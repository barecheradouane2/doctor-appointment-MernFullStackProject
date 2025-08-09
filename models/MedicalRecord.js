const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  visitDescription: {
    type: String,
    maxlength: 200,
  },
  diagnosis: {
    type: String,
    maxlength: 200,
  },
  additionalNotes: {
    type: String,
    maxlength: 200,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
