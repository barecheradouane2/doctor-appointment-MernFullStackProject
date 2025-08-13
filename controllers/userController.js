// controllers/userController.js
const BaseController = require("./baseController");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Nurse = require("../models/Nurse");
const Patient = require("../models/Patient");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');

const storage =multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.originalname + '-' + uniqueSuffix);
  }
});
//38.11

const upload = multer({ storage: storage });

class UserController extends BaseController {
  constructor() {
    super(User);
  }

  // Example: add custom logic for User
  register = async (req, res) => {
     try {
    const { name, email, passwordHash, role="Patient", phoneNumber } = req.body;

    if (!name || !email || !passwordHash || !role) {
      return res
        .status(400)
        .json({ message: "Name, email, password, and role are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists." });
    }
  const hashedPassword = await bcrypt.hash(passwordHash, 10);
const user = new User({ name, email, passwordHash: hashedPassword, role, phoneNumber });


    await user.save();

    if (role === "Doctor") {
      const { specialization, address, clinicName } = req.body;
      const image =req.file ?req.file.filename : null; // Handle image upload
      const doctor = new Doctor({
        user: user._id,
        specialization,
        image :req.file?.filename,
        address,
        clinicName,
      });
      await doctor.save();
    } else if (role === "Nurse") {
      const { doctor } = req.body;
      const nurse = new Nurse({
        user: user._id,
        doctor
      });
      await nurse.save();
    } else if (role === "Patient") {
      const { dateOfBirth, gender } = req.body;
      const patient = new Patient({
        user: user._id,
        dateOfBirth,
        gender
      });
      await patient.save();
    }

    let token= jwt.sign(
      {email, userId: user._id, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );




    res.status(201).json({ message: "User registered successfully",token, 
     user: { id: user._id,
      name: user.name,
      email: user.email,
     role: user.role }

     });



  } catch (error) {
    console.error("Error registering user:", error);
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
  };

  login=async (req, res) => {
    try {
    const { email, passwordHash } = req.body;
    if (!email || !passwordHash) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "user not found" });
    } 

    const isPasswordValid = await bcrypt.compare(passwordHash, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password." });
    }
    let token = jwt.sign(
      { email, userId: user._id, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   maxAge: 3600000, // 1 hour
    // });


    res.status(200).json({ message: "Login successful",token,
      user: { id: user._id,
      name: user.name,
      email: user.email,
      role: user.role }

       });
  } catch (error) {
    console.error("Error logging in user:", error);
    res
      .status(500)
      .json({ message: "Error logging in user", error: error.message });
  }

  }


}

module.exports = new UserController();

