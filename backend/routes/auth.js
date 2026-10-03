const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/User');
const { protect, signToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// --- simple brute-force guard: 5 wrong passwords => 15 minute lockout per IP ---
const attempts = new Map();
const MAX_TRIES = 5;
const LOCK_MS = 15 * 60 * 1000;
const isLocked = (ip) => {
  const a = attempts.get(ip);
  return a && a.count >= MAX_TRIES && Date.now() - a.last < LOCK_MS;
};
const fail = (ip) => {
  const a = attempts.get(ip);
  const fresh = !a || Date.now() - a.last >= LOCK_MS;
  attempts.set(ip, { count: fresh ? 1 : a.count + 1, last: Date.now() });
};

const safeEqual = (a, b) => {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
};

// POST /api/auth/login   { password }
// First ever login: the account is created from the ADMIN_PASSWORD env variable.
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const ip = req.ip;
    if (isLocked(ip)) {
      res.status(429);
      throw new Error('Too many attempts. Try again in 15 minutes.');
    }
    const { password } = req.body;
    if (!password || typeof password !== 'string') {
      res.status(400);
      throw new Error('Password is required');
    }

    let user = await User.findOne();
    if (!user) {
      const seed = process.env.ADMIN_PASSWORD;
      if (!seed || !safeEqual(password, seed)) {
        fail(ip);
        res.status(401);
        throw new Error('Incorrect password');
      }
      user = await User.create({ passwordHash: await bcrypt.hash(password, 12) });
    } else if (!(await bcrypt.compare(password, user.passwordHash))) {
      fail(ip);
      res.status(401);
      throw new Error('Incorrect password');
    }

    attempts.delete(ip);
    res.json({ success: true, token: signToken(user) });
  })
);

// POST /api/auth/change-password   { currentPassword, newPassword }
router.post(
  '/change-password',
  protect,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400);
      throw new Error('Both passwords are required');
    }
    if (newPassword.length < 8) {
      res.status(400);
      throw new Error('New password must be at least 8 characters');
    }
    if (!(await bcrypt.compare(currentPassword, req.user.passwordHash))) {
      res.status(400);
      throw new Error('Current password is incorrect');
    }
    req.user.passwordHash = await bcrypt.hash(newPassword, 12);
    req.user.tokenVersion += 1; // logs out every other device
    await req.user.save();
    res.json({ success: true, token: signToken(req.user) });
  })
);

module.exports = router;
