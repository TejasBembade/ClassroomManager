const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.SESSION_SECRET || 'fallback_secret';

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: 'Wrong password' });
    }

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    res.json({ message: 'Login successful', role: user.role, token });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const logout = (req, res) => {
  // With JWT, logout is handled client-side by deleting the token
  res.json({ message: 'Logged out' });
};

const getMe = (req, res) => {
  // req.user is set by the JWT middleware (verifyToken)
  res.json(req.user);
};

module.exports = { login, logout, getMe };