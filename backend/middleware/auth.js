const isLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Please login first' });
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' });
  }
  next();
};

const isInstructor = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'instructor') {
    return res.status(403).json({ message: 'Instructor access only' });
  }
  next();
};

module.exports = { isLoggedIn, isAdmin, isInstructor };