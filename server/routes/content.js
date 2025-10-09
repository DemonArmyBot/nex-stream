const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs').promises;

router.post('/upload', auth('admin'), upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'pdf', maxCount: 1 },
  { name: 'text', maxCount: 1 }
]), async (req, res) => {
  try {
    const files = req.files;
    if (files.video) {
      const video = files.video[0];
      const metadata = await new Promise((resolve, reject) => {
        ffmpeg.ffprobe(video.path, (err, data) => {
          if (err) return reject(err);
          resolve({
            duration: formatTime(data.format.duration),
            resolution: `${data.streams[0].width}x${data.streams[0].height}`,
            format: data.format.format_name
          });
        });
      });
      const thumbnail = await generateThumbnail(video.path);
      const content = new Content({
        title: video.originalname.replace(/\.[^/.]+$/, ''),
        type: 'video',
        url: `/uploads/${video.filename}`,
        thumbnail: `data:image/jpeg;base64,${thumbnail}`,
        category: parseCategory(video.originalname),
        metadata,
        uploadedBy: req.user.id
      });
      await content.save();
    } else if (files.pdf) {
      const pdf = files.pdf[0];
      const content = new Content({
        title: pdf.originalname.replace(/\.[^/.]+$/, ''),
        type: 'pdf',
        url: `/uploads/${pdf.filename}`,
        category: parseCategory(pdf.originalname),
        uploadedBy: req.user.id
      });
      await content.save();
    } else if (files.text) {
      const text = await fs.readFile(files.text[0].path, 'utf-8');
      const lines = text.split('\n');
      const contents = lines.map(line => {
        const match = line.match(/\[([^\]]+)\] : (https:\/\/[^\s]+)/);
        if (match) {
          return {
            title: match[1].trim(),
            type: 'video',
            url: match[2].trim(),
            category: parseCategory(match[1]),
            uploadedBy: req.user.id
          };
        }
      }).filter(Boolean);
      await Content.insertMany(contents);
    }
    res.json({ message: 'Uploaded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/library', async (req, res) => {
  const contents = await Content.find().populate('uploadedBy', 'username');
  res.json(contents);
});

function parseCategory(name) {
  const match = name.match(/\[([^\]]+)\]/);
  return match ? match[1] : 'Uncategorized';
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

async function generateThumbnail(path) {
  return new Promise((resolve, reject) => {
    ffmpeg(path)
      .screenshots({ count: 1, folder: '/tmp', size: '320x180', filename: 'thumb.jpg' })
      .on('end', async () => {
        const data = await fs.readFile('/tmp/thumb.jpg');
        resolve(data.toString('base64'));
      })
      .on('error', reject);
  });
}

module.exports = router;