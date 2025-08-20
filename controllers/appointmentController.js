const BaseController = require("./baseController");
const Appointment = require("../models/Appointment");
const AvailableSlot = require("../models/AvailableSlot");
const Patient = require("../models/Patient");

const getDoctorIdFromUser = require("../utils/getDoctorIdFromUser");

class AppointmentController extends BaseController {
  constructor() {
    super(Appointment);
  }

  create = async (req, res) => {
    try {
      const { slot, doctor, status, notes, medicalRecord, payment } = req.body;

      let patientID;

      if (!slot) {
        return res
          .status(400)
          .json({ error: "Slot, doctor, and patient are required." });
      }

      const isslotnotbooked = await AvailableSlot.findOne({
        _id: slot,
        isBooked: false,
      });

      if (!isslotnotbooked) {
        return res.status(400).json({ error: "Slot is already booked." });
      }

      if (req.user.role == "Doctor" || req.user.role == "Nurse") {
        const { name, phoneNumber, dateOfBirth, gender } = req.body;

        const patientDoc = await Patient.create({
          name,
          phoneNumber,
          dateOfBirth,
          gender,
        });
        patientID = patientDoc._id;
      } else if (req.user.role == "Patient") {
        const currentpatient = await Patient.findOne({ user: req.user.userId });
        patientID = currentpatient._id;
      }

      const appointment = await Appointment.create({
        slot,
        doctor,
        patient: patientID,
        status,
        notes,
        medicalRecord,
        payment,
      });

      await AvailableSlot.findByIdAndUpdate(slot, { isBooked: true });

      res.status(201).json({
        message: "Appointment created successfully",
        appointment,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  confirmAppointment = async (req, res) => {
    try {
      const { appointmentId } = req.params;

      const doctorId = getDoctorIdFromUser(req.user);

      const appointment = await Appointment.findOne({
        _id: appointmentId,
        doctor: doctorId,
      });

      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found." });
      }

      appointment.status = "Confirmed";
      await appointment.save();

      return res.status(200).json({
        message: "Appointment confirmed successfully.",
        appointment,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  getAll = async (req, res) => {
    try {
      let { page = 1, limit = 10, date, status, patientname } = req.query;

      page = Number(page);
      limit = Number(limit);

      const skip = (page - 1) * limit;

      const userId = req.user.userId;
      const userRole = req.user.role;

      let query = {}; // will build dynamically
      let populateOptions = [];
      let appointments;

      if (userRole === "Patient") {
        // Find current patient
        const currentPatient = await Patient.findOne({ user: userId });
        if (!currentPatient) {
          return res.status(404).json({ error: "Patient not found." });
        }

        query.patient = currentPatient._id;

        // add filters
        if (status) query.status = status;

        // populate doctor + slot
        populateOptions = [
          { path: "doctor", select: "name specialty" },
          {
            path: "slot",
            select: "date startTime endTime",
            match: date ? { date: new Date(date) } : {},
          },
        ];
      } else if (userRole === "Doctor" || userRole === "Nurse") {
        // Find doctor ID from user
        const doctorId = await getDoctorIdFromUser(req.user);
        if (!doctorId) {
          return res.status(404).json({ error: "Doctor not found." });
        }

        query.doctor = doctorId;

        // filter by status
        if (status) query.status = status;

        // filter by patient name
        if (patientname) {
          const currentPatient = await Patient.findOne({ name: patientname });
          if (!currentPatient) {
            return res.status(200).json({
              message: "Appointments retrieved successfully.",
              total: 0,
              page,
              totalPages: 0,
              appointments: [],
            });
          }
          query.patient = currentPatient._id;
        }

        // populate patient + slot
        populateOptions = [
          { path: "patient", select: "name phoneNumber dateOfBirth" },
          {
            path: "slot",
            select: "date startTime endTime",
            match: date ? { date: new Date(date) } : {},
          },
        ];
      } else {
        return res.status(403).json({ error: "Access denied." });
      }

      // Execute query
      appointments = await Appointment.find(query)
        .populate(populateOptions)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec();

      if (date) {
        appointments = appointments.filter((app) => app.slot !== null);
      }

      const total = await Appointment.countDocuments(query);

      res.status(200).json({
        message: "Appointments retrieved successfully.",
        total,
        page,
        totalPages: Math.ceil(total / limit),
        appointments,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  getOne = async (req, res) => {
    try {
      const { id } = req.params;

      const userId = req.user.userId;
      const userRole = req.user.role;

      let appointment;

      if (userRole === "Patient") {
        const currentPatient = await Patient.findOne({ user: userId });
        appointment = await Appointment.findOne({
          _id: id,
          patient: currentPatient._id,
        });
      } else if (userRole === "Doctor" || userRole === "Nurse") {
        const doctorId = getDoctorIdFromUser(req.user);
        appointment = await Appointment.findOne({
          _id: id,
          doctor: doctorId,
        });
      } else {
        return res.status(403).json({ error: "Access denied." });
      }

      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found." });
      }

      res.status(200).json({
        message: "Appointment retrieved successfully.",
        appointment,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  update = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const userRole = req.user.role;

      const { date, slot } = req.body;

      let appointment;

      if (userRole === "Patient") {
        const currentPatient = await Patient.findOne({ user: userId });
        appointment = await Appointment.findOne({
          _id: id,
          patient: currentPatient._id,
        });
      } else if (userRole === "Doctor" || userRole === "Nurse") {
        const doctorId = await getDoctorIdFromUser(req.user);
        const { status } = req.body;
        appointment = await Appointment.findOne({
          _id: id,
          doctor: doctorId,
        });
        appointment.status = status || appointment.status;

        // i think i need to check if date > slot ??

        if (status === "Cancelled") {
          const availableSlot = await AvailableSlot.findOne({
            doctor: doctorId,
            date: appointment.date,
            slot: appointment.slot,
          });

          availableSlot.isBooked = false;
          await availableSlot.save();
        }
      } else {
        return res.status(403).json({ error: "Access denied." });
      }

      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found." });
      }

      appointment.date = date || appointment.date;
      appointment.slot = slot || appointment.slot;

     
      const isSlotAvailable = await AvailableSlot.findOne({
        _id: appointment.slot,
        doctor: appointment.doctor
      });

      if (!isSlotAvailable) {
        return res.status(400).json({ error: "Slot is not available." });
      }

      await appointment.save();

      res.status(200).json({
        message: "Appointment updated successfully.",
        appointment,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  delete = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const userRole = req.user.role;

      let appointment;

      if (userRole === "Patient") {
        const currentPatient = await Patient.findOne({ user: userId });
        appointment = await Appointment.findOne({
          _id: id,
          patient: currentPatient._id,
        });
      } else if (userRole === "Doctor" || userRole === "Nurse") {
        const doctorId = await getDoctorIdFromUser(req.user);
        appointment = await Appointment.findOne({
          _id: id,
          doctor: doctorId,
        });
      } else {
        return res.status(403).json({ error: "Access denied." });
      }

      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found." });
      }

      await appointment.deleteOne();

      res.status(200).json({
        message: "Appointment deleted successfully.",
        appointment,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  // i have 3 option for handle appointemnet
  // no availbel slot the patient can conform or not
  // availbel slot 8-5  genirc for all doctor
  // each day the patient should create his  doctor own availble slots
}

module.exports = new AppointmentController();
