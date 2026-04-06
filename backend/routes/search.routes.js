const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth.middleware')
const { getGitHubStats } = require('../services/github.service')
const { getLeetCodeStats } = require('../services/leetcode.service')
const { getCodeforcesStats } = require('../services/codeforces.service')

// Search any platform profile
router.post('/', protect, async (req, res) => {
  const { github, leetcode, codeforces } = req.body

  if (!github && !leetcode && !codeforces) {
    return res.status(400).json({ message: 'At least one username is required' })
  }

  const results = {}
  const errors = {}

  await Promise.allSettled([
    github && getGitHubStats(github).then(d => results.github = d).catch(e => errors.github = e.message),
    leetcode && getLeetCodeStats(leetcode).then(d => results.leetcode = d).catch(e => errors.leetcode = e.message),
    codeforces && getCodeforcesStats(codeforces).then(d => results.codeforces = d).catch(e => errors.codeforces = e.message),
  ])

  res.json({ results, errors })
})

module.exports = router