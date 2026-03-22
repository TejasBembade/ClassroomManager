const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth');
const {
  addDepartment,
  addRoom,
  addTimeSlot,
  allocateRoom,
  createInstructor,
  getDepartments,
  getRooms,
  getTimeSlots,
  lockDay,
  getFullTimetable,
  getRoomAllocationTimetable
} = require('../controllers/adminController');

router.post('/departments', isAdmin, addDepartment);
router.get('/departments', isAdmin, getDepartments);

router.post('/rooms', isAdmin, addRoom);
router.get('/rooms', isAdmin, getRooms);

router.post('/timeslots', isAdmin, addTimeSlot);
router.get('/timeslots', isAdmin, getTimeSlots);

router.post('/room-allocation', isAdmin, allocateRoom);
router.get('/room-allocation-timetable', isAdmin, getRoomAllocationTimetable);

router.post('/create-instructor', isAdmin, createInstructor);
router.post('/lock-day', isAdmin, lockDay);
router.get('/full-timetable', isAdmin, getFullTimetable);

module.exports = router;