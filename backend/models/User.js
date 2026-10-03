const mongoose = require('mongoose');

// Single owner account. tokenVersion is bumped on every password change so
// all previously issued login tokens stop working immediately.
const UserSchema = new mongoose.Schema(
  {
    passwordHash: { type: String, required: true },
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
