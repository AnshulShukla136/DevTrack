const Redis = require('ioredis')

let redis

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL)
  redis.on('connect', () => console.log('Redis connected ✓'))
  redis.on('error', (err) => console.error('Redis error:', err.message))
} else {
  // In-memory fallback for development
  console.log('Redis not configured — using in-memory store for Bull')
  redis = null
}

module.exports = redis