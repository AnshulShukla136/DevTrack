const Cache = require('../models/Cache')

const CACHE_TTL_HOURS = 6
const CACHE_TTL_MS = CACHE_TTL_HOURS * 60 * 60 * 1000

// Get cached data for a user + platform
const getCached = async (userId, platform) => {
  const cache = await Cache.findOne({ userId, platform })
  if (!cache) return null

  const now = new Date()
  const isExpired = cache.expiresAt < now

  if (isExpired) {
    console.log(`Cache EXPIRED for ${platform} user ${userId}`)
    return null
  }

  const ageMinutes = Math.round((now - cache.syncedAt) / 60000)
  console.log(`Cache HIT for ${platform} user ${userId} (${ageMinutes}m old)`)
  return cache.data
}

// Save data to cache
const setCache = async (userId, platform, data) => {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + CACHE_TTL_MS)

  await Cache.findOneAndUpdate(
    { userId, platform },
    {
      userId,
      platform,
      data,
      syncedAt: now,
      expiresAt
    },
    { upsert: true, returnDocument: 'after' }
  )

  console.log(`Cache SET for ${platform} user ${userId} (expires in ${CACHE_TTL_HOURS}h)`)
}

// Force invalidate cache
const invalidateCache = async (userId, platform) => {
  await Cache.deleteOne({ userId, platform })
  console.log(`Cache INVALIDATED for ${platform} user ${userId}`)
}

// Get cache metadata (age, expiry) without returning full data
const getCacheMeta = async (userId, platform) => {
  const cache = await Cache.findOne(
    { userId, platform },
    { syncedAt: 1, expiresAt: 1 }
  )
  if (!cache) return null

  const now = new Date()
  const ageMinutes = Math.round((now - cache.syncedAt) / 60000)
  const expiresInMinutes = Math.round((cache.expiresAt - now) / 60000)

  return {
    syncedAt: cache.syncedAt,
    expiresAt: cache.expiresAt,
    ageMinutes,
    expiresInMinutes,
    isExpired: cache.expiresAt < now
  }
}

module.exports = { getCached, setCache, invalidateCache, getCacheMeta }