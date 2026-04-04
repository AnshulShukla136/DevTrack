const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth.middleware')
const { getRecommendations, topicConfig } = require('../services/recommendation.service')
const User = require('../models/User')
router.get('/tags-debug', protect, async (req, res) => {
  try {
    const { getLeetCodeTagStats } = require('../services/leetcode.service')
    const username = req.query.username
    const tags = await getLeetCodeTagStats(username)
    res.json(tags)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const leetcodeUsername = req.query.leetcode || user?.platforms?.leetcode?.username
    const codeforcesHandle = req.query.codeforces || user?.platforms?.codeforces?.handle

    const data = await getRecommendations(leetcodeUsername, codeforcesHandle)
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate recommendations', error: err.message })
  }
})

router.get('/topics', protect, (req, res) => {
  res.json({ topics: Object.keys(topicConfig) })
})

module.exports = router