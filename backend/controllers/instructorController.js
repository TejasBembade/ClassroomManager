const Subject = require('../models/Subject');
const RoomAllocation = require('../models/RoomAllocation');
const ClassAssignment = require('../models/ClassAssignment');
const Lock = require('../models/Lock');
const TimeSlot = require('../models/TimeSlot');

const addSubject = async (req, res) => {
  try {
    const { name } = req.body;
    const departmentId = req.user.departmentId;
    const existing = await Subject.findOne({ name, departmentId });
    if (existing) return res.status(400).json({ message: 'Subject already exists' });
    const subject = await Subject.create({ name, departmentId });
    res.json({ message: 'Subject added', subject });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getSubjects = async (req, res) => {
  try {
    const departmentId = req.user.departmentId;
    const subjects = await Subject.find({ departmentId });
    res.json(subjects);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Cascade: also delete assignments using this subject
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const departmentId = req.user.departmentId;
    const subject = await Subject.findById(id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    if (subject.departmentId.toString() !== departmentId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await ClassAssignment.deleteMany({ subjectId: id });
    await Subject.findByIdAndDelete(id);
    res.json({ message: 'Subject deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getAvailableRooms = async (req, res) => {
  try {
    const { day, timeSlotId } = req.query;
    const departmentId = req.user.departmentId;
    const allocations = await RoomAllocation.find({ departmentId, day, timeSlotId }).populate('roomId');
    const rooms = allocations.map(a => a.roomId);
    res.json(rooms);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const assignClass = async (req, res) => {
  try {
    const { subjectId, roomId, timeSlotId, day, teacherName, forceOverwrite } = req.body;
    const departmentId = req.user.departmentId;

    const lock = await Lock.findOne({ departmentId, day });
    if (lock && lock.isLocked) {
      return res.status(403).json({ message: 'Timetable is locked for this day' });
    }

    const allocation = await RoomAllocation.findOne({ roomId, departmentId, timeSlotId, day });
    if (!allocation) {
      return res.status(400).json({ message: 'This room is not allocated to your department for this day and time' });
    }

    const roomConflict = await ClassAssignment.findOne({ roomId, timeSlotId, day }).populate('subjectId');
    if (roomConflict && !forceOverwrite) {
      return res.status(409).json({
        message: `Room already assigned to ${roomConflict.subjectId.name} (${roomConflict.teacherName})`,
        conflict: 'room'
      });
    }

    const teacherConflict = await ClassAssignment.findOne({ teacherName, timeSlotId, day });
    if (teacherConflict && !forceOverwrite) {
      return res.status(409).json({
        message: `Teacher ${teacherName} is already assigned at this time`,
        conflict: 'teacher'
      });
    }

    await ClassAssignment.findOneAndDelete({ roomId, timeSlotId, day });
    const assignment = await ClassAssignment.create({ subjectId, roomId, timeSlotId, day, teacherName });
    res.json({ message: 'Class assigned successfully', assignment });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getTimetable = async (req, res) => {
  try {
    const departmentId = req.user.departmentId;
    const allocations = await RoomAllocation.find({ departmentId })
      .populate('roomId').populate('timeSlotId');

    const assignments = await ClassAssignment.find()
      .populate('subjectId').populate('roomId').populate('timeSlotId');

    // Auto-clean orphaned assignments (room/subject/timeslot was deleted)
    const orphanedIds = assignments
      .filter(a => !a.subjectId || !a.roomId || !a.timeSlotId)
      .map(a => a._id);
    if (orphanedIds.length > 0) {
      await ClassAssignment.deleteMany({ _id: { $in: orphanedIds } });
    }

    const validAssignments = assignments.filter(a => a.subjectId && a.roomId && a.timeSlotId);
    res.json({ allocations, assignments: validAssignments });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getTimeSlots = async (req, res) => {
  try {
    const timeSlots = await TimeSlot.find();
    res.json(timeSlots);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Delete assignment — blocked if day is locked
const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const departmentId = req.user.departmentId;

    const assignment = await ClassAssignment.findById(id).populate('subjectId');
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    const lock = await Lock.findOne({ departmentId, day: assignment.day });
    if (lock && lock.isLocked) {
      return res.status(403).json({ message: `Timetable for ${assignment.day} is locked` });
    }

    await ClassAssignment.findByIdAndDelete(id);
    res.json({ message: 'Assignment deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Update teacher name — blocked if day is locked
const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { teacherName } = req.body;
    const departmentId = req.user.departmentId;

    if (!teacherName || !teacherName.trim()) {
      return res.status(400).json({ message: 'Teacher name is required' });
    }

    const assignment = await ClassAssignment.findById(id).populate('subjectId');
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    const lock = await Lock.findOne({ departmentId, day: assignment.day });
    if (lock && lock.isLocked) {
      return res.status(403).json({ message: `Timetable for ${assignment.day} is locked` });
    }

    assignment.teacherName = teacherName.trim();
    await assignment.save();
    res.json({ message: 'Teacher updated', assignment });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = {
  addSubject, getSubjects, deleteSubject,
  getAvailableRooms, assignClass,
  getTimetable, getTimeSlots,
  deleteAssignment, updateTeacher,
};