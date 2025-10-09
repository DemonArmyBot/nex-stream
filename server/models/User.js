const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' }],
  history: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Content' }]
});
module.exports = mongoose.model('User', userSchema);