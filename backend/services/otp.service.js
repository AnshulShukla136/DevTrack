const OTP = require('../models/OTP')

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

const saveOTP = async (email, otp) => {
  await OTP.deleteMany({ email })
  await OTP.create({ email, otp })
}

const verifyOTP = async (email, otp) => {
  const record = await OTP.findOne({ email })
  if (!record) return { valid: false, message: 'OTP expired or not found' }
  if (record.otp !== otp) return { valid: false, message: 'Invalid OTP' }
  await OTP.deleteMany({ email })
  return { valid: true }
}

const sendOTPEmail = async (email, otp, name = 'User') => {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: {
        name: process.env.BREVO_SENDER_NAME,
        email: process.env.BREVO_SENDER_EMAIL
      },
      to: [{ email, name }],
      subject: 'Your DevTrack OTP Verification Code',
      htmlContent: `
        <div style="font-family:sans-serif;max-width:420px;margin:auto;padding:32px;border:1px solid #eee;border-radius:12px">
          <h2 style="color:#111;margin-bottom:8px">Email Verification</h2>
          <p style="color:#555">Hi ${name}, use the OTP below to verify your account:</p>
          <div style="
            font-size:40px;
            font-weight:bold;
            letter-spacing:10px;
            color:#6366f1;
            background:#f5f5ff;
            border-radius:8px;
            padding:16px;
            text-align:center;
            margin:24px 0
          ">${otp}</div>
          <p style="color:#888;font-size:13px">This code expires in <strong>5 minutes</strong>.</p>
          <p style="color:#888;font-size:13px">If you didn't request this, please ignore this email.</p>
        </div>
      `
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Brevo error: ${error.message}`)
  }

  return response.json()
}

module.exports = { generateOTP, saveOTP, verifyOTP, sendOTPEmail }