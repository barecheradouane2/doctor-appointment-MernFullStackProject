// models/availableSlot.js
const mongoose = require('mongoose');

const availableSlotSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  isBooked: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AvailableSlot', availableSlotSchema);
