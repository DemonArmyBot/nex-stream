require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const path = require('path');
const fs = require('fs');

const app = express();

// Create Uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'Uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors({
  origin: 'https://nex-stream-mu.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'NexusStream Backend API' });
});

app.get('/api/auth/debug', (req, res) => {
  res.json({ message: 'Auth routes are loaded', routes: Object.keys(authRoutes.stack).length });
});

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);

app.use((req, res) => {
  console.log(`Unhandled request: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found' });
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));