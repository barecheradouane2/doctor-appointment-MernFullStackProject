const mongoose = require('mongoose');

const nurseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
});

module.exports = mongoose.model('Nurse', nurseSchema);
