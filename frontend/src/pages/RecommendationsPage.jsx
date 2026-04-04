import { useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import { useStats } from '../context/StatsContext'
import { LeetCodeLogo, CodeForcesLogo } from '../components/Icons'
const difficultyColor = {
  Easy:   { bg: 'bg-green-50',  text: 'text-green-600', border: 'border-green-100' },
  Medium: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100' },
  Hard:   { bg: 'bg-red-50',    text: 'text-red-500',    border: 'border-red-100' },
}

const levelStyle = {
  'Not started': { color: '#9ca3af', bg: '#f9fafb' },
  'Weak':         { color: '#ef4444', bg: '#fef2f2' },
  'Intermediate': { color: '#f89f1b', bg: '#fffbeb' },
  'Advanced':     { color: '#3b82f6', bg: '#eff6ff' },
  'Master':       { color: '#22c55e', bg: '#f0fdf4' },
}

const getProblemUrl = (p) => p.url || `https://leetcode.com/problems/${p.slug}/`

const ScoreBar = ({ score, thresholds }) => {
  const maxScore = thresholds.advanced * 1.5
  const pct = Math.min((score / maxScore) * 100, 100)

  return (
    <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className="absolute top-0 left-0 h-full rounded-full transition-all"
        style={{
          width: `${pct}%`,
          background: score < thresholds.weak ? '#ef4444'
            : score < thresholds.intermediate ? '#f89f1b'
            : score < thresholds.advanced ? '#3b82f6'
            : '#22c55e'
        }}
      />
      {[thresholds.weak, thresholds.intermediate, thresholds.advanced].map((mark, i) => (
        <div key={i} className="absolute top-0 h-full w-px bg-white opacity-60"
          style={{ left: `${Math.min((mark / maxScore) * 100, 100)}%` }} />
      ))}
    </div>
  )
}

export default function RecommendationsPage() {
  const {
    recommendationsData, setRecommendationsData,
    leetcodeUsername, codeforcesHandle
  } = useStats()

  const [data, setData] = useState(recommendationsData)
  const [submitted, setSubmitted] = useState(!!recommendationsData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedTopic, setSelectedTopic] = useState(recommendationsData?.topics?.[0] || null)
  const [filter, setFilter] = useState('All')
  const [form, setForm] = useState({
    leetcode: leetcodeUsername || '',
    codeforces: codeforcesHandle || ''
  })

  const fetchRecommendations = async (lc, cf) => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (lc) params.append('leetcode', lc)
      if (cf) params.append('codeforces', cf)
      const res = await api.get(`/recommendations?${params}`)
      setData(res.data)
      setRecommendationsData(res.data)
      setSelectedTopic(res.data.topics[0])
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setData(null)
    setRecommendationsData(null)
    setSubmitted(false)
    setSelectedTopic(null)
    setFilter('All')
    setForm({ leetcode: leetcodeUsername || '', codeforces: codeforcesHandle || '' })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.leetcode && !form.codeforces) return
    fetchRecommendations(form.leetcode, form.codeforces)
  }

  const filteredTopics = data?.topics?.filter(t =>
    filter === 'All' ? true : t.level === filter
  ) || []

  const levels = ['Not started', 'Weak', 'Intermediate', 'Advanced', 'Master']


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Recommendations</h1>
            <p className="text-sm text-gray-400 italic">
              Score = Easy×1 + Medium×3 + Hard×5 · thresholds vary by topic
            </p>
          </div>
        </div>

        {/* Connect form */}
        {!submitted && !loading && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-lg">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Analyze your profile</h2>
            <p className="text-sm text-gray-400 mb-2">Score formula per topic:</p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 mb-5">
              <code className="text-xs font-mono text-gray-700">
                score = (easy × 1) + (medium × 3) + (hard × 5)
              </code>
              <p className="text-[11px] text-gray-400 mt-1">
                Thresholds differ per topic — larger topics have higher targets
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-xl mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">LeetCode username</label>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                  <LeetCodeLogo size={14} />
                  <input type="text" value={form.leetcode}
                    onChange={e => setForm({ ...form, leetcode: e.target.value })}
                    placeholder="   neal_wu"
                    className="flex-1 bg-transparent text-sm text-gray-900 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Codeforces handle</label>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                  <CodeForcesLogo size={14} />
                  <input type="text" value={form.codeforces}
                    onChange={e => setForm({ ...form, codeforces: e.target.value })}
                    placeholder="   tourist"
                    className="flex-1 bg-transparent text-sm text-gray-900 focus:outline-none" />
                </div>
              </div>
              <button type="submit"
                className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition mt-1">
                Generate recommendations
              </button>
            </form>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-7 h-7 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400 italic">Analyzing your submissions...</p>
          </div>
        )}

        {/* Results */}
        {data && !loading && (
          <>
            {/* Summary cards — 5 levels */}
            <div className="grid grid-cols-5 gap-3 mb-4">
              {levels.map(level => {
                const key = level.toLowerCase().replace(' ', '')
                const count = data.summary[key] ?? 0
                return (
                  <button key={level}
                    onClick={() => setFilter(filter === level ? 'All' : level)}
                    className={`bg-white border rounded-xl p-3 text-left transition ${
                      filter === level
                        ? 'border-gray-400 ring-1 ring-gray-300'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <p className="text-xl font-bold font-mono"
                      style={{ color: levelStyle[level].color }}>
                      {count}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{level}</p>
                  </button>
                )
              })}
            </div>

            <div className="flex justify-between items-center mb-3">
              <div>
                {filter !== 'All' && (
                  <button onClick={() => setFilter('All')}
                    className="text-xs text-gray-400 hover:text-gray-600">
                    ← Show all
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setData(null)
                  setSubmitted(false)
                  setForm({ leetcode: '', codeforces: '' })
                  setSelectedTopic(null)
                  setFilter('All')
                }}
                className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
                Analyze different profile
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Left — topic list */}
              <div className="md:col-span-1">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">
                    {filter === 'All' ? 'All topics' : `${filter} topics`} · {filteredTopics.length}
                  </p>
                  <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
                    {filteredTopics.map((t, i) => (
                      <button key={i} onClick={() => setSelectedTopic(t)}
                        className={`w-full text-left px-3 py-3 rounded-xl border transition ${
                          selectedTopic?.topic === t.topic
                            ? 'border-gray-900 bg-gray-900'
                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                        }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-medium capitalize ${
                            selectedTopic?.topic === t.topic ? 'text-white' : 'text-gray-900'
                          }`}>
                            {t.topic}
                          </span>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                            style={selectedTopic?.topic === t.topic
                              ? { background: 'rgba(255,255,255,0.15)', color: '#fff' }
                              : { background: levelStyle[t.level]?.bg, color: levelStyle[t.level]?.color }
                            }>
                            {t.level}
                          </span>
                        </div>
                        <ScoreBar score={t.score} thresholds={t.thresholds} />
                        <div className={`flex justify-between mt-1.5 text-[10px] font-mono ${
                          selectedTopic?.topic === t.topic ? 'text-white/60' : 'text-gray-400'
                        }`}>
                          <span>Score: {t.score}</span>
                          <span>{t.totalSolved} solved</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right — detail + problems */}
              <div className="md:col-span-2">
                {selectedTopic && (
                  <div className="bg-white border border-gray-200 rounded-xl p-5">

                    {/* Topic header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h2 className="text-base font-semibold text-gray-900 capitalize mb-1">
                          {selectedTopic.topic}
                        </h2>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{
                            background: levelStyle[selectedTopic.level]?.bg,
                            color: levelStyle[selectedTopic.level]?.color
                          }}>
                          {selectedTopic.level}
                        </span>
                      </div>
                      {/* Score — raw number, not /100 */}
                      <div className="text-right">
                        <p className="text-2xl font-bold font-mono text-gray-900">
                          {selectedTopic.score}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          pts · next: {selectedTopic.thresholds.weak > selectedTopic.score
                            ? selectedTopic.thresholds.weak
                            : selectedTopic.thresholds.intermediate > selectedTopic.score
                              ? selectedTopic.thresholds.intermediate
                              : selectedTopic.thresholds.advanced > selectedTopic.score
                                ? selectedTopic.thresholds.advanced
                                : 'Master ✓'
                          }
                        </p>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4">
                      <p className="text-xs text-gray-600 italic">{selectedTopic.reason}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Recommended:{' '}
                        {selectedTopic.recommendedDifficulty.map((d, i) => (
                          <span key={i} className={`font-medium mr-1 ${
                            d === 'Easy' ? 'text-green-500'
                            : d === 'Medium' ? 'text-yellow-500'
                            : 'text-red-500'
                          }`}>{d}</span>
                        ))}
                      </p>
                    </div>

                    {/* Score breakdown */}
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {[
                        { label: 'Score', value: selectedTopic.score, color: 'text-gray-900' },
                        { label: 'Easy ×1', value: selectedTopic.easy, color: 'text-green-500' },
                        { label: 'Medium ×3', value: selectedTopic.medium, color: 'text-yellow-500' },
                        { label: 'Hard ×5', value: selectedTopic.hard, color: 'text-red-500' },
                      ].map((s, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-2.5 text-center">
                          <p className={`text-base font-bold font-mono ${s.color}`}>{s.value}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Score bar with threshold labels */}
                    <ScoreBar score={selectedTopic.score} thresholds={selectedTopic.thresholds} />
                    <div className="flex justify-between text-[9px] text-gray-300 font-mono mt-1 mb-5">
                      <span>0</span>
                      <span>Weak ({selectedTopic.thresholds.weak})</span>
                      <span>Inter ({selectedTopic.thresholds.intermediate})</span>
                      <span>Adv ({selectedTopic.thresholds.advanced})</span>
                      <span>Master</span>
                    </div>

                    {/* Problems */}
                    <p className="text-xs font-semibold text-gray-700 mb-3">
                      Recommended problems ({selectedTopic.problems.length})
                    </p>
                    <div className="space-y-2">
                      {selectedTopic.problems.map((p, i) => {
                        const dc = difficultyColor[p.difficulty] || difficultyColor.Medium
                        return (
                          <a key={i} href={getProblemUrl(p)} target="_blank" rel="noreferrer"
                            className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition group">
                            <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-mono text-gray-400">{i + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 font-medium truncate group-hover:text-gray-700">
                                {p.title}
                              </p>
                              <p className="text-[10px] text-gray-400 capitalize mt-0.5">{p.platform}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${dc.bg} ${dc.text} ${dc.border}`}>
                                {p.difficulty}
                              </span>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"
                                className="group-hover:stroke-gray-600 transition">
                                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
                              </svg>
                            </div>
                          </a>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}