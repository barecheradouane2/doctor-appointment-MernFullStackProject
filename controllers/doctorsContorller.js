const BaseController = require("./baseController");
const Doctor = require("../models/Doctor");
const getDoctorIdFromUser = require("../utils/getDoctorIdFromUser");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname + "-" + uniqueSuffix);
  },
});
//38.11

const upload = multer({ storage: storage });

class DoctorController extends BaseController {
  constructor() {
    super(Doctor);
  }

  getAll = async (req, res) => {
    try {
      let {
        page = 1,
        limit = 10,
        specialization,
        address,
        clinicName,
        name,
      } = req.query;

      page = Number(page);
      limit = Number(limit);

      const skip = (page - 1) * limit;

      const query = {};
      let populateOptions = {};

      if (specialization) query.specialization = specialization;
      if (address) query.address = address;
      if (clinicName) query.clinicName = clinicName;
      if (name) query.name = name;

      populateOptions = {
        path: "users",
        select: "name",
      };

      const doctors = await Doctor.find(query)
        .populate(populateOptions)
        .skip(skip)
        .limit(limit);
      const total = await Doctor.countDocuments(query);

      res.status(200).json({
        success: true,
        data: doctors,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch {
      res.status(500).json({ message: "Error fetching doctors" });
    }
  };
  getInformation = async (req, res) => {
    try {
      const doctorId = awaitgetDoctorIdFromUser(req.user);
      const doctor = await Doctor.findById(doctorId).populate(
        "users",
        "name email phoneNumber "
      );
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      res.status(200).json({ success: true, doctor });
    } catch {
      res.status(500).json({ message: "Error fetching doctor information" });
    }
  };

  update = async (req, res) => {
    try {
      const doctorId = await getDoctorIdFromUser(req.user);

      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }

      const pickFields = (source, allowed) => {
        return allowed.reduce((obj, field) => {
          if (source[field] !== undefined) {
            obj[field] = source[field];
          }
          return obj;
        }, {});
      };

      const allowedUserUpdate = ["name", "email", "phoneNumber"];
      const allowedDoctorUpdate = ["specialization", "address", "clinicName"];

      const userUpdates = pickFields(req.body, allowedUserUpdate);
      const doctorUpdates = pickFields(req.body, allowedDoctorUpdate);

      let updatedUser = null;
      if (doctor.users) {
        updatedUser = await User.findByIdAndUpdate(doctor.users, userUpdates, {
          new: true,
          runValidators: true,
        });
      }

      const updatedDoctor = await Doctor.findByIdAndUpdate(
        doctorId,
        doctorUpdates,
        { new: true, runValidators: true }
      );

      res.status(200).json({
        success: true,
        doctor: updatedDoctor,
        user: updatedUser,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating doctor information" });
    }
  };

  // i should create default user and then create doctor
  create = async (req, res) => {
    try {
      const {
        name,
        email,
        passwordHash,
        phoneNumber,
        role = "Doctor",
      } = req.body;

      if (role !== "Doctor") {
        return res
          .status(400)
          .json({ message: "Invalid role for doctor creation" });
      }
      const hashedPassword = await bcrypt.hash(passwordHash, 10);

      const user = new User({
        name,
        email,
        passwordHash: hashedPassword,
        phoneNumber,
        role,
      });
      await user.save();

      const { specialization, address, clinicName } = req.body;
      const image = req.file ? req.file.filename : null; // Handle image upload

      const doctor = new Doctor({
        user: user._id,
        specialization,
        image,
        address,
        clinicName,
      });

      await doctor.save();

      res.status(201).json({
        message: "Doctor created successfully",
        doctor,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Error creating doctor:", error);
      res
        .status(500)
        .json({ message: "Error creating doctor", error: error.message });
    }
  };

  //when i delete a doctor i should delete the user also

  delete = async (req, res) => {
    try {
      const doctorId = req.params.id;

      const doctor = await Doctor.findByIdAndDelete(doctorId);

      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }

      if (doctor.user) {
        await User.findByIdAndDelete(doctor.user);
      }

      res.status(200).json({
        success: true,
        message: "Doctor and associated user deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting doctor:", error);
      res.status(500).json({
        message: "Error deleting doctor",
        error: error.message,
      });
    }
  };
}

module.exports = new DoctorController();
