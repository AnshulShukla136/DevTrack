import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useStats } from '../context/StatsContext'
import { DevTrackLogo } from './Icons'
export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { clearAll } = useStats()

  const links = [
    { label: 'Overview', path: '/dashboard' },
    { label: 'LeetCode', path: '/dashboard/leetcode' },
    { label: 'GitHub', path: '/dashboard/github' },
    { label: 'Codeforces', path: '/dashboard/codeforces' },
    { label: 'Recommendations', path: '/dashboard/recommendations' },
  ]

  const handleLogout = () => {
    clearAll()
    logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <nav className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-50">
      {/* Left */}
      <div className="flex items-center gap-8">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
        <DevTrackLogo size={32} className="rounded-xl" />
        <span className="text-[16px] font-bold text-gray-900 tracking-tight">
          Dev<span className="text-gray-400 font-medium">Track</span>
        </span>
      </Link>

        {/* Nav links — hidden on mobile */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm px-3 py-1.5 rounded-lg transition ${
                location.pathname === link.path
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <span className="hidden md:block text-sm text-gray-600 font-medium">{user?.name}</span>
        <div className="relative group">
          <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-semibold cursor-pointer">
            {user?.avatar
              ? <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
              : initials
            }
          </div>
          {/* Dropdown */}
          <div className="absolute right-0 top-10 w-40 bg-white border border-gray-200 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all">
            <div className="px-4 py-2.5 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 rounded-b-xl transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}