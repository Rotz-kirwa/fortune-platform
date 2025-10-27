
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

// Referral endpoints
router.get('/referral-stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const baseUrl = process.env.FRONTEND_URL || 'https://fortune-platform-two.vercel.app';
    
    // Get referral stats from database
    const pool = require('../config/db');
    const result = await pool.query(`
      SELECT 
        COUNT(r.id) as total_referrals,
        COALESCE(SUM(r.commission_amount), 0) as total_commission
      FROM referrals r 
      WHERE r.referrer_id = $1
    `, [userId]);
    
    const stats = result.rows[0] || { total_referrals: 0, total_commission: 0 };
    
    res.json({
      referral_link: `${baseUrl}/register?ref=${userId}`,
      total_referrals: parseInt(stats.total_referrals),
      total_commission: parseFloat(stats.total_commission).toFixed(2)
    });
  } catch (err) {
    console.error('Error fetching referral stats:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
