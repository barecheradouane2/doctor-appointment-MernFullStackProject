const BaseController = require("./baseController");
const AvailableSlot = require("../models/AvailableSlot");
const Nurse = require("../models/Nurse");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const mongoose = require("mongoose");

const getDoctorIdFromUser = require("../utils/getDoctorIdFromUser");



class AvailableSlotController extends BaseController {
  constructor() {
    super(AvailableSlot);
  }

 
  create = async (req, res) => {
    try {
      const {  date, startTime, endTime, isBooked = false } = req.body;

      // iwant the nurse and doctor can create only his slot ???

      if ( !date || !startTime || !endTime) {
        return res.status(400).json({ message: "All fields are required." });
      }

      


         const doctorId = await getDoctorIdFromUser(req.user);



      const availableSlot = new AvailableSlot({
        doctor: doctorId,
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
    const { date, doctorname } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date query parameter is required" });
    }
    if (!doctorname) {
      return res.status(400).json({ message: "Doctor name query parameter is required" });
    }
    if (isNaN(Date.parse(date))) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const user = await User.findOne({ name: doctorname });
    if (!user) {
      return res.status(404).json({ message: "User (doctor) not found" });
    }

    const doctor = await Doctor.findOne({ user: user._id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);

    const slots = await AvailableSlot.find({
      date: { $gte: start, $lt: end },
      doctor: doctor._id
    });

    res.status(200).json({ slots });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({
      message: "Error fetching available slots",
      error: error.message
    });
  }
   };

   update =async (req, res) => {
    try {
      const { slotId } = req.params;
      const { date, startTime, endTime, isBooked } = req.body;

      const doctorId = await getDoctorIdFromUser(req.user);

      const availableSlot = await AvailableSlot.findOne({ _id: slotId, doctor: doctorId });
      if (!availableSlot) {
        return res.status(404).json({ message: "Available slot not found or you don't have permission to edit it" });
      }

      availableSlot.date = date || availableSlot.date;
      availableSlot.startTime = startTime || availableSlot.startTime;
      availableSlot.endTime = endTime || availableSlot.endTime;
      availableSlot.isBooked = isBooked !== undefined ? isBooked : availableSlot.isBooked;

      await availableSlot.save();

      res.status(200).json({
        message: "Available slot updated successfully",
        availableSlot
      });
    } catch (error) {
      console.error("Error updating available slot:", error);
      res.status(500).json({
        message: "Error updating available slot",
        error: error.message
      });
    }
  };

  delete = async (req, res) => {
    try {
      const { slotId } = req.params;

      const doctorId = await getDoctorIdFromUser(req.user);

      const availableSlot = await AvailableSlot.findOneAndDelete({ _id: slotId, doctor: doctorId });
      if (!availableSlot) {
        return res.status(404).json({ message: "Available slot not found or you don't have permission to delete it" });
      }

      res.status(200).json({
        message: "Available slot deleted successfully",
        availableSlot
      });
    } catch (error) {
      console.error("Error deleting available slot:", error);
      res.status(500).json({
        message: "Error deleting available slot",
        error: error.message
      });
    }
  };
}

module.exports = new AvailableSlotController();
