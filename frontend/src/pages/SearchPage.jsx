import { useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import { LeetCodeLogo, GitHubLogo, CodeForcesLogo } from '../components/Icons'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const getRankColor = (rank) => {
  if (!rank) return '#9ca3af'
  if (rank.includes('legendary') || rank.includes('grandmaster')) return '#ff0000'
  if (rank.includes('master')) return '#ff8c00'
  if (rank.includes('candidate')) return '#ff8c00'
  if (rank.includes('expert')) return '#0000ff'
  if (rank.includes('specialist')) return '#03a89e'
  if (rank.includes('pupil')) return '#008000'
  return '#9ca3af'
}

const StatBox = ({ label, value, sub }) => (
  <div className="bg-gray-50 rounded-xl p-3 text-center">
    <p className="text-lg font-bold font-mono text-gray-900">{value ?? '—'}</p>
    <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">{label}</p>
    {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
  </div>
)

const PlatformSection = ({ title, icon, iconBg, data, error, loading }) => {
  if (loading) return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-center">
      <div className="w-6 h-6 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: iconBg }}>
          {icon}
        </div>
        <span className="text-sm font-semibold text-gray-900">{title}</span>
      </div>
      <p className="text-sm text-red-400 italic">{error}</p>
    </div>
  )

  if (!data) return null

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: iconBg }}>
          {icon}
        </div>
        <span className="text-sm font-semibold text-gray-900">{title}</span>
        <span className="ml-auto text-xs text-green-500 font-medium">Found ✓</span>
      </div>

      {/* GitHub */}
      {title === 'GitHub' && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <img src={data.avatar} alt={data.username}
              className="w-12 h-12 rounded-full border border-gray-200" />
            <div>
              <p className="text-sm font-bold text-gray-900">{data.name || data.username}</p>
              <p className="text-xs text-gray-400 font-mono">@{data.username}</p>
              {data.bio && <p className="text-xs text-gray-500 italic mt-0.5">{data.bio}</p>}
            </div>
            <a href={data.profileUrl} target="_blank" rel="noreferrer"
              className="ml-auto text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition">
              View →
            </a>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-3">
            <StatBox label="Repos" value={data.publicRepos} />
            <StatBox label="Stars" value={data.totalStars} />
            <StatBox label="Commits" value={data.recentCommits?.toLocaleString()} />
            <StatBox label="Followers" value={data.followers} />
          </div>
          {data.topLanguages?.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2">Top languages</p>
              <div className="flex flex-wrap gap-1.5">
                {data.topLanguages.map((l, i) => (
                  <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">
                    {l.lang} ({l.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* LeetCode */}
      {title === 'LeetCode' && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <img src={data.avatar} alt={data.username}
              className="w-12 h-12 rounded-full border border-gray-200" />
            <div>
              <p className="text-sm font-bold text-gray-900">{data.name || data.username}</p>
              <p className="text-xs text-gray-400 font-mono">@{data.username}</p>
              {data.contestBadge && (
                <span className="text-[10px] bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full">
                  {data.contestBadge}
                </span>
              )}
            </div>
            <a href={`https://leetcode.com/${data.username}`} target="_blank" rel="noreferrer"
              className="ml-auto text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition">
              View →
            </a>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-3">
            <StatBox label="Solved" value={data.totalSolved} />
            <StatBox label="Easy" value={data.easySolved} />
            <StatBox label="Medium" value={data.mediumSolved} />
            <StatBox label="Hard" value={data.hardSolved} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <StatBox label="Rating" value={data.contestRating || '—'} />
            <StatBox label="Contests" value={data.attendedContests} />
            <StatBox label="Streak" value={`${data.streak}d`} />
          </div>
          {data.contestHistory?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-2">Contest rating history</p>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={data.contestHistory}>
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={35} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="rating" stroke="#f89f1b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {/* Codeforces */}
      {title === 'Codeforces' && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <img src={data.avatar} alt={data.handle}
              className="w-12 h-12 rounded-full border border-gray-200 object-cover" />
            <div>
              <p className="text-sm font-bold text-gray-900">{data.handle}</p>
              <span className="text-xs font-medium capitalize" style={{ color: getRankColor(data.rank) }}>
                {data.rank}
              </span>
              {data.organization && <p className="text-xs text-gray-400 mt-0.5">{data.organization}</p>}
            </div>
            <a href={`https://codeforces.com/profile/${data.handle}`} target="_blank" rel="noreferrer"
              className="ml-auto text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition">
              View →
            </a>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-3">
            <StatBox label="Rating" value={data.rating} sub={`Max: ${data.maxRating}`} />
            <StatBox label="Solved" value={data.totalSolved} />
            <StatBox label="Contests" value={data.contestCount} />
            <StatBox label="Contribution" value={data.contribution} />
          </div>
          {data.topTags?.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2">Top tags</p>
              <div className="flex flex-wrap gap-1.5">
                {data.topTags.slice(0, 6).map((t, i) => (
                  <span key={i} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg capitalize">
                    {t.tag} ({t.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function SearchPage() {
  const [form, setForm] = useState({ github: '', leetcode: '', codeforces: '' })
  const [results, setResults] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.github && !form.leetcode && !form.codeforces) return
    setLoading(true)
    setResults(null)
    setErrors({})
    try {
      const res = await api.post('/search', form)
      setResults(res.data.results)
      setErrors(res.data.errors || {})
      setSearched(true)
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Search failed' })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setForm({ github: '', leetcode: '', codeforces: '' })
    setResults(null)
    setErrors({})
    setSearched(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Search profiles</h1>
            <p className="text-sm text-gray-400 italic">Look up any coder across all platforms</p>
          </div>
        </div>

        {/* Search form */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">LeetCode username</label>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                  <LeetCodeLogo size={14} />
                  <input type="text" value={form.leetcode}
                    onChange={e => setForm({ ...form, leetcode: e.target.value })}
                    placeholder="e.g. neal_wu"
                    className="flex-1 bg-transparent text-sm text-gray-900 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">GitHub username</label>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                  <GitHubLogo size={14} />
                  <input type="text" value={form.github}
                    onChange={e => setForm({ ...form, github: e.target.value })}
                    placeholder="e.g. torvalds"
                    className="flex-1 bg-transparent text-sm text-gray-900 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Codeforces handle</label>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                  <CodeForcesLogo size={14} />
                  <input type="text" value={form.codeforces}
                    onChange={e => setForm({ ...form, codeforces: e.target.value })}
                    placeholder="e.g. tourist"
                    className="flex-1 bg-transparent text-sm text-gray-900 focus:outline-none" />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading}
                className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition">
                {loading ? 'Searching...' : 'Search'}
              </button>
              {searched && (
                <button type="button" onClick={handleReset}
                  className="bg-gray-100 text-gray-600 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-7 h-7 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400 italic">Fetching profiles...</p>
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {form.leetcode && (
              <PlatformSection
                title="LeetCode"
                icon={<LeetCodeLogo size={16} />}
                iconBg="#fff7e6"
                data={results.leetcode}
                error={errors.leetcode}
                loading={false}
              />
            )}
            {form.github && (
              <PlatformSection
                title="GitHub"
                icon={<GitHubLogo size={16} />}
                iconBg="#f5f5f5"
                data={results.github}
                error={errors.github}
                loading={false}
              />
            )}
            {form.codeforces && (
              <PlatformSection
                title="Codeforces"
                icon={<CodeForcesLogo size={16} />}
                iconBg="#e8f0fe"
                data={results.codeforces}
                error={errors.codeforces}
                loading={false}
              />
            )}
          </div>
        )}

        {/* Empty state */}
        {!results && !loading && !searched && (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            <p className="text-gray-400 text-sm italic">Enter a username above to search profiles</p>
            <p className="text-gray-300 text-xs mt-1">You can search one or all platforms at once</p>
          </div>
        )}

      </div>
    </div>
  )
}