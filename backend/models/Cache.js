const mongoose = require('mongoose')

const cacheSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  platform: {
    type: String,
    enum: ['leetcode', 'github', 'codeforces'],
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  syncedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  }
})

// Compound index for fast lookup
cacheSchema.index({ userId: 1, platform: 1 }, { unique: true })

// Auto-delete expired cache documents
cacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.model('Cache', cacheSchema)