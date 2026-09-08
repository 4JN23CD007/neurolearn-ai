const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserModel } = require('../models/store');

const router = express.Router();

function generateToken(userId) {
  const secret = process.env.JWT_SECRET || 'neurolearn_jwt_secret_default_key';
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'name, email, and password are required' });

    if (UserModel.findByEmail(email))
      return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = UserModel.create({ name, email, passwordHash });
    const token = generateToken(user.id);

    res.status(201).json({ token, user: UserModel.toPublic(user) });
  } catch (err) { next(err); }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'email and password are required' });

    const user = UserModel.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user.id);
    res.json({ token, user: UserModel.toPublic(user) });
  } catch (err) { next(err); }
});

// POST /api/auth/guest — create anonymous session
router.post('/guest', async (req, res, next) => {
  try {
    const name = 'Guest Learner';
    const email = `guest_${Date.now()}@neurolearn.local`;
    const passwordHash = await bcrypt.hash('guest', 1);
    const user = UserModel.create({ name, email, passwordHash });
    const token = generateToken(user.id);
    res.status(201).json({ token, user: UserModel.toPublic(user) });
  } catch (err) { next(err); }
});

module.exports = router;
