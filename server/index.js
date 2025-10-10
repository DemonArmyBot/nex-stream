require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const path = require('path');
const fs = require('fs');

// Create Uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'Uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = ['https://nex-stream-mu.vercel.app'];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json()); // Ensure this parses POST bodies
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// Root route for testing
app.get('/', (req, res) => {
  res.json({ message: 'NexusStream Backend API' });
});
app.use(cors({
  origin: 'https://nex-stream-mu.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
// Debug route to confirm authRoutes
app.get('/api/auth/debug', (req, res) => {
  res.json({ message: 'Auth routes are loaded', routes: Object.keys(authRoutes.stack).length });
});

// Add a catch-all to check unhandled routes
app.use((req, res, next) => {
  console.log(`Unhandled request: ${req.method} ${req.url}`);
  next();
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));