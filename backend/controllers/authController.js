const User = require('../models/User');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check password
    if (user.password !== password) {
      return res.status(401).json({ message: 'Wrong password' });
    }

    // Save user in session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId
    };

    res.json({ message: 'Login successful', role: user.role });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const logout = (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out' });
};

const getMe = (req, res) => {
  res.json(req.session.user);
};

module.exports = { login, logout, getMe };