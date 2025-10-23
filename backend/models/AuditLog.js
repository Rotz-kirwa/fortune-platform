// models/AuditLog.js
const pool = require('../config/db');

// Create Audit Logs table if not exists
const initAuditLogTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id),
      admin_id INT REFERENCES users(id),
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(50),
      entity_id INT,
      old_value JSONB,
      new_value JSONB,
      ip_address VARCHAR(45),
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
  `);
};

const AuditLog = {
  /**
   * Create a new audit log entry
   */
  async create({ 
    user_id = null, 
    admin_id = null, 
    action, 
    entity_type = null, 
    entity_id = null, 
    old_value = null, 
    new_value = null,
    ip_address = null,
    user_agent = null
  }) {
    const result = await pool.query(
      `INSERT INTO audit_logs (user_id, admin_id, action, entity_type, entity_id, old_value, new_value, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        user_id, 
        admin_id, 
        action, 
        entity_type, 
        entity_id, 
        old_value ? JSON.stringify(old_value) : null,
        new_value ? JSON.stringify(new_value) : null,
        ip_address,
        user_agent
      ]
    );
    return result.rows[0];
  },

  /**
   * Log user action
   */
  async logUserAction(user_id, action, entity_type, entity_id, metadata = {}) {
    return await this.create({
      user_id,
      action,
      entity_type,
      entity_id,
      new_value: metadata
    });
  },

  /**
   * Log admin action
   */
  async logAdminAction(admin_id, action, entity_type, entity_id, old_value, new_value, metadata = {}) {
    return await this.create({
      admin_id,
      action,
      entity_type,
      entity_id,
      old_value,
      new_value: { ...new_value, ...metadata }
    });
  },

  /**
   * Log payment callback
   */
  async logPaymentCallback(user_id, payment_id, callback_data) {
    return await this.create({
      user_id,
      action: 'payment_callback_received',
      entity_type: 'payment',
      entity_id: payment_id,
      new_value: callback_data
    });
  },

  /**
   * Log withdrawal action
   */
  async logWithdrawalAction(user_id, admin_id, action, withdrawal_id, details) {
    return await this.create({
      user_id,
      admin_id,
      action,
      entity_type: 'withdrawal',
      entity_id: withdrawal_id,
      new_value: details
    });
  },

  /**
   * Log balance change
   */
  async logBalanceChange(user_id, action, old_balance, new_balance, reason) {
    return await this.create({
      user_id,
      action,
      entity_type: 'balance',
      old_value: old_balance,
      new_value: { ...new_balance, reason }
    });
  },

  /**
   * Get audit logs with filters
   */
  async findAll(filters = {}, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT a.*, 
             u.name as user_name, u.email as user_email,
             ad.name as admin_name, ad.email as admin_email
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN users ad ON a.admin_id = ad.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    // Add filters
    if (filters.user_id) {
      query += ` AND a.user_id = $${paramCount}`;
      params.push(filters.user_id);
      paramCount++;
    }

    if (filters.admin_id) {
      query += ` AND a.admin_id = $${paramCount}`;
      params.push(filters.admin_id);
      paramCount++;
    }

    if (filters.action) {
      query += ` AND a.action = $${paramCount}`;
      params.push(filters.action);
      paramCount++;
    }

    if (filters.entity_type) {
      query += ` AND a.entity_type = $${paramCount}`;
      params.push(filters.entity_type);
      paramCount++;
    }

    if (filters.entity_id) {
      query += ` AND a.entity_id = $${paramCount}`;
      params.push(filters.entity_id);
      paramCount++;
    }

    if (filters.start_date) {
      query += ` AND a.created_at >= $${paramCount}`;
      params.push(filters.start_date);
      paramCount++;
    }

    if (filters.end_date) {
      query += ` AND a.created_at <= $${paramCount}`;
      params.push(filters.end_date);
      paramCount++;
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    
    const countResult = await pool.query('SELECT COUNT(*) FROM audit_logs');
    const total = parseInt(countResult.rows[0].count);
    
    return {
      logs: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get user activity
   */
  async getUserActivity(user_id, start_date = null, end_date = null, limit = 100) {
    let query = `
      SELECT a.*, ad.name as admin_name
      FROM audit_logs a
      LEFT JOIN users ad ON a.admin_id = ad.id
      WHERE a.user_id = $1
    `;
    const params = [user_id];
    let paramCount = 2;

    if (start_date) {
      query += ` AND a.created_at >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      query += ` AND a.created_at <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${paramCount}`;
    params.push(limit);

    const result = await pool.query(query, params);
    return result.rows;
  },

  /**
   * Get admin activity
   */
  async getAdminActivity(admin_id, start_date = null, end_date = null, limit = 100) {
    let query = `
      SELECT a.*, u.name as user_name, u.email as user_email
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.admin_id = $1
    `;
    const params = [admin_id];
    let paramCount = 2;

    if (start_date) {
      query += ` AND a.created_at >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      query += ` AND a.created_at <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${paramCount}`;
    params.push(limit);

    const result = await pool.query(query, params);
    return result.rows;
  },

  /**
   * Get recent activity (for dashboard)
   */
  async getRecentActivity(limit = 20) {
    const result = await pool.query(
      `SELECT a.*, 
              u.name as user_name, u.email as user_email,
              ad.name as admin_name
       FROM audit_logs a
       LEFT JOIN users u ON a.user_id = u.id
       LEFT JOIN users ad ON a.admin_id = ad.id
       ORDER BY a.created_at DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  },

  /**
   * Get action statistics
   */
  async getActionStats(start_date = null, end_date = null) {
    let query = `
      SELECT 
        action,
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users
      FROM audit_logs
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

    query += ` GROUP BY action ORDER BY count DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  },

  /**
   * Search audit logs
   */
  async search(searchTerm, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    
    const result = await pool.query(
      `SELECT a.*, 
              u.name as user_name, u.email as user_email,
              ad.name as admin_name
       FROM audit_logs a
       LEFT JOIN users u ON a.user_id = u.id
       LEFT JOIN users ad ON a.admin_id = ad.id
       WHERE a.action ILIKE $1 
          OR u.name ILIKE $1 
          OR u.email ILIKE $1
          OR ad.name ILIKE $1
       ORDER BY a.created_at DESC
       LIMIT $2 OFFSET $3`,
      [`%${searchTerm}%`, limit, offset]
    );
    
    return result.rows;
  },

  /**
   * Delete old audit logs (for maintenance)
   */
  async deleteOlderThan(days) {
    const result = await pool.query(
      `DELETE FROM audit_logs 
       WHERE created_at < CURRENT_DATE - INTERVAL '${days} days'
       RETURNING COUNT(*)`,
      []
    );
    return result.rowCount;
  }
};

initAuditLogTable();

module.exports = AuditLog;
