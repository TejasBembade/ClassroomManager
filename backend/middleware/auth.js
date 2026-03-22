const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.SESSION_SECRET || 'fallback_secret';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Please login first' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token, please login again' });
  }
};

const isLoggedIn = verifyToken;

const isAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access only' });
    }
    next();
  });
};

const isInstructor = (req, res, next) => {
  verifyToken(req, res, () => {
    if (!req.user || req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Instructor access only' });
    }
    next();
  });
};

module.exports = { isLoggedIn, isAdmin, isInstructor };