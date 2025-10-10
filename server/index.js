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
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// Root route for testing
app.get('/', (req, res) => {
  res.json({ message: 'NexusStream Backend API' });
});
app.get('/api/auth/test', (req, res) => {
  res.json({ message: 'API is running' });
});
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));