const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const multer = require('multer');
const jwt = require('jsonwebtoken');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Middleware to verify admin role
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get library content
router.get('/library', async (req, res) => {
  try {
    const content = await Content.find();
    res.json(content);
  } catch (err) {
    console.error('Library fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload content (admin only)
router.post('/upload', verifyAdmin, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'pdf', maxCount: 1 },
  { name: 'text', maxCount: 1 }
]), async (req, res) => {
  try {
    const { video, pdf, text } = req.files;
    const newContent = [];

    if (video) {
      newContent.push({
        title: req.body.title || video[0].originalname.split('.')[0],
        url: `/uploads/${video[0].filename}`,
        type: 'video',
        category: req.body.category || 'Videos'
      });
    }
    if (pdf) {
      newContent.push({
        title: req.body.title || pdf[0].originalname.split('.')[0],
        url: `/uploads/${pdf[0].filename}`,
        type: 'pdf',
        category: req.body.category || 'Documents'
      });
    }
    if (text) {
      const textContent = text[0].buffer.toString('utf8');
      const lines = textContent.split('\n').filter(line => line.trim());
      lines.forEach(line => {
        const match = line.match(/\[(.+)\]\s*:\s*(.+)/);
        if (match) {
          newContent.push({
            title: match[1],
            url: match[2],
            type: match[2].endsWith('.m3u8') ? 'video' : 'text',
            category: req.body.category || 'Text'
          });
        }
      });
    }

    const savedContent = await Content.insertMany(newContent);
    res.json({ message: 'Upload successful', content: savedContent });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Server error during upload' });
  }
});

module.exports = router;