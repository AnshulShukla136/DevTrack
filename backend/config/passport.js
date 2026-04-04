const passport = require('passport')
const GitHubStrategy = require('passport-github2').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy
const User = require('../models/User')

// ─── GITHUB ───────────────────────────────────────────────────
passport.use('github', new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL,
  scope: ['user:email'],
  passReqToCallback: true
},
async (req, accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value
    if (!email) return done(null, false, { message: 'No email from GitHub' })

    const isRegister = req.query.state === 'register'
    const existing = await User.findOne({ email })

    if (isRegister && existing) {
      return done(null, false, { message: 'account_exists' })
    }

    let user = existing
    if (!user) {
      user = await User.create({
        name: profile.displayName || profile.username,
        email,
        authProvider: 'github',
        isVerified: true,
        avatar: profile.photos?.[0]?.value,
        platforms: { github: { username: profile.username, accessToken } }
      })
    } else {
      user.platforms = user.platforms || {}
      user.platforms.github = { username: profile.username, accessToken }
      user.isVerified = true
      await user.save()
    }
    return done(null, user)
  } catch (err) {
    return done(err, null)
  }
}))

// ─── GOOGLE ───────────────────────────────────────────────────
passport.use('google', new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  passReqToCallback: true
},
async (req, accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value
    if (!email) return done(null, false, { message: 'No email from Google' })

    const isRegister = req.query.state?.includes('register')
    const existing = await User.findOne({ email })

    if (isRegister && existing) {
      return done(null, false, { message: 'account_exists' })
    }

    let user = existing
    if (!user) {
      user = await User.create({
        name: profile.displayName,
        email,
        authProvider: 'google',
        isVerified: true,
        avatar: profile.photos?.[0]?.value
      })
    } else {
      user.isVerified = true
      await user.save()
    }
    return done(null, user)
  } catch (err) {
    return done(err, null)
  }
}))

module.exports = passport