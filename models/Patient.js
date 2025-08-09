const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dateOfBirth: { type: Date },
  gender: { type: String },
});

module.exports = mongoose.model('Patient', patientSchema);
