import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function OAuthSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) return navigate('/login')

    // Fetch user data using the token
    localStorage.setItem('token', token)
    api.get('/auth/me')
      .then(res => {
        login(token, res.data.user)
        navigate('/dashboard')
      })
      .catch(() => navigate('/login'))
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Completing login...</p>
      </div>
    </div>
  )
}