// models/Balance.js
const pool = require('../config/db');

// Create Balances table if not exists
const initBalanceTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS balances (
      id SERIAL PRIMARY KEY,
      user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      available_balance NUMERIC(10,2) DEFAULT 0.00,
      locked_balance NUMERIC(10,2) DEFAULT 0.00,
      total_deposited NUMERIC(10,2) DEFAULT 0.00,
      total_withdrawn NUMERIC(10,2) DEFAULT 0.00,
      total_returns NUMERIC(10,2) DEFAULT 0.00,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_balances_user_id ON balances(user_id);
  `);
};

const Balance = {
  /**
   * Initialize balance for a new user
   */
  async initialize(user_id) {
    const result = await pool.query(
      `INSERT INTO balances (user_id, available_balance, locked_balance, total_deposited, total_withdrawn, total_returns)
       VALUES ($1, 0.00, 0.00, 0.00, 0.00, 0.00)
       ON CONFLICT (user_id) DO NOTHING
       RETURNING *`,
      [user_id]
    );
    return result.rows[0];
  },

  /**
   * Get user balance
   */
  async findByUserId(user_id) {
    const result = await pool.query(
      'SELECT * FROM balances WHERE user_id = $1',
      [user_id]
    );
    
    // If balance doesn't exist, initialize it
    if (result.rows.length === 0) {
      return await this.initialize(user_id);
    }
    
    return result.rows[0];
  },

  /**
   * Add to available balance
   */
  async addToAvailableBalance(user_id, amount, description = '') {
    // Ensure balance exists
    await this.initialize(user_id);
    
    const result = await pool.query(
      `UPDATE balances 
       SET available_balance = available_balance + $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING *`,
      [amount, user_id]
    );
    
    return result.rows[0];
  },

  /**
   * Deduct from available balance
   */
  async deductFromAvailableBalance(user_id, amount, description = '') {
    // Check if user has sufficient balance
    const balance = await this.findByUserId(user_id);
    
    if (parseFloat(balance.available_balance) < parseFloat(amount)) {
      throw new Error('Insufficient available balance');
    }
    
    const result = await pool.query(
      `UPDATE balances 
       SET available_balance = available_balance - $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING *`,
      [amount, user_id]
    );
    
    return result.rows[0];
  },

  /**
   * Lock balance (for pending withdrawals or investments)
   */
  async lockBalance(user_id, amount) {
    // Check if user has sufficient available balance
    const balance = await this.findByUserId(user_id);
    
    if (parseFloat(balance.available_balance) < parseFloat(amount)) {
      throw new Error('Insufficient available balance to lock');
    }
    
    const result = await pool.query(
      `UPDATE balances 
       SET available_balance = available_balance - $1,
           locked_balance = locked_balance + $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING *`,
      [amount, user_id]
    );
    
    return result.rows[0];
  },

  /**
   * Unlock balance (if withdrawal/investment fails)
   */
  async unlockBalance(user_id, amount) {
    const result = await pool.query(
      `UPDATE balances 
       SET available_balance = available_balance + $1,
           locked_balance = locked_balance - $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING *`,
      [amount, user_id]
    );
    
    return result.rows[0];
  },

  /**
   * Add to total deposited
   */
  async addToTotalDeposited(user_id, amount) {
    await this.initialize(user_id);
    
    const result = await pool.query(
      `UPDATE balances 
       SET total_deposited = total_deposited + $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING *`,
      [amount, user_id]
    );
    
    return result.rows[0];
  },

  /**
   * Add to total withdrawn
   */
  async addToTotalWithdrawn(user_id, amount) {
    const result = await pool.query(
      `UPDATE balances 
       SET total_withdrawn = total_withdrawn + $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING *`,
      [amount, user_id]
    );
    
    return result.rows[0];
  },

  /**
   * Add to total returns
   */
  async addToTotalReturns(user_id, amount) {
    const result = await pool.query(
      `UPDATE balances 
       SET total_returns = total_returns + $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING *`,
      [amount, user_id]
    );
    
    return result.rows[0];
  },

  /**
   * Calculate total balance (available + locked)
   */
  async calculateTotalBalance(user_id) {
    const balance = await this.findByUserId(user_id);
    
    return {
      available_balance: parseFloat(balance.available_balance),
      locked_balance: parseFloat(balance.locked_balance),
      total_balance: parseFloat(balance.available_balance) + parseFloat(balance.locked_balance),
      total_deposited: parseFloat(balance.total_deposited),
      total_withdrawn: parseFloat(balance.total_withdrawn),
      total_returns: parseFloat(balance.total_returns)
    };
  },

  /**
   * Get balance history (changes over time)
   */
  async getBalanceHistory(user_id, days = 30) {
    // Get transactions that affected balance
    const result = await pool.query(
      `SELECT 
        DATE(created_at) as date,
        SUM(CASE WHEN type = 'deposit' AND status = 'completed' THEN amount ELSE 0 END) as deposits,
        SUM(CASE WHEN type = 'withdrawal' AND status = 'completed' THEN amount ELSE 0 END) as withdrawals,
        SUM(CASE WHEN type = 'return' AND status = 'completed' THEN amount ELSE 0 END) as returns
       FROM transactions
       WHERE user_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '${days} days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      [user_id]
    );
    
    return result.rows;
  },

  /**
   * Get all balances (admin)
   */
  async findAll(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    
    const result = await pool.query(
      `SELECT b.*, u.name, u.email 
       FROM balances b
       LEFT JOIN users u ON b.user_id = u.id
       ORDER BY (b.available_balance + b.locked_balance) DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    const countResult = await pool.query('SELECT COUNT(*) FROM balances');
    const total = parseInt(countResult.rows[0].count);
    
    return {
      balances: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get platform balance statistics (admin)
   */
  async getPlatformStats() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COALESCE(SUM(available_balance), 0) as total_available,
        COALESCE(SUM(locked_balance), 0) as total_locked,
        COALESCE(SUM(available_balance + locked_balance), 0) as total_balance,
        COALESCE(SUM(total_deposited), 0) as total_deposited,
        COALESCE(SUM(total_withdrawn), 0) as total_withdrawn,
        COALESCE(SUM(total_returns), 0) as total_returns
      FROM balances
    `);
    
    return result.rows[0];
  }
};

initBalanceTable();

module.exports = Balance;
