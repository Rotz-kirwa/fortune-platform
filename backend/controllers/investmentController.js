// controllers/investmentController.js
const Investment = require('../models/Investment');
const InvestmentPlan = require('../models/InvestmentPlan');

const PendingInvestment = require('../models/PendingInvestment');

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

  // Create pending investment (before payment)
  async createPendingInvestment(req, res) {
    try {
      const { plan_id, amount, phone_number, checkout_request_id, user_id } = req.body;
      
      // If no user_id provided, use a default or create anonymous pending investment
      const actualUserId = user_id || null;

      const plan = await InvestmentPlan.findById(plan_id);
      if (!plan) {
        return res.status(404).json({ error: 'Investment plan not found' });
      }

      if (amount < plan.min_amount || amount > plan.max_amount) {
        return res.status(400).json({ 
          error: `Amount must be between KSh ${plan.min_amount} and KSh ${plan.max_amount}` 
        });
      }

      const pendingInvestment = await PendingInvestment.create({
        user_id: actualUserId,
        plan_id: plan.id,
        plan_name: plan.name,
        amount: parseFloat(amount),
        daily_return_rate: plan.daily_return_rate,
        duration_days: plan.duration_days,
        phone_number,
        checkout_request_id
      });

      console.log(`⏳ Pending investment created: ${checkout_request_id}`);
      res.status(201).json(pendingInvestment);
    } catch (error) {
      console.error('Create pending investment error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // Create new investment (only after payment confirmation)
  async createInvestment(req, res) {
    try {
      const { plan_id, amount, checkout_request_id } = req.body;
      const user_id = req.user.id;

      // Validate that this is from a confirmed payment
      if (!checkout_request_id) {
        return res.status(400).json({ error: 'Payment confirmation required' });
      }

      const plan = await InvestmentPlan.findById(plan_id);
      if (!plan) {
        return res.status(404).json({ error: 'Investment plan not found' });
      }

      if (amount < plan.min_amount || amount > plan.max_amount) {
        return res.status(400).json({ 
          error: `Amount must be between KSh ${plan.min_amount} and KSh ${plan.max_amount}` 
        });
      }

      const investment = await Investment.create({
        user_id,
        plan_id: plan.id,
        plan_name: plan.name,
        amount: parseFloat(amount),
        daily_return_rate: plan.daily_return_rate,
        duration_days: plan.duration_days
      });

      console.log(`✅ Investment created for user ${user_id}: KSh ${amount} in ${plan.name}`);
      res.status(201).json(investment);
    } catch (error) {
      console.error('Create investment error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // Get user investments
  async getUserInvestments(req, res) {
    try {
      const user_id = req.user.id;
      console.log('Getting investments for user:', user_id);
      
      const investments = await Investment.findByUserId(user_id);
      console.log('Found investments:', investments.length);
      
      // Return investments with current data (updated by automated service)
      const investmentsWithReturns = investments.map(inv => ({
        ...inv,
        current_return: parseFloat(inv.current_return || 0).toFixed(2),
        current_value: parseFloat(inv.current_value || inv.amount).toFixed(2),
        progress: parseFloat(inv.progress || 0).toFixed(1),
        days_passed: inv.days_passed || 0
      }));

      res.json(investmentsWithReturns);
    } catch (error) {
      console.error('Get investments error:', error.message);
      console.error('Stack trace:', error.stack);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // Get user dashboard stats
  async getDashboardStats(req, res) {
    try {
      const user_id = req.user.id;
      console.log('Getting dashboard stats for user:', user_id);
      
      const stats = await Investment.getUserStats(user_id);
      console.log('Raw stats:', stats);
      
      const investments = await Investment.findByUserId(user_id);
      console.log('User investments:', investments.length);

      // Calculate total current returns from stored values
      let totalCurrentReturns = 0;
      investments.forEach(inv => {
        totalCurrentReturns += parseFloat(inv.current_return || 0);
      });

      // Handle case where user has no investments
      const dashboardData = {
        total_investments: stats?.total_investments || '0',
        total_invested: stats?.total_invested || '0.00',
        total_returns: stats?.total_returns || '0.00',
        portfolio_value: stats?.portfolio_value || '0.00',
        total_current_returns: totalCurrentReturns.toFixed(2),
        current_portfolio_value: stats?.portfolio_value || '0.00',
        active_investments: investments.filter(inv => inv.status === 'active' || !inv.status).length
      };

      console.log('Final dashboard data:', dashboardData);
      res.json(dashboardData);
    } catch (error) {
      console.error('Dashboard stats error:', error.message);
      console.error('Stack trace:', error.stack);
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