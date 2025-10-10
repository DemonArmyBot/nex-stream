const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const jwt = require('jsonwebtoken');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const ffmpegStatic = require('ffmpeg-static');

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token role:', decoded.role);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.get('/library', async (req, res) => {
  try {
    const content = await Content.find();
    res.json(content);
  } catch (err) {
    console.error('Library fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/content/upload', verifyAdmin, async (req, res) => {
  try {
    const { url, title, thumbnail, category, type, textContent } = req.body;
    const newContent = [];

    if (textContent) {
      const lines = textContent.split('\n').filter(line => line.trim());
      if (lines.length === 0) return res.status(400).json({ error: 'Text content is empty' });
      let validLines = 0;
      lines.forEach(line => {
        const match = line.match(/\[(.+)\]\s*:\s*(.+)/);
        if (match) {
          validLines++;
          newContent.push({
            title: match[1],
            url: match[2].trim(),
            type: 'video',
            thumbnail: thumbnail || '',
            category: category || 'Text'
          });
        }
      });
      if (validLines === 0) return res.status(400).json({ error: 'No valid [Title] : URL format found' });
    } else if (url) {
      newContent.push({
        title: title || 'Untitled',
        url: url.trim(),
        type: type || 'video',
        thumbnail: thumbnail || '',
        category: category || 'Videos'
      });
    } else {
      return res.status(400).json({ error: 'No valid content provided' });
    }

    const savedContent = await Content.insertMany(newContent);
    console.log('Upload successful, saved content:', savedContent);
    res.json({ message: 'Upload successful', content: savedContent });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Server error during upload', details: err.message });
  }
});

router.put('/content/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, thumbnail } = req.body;
    const updatedContent = await Content.findByIdAndUpdate(id, { title, thumbnail }, { new: true });
    if (!updatedContent) return res.status(404).json({ error: 'Content not found' });
    console.log('Content updated:', updatedContent);
    res.json({ message: 'Update successful', content: updatedContent });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Server error during update' });
  }
});

module.exports = router;