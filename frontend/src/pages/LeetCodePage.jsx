import { useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import { useStats } from '../context/StatsContext'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { LeetCodeLogo } from '../components/Icons'
const LeetCodeIcon = () => <LeetCodeLogo size={16} />

const StatBox = ({ label, value, sub, valueColor }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4">
    <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1.5">{label}</p>
    <p className="text-2xl font-bold font-mono" style={{ color: valueColor || '#111' }}>{value ?? '—'}</p>
    {sub && <p className="text-[11px] text-gray-400 mt-1">{sub}</p>}
  </div>
)

const ContestTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs shadow-sm">
      <p className="font-mono font-semibold text-gray-900">{d.rating}</p>
      <p className="text-gray-400 mt-0.5 max-w-[180px] truncate">{d.title}</p>
      <p className="text-gray-400">Rank #{d.ranking}</p>
    </div>
  )
}

export default function LeetCodePage() {
  const {
    leetcodeData: stats, setLeetcodeData: setStats,
    leetcodeUsername: savedUsername, setLeetcodeUsername: setSavedUsername
  } = useStats()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [inputUsername, setInputUsername] = useState(savedUsername || '')

const fetchStats = async (username, forceRefresh = false) => {
  setLoading(true)
  setError('')
  try {
    const url = forceRefresh
      ? `/leetcode/stats?username=${username}&refresh=true`
      : `/leetcode/stats?username=${username}`
    const res = await api.get(url)
    setStats(res.data)
    setSavedUsername(username)
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to fetch LeetCode stats')
  } finally {
    setLoading(false)
  }
}

const handleConnect = (e) => {
  e.preventDefault()
  if (!inputUsername.trim()) return
  fetchStats(inputUsername.trim())
}

  // Solved percentage bar
  const SolvedBar = ({ label, solved, total, color }) => (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-600 w-16 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all"
          style={{ width: `${total ? Math.round((solved / total) * 100) : 0}%`, background: color }} />
      </div>
      <span className="text-[11px] font-mono text-gray-400 w-16 text-right">
        {solved} / {total}
      </span>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center">
            <LeetCodeIcon />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">LeetCode</h1>
            <p className="text-sm text-gray-400 italic">Your problem solving and contest stats</p>
          </div>
        </div>

        {/* Connect form */}
        {!stats && !loading && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-md">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Connect your LeetCode</h2>
            <p className="text-sm text-gray-400 mb-5">Enter your LeetCode username to load your stats</p>
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
                placeholder="e.g. neal_wu"
                className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition"
              />
              <button type="submit"
                className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition">
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

        {stats && !loading && (
          <>
            {/* Profile */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4 flex items-center gap-4">
              <img src={stats.avatar} alt={stats.username}
                className="w-14 h-14 rounded-full border border-gray-200 object-cover" />
              <div className="flex-1">
                <h2 className="text-base font-bold text-gray-900">{stats.name || stats.username}</h2>
                <p className="text-sm text-gray-400 font-mono">@{stats.username}</p>
                <div className="flex items-center gap-3 mt-1">
                  {stats.country && <p className="text-xs text-gray-400 italic">{stats.country}</p>}
                  {stats.company && <p className="text-xs text-gray-400">{stats.company}</p>}
                  {stats.contestBadge && (
                    <span className="text-[10px] bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full font-medium">
                      {stats.contestBadge}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <a href={`https://leetcode.com/${stats.username}`} target="_blank" rel="noreferrer"
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition">
                  View profile
                </a>
                <button onClick={() => { setStats(null); setInputUsername('') }}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition">
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
                      onClick={() => fetchStats(savedUsername, true)}
                      className="ml-2 text-gray-400 hover:text-gray-600 underline">
                      Force refresh
                    </button>
                  </div>
                )}
            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <StatBox label="Total solved" value={stats.totalSolved} sub={`Rank #${stats.ranking?.toLocaleString()}`} />
              <StatBox label="Contest rating" value={stats.contestRating || '—'} sub={stats.topPercentage ? `Top ${stats.topPercentage?.toFixed(1)}%` : 'No contests'} />
              <StatBox label="Contests" value={stats.attendedContests} sub="participated" />
              <StatBox label="Streak" value={`${stats.streak}d`} sub={`${stats.totalActiveDays} active days`} />
            </div>

            {/* Difficulty breakdown + Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

              {/* Difficulty */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-sm font-semibold text-gray-900 mb-4">Problems solved</p>
                <div className="space-y-3 mb-4">
                  <SolvedBar label="Easy" solved={stats.easySolved} total={878} color="#22c55e" />
                  <SolvedBar label="Medium" solved={stats.mediumSolved} total={1838} color="#f89f1b" />
                  <SolvedBar label="Hard" solved={stats.hardSolved} total={827} color="#ef4444" />
                </div>
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-lg font-bold font-mono text-green-500">{stats.easySolved}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Easy</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold font-mono text-yellow-500">{stats.mediumSolved}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Medium</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold font-mono text-red-500">{stats.hardSolved}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Hard</p>
                  </div>
                </div>
              </div>

              {/* Top tags */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-sm font-semibold text-gray-900 mb-4">Top problem tags</p>
                <div className="space-y-2.5">
                  {stats.topTags.slice(0, 8).map((t, i) => {
                    const max = stats.topTags[0]?.problemsSolved || 1
                    const pct = Math.round((t.problemsSolved / max) * 100)
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-gray-600 w-32 flex-shrink-0 capitalize">{t.tagName}</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[11px] font-mono text-gray-400 w-8 text-right">{t.problemsSolved}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Contest rating chart */}
            {stats.contestHistory?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
                <p className="text-sm font-semibold text-gray-900 mb-1">Contest rating history</p>
                <p className="text-xs text-gray-400 italic mb-4">Last {stats.contestHistory.length} contests</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={stats.contestHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                    <YAxis
                      domain={['auto', 'auto']}
                      tick={{ fontSize: 10, fill: '#9ca3af', fontFamily: 'monospace' }}
                      tickLine={false} axisLine={false} width={40}
                    />
                    <Tooltip content={<ContestTooltip />} />
                    <Line
                      type="monotone" dataKey="rating"
                      stroke="#f89f1b" strokeWidth={2}
                      dot={{ fill: '#f89f1b', r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: '#f89f1b', strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recent submissions */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm font-semibold text-gray-900 mb-4">Recent accepted submissions</p>
              <div className="space-y-2.5">
                
                {stats.recentSubmissions.length > 0 ? (
                stats.recentSubmissions.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-600 flex-shrink-0">
                      AC
                    </span>
                    <a href={s.url} target="_blank" rel="noreferrer"
                      className="text-xs text-gray-700 hover:text-gray-900 hover:underline flex-1 truncate">
                      {s.title}
                    </a>
                    <span className="text-[10px] text-gray-400 flex-shrink-0 font-mono">{s.time}</span>
                  </div>
                ))
                ) : (
  <p className="text-sm text-gray-400 italic">No recent submissions found</p>
)}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}