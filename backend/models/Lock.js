const mongoose = require('mongoose');

const lockSchema = new mongoose.Schema({
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    required: true
  },
  isLocked: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Lock', lockSchema);