// controllers/userController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userController = {
  register: async (req, res) => {
    try {
      const { name, email, password, referralCode } = req.body;
      
      // Validation
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }
      
      if (!/^\d{4}$/.test(password)) {
        return res.status(400).json({ error: 'Password must be exactly 4 digits' });
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Please enter a valid email address' });
      }

      const existing = await User.findByEmail(email.toLowerCase());
      if (existing) return res.status(400).json({ error: 'User already exists' });

      const user = await User.create({ name: name.trim(), email: email.toLowerCase(), password });
      
      // Handle referral if provided
      if (referralCode) {
        try {
          const pool = require('../config/db');
          const referrer = await pool.query('SELECT id FROM users WHERE id = $1', [referralCode]);
          
          if (referrer.rows.length > 0) {
            await pool.query(
              'INSERT INTO referrals (referrer_id, referred_id, status) VALUES ($1, $2, $3)',
              [referralCode, user.id, 'active']
            );
            console.log(`✅ Referral recorded: ${referralCode} -> ${user.id}`);
          }
        } catch (refError) {
          console.error('Referral error:', refError);
          // Don't fail registration if referral fails
        }
      }
      
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      // Remove password from response
      const { password: _, ...userResponse } = user;
      
      console.log(`✅ New user registered: ${email}`);
      res.status(201).json({ user: userResponse, token });
    } catch (err) {
      console.error('Registration error:', err);
      if (err.code === '23505') { // Unique constraint violation
        return res.status(400).json({ error: 'Email already exists' });
      }
      res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await User.findByEmail(email.toLowerCase());
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      // Check if user is active
      if (user.status === 'suspended') {
        return res.status(403).json({ error: 'Account suspended. Contact support.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Update last login
      await User.updateLastLogin(user.id);
      
      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
      
      // Remove password from response
      const { password: _, ...userResponse } = user;
      
      console.log(`✅ User logged in: ${email}`);
      res.json({ user: userResponse, token });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Login failed. Please try again.' });
    }
  },

  // Get current user profile
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (err) {
      console.error('Get profile error:', err);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const users = await User.all();
      res.json(users);
    } catch (err) {
      console.error('Get users error:', err);
      res.status(500).json({ error: 'Failed to get users' });
    }
  }
};

module.exports = userController;
