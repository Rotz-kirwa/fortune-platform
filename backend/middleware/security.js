// Security middleware
const rateLimit = require('express-rate-limit');

// Input validation middleware
const validateInput = (req, res, next) => {
  // Sanitize common injection patterns
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj.replace(/[<>'"]/g, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        obj[key] = sanitize(obj[key]);
      }
    }
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  
  next();
};

// Phone number validation
const validatePhone = (phone) => {
  const phoneRegex = /^254[0-9]{9}$/;
  return phoneRegex.test(phone);
};

// Amount validation
const validateAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && num <= 1000000;
};

// API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later' }
});

const paymentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,
  message: { error: 'Too many payment requests, please wait' }
});

// Audit logging
const auditLog = async (req, action, resource = null, resourceId = null) => {
  try {
    const pool = require('../config/db');
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, resource, resource_id, ip_address, user_agent, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        req.user?.id || null,
        action,
        resource,
        resourceId,
        req.ip,
        req.get('User-Agent'),
        JSON.stringify({ method: req.method, url: req.originalUrl })
      ]
    );
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

module.exports = {
  validateInput,
  validatePhone,
  validateAmount,
  apiLimiter,
  paymentLimiter,
  auditLog
};