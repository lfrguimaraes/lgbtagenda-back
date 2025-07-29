
const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  age: Number,
  sexualPosition: { type: String, enum: ['top', 'bottom', 'versatile'] },
  tribe: { type: String, enum: ['muscled', 'fit', 'sporty', 'bear', 'twink', 'twank', 'otter'] },
  profileImageUrl: String,
  preferredCity: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});
module.exports = mongoose.model('User', UserSchema);
