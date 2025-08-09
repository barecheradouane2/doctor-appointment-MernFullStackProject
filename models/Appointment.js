const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  slot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AvailableSlot',
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  notes: String,
  medicalRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord',
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
  },
}, { timestamps: true });
