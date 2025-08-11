const mongoose = require("mongoose");

const availableSlotSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor", // Change from 'Doctor'
      required: true,
      index: true,
    },
    date: {
      type: Date, // Stores only the date part
      required: true,
    },
    startTime: {
      type: String, // e.g., "09:00:00"
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, // HH:mm:ss format validation
    },
    endTime: {
      type: String, // e.g., "09:30:00"
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, // HH:mm:ss format validation
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Optional: ensure startTime < endTime
availableSlotSchema.pre("save", function (next) {
  const start = this.startTime.split(":").map(Number);
  const end = this.endTime.split(":").map(Number);

  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];

  if (startMinutes >= endMinutes) {
    return next(new Error("Start time must be before end time"));
  }

  next();
});

module.exports = mongoose.model("AvailableSlot", availableSlotSchema);
