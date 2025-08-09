const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialization: { type: String },
  image: { type: String },
  address: { type: String },
  clinicName: { type: String },
});

module.exports = mongoose.model('Doctor', doctorSchema);
