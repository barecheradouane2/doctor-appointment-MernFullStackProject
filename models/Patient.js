const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, 
  name: { type: String, required: true },
  phoneNumber: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['Male', 'Female'], required: true },
});


module.exports = mongoose.model('Patient', patientSchema);
