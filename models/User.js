const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Patient', 'Doctor', 'Nurse', 'Admin'], 
    required: true 
  },
  phoneNumber: { type: String, maxlength: 20 },
  
});

module.exports = mongoose.model('User', userSchema);
