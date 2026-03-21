const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected!');

    // Check if admin already exists
    const existing = await User.findOne({ email: 'admin@college.com' });
    if (existing) {
      console.log('Admin already exists!');
      process.exit();
    }

    // Create admin user
    await User.create({
      name: 'Admin',
      email: 'admin@college.com',
      password: 'admin123',
      role: 'admin',
      departmentId: null
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@college.com');
    console.log('Password: admin123');
    process.exit();
  })
  .catch((err) => {
    console.log('Error:', err.message);
    process.exit();
  });