const BaseController = require("./baseController");
const AvailableSlot = require("../models/AvailableSlot");
const Nurse = require("../models/Nurse");

class AvailableSlotController extends BaseController {
  constructor() {
    super(AvailableSlot);
  }

  // Example: add custom logic for AvailableSlot
  create = async (req, res) => {
    try {
      const { doctor, date, startTime, endTime, isBooked = false } = req.body;

      // iwant the nurse and doctor can create only his slot ???

      if (!doctor || !date || !startTime || !endTime) {
        return res.status(400).json({ message: "All fields are required." });
      }

      const availableSlot = new AvailableSlot({
        doctor,
        date,
        startTime,
        endTime,
        isBooked,
      });

      await availableSlot.save();

      res.status(201).json({
        message: "Available slot created successfully",
        availableSlot,
      });
    } catch (error) {
      console.error("Error creating available slot:", error);
      res.status(500).json({
        message: "Error creating available slot",
        error: error.message,
      });
    }
  };
  getAll = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: "Date query parameter is required" });
    }

    let doctorId;

    if (req.user.role === "Nurse") {
      const nurseProfile = await Nurse.findOne({ user: req.user.id });
      if (!nurseProfile) {
        return res.status(404).json({ message: "Nurse profile not found" });
      }
      doctorId = nurseProfile.doctor;
    } 
    else if (req.user.role === "Doctor") {
      const doctorProfile = await Doctor.findOne({ user: req.user.id });
      if (!doctorProfile) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      doctorId = doctorProfile._id;
    } 
    else {
      return res.status(403).json({ message: "Only nurses and doctors can view these slots" });
    }

    // Normalize the query date to midnight
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const slots = await AvailableSlot.find({
      date: targetDate, // Exact match
      doctor: doctorId
    }).populate({
      path: "doctor",
      populate: { path: "user", model: "User" }
    });

    res.status(200).json(slots);
  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({
      message: "Error fetching available slots",
      error: error.message
    });
  }
};

}

module.exports = new AvailableSlotController();
