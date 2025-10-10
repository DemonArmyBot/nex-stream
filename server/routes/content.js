const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../Uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
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
    console.log('Decoded token role:', decoded.role); // Debug log
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
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
    console.log('Files received:', req.files); // Debug log
    const { video, pdf, text } = req.files || {};
    const newContent = [];

    if (video) {
      const videoExt = path.extname(video[0].originalname).toLowerCase();
      const isVideo = ['.mp4', '.m3u8', '.mov', '.avi'].includes(videoExt); // Support multiple formats
      if (isVideo) {
        newContent.push({
          title: req.body.title || video[0].originalname.split('.')[0],
          url: `/uploads/${video[0].filename}`,
          type: 'video',
          category: req.body.category || 'Videos',
          thumbnail: await generateThumbnail(video[0].path), // Add thumbnail generation
          metadata: await getMetadata(video[0].path) // Add metadata extraction
        });
      } else {
        return res.status(400).json({ error: `Unsupported video format: ${videoExt}` });
      }
    }
    if (pdf) {
      newContent.push({
        title: req.body.title || pdf[0].originalname.split('.')[0],
        url: `/uploads/${pdf[0].filename}`,
        type: 'pdf',
        category: req.body.category || 'Documents',
        thumbnail: await generatePdfThumbnail(pdf[0].path) // Placeholder for PDF thumbnail
      });
    }
    if (text) {
      const textFilePath = text[0].path;
      const textContent = fs.readFileSync(textFilePath, 'utf8');
      console.log('Text file content:', textContent); // Debug log
      const lines = textContent.split('\n').filter(line => line.trim());
      if (lines.length === 0) {
        return res.status(400).json({ error: 'Text file is empty' });
      }
      let validLines = 0;
      lines.forEach(line => {
        const match = line.match(/\[(.+)\]\s*:\s*(.+)/);
        if (match) {
          validLines++;
          const url = match[2].trim().toLowerCase();
          const type = url.endsWith('.mp4') || url.endsWith('.m3u8') || url.endsWith('.mov') || url.endsWith('.avi') ? 'video' : 'text';
          newContent.push({
            title: match[1],
            url: match[2],
            type: type,
            category: req.body.category || 'Text',
            thumbnail: type === 'video' ? await generateThumbnail(match[2]) : '', // Generate thumbnail for external videos
            metadata: type === 'video' ? await getMetadata(match[2]) : {} // Get metadata for external videos
          });
        }
      });
      if (validLines === 0) {
        return res.status(400).json({ error: 'No valid [Title] : URL format found in text file' });
      }
    }

    if (newContent.length === 0) {
      return res.status(400).json({ error: 'No valid content to upload' });
    }

    const savedContent = await Content.insertMany(newContent);
    console.log('Upload successful, saved content:', savedContent); // Debug log
    res.json({ message: 'Upload successful', content: savedContent });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Server error during upload', details: err.message });
  }
});

// Helper functions for thumbnail and metadata (using fluent-ffmpeg)
async function generateThumbnail(url) {
  // Placeholder for external URL thumbnail generation
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAABJRU5ErkJggg=='; // Gray placeholder
}

async function getMetadata(url) {
  // Placeholder for metadata extraction
  return { duration: 'Unknown', resolution: 'Unknown', format: 'Unknown' };
}

async function generatePdfThumbnail(pdfPath) {
  // Placeholder for PDF thumbnail
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAABJRU5ErkJggg=='; // Gray placeholder
}

module.exports = router;