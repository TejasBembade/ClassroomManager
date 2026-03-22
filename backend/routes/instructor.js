const express = require('express');
const router = express.Router();
const { isInstructor } = require('../middleware/auth');
const {
  addSubject,
  getSubjects,
  getAvailableRooms,
  assignClass,
  getTimetable
} = require('../controllers/instructorController');

router.post('/subjects', isInstructor, addSubject);
router.get('/subjects', isInstructor, getSubjects);
router.get('/available-rooms', isInstructor, getAvailableRooms);
router.post('/assign', isInstructor, assignClass);
router.get('/timetable', isInstructor, getTimetable);

module.exports = router;