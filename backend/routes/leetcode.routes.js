const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth.middleware')
const { getLeetCodeStats } = require('../services/leetcode.service')
const { getCached, setCache, invalidateCache, getCacheMeta } = require('../services/cache.service')
const User = require('../models/User')

router.get('/stats', protect, async (req, res) => {
  try {
    let username = req.query.username
    const forceRefresh = req.query.refresh === 'true'

    if (!username) {
      const user = await User.findById(req.user._id)
      username = user?.platforms?.leetcode?.username
    }

    if (!username) return res.status(400).json({ message: 'LeetCode username is required' })

    if (!forceRefresh) {
      const cached = await getCached(req.user._id, 'leetcode')
      if (cached) {
        const meta = await getCacheMeta(req.user._id, 'leetcode')
        return res.json({
          ...cached,
          _cache: { hit: true, ageMinutes: meta.ageMinutes, expiresInMinutes: meta.expiresInMinutes }
        })
      }
    }

    console.log(`Fetching fresh LeetCode data for ${username}`)
    const stats = await getLeetCodeStats(username)
    await setCache(req.user._id, 'leetcode', stats)
    await User.findByIdAndUpdate(req.user._id, {
      'platforms.leetcode.username': username,
      'platforms.leetcode.lastSynced': new Date()
    })

    res.json({ ...stats, _cache: { hit: false } })
  } catch (err) {
    if (err.message === 'User not found') {
      return res.status(404).json({ message: 'LeetCode user not found' })
    }
    res.status(500).json({ message: 'Failed to fetch LeetCode stats', error: err.message })
  }
})

router.post('/refresh', protect, async (req, res) => {
  try {
    await invalidateCache(req.user._id, 'leetcode')
    res.json({ message: 'Cache cleared. Next request will fetch fresh data.' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

module.exports = router