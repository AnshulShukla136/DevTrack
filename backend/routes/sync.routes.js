const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth.middleware')
const { scheduleUserSync, syncNow } = require('../queues/syncQueue')
const { getCacheMeta, invalidateCache } = require('../services/cache.service')

// Get cache status for all platforms
router.get('/status', protect, async (req, res) => {
  try {
    const userId = req.user._id
    const [github, leetcode, codeforces] = await Promise.all([
      getCacheMeta(userId, 'github'),
      getCacheMeta(userId, 'leetcode'),
      getCacheMeta(userId, 'codeforces')
    ])

    res.json({
      github: github || { cached: false },
      leetcode: leetcode || { cached: false },
      codeforces: codeforces || { cached: false }
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// Trigger immediate sync for all platforms
router.post('/now', protect, async (req, res) => {
  try {
    await syncNow(req.user._id)
    res.json({ message: 'Sync started for all platforms' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// Schedule next sync
router.post('/schedule', protect, async (req, res) => {
  try {
    await scheduleUserSync(req.user._id)
    res.json({ message: 'Next sync scheduled in 6 hours' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// Clear all caches for user
router.delete('/cache', protect, async (req, res) => {
  try {
    await Promise.all([
      invalidateCache(req.user._id, 'github'),
      invalidateCache(req.user._id, 'leetcode'),
      invalidateCache(req.user._id, 'codeforces')
    ])
    res.json({ message: 'All caches cleared' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

module.exports = router