const cron = require('node-cron')
const axios = require('axios')

const keepAlive = () => {
  // Ping every 14 minutes to prevent Render cold start
  cron.schedule('*/14 * * * *', async () => {
    try {
      const url = process.env.RENDER_URL || `http://localhost:${process.env.PORT || 5000}`
      await axios.get(url)
      console.log(`[KeepAlive] Server pinged at ${new Date().toISOString()}`)
    } catch (err) {
      console.log(`[KeepAlive] Ping failed: ${err.message}`)
    }
  })

  console.log('KeepAlive cron started ✓')
}

module.exports = keepAlive