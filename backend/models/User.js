// models/User.js
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Create Users table if not exists
const initUserTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        phone_number VARCHAR(15),
        status VARCHAR(20) DEFAULT 'active',
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT now()
      )
    `);
    
    // Try to add columns if they don't exist (for existing databases)
    // Wrap in try-catch in case of permission issues
    try {
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';`);
    } catch (err) {
      console.log('Note: Could not alter users table (role). Column may already exist.');
    }
    
    try {
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(15);`);
    } catch (err) {
      console.log('Note: Could not alter users table (phone_number). Column may already exist.');
    }
    
    try {
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';`);
    } catch (err) {
      console.log('Note: Could not alter users table (status). Column may already exist.');
    }
    
    try {
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;`);
    } catch (err) {
      console.log('Note: Could not alter users table (last_login). Column may already exist.');
    }
  } catch (error) {
    console.error('Error initializing users table:', error.message);
  }
};

const User = {
  async create({ name, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, hashedPassword]
    );
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query(
      'SELECT id, name, email, role, phone_number, status, last_login, created_at FROM users WHERE id = $1 LIMIT 1',
      [id]
    );
    return result.rows[0];
  },

  async all() {
    const result = await pool.query(
      'SELECT id, name, email, role, phone_number, status, last_login, created_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  },

  async updateLastLogin(id) {
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
  },

  async updateStatus(id, status) {
    const result = await pool.query(
      'UPDATE users SET status = $1 WHERE id = $2 RETURNING id, name, email, role, status',
      [status, id]
    );
    return result.rows[0];
  },

  async updateRole(id, role) {
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
      [role, id]
    );
    return result.rows[0];
  },

  async update(id, { name, email, password }) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (name) {
      fields.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }
    if (email) {
      fields.push(`email = $${paramCount}`);
      values.push(email);
      paramCount++;
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      fields.push(`password = $${paramCount}`);
      values.push(hashedPassword);
      paramCount++;
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING id, name, email, created_at`,
      values
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, name, email, created_at',
      [id]
    );
    return result.rows[0];
  }
};

initUserTable();

module.exports = User;
