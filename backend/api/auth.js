const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const dbPath = path.join(__dirname, '..', 'db');
const verifyToken = require('../middleware/auth');
const users = JSON.parse(fs.readFileSync(path.join(dbPath, 'users.json'), 'utf8'));

const SECRET_KEY = 'your-secret-key'; // In a real app, use an environment variable

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role || 'customer' }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

router.post('/register', (req, res) => {
  const { email, password, name, phone } = req.body;
  const newUser = {
    id: users.length + 1,
    name,
    email,
    phone,
    password, // In production, hash this
    role: 'customer'
  };
  users.push(newUser);
  fs.writeFileSync(path.join(dbPath, 'users.json'), JSON.stringify(users, null, 2));
  res.status(201).json({ message: 'User created', user: newUser });
});

router.get('/profile', verifyToken, (req, res) => {
  const user = users.find(u => u.id === req.userId);
  if (user) {
    const { password, ...profile } = user;
    res.json(profile);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

module.exports = router;
