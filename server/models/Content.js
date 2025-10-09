const mongoose = require('mongoose');
const contentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['video', 'pdf'], required: true },
  url: { type: String, required: true },
  thumbnail: { type: String },
  category: { type: String },
  metadata: {
    duration: String,
    resolution: String,
    format: String
  },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Content', contentSchema);