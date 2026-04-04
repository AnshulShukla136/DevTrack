const dotenv = require('dotenv')

dotenv.config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')

const passport = require('passport')
const connectDB = require('./config/db')
require('./config/passport') // load strategies

connectDB()

const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(passport.initialize()) 

app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api/github', require('./routes/github.routes'))
app.use('/api/leetcode', require('./routes/leetcode.routes'))
app.use('/api/codeforces', require('./routes/codeforces.routes'))
app.use('/api/recommendations', require('./routes/recommendation.routes'))
app.use('/api/sync', require('./routes/sync.routes'))                   //for caching the data
app.get('/', (req, res) => res.json({ message: 'DevTrack API running ✓' }))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))