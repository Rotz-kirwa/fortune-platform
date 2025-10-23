
// routes/users.js
const express = require('express');
const userController = require('../controllers/userController');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Authentication routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', auth, userController.getProfile);

// CRUD routes
router.get('/', userController.getAllUsers);
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const updatedUser = await User.update(req.params.id, req.body);
    if (!updatedUser) return res.status(404).json({ error: 'User not found or nothing to update' });
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedUser = await User.delete(req.params.id);
    if (!deletedUser) return res.status(404).json({ error: 'User not found' });
    res.json(deletedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
