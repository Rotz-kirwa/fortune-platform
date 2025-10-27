// services/CacheService.js
const redis = require('redis');

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.client = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });
      
      await this.client.connect();
      this.isConnected = true;
      console.log('✅ Redis connected');
    } catch (error) {
      console.log('⚠️ Redis not available, using memory cache');
      this.isConnected = false;
    }
  }

  async get(key) {
    if (!this.isConnected) return null;
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }

  async set(key, value, ttl = 300) {
    if (!this.isConnected) return;
    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key) {
    if (!this.isConnected) return;
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }
}

module.exports = new CacheService();