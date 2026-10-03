const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler } = require('./errorHandler');

const secret = () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
    throw new Error('JWT_SECRET is missing or too short (use 32+ random characters)');
  }
  return process.env.JWT_SECRET;
};

const signToken = (user) =>
  jwt.sign({ id: user._id.toString(), v: user.tokenVersion }, secret(), { expiresIn: '7d' });

// Blocks every request that doesn't carry a valid, current token.
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    res.status(401);
    throw new Error('Please log in');
  }
  let payload;
  try {
    payload = jwt.verify(token, secret());
  } catch (e) {
    res.status(401);
    throw new Error('Session expired, please log in again');
  }
  const user = await User.findById(payload.id);
  if (!user || user.tokenVersion !== payload.v) {
    res.status(401);
    throw new Error('Session expired, please log in again');
  }
  req.user = user;
  next();
});

module.exports = { protect, signToken };
