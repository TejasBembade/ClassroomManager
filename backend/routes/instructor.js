const express = require('express');
const router = express.Router();
const { isInstructor } = require('../middleware/auth');
const {
  addSubject, getSubjects, deleteSubject,
  getAvailableRooms, assignClass,
  getTimetable, getTimeSlots, deleteAssignment
} = require('../controllers/instructorController');

router.post('/subjects', isInstructor, addSubject);
router.get('/subjects', isInstructor, getSubjects);
router.delete('/subjects/:id', isInstructor, deleteSubject);
router.get('/timeslots', isInstructor, getTimeSlots);
router.get('/available-rooms', isInstructor, getAvailableRooms);
router.post('/assign', isInstructor, assignClass);
router.get('/timetable', isInstructor, getTimetable);
router.delete('/assignments/:id', isInstructor, deleteAssignment);

module.exports = router;