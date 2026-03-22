const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth');
const {
  addDepartment, deleteDepartment,
  addRoom, deleteRoom,
  addTimeSlot, deleteTimeSlot,
  allocateRoom, deleteRoomAllocation,
  createInstructor,
  getDepartments, getRooms, getTimeSlots,
  lockDay, getFullTimetable, getRoomAllocationTimetable
} = require('../controllers/adminController');

router.post('/departments', isAdmin, addDepartment);
router.get('/departments', isAdmin, getDepartments);
router.delete('/departments/:id', isAdmin, deleteDepartment);

router.post('/rooms', isAdmin, addRoom);
router.get('/rooms', isAdmin, getRooms);
router.delete('/rooms/:id', isAdmin, deleteRoom);

router.post('/timeslots', isAdmin, addTimeSlot);
router.get('/timeslots', isAdmin, getTimeSlots);
router.delete('/timeslots/:id', isAdmin, deleteTimeSlot);

router.post('/room-allocation', isAdmin, allocateRoom);
router.get('/room-allocation-timetable', isAdmin, getRoomAllocationTimetable);
router.delete('/room-allocation/:id', isAdmin, deleteRoomAllocation);

router.post('/create-instructor', isAdmin, createInstructor);
router.post('/lock-day', isAdmin, lockDay);
router.get('/full-timetable', isAdmin, getFullTimetable);

module.exports = router;