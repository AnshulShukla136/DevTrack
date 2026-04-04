const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth.middleware')
const { getCodeforcesStats } = require('../services/codeforces.service')
const { getCached, setCache, invalidateCache, getCacheMeta } = require('../services/cache.service')
const User = require('../models/User')

router.get('/stats', protect, async (req, res) => {
  try {
    let handle = req.query.handle
    const forceRefresh = req.query.refresh === 'true'

    if (!handle) {
      const user = await User.findById(req.user._id)
      handle = user?.platforms?.codeforces?.handle
    }

    if (!handle) return res.status(400).json({ message: 'Codeforces handle is required' })

    if (!forceRefresh) {
      const cached = await getCached(req.user._id, 'codeforces')
      if (cached) {
        const meta = await getCacheMeta(req.user._id, 'codeforces')
        return res.json({
          ...cached,
          _cache: { hit: true, ageMinutes: meta.ageMinutes, expiresInMinutes: meta.expiresInMinutes }
        })
      }
    }

    console.log(`Fetching fresh Codeforces data for ${handle}`)
    const stats = await getCodeforcesStats(handle)
    await setCache(req.user._id, 'codeforces', stats)
    await User.findByIdAndUpdate(req.user._id, {
      'platforms.codeforces.handle': handle,
      'platforms.codeforces.lastSynced': new Date()
    })

    res.json({ ...stats, _cache: { hit: false } })
  } catch (err) {
    if (err.message === 'User not found') {
      return res.status(404).json({ message: 'Codeforces handle not found' })
    }
    res.status(500).json({ message: 'Failed to fetch Codeforces stats', error: err.message })
  }
})

router.post('/refresh', protect, async (req, res) => {
  try {
    await invalidateCache(req.user._id, 'codeforces')
    res.json({ message: 'Cache cleared. Next request will fetch fresh data.' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

module.exports = router