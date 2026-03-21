const mongoose = require('mongoose');

const classAssignmentSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  timeSlotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimeSlot',
    required: true
  },
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    required: true
  },
  teacherName: {
    type: String,
    required: true,
    trim: true
  }
});

// This prevents two classes in the same room at the same time on the same day
classAssignmentSchema.index({ roomId: 1, timeSlotId: 1, day: 1 }, { unique: true });

module.exports = mongoose.model('ClassAssignment', classAssignmentSchema);