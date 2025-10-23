// models/Transaction.js
const pool = require('../config/db');

// Create Transactions table if not exists
const initTransactionTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      amount NUMERIC(10,2) NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      reference VARCHAR(100) UNIQUE,
      description TEXT,
      metadata JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
    CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(reference);
    CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
  `);
};

const Transaction = {
  /**
   * Create a new transaction
   */
  async create({ user_id, type, amount, reference, description, metadata = {}, status = 'pending' }) {
    const result = await pool.query(
      `INSERT INTO transactions (user_id, type, amount, reference, description, metadata, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [user_id, type, amount, reference, description, JSON.stringify(metadata), status]
    );
    return result.rows[0];
  },

  /**
   * Get transaction by ID
   */
  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  /**
   * Get transaction by reference
   */
  async findByReference(reference) {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE reference = $1',
      [reference]
    );
    return result.rows[0];
  },

  /**
   * Get user transactions with pagination and filters
   */
  async findByUserId(user_id, filters = {}, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM transactions WHERE user_id = $1';
    const params = [user_id];
    let paramCount = 2;

    // Add type filter
    if (filters.type) {
      query += ` AND type = $${paramCount}`;
      params.push(filters.type);
      paramCount++;
    }

    // Add status filter
    if (filters.status) {
      query += ` AND status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    // Add date range filter
    if (filters.start_date) {
      query += ` AND created_at >= $${paramCount}`;
      params.push(filters.start_date);
      paramCount++;
    }

    if (filters.end_date) {
      query += ` AND created_at <= $${paramCount}`;
      params.push(filters.end_date);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    
    // Get total count
    const countQuery = 'SELECT COUNT(*) FROM transactions WHERE user_id = $1';
    const countResult = await pool.query(countQuery, [user_id]);
    const total = parseInt(countResult.rows[0].count);

    return {
      transactions: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get all transactions (admin)
   */
  async findAll(filters = {}, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    let query = 'SELECT t.*, u.name as user_name, u.email as user_email FROM transactions t LEFT JOIN users u ON t.user_id = u.id WHERE 1=1';
    const params = [];
    let paramCount = 1;

    // Add filters
    if (filters.type) {
      query += ` AND t.type = $${paramCount}`;
      params.push(filters.type);
      paramCount++;
    }

    if (filters.status) {
      query += ` AND t.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.user_id) {
      query += ` AND t.user_id = $${paramCount}`;
      params.push(filters.user_id);
      paramCount++;
    }

    if (filters.start_date) {
      query += ` AND t.created_at >= $${paramCount}`;
      params.push(filters.start_date);
      paramCount++;
    }

    if (filters.end_date) {
      query += ` AND t.created_at <= $${paramCount}`;
      params.push(filters.end_date);
      paramCount++;
    }

    query += ` ORDER BY t.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    
    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) FROM transactions');
    const total = parseInt(countResult.rows[0].count);

    return {
      transactions: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Update transaction status
   */
  async updateStatus(id, status, metadata = {}) {
    const result = await pool.query(
      `UPDATE transactions 
       SET status = $1, metadata = metadata || $2::jsonb, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 RETURNING *`,
      [status, JSON.stringify(metadata), id]
    );
    return result.rows[0];
  },

  /**
   * Get transaction statistics for a user
   */
  async getUserStats(user_id, start_date = null, end_date = null) {
    let query = `
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(CASE WHEN type = 'deposit' AND status = 'completed' THEN amount ELSE 0 END), 0) as total_deposits,
        COALESCE(SUM(CASE WHEN type = 'withdrawal' AND status = 'completed' THEN amount ELSE 0 END), 0) as total_withdrawals,
        COALESCE(SUM(CASE WHEN type = 'return' AND status = 'completed' THEN amount ELSE 0 END), 0) as total_returns,
        COALESCE(SUM(CASE WHEN type = 'commission' AND status = 'completed' THEN amount ELSE 0 END), 0) as total_commissions
      FROM transactions 
      WHERE user_id = $1
    `;
    
    const params = [user_id];
    let paramCount = 2;

    if (start_date) {
      query += ` AND created_at >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      query += ` AND created_at <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    const result = await pool.query(query, params);
    return result.rows[0];
  },

  /**
   * Get platform statistics (admin)
   */
  async getPlatformStats(start_date = null, end_date = null) {
    let query = `
      SELECT 
        COUNT(*) as total_transactions,
        COUNT(DISTINCT user_id) as unique_users,
        COALESCE(SUM(CASE WHEN type = 'deposit' AND status = 'completed' THEN amount ELSE 0 END), 0) as total_deposits,
        COALESCE(SUM(CASE WHEN type = 'withdrawal' AND status = 'completed' THEN amount ELSE 0 END), 0) as total_withdrawals,
        COALESCE(SUM(CASE WHEN type = 'return' AND status = 'completed' THEN amount ELSE 0 END), 0) as total_returns,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_amount
      FROM transactions 
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;

    if (start_date) {
      query += ` AND created_at >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      query += ` AND created_at <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    const result = await pool.query(query, params);
    return result.rows[0];
  },

  /**
   * Delete transaction (admin only, use with caution)
   */
  async delete(id) {
    const result = await pool.query(
      'DELETE FROM transactions WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
};

initTransactionTable();

module.exports = Transaction;
