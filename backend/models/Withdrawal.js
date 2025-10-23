// models/Withdrawal.js
const pool = require('../config/db');

// Create Withdrawals table if not exists
const initWithdrawalTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS withdrawals (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      amount NUMERIC(10,2) NOT NULL,
      phone_number VARCHAR(15) NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      mpesa_transaction_id VARCHAR(100),
      mpesa_receipt_number VARCHAR(100),
      admin_id INT REFERENCES users(id),
      admin_notes TEXT,
      failure_reason TEXT,
      requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      processed_at TIMESTAMP,
      completed_at TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
    CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
    CREATE INDEX IF NOT EXISTS idx_withdrawals_requested_at ON withdrawals(requested_at);
  `);
};

const Withdrawal = {
  /**
   * Create a new withdrawal request
   */
  async create({ user_id, amount, phone_number }) {
    const result = await pool.query(
      `INSERT INTO withdrawals (user_id, amount, phone_number, status, requested_at)
       VALUES ($1, $2, $3, 'pending', CURRENT_TIMESTAMP) RETURNING *`,
      [user_id, amount, phone_number]
    );
    return result.rows[0];
  },

  /**
   * Get withdrawal by ID
   */
  async findById(id) {
    const result = await pool.query(
      `SELECT w.*, u.name as user_name, u.email as user_email,
              a.name as admin_name
       FROM withdrawals w
       LEFT JOIN users u ON w.user_id = u.id
       LEFT JOIN users a ON w.admin_id = a.id
       WHERE w.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  /**
   * Get user withdrawals
   */
  async findByUserId(user_id, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    
    const result = await pool.query(
      `SELECT * FROM withdrawals 
       WHERE user_id = $1 
       ORDER BY requested_at DESC 
       LIMIT $2 OFFSET $3`,
      [user_id, limit, offset]
    );
    
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM withdrawals WHERE user_id = $1',
      [user_id]
    );
    const total = parseInt(countResult.rows[0].count);
    
    return {
      withdrawals: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get pending withdrawals (admin)
   */
  async findPending(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    
    const result = await pool.query(
      `SELECT w.*, u.name as user_name, u.email as user_email, u.phone_number as user_phone,
              b.available_balance, b.locked_balance
       FROM withdrawals w
       LEFT JOIN users u ON w.user_id = u.id
       LEFT JOIN balances b ON w.user_id = b.user_id
       WHERE w.status = 'pending'
       ORDER BY w.requested_at ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM withdrawals WHERE status = 'pending'"
    );
    const total = parseInt(countResult.rows[0].count);
    
    return {
      withdrawals: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get all withdrawals (admin)
   */
  async findAll(filters = {}, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT w.*, u.name as user_name, u.email as user_email,
             a.name as admin_name
      FROM withdrawals w
      LEFT JOIN users u ON w.user_id = u.id
      LEFT JOIN users a ON w.admin_id = a.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    // Add filters
    if (filters.status) {
      query += ` AND w.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.user_id) {
      query += ` AND w.user_id = $${paramCount}`;
      params.push(filters.user_id);
      paramCount++;
    }

    if (filters.start_date) {
      query += ` AND w.requested_at >= $${paramCount}`;
      params.push(filters.start_date);
      paramCount++;
    }

    if (filters.end_date) {
      query += ` AND w.requested_at <= $${paramCount}`;
      params.push(filters.end_date);
      paramCount++;
    }

    query += ` ORDER BY w.requested_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    
    const countResult = await pool.query('SELECT COUNT(*) FROM withdrawals');
    const total = parseInt(countResult.rows[0].count);
    
    return {
      withdrawals: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Update withdrawal status
   */
  async updateStatus(id, status, updates = {}) {
    const fields = ['status = $1'];
    const params = [status, id];
    let paramCount = 3;

    if (updates.admin_id) {
      fields.push(`admin_id = $${paramCount}`);
      params.splice(paramCount - 1, 0, updates.admin_id);
      paramCount++;
    }

    if (updates.admin_notes) {
      fields.push(`admin_notes = $${paramCount}`);
      params.splice(paramCount - 1, 0, updates.admin_notes);
      paramCount++;
    }

    if (updates.failure_reason) {
      fields.push(`failure_reason = $${paramCount}`);
      params.splice(paramCount - 1, 0, updates.failure_reason);
      paramCount++;
    }

    if (updates.mpesa_transaction_id) {
      fields.push(`mpesa_transaction_id = $${paramCount}`);
      params.splice(paramCount - 1, 0, updates.mpesa_transaction_id);
      paramCount++;
    }

    if (updates.mpesa_receipt_number) {
      fields.push(`mpesa_receipt_number = $${paramCount}`);
      params.splice(paramCount - 1, 0, updates.mpesa_receipt_number);
      paramCount++;
    }

    if (status === 'processing') {
      fields.push('processed_at = CURRENT_TIMESTAMP');
    }

    if (status === 'completed') {
      fields.push('completed_at = CURRENT_TIMESTAMP');
    }

    const query = `UPDATE withdrawals SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`;
    
    const result = await pool.query(query, params);
    return result.rows[0];
  },

  /**
   * Approve withdrawal (admin)
   */
  async approve(id, admin_id, admin_notes = '') {
    return await this.updateStatus(id, 'approved', { admin_id, admin_notes });
  },

  /**
   * Reject withdrawal (admin)
   */
  async reject(id, admin_id, reason) {
    return await this.updateStatus(id, 'cancelled', { 
      admin_id, 
      admin_notes: reason,
      failure_reason: reason 
    });
  },

  /**
   * Mark as processing
   */
  async markProcessing(id, mpesa_transaction_id) {
    return await this.updateStatus(id, 'processing', { mpesa_transaction_id });
  },

  /**
   * Mark as completed
   */
  async markCompleted(id, mpesa_receipt_number) {
    return await this.updateStatus(id, 'completed', { mpesa_receipt_number });
  },

  /**
   * Mark as failed
   */
  async markFailed(id, failure_reason) {
    return await this.updateStatus(id, 'failed', { failure_reason });
  },

  /**
   * Get withdrawal statistics for user
   */
  async getUserStats(user_id) {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_withdrawals,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_withdrawn,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_amount,
        COALESCE(SUM(CASE WHEN status = 'failed' THEN amount ELSE 0 END), 0) as failed_amount
      FROM withdrawals 
      WHERE user_id = $1
    `, [user_id]);
    
    return result.rows[0];
  },

  /**
   * Get platform withdrawal statistics (admin)
   */
  async getPlatformStats() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_withdrawals,
        COUNT(DISTINCT user_id) as unique_users,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_withdrawn,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_amount,
        COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) as approved_amount,
        COALESCE(SUM(CASE WHEN status = 'processing' THEN amount ELSE 0 END), 0) as processing_amount,
        COALESCE(SUM(CASE WHEN status = 'failed' THEN amount ELSE 0 END), 0) as failed_amount,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
      FROM withdrawals
    `);
    
    return result.rows[0];
  },

  /**
   * Delete withdrawal (admin only, use with caution)
   */
  async delete(id) {
    const result = await pool.query(
      'DELETE FROM withdrawals WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
};

initWithdrawalTable();

module.exports = Withdrawal;
