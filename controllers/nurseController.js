const BaseController = require("./baseController");
const Nurse = require("../models/Nurse");
const getDoctorIdFromUser = require("../utils/getDoctorIdFromUser");

const User = require("../models/User");
const bcrypt = require("bcryptjs");

class NurseController extends BaseController {
  constructor() {
    super(Nurse);
  }

  getAll = async (req, res) => {
    try {
      const doctorId = await getDoctorIdFromUser(req.user);

      const nurses = await Nurse.find({ doctor: doctorId }).populate(
        "users",
        "name email phoneNumber "
      );

      res.status(200).json(nurses);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  delete = async (req, res) => {
    try {
      const nurseId = req.params.id;
      const doctorId = await getDoctorIdFromUser(req.user);

      const nurse = await Nurse.findOneAndDelete({
        _id: nurseId,
        doctor: doctorId,
      });

      if (!nurse) {
        return res.status(404).json({ message: "Nurse not found" });
      }

      res.status(200).json({ message: "Nurse deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

 
}
