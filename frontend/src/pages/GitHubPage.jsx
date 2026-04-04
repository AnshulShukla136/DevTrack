import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import { useStats } from '../context/StatsContext'
import { LeetCodeLogo, GitHubLogo, CodeForcesLogo } from '../components/Icons'
const GitHubIcon = () => <GitHubLogo size={16} />

const StatBox = ({ label, value }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4">
    <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1.5">{label}</p>
    <p className="text-2xl font-bold text-gray-900 font-mono">{value ?? '—'}</p>
  </div>
)

  
export default function GitHubPage() {
  const {
    githubData: stats, setGithubData: setStats,
    githubUsername: username, setGithubUsername: setUsername
  } = useStats()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [inputUsername, setInputUsername] = useState(username || '')

  // No useEffect needed — data persists in context

 const fetchStats = async (uname, forceRefresh = false) => {
  setLoading(true)
  setError('')
  try {
    const url = forceRefresh
      ? `/github/stats?username=${uname}&refresh=true`
      : `/github/stats?username=${uname}`
    const res = await api.get(url)
    setStats(res.data)
    setUsername(uname)
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to fetch stats')
  } finally {
    setLoading(false)
  }
}

  const handleConnect = async (e) => {
    e.preventDefault()
    if (!inputUsername.trim()) return
    fetchStats(inputUsername.trim())
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
            <GitHubIcon size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">GitHub</h1>
            <p className="text-sm text-gray-400 italic">Your repositories and contribution stats</p>
          </div>
        </div>

        {/* Connect form */}
        {!stats && !loading && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-md">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Connect your GitHub</h2>
            <p className="text-sm text-gray-400 mb-5">Enter your GitHub username to load your stats</p>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-xl mb-4 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleConnect} className="flex gap-2">
              <input
                type="text"
                value={inputUsername}
                onChange={e => setInputUsername(e.target.value)}
                placeholder="e.g. torvalds"
                className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition"
              />
              <button
                type="submit"
                className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition"
              >
                Load
              </button>
            </form>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Stats */}
        {stats && !loading && (
          <>
            {/* Profile */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4 flex items-center gap-4">
              <img src={stats.avatar} alt={stats.username} className="w-14 h-14 rounded-full border border-gray-200" />
              <div className="flex-1">
                <h2 className="text-base font-bold text-gray-900">{stats.name || stats.username}</h2>
                <p className="text-sm text-gray-400 font-mono">@{stats.username}</p>
                {stats.bio && <p className="text-sm text-gray-500 mt-1 italic">{stats.bio}</p>}
              </div>
              <div className="flex gap-2">
                
                 <a href={stats.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition"
                >
                  View profile
                </a>
                <button
                  onClick={() => { setStats(null); setInputUsername('') }}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition"
                >
                  Change
                </button>
              </div>
            </div>  
            {/* cache indicator */}
                {stats?._cache && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                    <div className={`w-1.5 h-1.5 rounded-full ${stats._cache.hit ? 'bg-green-400' : 'bg-blue-400'}`} />
                    {stats._cache.hit
                      ? `Cached · ${stats._cache.ageMinutes}m ago · refreshes in ${stats._cache.expiresInMinutes}m`
                      : 'Fresh data just fetched'
                    }
                    <button
                      onClick={() => fetchStats(username, true)}
                      className="ml-2 text-gray-400 hover:text-gray-600 underline">
                      Force refresh
                    </button>
                  </div>
                )}
                            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <StatBox label="Public repos" value={stats.publicRepos} />
              <StatBox label="Total stars" value={stats.totalStars} />
              <StatBox label="Followers" value={stats.followers} />
              <StatBox label="Recent commits" value={stats.recentCommits} />
            </div>

            {/* Languages + Top repos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

              {/* Top languages */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-sm font-semibold text-gray-900 mb-4">Top languages</p>
                <div className="space-y-3">
                  {stats.topLanguages.map((l, i) => {
                    const max = stats.topLanguages[0].count
                    const pct = Math.round((l.count / max) * 100)
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-gray-600 w-24 flex-shrink-0">{l.lang}</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-900 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[11px] font-mono text-gray-400 w-8 text-right">{l.count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Top repos */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-sm font-semibold text-gray-900 mb-4">Top repositories</p>
                <div className="space-y-3">
                  {stats.topRepos.map((r, i) => (
                    <div key={i} className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <a href={r.url} target="_blank" rel="noreferrer"
                          className="text-xs font-medium text-gray-900 hover:underline truncate block">
                          {r.name}
                        </a>
                        {r.description && (
                          <p className="text-[11px] text-gray-400 truncate mt-0.5">{r.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {r.language && (
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{r.language}</span>
                        )}
                        <span className="text-[11px] font-mono text-gray-400">⭐ {r.stars}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm font-semibold text-gray-900 mb-4">Recent activity</p>
              <div className="space-y-3">
                {stats.recentActivity.map((a, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-900 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-700">{a.text}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                        {new Date(a.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}