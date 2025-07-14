const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = 'your_secret_key'; // Change this to a strong secret in production

// Register route (superuser only)
router.post('/register', authenticateToken, async (req, res) => {
  // Only allow superuser to create users
  if (req.user.role !== 'superuser') {
    return res.status(403).json({ error: 'Access denied: superuser only' });
  }

  const { username, password, role, rate } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashedPassword,
      role: role || 'user',
      rate: rate || 0.0,
    });
    res.status(201).json({ message: 'User created', user: { id: user.id, username: user.username, role: user.role, rate: user.rate } });
  } catch (err) {
    res.status(400).json({ error: 'Username already exists' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ where: { username } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role, rate: user.rate } });
});

// List all users (superuser only)
router.get('/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'superuser') {
    return res.status(403).json({ error: 'Access denied: superuser only' });
  }
  const users = await User.findAll({
    attributes: ['id', 'username', 'role', 'rate']
  });
  res.json({ users });
});

// Update own invoice settings
router.put('/me/invoice', authenticateToken, async (req, res) => {
  const { companyName, invoiceNumber, invoiceToInfo, perHourRate, perCallRate } = req.body;
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.companyName = companyName || user.companyName;
    user.invoiceNumber = invoiceNumber || user.invoiceNumber;
    user.invoiceToInfo = invoiceToInfo || user.invoiceToInfo;
    if (perHourRate !== undefined) user.perHourRate = perHourRate;
    if (perCallRate !== undefined) user.perCallRate = perCallRate;
    await user.save();

    res.json({ message: 'Invoice settings updated', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update invoice settings' });
  }
});

// Get current user's profile
router.get('/users/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

module.exports = router;