import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { DevTrackLogo } from '../components/Icons'
const LogoIcon = () => (
  <svg viewBox="0 0 36 36" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" rx="8" fill="#fff" stroke="#e5e7eb" strokeWidth="0.5"/>
    <path d="M18 4 Q32 4 32 18 Q32 32 18 32 Q4 32 4 18 Q4 4 18 4Z" fill="none" stroke="#111" strokeWidth="1.5"/>
    <line x1="18" y1="4" x2="18" y2="32" stroke="#fff" strokeWidth="2.5"/>
    <ellipse cx="25" cy="11" rx="5" ry="7" fill="#111" transform="rotate(-15 25 11)"/>
    <ellipse cx="11" cy="25" rx="5" ry="7" fill="#111" transform="rotate(-15 11 25)"/>
    <path d="M6 18 Q4 10 10 6 L18 18Z" fill="#111"/>
    <path d="M30 18 Q32 26 26 30 L18 18Z" fill="#111"/>
  </svg>
)

export default function OtpVerify() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const email = location.state?.email || ''
  const name = location.state?.name || 'User'

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [countdown, setCountdown] = useState(60)
  const inputs = useRef([])

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) inputs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      inputs.current[5]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otpString = otp.join('')
    if (otpString.length !== 6) return setError('Please enter the complete 6-digit OTP')
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/verify-otp', { email, otp: otpString })
      login(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP')
      setOtp(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setError('')
    try {
      await api.post('/auth/resend-otp', { email })
      setSuccess('New OTP sent to your email!')
      setCountdown(60)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4  overflow-x-hidden">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm px-10 py-12">

       <div className="flex items-center gap-2.5 mb-9">
        <DevTrackLogo size={40} className="rounded-xl" />
        <span className="text-[19px] font-bold text-gray-900 tracking-tight">
          DevTrack <span className="text-gray-400 font-medium text-base italic font-mono">/code</span>
        </span>
      </div>

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Check your email</h2>
          <p className="text-sm text-gray-400 mt-2">
            We sent a 6-digit code to<br />
            <span className="text-gray-900 font-medium">{email}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-xl mb-4 text-sm text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl mb-4 text-sm text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex gap-2.5 justify-center mb-6" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-11 h-12 text-center text-lg font-semibold bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:border-gray-400 transition"
              />
            ))}
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition text-sm">
            {loading ? 'Verifying...' : 'Verify code'}
          </button>
        </form>

        <div className="text-center mt-4">
          {countdown > 0 ? (
            <p className="text-xs text-gray-400">
              Resend code in <span className="text-gray-900 font-medium">{countdown}s</span>
            </p>
          ) : (
            <button onClick={handleResend} disabled={resending}
              className="text-xs text-gray-900 font-medium hover:underline disabled:opacity-50">
              {resending ? 'Sending...' : 'Resend code'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}