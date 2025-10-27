// Admin routes for manual triggers
const express = require('express');
const router = express.Router();
const DailyReturnsService = require('../services/DailyReturnsService');

// Manual trigger for daily returns calculation
router.post('/trigger-daily-returns', async (req, res) => {
  try {
    await DailyReturnsService.triggerManualCalculation();
    res.json({ success: true, message: 'Daily returns calculation triggered successfully' });
  } catch (error) {
    console.error('Error triggering daily returns:', error);
    res.status(500).json({ error: 'Failed to trigger daily returns calculation' });
  }
});

module.exports = router;