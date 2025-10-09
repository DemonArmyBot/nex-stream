const mongoose = require('mongoose');
const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Content' }]
});
module.exports = mongoose.model('Playlist', playlistSchema);