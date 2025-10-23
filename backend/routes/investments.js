// routes/investments.js
const express = require('express');
const investmentController = require('../controllers/investmentController');
const auth = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/plans', investmentController.getPlans);

// Protected routes
router.post('/pending', auth, investmentController.createPendingInvestment);
router.post('/', auth, investmentController.createInvestment);
router.get('/my-investments', auth, investmentController.getUserInvestments);
router.get('/dashboard-stats', auth, investmentController.getDashboardStats);
router.get('/portfolio-growth', auth, investmentController.getPortfolioGrowth);

module.exports = router;