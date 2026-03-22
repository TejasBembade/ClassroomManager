const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/instructor', require('./routes/instructor'));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

app.get('/api/debug', (req, res) => {
  res.json(req.session.user);
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected!');
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log('Connection failed:', err.message);
  });