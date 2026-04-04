const Queue = require('bull')
const User = require('../models/User')
const Cache = require('../models/Cache')
const { getGitHubStats } = require('../services/github.service')
const { getLeetCodeStats } = require('../services/leetcode.service')
const { getCodeforcesStats } = require('../services/codeforces.service')
const { setCache } = require('../services/cache.service')

// Use in-memory fallback if Redis not available
let syncQueue = null

try {
  syncQueue = new Queue('platform-sync', {
    redis: process.env.REDIS_URL || { host: '127.0.0.1', port: 6379 }
  })

  // Process sync jobs
  syncQueue.process('sync-github', 3, async (job) => {
    const { userId, username } = job.data
    console.log(`[Queue] Syncing GitHub for user ${userId}`)
    try {
      const stats = await getGitHubStats(username)
      await setCache(userId, 'github', stats)
      await User.findByIdAndUpdate(userId, {
        'platforms.github.lastSynced': new Date()
      })
      console.log(`[Queue] GitHub sync complete for user ${userId}`)
      return { success: true }
    } catch (err) {
      console.error(`[Queue] GitHub sync failed for user ${userId}:`, err.message)
      throw err
    }
  })

  syncQueue.process('sync-leetcode', 2, async (job) => {
    const { userId, username } = job.data
    console.log(`[Queue] Syncing LeetCode for user ${userId}`)
    try {
      const stats = await getLeetCodeStats(username)
      await setCache(userId, 'leetcode', stats)
      await User.findByIdAndUpdate(userId, {
        'platforms.leetcode.lastSynced': new Date()
      })
      console.log(`[Queue] LeetCode sync complete for user ${userId}`)
      return { success: true }
    } catch (err) {
      console.error(`[Queue] LeetCode sync failed for user ${userId}:`, err.message)
      throw err
    }
  })

  syncQueue.process('sync-codeforces', 2, async (job) => {
    const { userId, handle } = job.data
    console.log(`[Queue] Syncing Codeforces for user ${userId}`)
    try {
      const stats = await getCodeforcesStats(handle)
      await setCache(userId, 'codeforces', stats)
      await User.findByIdAndUpdate(userId, {
        'platforms.codeforces.lastSynced': new Date()
      })
      console.log(`[Queue] Codeforces sync complete for user ${userId}`)
      return { success: true }
    } catch (err) {
      console.error(`[Queue] Codeforces sync failed for user ${userId}:`, err.message)
      throw err
    }
  })

  syncQueue.on('failed', (job, err) => {
    console.error(`[Queue] Job ${job.name} failed:`, err.message)
  })

  console.log('Sync queue initialized ✓')
} catch (err) {
  console.log('Queue not available (Redis not running) — background sync disabled')
}

// Schedule sync for a user
const scheduleUserSync = async (userId) => {
  if (!syncQueue) return

  try {
    const user = await User.findById(userId)
    if (!user) return

    const delay = 6 * 60 * 60 * 1000 // 6 hours

    if (user.platforms?.github?.username) {
      await syncQueue.add('sync-github',
        { userId: userId.toString(), username: user.platforms.github.username },
        { delay, attempts: 3, backoff: { type: 'exponential', delay: 5000 } }
      )
    }

    if (user.platforms?.leetcode?.username) {
      await syncQueue.add('sync-leetcode',
        { userId: userId.toString(), username: user.platforms.leetcode.username },
        { delay, attempts: 3, backoff: { type: 'exponential', delay: 5000 } }
      )
    }

    if (user.platforms?.codeforces?.handle) {
      await syncQueue.add('sync-codeforces',
        { userId: userId.toString(), handle: user.platforms.codeforces.handle },
        { delay, attempts: 3, backoff: { type: 'exponential', delay: 5000 } }
      )
    }

    console.log(`[Queue] Sync scheduled for user ${userId}`)
  } catch (err) {
    console.error('[Queue] Failed to schedule sync:', err.message)
  }
}

// Immediately sync all platforms for a user
const syncNow = async (userId) => {
  if (!syncQueue) return

  try {
    const user = await User.findById(userId)
    if (!user) return

    if (user.platforms?.github?.username) {
      await syncQueue.add('sync-github',
        { userId: userId.toString(), username: user.platforms.github.username },
        { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
      )
    }

    if (user.platforms?.leetcode?.username) {
      await syncQueue.add('sync-leetcode',
        { userId: userId.toString(), username: user.platforms.leetcode.username },
        { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
      )
    }

    if (user.platforms?.codeforces?.handle) {
      await syncQueue.add('sync-codeforces',
        { userId: userId.toString(), handle: user.platforms.codeforces.handle },
        { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
      )
    }

    console.log(`[Queue] Immediate sync triggered for user ${userId}`)
  } catch (err) {
    console.error('[Queue] Failed to trigger sync:', err.message)
  }
}

module.exports = { syncQueue, scheduleUserSync, syncNow }
