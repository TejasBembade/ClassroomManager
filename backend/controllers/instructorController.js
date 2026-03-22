const Subject = require('../models/Subject');
const RoomAllocation = require('../models/RoomAllocation');
const ClassAssignment = require('../models/ClassAssignment');
const Lock = require('../models/Lock');

// Add subject
const addSubject = async (req, res) => {
  try {
    const { name } = req.body;
    const departmentId = req.session.user.departmentId;
    const existing = await Subject.findOne({ name, departmentId });
    if (existing) return res.status(400).json({ message: 'Subject already exists' });
    const subject = await Subject.create({ name, departmentId });
    res.json({ message: 'Subject added', subject });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get subjects for instructor's department
const getSubjects = async (req, res) => {
  try {
    const departmentId = req.session.user.departmentId;
    const subjects = await Subject.find({ departmentId });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get available rooms for a day and timeslot
const getAvailableRooms = async (req, res) => {
  try {
    const { day, timeSlotId } = req.query;
    const departmentId = req.session.user.departmentId;
    const allocations = await RoomAllocation.find({ departmentId, day, timeSlotId }).populate('roomId');
    const rooms = allocations.map(a => a.roomId);
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Assign class
const assignClass = async (req, res) => {
  try {
    const { subjectId, roomId, timeSlotId, day, teacherName, forceOverwrite } = req.body;
    const departmentId = req.session.user.departmentId;

    // Check if locked
    const lock = await Lock.findOne({ departmentId, day });
    if (lock && lock.isLocked) {
      return res.status(403).json({ message: 'Timetable is locked for this day' });
    }

    // Check room is allocated to this department
    const allocation = await RoomAllocation.findOne({ roomId, departmentId, timeSlotId, day });
    if (!allocation) {
      return res.status(400).json({ message: 'This room is not allocated to your department for this day and time' });
    }

    // Check room conflict
    const roomConflict = await ClassAssignment.findOne({ roomId, timeSlotId, day })
      .populate('subjectId');
    if (roomConflict && !forceOverwrite) {
      return res.status(409).json({
        message: `Room already assigned to ${roomConflict.subjectId.name} (${roomConflict.teacherName})`,
        conflict: 'room'
      });
    }

    // Check teacher conflict
    const teacherConflict = await ClassAssignment.findOne({ teacherName, timeSlotId, day });
    if (teacherConflict && !forceOverwrite) {
      return res.status(409).json({
        message: `Teacher ${teacherName} is already assigned at this time`,
        conflict: 'teacher'
      });
    }

    // Overwrite or create
    await ClassAssignment.findOneAndDelete({ roomId, timeSlotId, day });
    const assignment = await ClassAssignment.create({ subjectId, roomId, timeSlotId, day, teacherName });
    res.json({ message: 'Class assigned successfully', assignment });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get timetable for instructor's department
const getTimetable = async (req, res) => {
  try {
    const departmentId = req.session.user.departmentId;
    const allocations = await RoomAllocation.find({ departmentId })
      .populate('roomId')
      .populate('timeSlotId');

    const assignments = await ClassAssignment.find()
      .populate('subjectId')
      .populate('roomId')
      .populate('timeSlotId');

    res.json({ allocations, assignments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTimeSlots = async (req, res) => {
  try {
    const TimeSlot = require('../models/TimeSlot');
    const timeSlots = await TimeSlot.find();
    res.json(timeSlots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { addSubject, getSubjects, getAvailableRooms, assignClass, getTimetable, getTimeSlots };