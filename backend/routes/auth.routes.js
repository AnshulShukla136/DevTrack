const express = require('express')
const router = express.Router()
const passport = require('../config/passport')
const User = require('../models/User')
const { signToken } = require('../services/jwt.service')
const { generateOTP, saveOTP, verifyOTP, sendOTPEmail } = require('../services/otp.service')
const { protect } = require('../middleware/auth.middleware')
const { scheduleUserSync } = require('../queues/syncQueue')
// ─── LOCAL REGISTER ───────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' })

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' })

    const existing = await User.findOne({ email })
    if (existing)
      return res.status(400).json({ message: 'Email already registered' })

    const user = await User.create({ name, email, password, authProvider: 'local' })

    // Send OTP
    const otp = generateOTP()
    await saveOTP(email, otp)
    await sendOTPEmail(email, otp)

    res.status(201).json({ message: 'Registered! Check your email for OTP.', email })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// ─── VERIFY OTP ───────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body
    if (!email || !otp)
      return res.status(400).json({ message: 'Email and OTP are required' })

    const result = await verifyOTP(email, otp)
    if (!result.valid)
      return res.status(400).json({ message: result.message })

    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    )

    const token = signToken(user._id)
    res.json({ message: 'Email verified!', token, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar } })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// ─── RESEND OTP ───────────────────────────────────────────────
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.isVerified) return res.status(400).json({ message: 'Already verified' })

    const otp = generateOTP()
    await saveOTP(email, otp)
    await sendOTPEmail(email, otp)

    res.json({ message: 'OTP resent successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// ─── LOCAL LOGIN ──────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' })

    const user = await User.findOne({ email })
    if (!user || !user.password)
      return res.status(401).json({ message: 'Invalid credentials' })

    const isMatch = await user.comparePassword(password)
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' })

    if (!user.isVerified)
      return res.status(403).json({ message: 'Please verify your email first', email })

    // Send OTP for login verification
    const otp = generateOTP()
    await saveOTP(email, otp)
    await sendOTPEmail(email, otp, user.name)

    res.json({
      message: 'OTP sent to your email',
      email,
      requiresOTP: true
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// ─── VERIFY LOGIN OTP ─────────────────────────────────────────
router.post('/verify-login-otp', async (req, res) => {
  try {
    const { email, otp } = req.body
    if (!email || !otp)
      return res.status(400).json({ message: 'Email and OTP are required' })

    const result = await verifyOTP(email, otp)
    if (!result.valid)
      return res.status(400).json({ message: result.message })

    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const token = signToken(user._id)
    scheduleUserSync(user._id)
    res.json({
      message: 'Login successful!',
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar }
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})
// ─── GITHUB OAUTH ─────────────────────────────────────────────
// GitHub OAuth
// ─── GITHUB LOGIN ─────────────────────────────────────────────
router.get('/github',
  passport.authenticate('github', {
    scope: ['user:email'],
    session: false
  })
)

router.get('/github/callback',
  (req, res, next) => {
    const isRegister = req.query.state === 'register'
    passport.authenticate('github', {
      session: false,
      failureRedirect: isRegister
        ? `${process.env.CLIENT_URL}/register?error=account_exists`
        : `${process.env.CLIENT_URL}/login?error=github_failed`
    })(req, res, next)
  },
  (req, res) => {
    const token = signToken(req.user._id)
    scheduleUserSync(req.user._id)
    res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`)
  }
)

// ─── GITHUB REGISTER ──────────────────────────────────────────
router.get('/github/register',
  passport.authenticate('github', {
    scope: ['user:email'],
    session: false,
    state: 'register'
  })
)

// ─── GOOGLE LOGIN ─────────────────────────────────────────────
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
)

router.get('/google/callback',
  (req, res, next) => {
    const isRegister = req.query.state?.includes('register')
    passport.authenticate('google', {
      session: false,
      failureRedirect: isRegister
        ? `${process.env.CLIENT_URL}/register?error=account_exists`
        : `${process.env.CLIENT_URL}/login?error=google_failed`
    })(req, res, next)
  },
  (req, res) => {
    const token = signToken(req.user._id)
    scheduleUserSync(req.user._id)
    res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`)
  }
)

// ─── GOOGLE REGISTER ──────────────────────────────────────────
router.get('/google/register',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    state: 'register',
    prompt: 'select_account'
  })
)
// ─── GET CURRENT USER ─────────────────────────────────────────
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user })
})

module.exports = router