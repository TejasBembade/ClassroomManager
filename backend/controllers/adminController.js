const Department = require('../models/Department');
const Room = require('../models/Room');
const TimeSlot = require('../models/TimeSlot');
const RoomAllocation = require('../models/RoomAllocation');
const User = require('../models/User');
const Lock = require('../models/Lock');
const ClassAssignment = require('../models/ClassAssignment');
const Subject = require('../models/Subject');

const getValidAssignments = async () => {
  const assignments = await ClassAssignment.find()
    .populate({
      path: 'subjectId',
      populate: { path: 'departmentId' }
    })
    .populate('roomId')
    .populate('timeSlotId');

  const orphanedIds = assignments
    .filter(a => !a.subjectId || !a.roomId || !a.timeSlotId)
    .map(a => a._id);

  if (orphanedIds.length > 0) {
    await ClassAssignment.deleteMany({ _id: { $in: orphanedIds } });
  }

  return assignments.filter(a => a.subjectId && a.roomId && a.timeSlotId);
};

// ── ADD ──────────────────────────────────────────────────────────────────────

const addDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    const existing = await Department.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Department already exists' });
    const department = await Department.create({ name });
    res.json({ message: 'Department added', department });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const addRoom = async (req, res) => {
  try {
    const { roomNumber } = req.body;
    const existing = await Room.findOne({ roomNumber });
    if (existing) return res.status(400).json({ message: 'Room already exists' });
    const room = await Room.create({ roomNumber });
    res.json({ message: 'Room added', room });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const addTimeSlot = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    const timeSlot = await TimeSlot.create({ startTime, endTime });
    res.json({ message: 'Time slot added', timeSlot });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const allocateRoom = async (req, res) => {
  try {
    const { roomId, departmentId, timeSlotId, day } = req.body;
    const existing = await RoomAllocation.findOne({ roomId, timeSlotId, day });
    if (existing) return res.status(400).json({ message: 'Room already allocated for this day and time' });
    const allocation = await RoomAllocation.create({ roomId, departmentId, timeSlotId, day });
    res.json({ message: 'Room allocated', allocation });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const createInstructor = async (req, res) => {
  try {
    const { name, email, password, departmentId } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });
    const instructor = await User.create({ name, email, password, role: 'instructor', departmentId });
    res.json({ message: 'Instructor created', instructor });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── GET ──────────────────────────────────────────────────────────────────────

const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getTimeSlots = async (req, res) => {
  try {
    const timeSlots = await TimeSlot.find();
    res.json(timeSlots);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getInstructors = async (req, res) => {
  try {
    const instructors = await User.find({ role: 'instructor' })
      .populate('departmentId')
      .select('-password');
    res.json(instructors);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const lockDay = async (req, res) => {
  try {
    const { departmentId, day, isLocked } = req.body;
    const lock = await Lock.findOneAndUpdate(
      { departmentId, day }, { isLocked }, { upsert: true, new: true }
    );
    res.json({ message: `Timetable ${isLocked ? 'locked' : 'unlocked'}`, lock });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getFullTimetable = async (req, res) => {
  try {
    const valid = await getValidAssignments();
    res.json(valid);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getPublicDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getPublicTimetable = async (req, res) => {
  try {
    const { departmentId } = req.query;
    const valid = await getValidAssignments();

    const filtered = departmentId
      ? valid.filter(a => a.subjectId?.departmentId?._id?.toString() === departmentId)
      : valid;

    res.json(filtered);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getRoomAllocationTimetable = async (req, res) => {
  try {
    const allocations = await RoomAllocation.find()
      .populate('roomId').populate('departmentId').populate('timeSlotId');
    res.json(allocations);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── DELETE (with cascade) ────────────────────────────────────────────────────

const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const dept = await Department.findById(id);
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    const subjects = await Subject.find({ departmentId: id });
    const subjectIds = subjects.map(s => s._id);
    await ClassAssignment.deleteMany({ subjectId: { $in: subjectIds } });
    await Subject.deleteMany({ departmentId: id });
    await RoomAllocation.deleteMany({ departmentId: id });
    await Lock.deleteMany({ departmentId: id });
    await User.deleteMany({ departmentId: id, role: 'instructor' });
    await Department.findByIdAndDelete(id);
    res.json({ message: 'Department deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    await ClassAssignment.deleteMany({ roomId: id });
    await RoomAllocation.deleteMany({ roomId: id });
    await Room.findByIdAndDelete(id);
    res.json({ message: 'Room deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const slot = await TimeSlot.findById(id);
    if (!slot) return res.status(404).json({ message: 'Time slot not found' });
    await ClassAssignment.deleteMany({ timeSlotId: id });
    await RoomAllocation.deleteMany({ timeSlotId: id });
    await TimeSlot.findByIdAndDelete(id);
    res.json({ message: 'Time slot deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteRoomAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    const allocation = await RoomAllocation.findById(id);
    if (!allocation) return res.status(404).json({ message: 'Allocation not found' });
    await ClassAssignment.deleteMany({
      roomId: allocation.roomId,
      timeSlotId: allocation.timeSlotId,
      day: allocation.day,
    });
    await RoomAllocation.findByIdAndDelete(id);
    res.json({ message: 'Allocation deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteInstructor = async (req, res) => {
  try {
    const { id } = req.params;
    const instructor = await User.findById(id);
    if (!instructor || instructor.role !== 'instructor') {
      return res.status(404).json({ message: 'Instructor not found' });
    }
    await User.findByIdAndDelete(id);
    res.json({ message: 'Instructor deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteAssignment = async (req, res) => {
  try {
    await ClassAssignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Assignment deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = {
  addDepartment, deleteDepartment,
  addRoom, deleteRoom,
  addTimeSlot, deleteTimeSlot,
  allocateRoom, deleteRoomAllocation,
  createInstructor, getInstructors, deleteInstructor,
  getDepartments, getRooms, getTimeSlots,
  lockDay, getFullTimetable, getRoomAllocationTimetable,
  getPublicDepartments, getPublicTimetable,
  deleteAssignment,
};
