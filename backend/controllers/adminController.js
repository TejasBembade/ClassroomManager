const Department = require('../models/Department');
const Room = require('../models/Room');
const TimeSlot = require('../models/TimeSlot');
const RoomAllocation = require('../models/RoomAllocation');
const User = require('../models/User');
const Lock = require('../models/Lock');
const ClassAssignment = require('../models/ClassAssignment');

// Add department
const addDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    const existing = await Department.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Department already exists' });
    const department = await Department.create({ name });
    res.json({ message: 'Department added', department });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add room
const addRoom = async (req, res) => {
  try {
    const { roomNumber } = req.body;
    const existing = await Room.findOne({ roomNumber });
    if (existing) return res.status(400).json({ message: 'Room already exists' });
    const room = await Room.create({ roomNumber });
    res.json({ message: 'Room added', room });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add time slot
const addTimeSlot = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    const timeSlot = await TimeSlot.create({ startTime, endTime });
    res.json({ message: 'Time slot added', timeSlot });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Allocate room to department
const allocateRoom = async (req, res) => {
  try {
    const { roomId, departmentId, timeSlotId, day } = req.body;
    const existing = await RoomAllocation.findOne({ roomId, timeSlotId, day });
    if (existing) return res.status(400).json({ message: 'Room already allocated for this day and time' });
    const allocation = await RoomAllocation.create({ roomId, departmentId, timeSlotId, day });
    res.json({ message: 'Room allocated', allocation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create instructor
const createInstructor = async (req, res) => {
  try {
    const { name, email, password, departmentId } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });
    const instructor = await User.create({ name, email, password, role: 'instructor', departmentId });
    res.json({ message: 'Instructor created', instructor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all departments
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all rooms
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all time slots
const getTimeSlots = async (req, res) => {
  try {
    const timeSlots = await TimeSlot.find();
    res.json(timeSlots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Lock or unlock a day
const lockDay = async (req, res) => {
  try {
    const { departmentId, day, isLocked } = req.body;
    const lock = await Lock.findOneAndUpdate(
      { departmentId, day },
      { isLocked },
      { upsert: true, new: true }
    );
    res.json({ message: `Timetable ${isLocked ? 'locked' : 'unlocked'}`, lock });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get full timetable
const getFullTimetable = async (req, res) => {
  try {
    const assignments = await ClassAssignment.find()
      .populate('subjectId')
      .populate('roomId')
      .populate('timeSlotId');
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get room allocation timetable
const getRoomAllocationTimetable = async (req, res) => {
  try {
    const allocations = await RoomAllocation.find()
      .populate('roomId')
      .populate('departmentId')
      .populate('timeSlotId');
    res.json(allocations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete department
const deleteDepartment = async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: 'Department deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete room
const deleteRoom = async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete time slot
const deleteTimeSlot = async (req, res) => {
  try {
    await TimeSlot.findByIdAndDelete(req.params.id);
    res.json({ message: 'Time slot deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete room allocation
const deleteRoomAllocation = async (req, res) => {
  try {
    await RoomAllocation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Allocation deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    await ClassAssignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addDepartment, deleteDepartment,
  addRoom, deleteRoom,
  addTimeSlot, deleteTimeSlot,
  allocateRoom, deleteRoomAllocation,
  createInstructor,
  getDepartments, getRooms, getTimeSlots,
  lockDay, getFullTimetable, getRoomAllocationTimetable
};