const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentDate: {
    type: Date,
    required: true,
  },
  paymentMethod: {
    type: String,
    maxlength: 50,
  },
  amountPaid: {
    type: mongoose.Decimal128,
    required: true,
  },
  additionalNotes: {
    type: String,
    maxlength: 200,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Payment', paymentSchema);
