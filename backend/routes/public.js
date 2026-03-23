const express = require('express');
const router = express.Router();
const { getPublicDepartments, getPublicTimetable } = require('../controllers/adminController');

router.get('/departments', getPublicDepartments);
router.get('/timetable', getPublicTimetable);

module.exports = router;
