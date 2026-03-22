const express = require('express');
const router = express.Router();
const { login, logout, getMe } = require('../controllers/authController');
const { isLoggedIn } = require('../middleware/auth');

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', isLoggedIn, getMe);

module.exports = router;