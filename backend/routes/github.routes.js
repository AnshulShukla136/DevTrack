const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth.middleware')
const { getGitHubStats } = require('../services/github.service')
const { getCached, setCache, invalidateCache, getCacheMeta } = require('../services/cache.service')
const User = require('../models/User')

// GET /api/github/stats
router.get('/stats', protect, async (req, res) => {
  try {
    let username = req.query.username
    const forceRefresh = req.query.refresh === 'true'

    if (!username) {
      const user = await User.findById(req.user._id)
      username = user?.platforms?.github?.username
    }

    if (!username) {
      return res.status(400).json({ message: 'GitHub username is required' })
    }

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = await getCached(req.user._id, 'github')
      if (cached) {
        const meta = await getCacheMeta(req.user._id, 'github')
        return res.json({
          ...cached,
          _cache: { hit: true, ageMinutes: meta.ageMinutes, expiresInMinutes: meta.expiresInMinutes }
        })
      }
    }

    // Fetch fresh data
    console.log(`Fetching fresh GitHub data for ${username}`)
    const stats = await getGitHubStats(username)                  

    // Save to cache
    await setCache(req.user._id, 'github', stats)     //saveing to cache if user returns befroe 6 hours then return data from mongo

    // Save username to user profile
    await User.findByIdAndUpdate(req.user._id, {
      'platforms.github.username': username,
      'platforms.github.lastSynced': new Date()
    })

    res.json({ ...stats, _cache: { hit: false } })
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ message: 'GitHub user not found' })
    }
    if (err.response?.status === 403) {
      return res.status(403).json({ message: 'GitHub API rate limit exceeded' })
    }
    res.status(500).json({ message: 'Failed to fetch GitHub stats', error: err.message })
  }
})

// Force refresh
router.post('/refresh', protect, async (req, res) => {
  try {
    await invalidateCache(req.user._id, 'github')
    res.json({ message: 'Cache cleared. Next request will fetch fresh data.' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// Connect GitHub
router.post('/connect', protect, async (req, res) => {
  try {
    const { username } = req.body
    if (!username) return res.status(400).json({ message: 'Username is required' })

    const stats = await getGitHubStats(username)
    await setCache(req.user._id, 'github', stats)
    await User.findByIdAndUpdate(req.user._id, {
      'platforms.github.username': username,
      'platforms.github.lastSynced': new Date()
    })

    res.json({ message: 'GitHub connected!', stats })
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ message: 'GitHub user not found' })
    }
    res.status(500).json({ message: 'Failed to connect GitHub', error: err.message })
  }
})
router.get('/debug', protect, async (req, res) => {
  try {
    const username = req.query.username
    const headers = {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json'
    }

    // Test 1 — events
    const eventsRes = await axios.get(
      `https://api.github.com/users/${username}/events?per_page=10`,
      { headers }
    )

    // Test 2 — commits search
    let searchResult = null
    try {
      const searchRes = await axios.get(
        `https://api.github.com/search/commits?q=author:${username}&per_page=1`,
        { headers: { ...headers, Accept: 'application/vnd.github.cloak-preview+json' } }
      )
      searchResult = searchRes.data.total_count
    } catch (e) {
      searchResult = `Error: ${e.message}`
    }

    // Test 3 — one repo commits
    const reposRes = await axios.get(
      `https://api.github.com/users/${username}/repos?per_page=5`,
      { headers }
    )
    const repos = reposRes.data

    const repoCommits = []
    for (const repo of repos.slice(0, 3)) {
      try {
        const r = await axios.get(
          `https://api.github.com/repos/${username}/${repo.name}/commits?author=${username}&per_page=1`,
          { headers }
        )
        const link = r.headers.link || ''
        const match = link.match(/page=(\d+)>; rel="last"/)
        const count = match ? parseInt(match[1]) : r.data.length
        repoCommits.push({ repo: repo.name, count, link })
      } catch (e) {
        repoCommits.push({ repo: repo.name, error: e.message })
      }
    }

    res.json({
      eventsCount: eventsRes.data.length,
      eventTypes: eventsRes.data.map(e => e.type),
      pushEvents: eventsRes.data.filter(e => e.type === 'PushEvent').map(e => ({
        repo: e.repo.name,
        commits: e.payload?.commits?.length
      })),
      searchTotalCommits: searchResult,
      repoCommits
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router