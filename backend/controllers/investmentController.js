// controllers/investmentController.js
const Investment = require('../models/Investment');
const InvestmentPlan = require('../models/InvestmentPlan');

const investmentController = {
  // Get all investment plans
  async getPlans(req, res) {
    try {
      const plans = await InvestmentPlan.findAll();
      res.json(plans);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // Create new investment
  async createInvestment(req, res) {
    try {
      const { plan_id, amount } = req.body;
      const user_id = req.user.id;

      const plan = await InvestmentPlan.findById(plan_id);
      if (!plan) {
        return res.status(404).json({ error: 'Investment plan not found' });
      }

      if (amount < plan.min_amount || amount > plan.max_amount) {
        return res.status(400).json({ 
          error: `Amount must be between $${plan.min_amount} and $${plan.max_amount}` 
        });
      }

      const investment = await Investment.create({
        user_id,
        plan_name: plan.name,
        amount: parseFloat(amount),
        daily_return_rate: plan.daily_return_rate,
        duration_days: plan.duration_days
      });

      res.status(201).json(investment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // Get user investments
  async getUserInvestments(req, res) {
    try {
      const user_id = req.user.id;
      const investments = await Investment.findByUserId(user_id);
      
      // Calculate current returns for each investment
      const investmentsWithReturns = investments.map(inv => {
        const daysPassed = Math.floor((new Date() - new Date(inv.created_at)) / (1000 * 60 * 60 * 24));
        const currentReturn = inv.amount * inv.daily_return_rate * Math.min(daysPassed, inv.duration_days);
        const currentValue = parseFloat(inv.amount) + currentReturn;
        
        return {
          ...inv,
          days_passed: daysPassed,
          current_return: currentReturn.toFixed(2),
          current_value: currentValue.toFixed(2),
          progress: Math.min((daysPassed / inv.duration_days) * 100, 100).toFixed(1)
        };
      });

      res.json(investmentsWithReturns);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // Get user dashboard stats
  async getDashboardStats(req, res) {
    try {
      const user_id = req.user.id;
      const stats = await Investment.getUserStats(user_id);
      const investments = await Investment.findByUserId(user_id);

      // Calculate total current returns
      let totalCurrentReturns = 0;
      investments.forEach(inv => {
        const daysPassed = Math.floor((new Date() - new Date(inv.created_at)) / (1000 * 60 * 60 * 24));
        const currentReturn = inv.amount * inv.daily_return_rate * Math.min(daysPassed, inv.duration_days);
        totalCurrentReturns += currentReturn;
      });

      const dashboardData = {
        ...stats,
        total_current_returns: totalCurrentReturns.toFixed(2),
        current_portfolio_value: (parseFloat(stats.total_invested) + totalCurrentReturns).toFixed(2),
        active_investments: investments.filter(inv => inv.status === 'active').length
      };

      res.json(dashboardData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // Get portfolio growth data for chart
  async getPortfolioGrowth(req, res) {
    try {
      const user_id = req.user.id;
      const investments = await Investment.findByUserId(user_id);
      
      // Generate 30 days of portfolio growth data
      const growthData = [];
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        let dayValue = 0;
        investments.forEach(inv => {
          const invStart = new Date(inv.created_at);
          if (date >= invStart) {
            const daysPassed = Math.floor((date - invStart) / (1000 * 60 * 60 * 24));
            const returns = inv.amount * inv.daily_return_rate * Math.min(daysPassed, inv.duration_days);
            dayValue += parseFloat(inv.amount) + returns;
          }
        });
        
        growthData.push({
          date: date.toISOString().split('T')[0],
          value: dayValue.toFixed(2)
        });
      }
      
      res.json(growthData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
};

module.exports = investmentController;