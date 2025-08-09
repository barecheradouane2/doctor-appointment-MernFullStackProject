const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  medicalRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord',
    required: true,
  },
  medicationName: {
    type: String,
    maxlength: 100,
    required: true,
  },
  dosage: {
    type: String,
    maxlength: 50,
  },
  frequency: {
    type: String,
    maxlength: 50,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  specialInstructions: {
    type: String,
    maxlength: 200,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
