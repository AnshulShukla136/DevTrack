import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Register from './pages/Register'
import Login from './pages/Login'
import OtpVerify from './pages/OtpVerify'
import OAuthSuccess from './pages/OAuthSuccess'
import Dashboard from './pages/Dashboard'
import GitHubPage from './pages/GitHubPage'
import CodeForcesPage from './pages/CodeForcesPage'
import LeetCodePage from './pages/LeetCodePage'
import RecommendationsPage from './pages/RecommendationsPage'
import { StatsProvider } from './context/StatsContext'
function App() {
  return (
    <AuthProvider>
      <StatsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<OtpVerify />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />

          {/* Specific routes first */}
          <Route path="/dashboard/recommendations" element={<ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />
          <Route path="/dashboard/github" element={<ProtectedRoute><GitHubPage /></ProtectedRoute>} />
          <Route path="/dashboard/codeforces" element={<ProtectedRoute><CodeForcesPage /></ProtectedRoute>} />
          <Route path="/dashboard/leetcode" element={<ProtectedRoute><LeetCodePage /></ProtectedRoute>} />
          
          {/* Wildcard last */}
          <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
      </StatsProvider>
    </AuthProvider>
  )
}
 
export default App