import { useState, useRef } from 'react'
import {useSearchParams, Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { DevTrackLogo, GitHubLogo, LeetCodeLogo, CodeForcesLogo } from '../components/Icons'
import PasswordInput from '../components/PasswordInput'

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

const StatCard = ({ icon, iconBg, name, badge, badgeStyle, stats, barWidth, barColor }) => (
  <div className="bg-white rounded-2xl p-4 mb-3 w-full max-w-xs border border-[#f0dcc8]">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: iconBg }}>
        {icon}
      </div>
      <span className="text-sm font-semibold text-gray-900">{name}</span>
      <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full" style={badgeStyle}>{badge}</span>
    </div>
    <div className="flex gap-4">
      {stats.map((s, i) => (
        <div key={i}>
          <div className="text-sm font-semibold text-gray-900 font-mono">{s.val}</div>
          <div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">{s.lbl}</div>
        </div>
      ))}
    </div>
    <div className="h-0.5 bg-[#f0dcc8] rounded-full mt-3 overflow-hidden">
      <div className="h-full rounded-full" style={{ width: barWidth, background: barColor }} />
    </div>
  </div>
)

const OTPInput = ({ otp, setOtp, onSubmit, loading, error, onResend, countdown, resending, email }) => {
  const refs = useRef(Array(6).fill(null).map(() => ({ current: null })))

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) refs.current[index + 1].current?.focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      refs.current[index - 1].current?.focus()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      refs.current[5].current?.focus()
    }
  }

  return (
    <div>
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm text-gray-600">We sent a 6-digit code to</p>
        <p className="text-sm font-semibold text-gray-900 font-mono mt-0.5">{email}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-xl mb-4 text-sm text-center">
          {error}
        </div>
      )}

      <div className="flex gap-2 justify-center mb-5" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={el => refs.current[index].current = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            className="w-11 h-12 text-center text-lg font-semibold font-mono bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:border-gray-400 transition"
          />
        ))}
      </div>

      <button onClick={onSubmit} disabled={loading}
        className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition text-sm">
        {loading ? 'Verifying...' : 'Verify & Create account'}
      </button>

      <div className="text-center mt-3">
        {countdown > 0 ? (
          <p className="text-xs text-gray-400">
            Resend code in <span className="text-gray-900 font-medium font-mono">{countdown}s</span>
          </p>
        ) : (
          <button onClick={onResend} disabled={resending}
            className="text-xs text-gray-900 font-medium hover:underline disabled:opacity-50">
            {resending ? 'Sending...' : 'Resend code'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [searchParams] = useSearchParams()
  
  // Read error from URL on mount


  // Step: 'details' | 'otp'
  const [step, setStep] = useState('details')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
    const [error, setError] = useState(() => {
    const err = searchParams.get('error')
    if (err === 'account_exists') return 'An account with this email already exists. Please sign in instead.'
    if (err === 'github_failed') return 'GitHub login failed. Please try again.'
    if (err === 'google_failed') return 'Google login failed. Please try again.'
    return ''
  })

  const [countdown, setCountdown] = useState(30)
  const [resending, setResending] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const startCountdown = () => {
    setCountdown(30)
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  // Step 1 — submit registration details
  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters')
    }

    setLoading(true)
    try {
      await api.post('/auth/register', form)
      setStep('otp')
      startCountdown()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // Step 2 — verify OTP and complete registration
  const handleVerifyOTP = async () => {
    const otpString = otp.join('')
    if (otpString.length !== 6) return setError('Please enter the complete 6-digit OTP')
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/verify-otp', { email: form.email, otp: otpString })
      login(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP')
      setOtp(['', '', '', '', '', ''])
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  const handleResend = async () => {
    setResending(true)
    setError('')
    try {
      await api.post('/auth/resend-otp', { email: form.email })
      startCountdown()
      setOtp(['', '', '', '', '', ''])
    } catch (err) {
      setError('Failed to resend OTP')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 overflow-x-hidden">
      <div className="flex flex-col md:flex-row w-full max-w-4xl rounded-2xl overflow-hidden shadow-sm border border-gray-200">

        {/* Left — Form */}
        <div className="w-full md:w-[45%] bg-white px-6 md:px-10 py-10 md:py-12 flex flex-col justify-center">

          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-9">
            <DevTrackLogo size={40} className="rounded-xl" />
            <span className="text-[25px] font-bold text-gray-900 tracking-tight">
              Dev<span className="text-[25px] font-bold text-gray-400">Track</span>
            </span>
          </div>

          {step === 'details' ? (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Create your account</h2>
              <p className="text-sm text-gray-400 italic mb-7">Start tracking your coding journey today</p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-xl mb-4 text-sm">
                  {error}
                </div>
              )}

              {/* OAuth buttons */}
              <div className="grid grid-cols-2 gap-2.5 mb-5">
                {/* GitHub Register */}
              <a href={`${import.meta.env.VITE_API_URL}/auth/github/register`}
                className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 transition">
                <GitHubLogo size={15} /> GitHub
              </a>

              {/* Google Register */}
              <a href={`${import.meta.env.VITE_API_URL}/auth/google/register`}
                className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 transition">
                <GoogleIcon /> Google
              </a>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400">or sign up with email</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Full name</label>
                  <input name="name" type="text" required value={form.name}
                    onChange={handleChange} placeholder="Your name"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Email</label>
                  <input name="email" type="email" required value={form.email}
                    onChange={handleChange} placeholder="you@example.com"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Password</label>
                  <PasswordInput
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="max(6, password)"
                  />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition text-sm">
                  {loading ? 'Sending OTP...' : 'Create account'}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-5">
                Already have an account?{' '}
                <Link to="/login" className="text-gray-900 font-medium hover:underline">Sign in</Link>
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Verify your email</h2>
              <p className="text-sm text-gray-400 italic mb-7">Almost there — just verify your email</p>
              <OTPInput
                otp={otp}
                setOtp={setOtp}
                onSubmit={handleVerifyOTP}
                loading={loading}
                error={error}
                onResend={handleResend}
                countdown={countdown}
                resending={resending}
                email={form.email}
              />
              <button
                onClick={() => { setStep('details'); setError(''); setOtp(['','','','','','']) }}
                className="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-4 transition">
                ← Back to details
              </button>
            </>
          )}
        </div>

        {/* Right — Stats Panel */}
        <div className="hidden md:flex md:w-[55%] bg-[#fff8f0] flex-col items-center justify-center px-10 py-12 relative overflow-hidden">
          <div className="absolute w-80 h-80 rounded-full bg-orange-100 opacity-30 -top-24 -right-24" />
          <div className="absolute w-56 h-56 rounded-full bg-orange-100 opacity-20 -bottom-16 -left-12" />
          <p className="text-gray-900 text-base font-semibold text-center mb-1 relative z-10">
            Your coding stats, unified
          </p>
          <p className="text-gray-400 text-xs text-center mb-6 relative z-10 italic">
            Connect LeetCode, GitHub & Codeforces in one place
          </p>
          <div className="relative z-10 w-full flex flex-col items-center">
            <StatCard
              icon={<LeetCodeLogo size={18} />}
              iconBg="#fff7e6"
              name="LeetCode" badge="Knight"
              badgeStyle={{ background: '#fff7e6', color: '#b45309' }}
              stats={[{ val: '342', lbl: 'Solved' }, { val: '1847', lbl: 'Rating' }, { val: 'Top 8%', lbl: 'Global' }]}
              barWidth="68%" barColor="#f89f1b"
            />
            <StatCard
              icon={<GitHubLogo size={18} />}
              iconBg="#f5f5f5"
              name="GitHub" badge="Pro"
              badgeStyle={{ background: '#f5f5f5', color: '#444' }}
              stats={[{ val: '1.2k', lbl: 'Commits' }, { val: '38', lbl: 'Repos' }, { val: '247', lbl: 'Stars' }]}
              barWidth="82%" barColor="#24292e"
            />
            <StatCard
              icon={<CodeForcesLogo size={18} />}
              iconBg="#e8f0fe"
              name="Codeforces" badge="Expert"
              badgeStyle={{ background: '#e8f0fe', color: '#1a56db' }}
              stats={[{ val: '1624', lbl: 'Rating' }, { val: '89', lbl: 'Contests' }, { val: '412', lbl: 'Solved' }]}
              barWidth="55%" barColor="#4285f4"
            />
          </div>
        </div>

      </div>
    </div>
  )
}