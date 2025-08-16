const BaseController = require("./baseController");
const Appointment = require("../models/Appointment");
const AvailableSlot = require("../models/AvailableSlot");
const Patient = require("../models/Patient");
const AvailableSlot = require("../models/AvailableSlot");

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
      let { page = 1, limit = 10 } = req.query;

      page = Number(page);
      limit = Number(limit);

      const skip = (page - 1) * limit;

      const userId = req.user.userId;
      const userRole = req.user.role;

      let appointments;
      let total;

      if (userRole === "Patient") {
        const currentPatient = await Patient.findOne({ user: userId });

        let { date, status } = req.query;
        appointments = await Appointment.find({ patient: currentPatient._id })
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 });

          if (date) {
            appointments = await Appointment.find({
              patient: currentPatient._id,
              date,
            })
              .skip(skip)
              .limit(limit)
              .sort({ createdAt: -1 });
          }

          if (status) {
            appointments = await Appointment.find({
              patient: currentPatient._id,
              status,
            })
              .skip(skip)
              .limit(limit)
              .sort({ createdAt: -1 });
          }


        total = await Appointment.countDocuments({
          patient: currentPatient._id,
        });
      } else if (userRole === "Doctor" || userRole === "Nurse") {
        const doctorId = getDoctorIdFromUser(req.user);

        let { patientname, date ,status } = req.query;

        appointments = await Appointment.find({ doctor: doctorId })
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 });

        if (patientname) {
          const currentPatient = await Patient.findOne({ name: patientname });
          if (currentPatient) {
            appointments = await Appointment.find({
              doctor: doctorId,
              patient: currentPatient._id,
            })
              .skip(skip)
              .limit(limit)
              .sort({ createdAt: -1 });
          }
        }

        if (date) {
          appointments = await Appointment.find({ doctor: doctorId, date })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        }

        if (status) {
          appointments = await Appointment.find({ doctor: doctorId, status })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        }

        total = await Appointment.countDocuments({ doctor: doctorId });
      } else {
        return res.status(403).json({ error: "Access denied." });
      }

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
        const doctorId = getDoctorIdFromUser(req.user);
        const { status } = req.body;
        appointment = await Appointment.findOne({
          _id: id,
          doctor: doctorId,
        });
        appointment.status = status || appointment.status;

        // i think i need to check if date > slot ??

        if(status ==="Cancelled"){

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

      // i need to check if the slot is available before updating
      const isSlotAvailable = await AvailableSlot.findOne({
        doctor: appointment.doctor,
        date: appointment.date,
        slot: appointment.slot,
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
    

 }

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

     await appointment.remove();

     res.status(200).json({
       message: "Appointment deleted successfully.",
        appointment
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
