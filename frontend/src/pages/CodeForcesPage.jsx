import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import { useStats } from '../context/StatsContext'
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts'
import {  CodeForcesLogo } from '../components/Icons'
const getRankColor = (rank) => {
  if (!rank) return '#9ca3af'
  if (rank.includes('grandmaster') || rank.includes('legendary')) return '#ff0000'
  if (rank.includes('master')) return '#ff8c00'
  if (rank.includes('candidate')) return '#ff8c00'
  if (rank.includes('expert')) return '#0000ff'
  if (rank.includes('specialist')) return '#03a89e'
  if (rank.includes('pupil')) return '#008000'
  return '#9ca3af'
}

const StatBox = ({ label, value, sub }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4">
    <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1.5">{label}</p>
    <p className="text-2xl font-bold text-gray-900 font-mono">{value ?? '—'}</p>
    {sub && <p className="text-[11px] text-gray-400 mt-1">{sub}</p>}
  </div>
)


const CodeforcesIcon = () => <CodeForcesLogo size={16} />
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs shadow-sm">
      <p className="font-mono font-semibold text-gray-900">{d.rating}</p>
      <p className="text-gray-400 mt-0.5 max-w-[160px] truncate">{d.contest}</p>
      <p className="text-gray-400">{d.date}</p>
    </div>
  )
}

const RatingChart = ({ data }) => {
  const minRating = Math.min(...data.map(d => d.rating)) - 100
  const maxRating = Math.max(...data.map(d => d.rating)) + 100

  const rankZones = [
    { y: 3000, label: 'Legendary', color: '#ff0000' },
    { y: 2400, label: 'Grandmaster', color: '#ff0000' },
    { y: 2100, label: 'Master', color: '#ff8c00' },
    { y: 1900, label: 'Candidate Master', color: '#aa00aa' },
    { y: 1600, label: 'Expert', color: '#0000ff' },
    { y: 1400, label: 'Specialist', color: '#03a89e' },
    { y: 1200, label: 'Pupil', color: '#008000' },
  ]

  const chartWidth = Math.max(600, data.length * 30)

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
      <p className="text-sm font-semibold text-gray-900 mb-1">Rating history</p>
      <p className="text-xs text-gray-400 italic mb-4">
        All {data.length} contests · <span className="text-gray-500">scroll horizontally to see more</span>
      </p>
      <div className="overflow-x-auto">
        <div style={{ width: chartWidth, minWidth: '100%' }}>
          <LineChart
            width={chartWidth}
            height={260}
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              interval={Math.floor(data.length / 10)}
            />
            <YAxis
              domain={[minRating, maxRating]}
              tick={{ fontSize: 10, fill: '#9ca3af', fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            {rankZones.map((zone, i) => (
              zone.y >= minRating && zone.y <= maxRating + 100 && (
                <ReferenceLine
                  key={i}
                  y={zone.y}
                  stroke="#e5e7eb"
                  strokeDasharray="3 3"
                  label={{
                    value: zone.label,
                    position: 'insideTopRight',
                    fontSize: 9,
                    fill: zone.color,
                    opacity: 0.6
                  }}
                />
              )
            ))}
            <Line
              type="monotone"
              dataKey="rating"
              stroke="#4285f4"
              strokeWidth={2}
              dot={{ fill: '#4285f4', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#4285f4', strokeWidth: 0 }}
            />
          </LineChart>
        </div>
      </div>
    </div>
  )
}

export default function CodeForcesPage() {
  const {
    codeforcesData: stats, setCodeforcesData: setStats,
    codeforcesHandle: savedHandle, setCodeforcesHandle: setSavedHandle
  } = useStats()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [inputHandle, setInputHandle] = useState(savedHandle || '')

const fetchStats = async (handle, forceRefresh = false) => {
  setLoading(true)
  setError('')
  try {
    const url = forceRefresh
      ? `/codeforces/stats?handle=${handle}&refresh=true`
      : `/codeforces/stats?handle=${handle}`
    const res = await api.get(url)
    setStats(res.data)
    setSavedHandle(handle)
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to fetch Codeforces stats')
  } finally {
    setLoading(false)
  }
}
const handleConnect = (e) => {
  e.preventDefault()
  if (!inputHandle.trim()) return
  fetchStats(inputHandle.trim())
}

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <CodeforcesIcon />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Codeforces</h1>
            <p className="text-sm text-gray-400 italic">Your contest performance and problem stats</p>
          </div>
        </div>

        {/* Connect form */}
        {!stats && !loading && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-md">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Connect your Codeforces</h2>
            <p className="text-sm text-gray-400 mb-5">Enter your Codeforces handle to load your stats</p>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-xl mb-4 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleConnect} className="flex gap-2">
              <input
                type="text"
                value={inputHandle}
                onChange={e => setInputHandle(e.target.value)}
                placeholder="e.g. tourist"
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
              <img src={stats.avatar} alt={stats.handle}
                className="w-14 h-14 rounded-full border border-gray-200 object-cover" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900">{stats.handle}</h2>
                  <span className="text-sm font-medium capitalize" style={{ color: getRankColor(stats.rank) }}>
                    {stats.rank}
                  </span>
                </div>
                {stats.organization && (
                  <p className="text-sm text-gray-400 mt-0.5">{stats.organization}</p>
                )}
                {stats.country && (
                  <p className="text-xs text-gray-400 italic mt-0.5">{stats.city ? `${stats.city}, ` : ''}{stats.country}</p>
                )}
              </div>
              <button
                onClick={() => { setStats(null); setInputHandle('') }}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition"
              >
                Change
              </button>
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
                      onClick={() => fetchStats(savedHandle, true)}
                      className="ml-2 text-gray-400 hover:text-gray-600 underline">
                      Force refresh
                    </button>
                  </div>
                )}
            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <StatBox label="Current rating" value={stats.rating} sub={`Max: ${stats.maxRating}`} />
              <StatBox label="Problems solved" value={stats.totalSolved} sub={`${stats.totalSubmissions} submissions`} />
              <StatBox label="Contests" value={stats.contestCount} sub="participated" />
              <StatBox label="Contribution" value={stats.contribution} sub={`${stats.friendOfCount} friends`} />
            </div>

            {/* Tags + Difficulty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

              {/* Top tags */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-sm font-semibold text-gray-900 mb-4">Top problem tags</p>
                <div className="space-y-2.5">
                  {stats.topTags.map((t, i) => {
                    const max = stats.topTags[0].count
                    const pct = Math.round((t.count / max) * 100)
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-gray-600 w-32 flex-shrink-0 capitalize">{t.tag}</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[11px] font-mono text-gray-400 w-8 text-right">{t.count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Difficulty breakdown */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-sm font-semibold text-gray-900 mb-4">Difficulty breakdown</p>
                <div className="space-y-2.5">
                  {Object.entries(stats.difficultyBreakdown).map(([range, count], i) => {
                    const max = Math.max(...Object.values(stats.difficultyBreakdown))
                    const pct = max > 0 ? Math.round((count / max) * 100) : 0
                    const colors = ['#22c55e', '#86efac', '#f89f1b', '#f97316', '#ef4444']
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-gray-600 w-24 flex-shrink-0 font-mono">{range}</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: colors[i] }} />
                        </div>
                        <span className="text-[11px] font-mono text-gray-400 w-8 text-right">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
                {/* Rating chart */}
                {stats.ratingChartData?.length > 0 && (
                <RatingChart data={stats.ratingChartData} currentRank={stats.rank} />
                )}
            {/* Recent contests */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
              <p className="text-sm font-semibold text-gray-900 mb-4">Recent contests</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-gray-400 font-medium pb-2">Contest</th>
                      <th className="text-right text-gray-400 font-medium pb-2">Rank</th>
                      <th className="text-right text-gray-400 font-medium pb-2">Rating</th>
                      <th className="text-right text-gray-400 font-medium pb-2">Change</th>
                      <th className="text-right text-gray-400 font-medium pb-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentContests.map((c, i) => (
                      <tr key={i} className="border-b border-gray-50 last:border-0">
                        <td className="py-2 text-gray-700 max-w-xs truncate pr-4">{c.contestName}</td>
                        <td className="py-2 text-right font-mono text-gray-700">#{c.rank}</td>
                        <td className="py-2 text-right font-mono text-gray-700">{c.newRating}</td>
                        <td className="py-2 text-right font-mono font-semibold"
                          style={{ color: c.change >= 0 ? '#22c55e' : '#ef4444' }}>
                          {c.change >= 0 ? '+' : ''}{c.change}
                        </td>
                        <td className="py-2 text-right text-gray-400">{c.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent submissions */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm font-semibold text-gray-900 mb-4">Recent submissions</p>
              <div className="space-y-2.5">
                {stats.recentActivity.map((a, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                      a.verdict === 'OK'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-red-50 text-red-500'
                    }`}>
                      {a.verdict === 'OK' ? 'AC' : 'WA'}
                    </span>
                    <span className="text-xs text-gray-700 flex-1 truncate">{a.problem}</span>
                    {a.rating && (
                      <span className="text-[11px] font-mono text-gray-400">{a.rating}</span>
                    )}
                    <span className="text-[10px] text-gray-400 flex-shrink-0">{a.time}</span>
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