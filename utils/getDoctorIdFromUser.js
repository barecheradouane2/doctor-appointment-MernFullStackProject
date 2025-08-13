// utils/getDoctorIdFromUser.js
const Nurse = require("../models/Nurse");
const Doctor = require("../models/Doctor");

async function getDoctorIdFromUser(user) {
  let doctorId = null;

  if (user.role === "Nurse") {
    const nurseProfile = await Nurse.findOne({ user: user.userId });
    if (!nurseProfile) {
      throw new Error("Nurse profile not found");
    }
    doctorId = nurseProfile.doctor;
  }
  else if (user.role === "Doctor") {
    const doctorProfile = await Doctor.findOne({ user: user.userId });
    if (!doctorProfile) {
      throw new Error("Doctor profile not found");
    }
    doctorId = doctorProfile._id;
  }
  else {
    throw new Error("Only nurses and doctors can perform this action");
  }

  return doctorId;
}

module.exports = getDoctorIdFromUser;
