import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useStats } from '../context/StatsContext'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import { LeetCodeLogo, GitHubLogo, CodeForcesLogo } from '../components/Icons'
const LeetCodeIcon = () => <LeetCodeLogo size={16} />

const GitHubIcon = () => <GitHubLogo size={16} />

const CodeforcesIcon = () => <CodeForcesLogo size={16} />

const StatCard = ({ label, value, sub, dotColor }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4">
    <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1.5">{label}</p>
    <p className="text-2xl font-bold text-gray-900 font-mono">{value ?? '—'}</p>
    {sub && (
      <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
        {dotColor && <span className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0" style={{ background: dotColor }} />}
        {sub}
      </p>
    )}
  </div>
)

const PlatformCard = ({ icon, iconBg, name, badge, badgeStyle, stats, connected, onConnect, path }) => {
  const navigate = useNavigate()
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: iconBg }}>
          {icon}
        </div>
        <span className="text-sm font-semibold text-gray-900">{name}</span>
        {connected && badge && (
          <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full" style={badgeStyle}>
            {badge}
          </span>
        )}
        {!connected && (
          <button onClick={onConnect}
            className="ml-auto text-[10px] font-medium px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition">
            Connect
          </button>
        )}
      </div>

      {connected ? (
        <>
          <div className="space-y-0">
            {stats.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-500">{s.label}</span>
                <span className={`text-xs font-semibold font-mono ${s.color || 'text-gray-900'}`}>{s.value}</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate(path)}
            className="mt-3 w-full text-xs text-gray-400 hover:text-gray-600 text-center transition">
            View full stats →
          </button>
        </>
      ) : (
        <div className="py-4 text-center">
          <p className="text-xs text-gray-400 italic mb-2">Not connected yet</p>
          <button onClick={onConnect}
            className="text-xs bg-gray-900 text-white px-4 py-1.5 rounded-lg hover:bg-gray-800 transition">
            Load {name} stats
          </button>
        </div>
      )}
    </div>
  )
}

const WeaknessBar = ({ topic, score, thresholds }) => {
  const maxScore = thresholds?.advanced * 1.5 || 600
  const pct = Math.min((score / maxScore) * 100, 100)
  const color = score < (thresholds?.weak || 80) ? '#ef4444'
    : score < (thresholds?.intermediate || 200) ? '#f89f1b'
    : score < (thresholds?.advanced || 400) ? '#3b82f6'
    : '#22c55e'
  const label = score < (thresholds?.weak || 80) ? 'Weak'
    : score < (thresholds?.intermediate || 200) ? 'Fair'
    : score < (thresholds?.advanced || 400) ? 'Good'
    : 'Master'

  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs text-gray-600 w-28 flex-shrink-0 capitalize">{topic}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[10px] font-mono text-gray-400 w-8 text-right">{score}</span>
      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full w-12 text-center flex-shrink-0"
        style={{
          background: color + '20',
          color
        }}>
        {label}
      </span>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const {
    githubData, setGithubData, githubUsername, setGithubUsername,
    leetcodeData, setLeetcodeData, leetcodeUsername, setLeetcodeUsername,
    codeforcesData, setCodeforcesData, codeforcesHandle, setCodeforcesHandle,
    recommendationsData
  } = useStats()

  const [fetching, setFetching] = useState({ github: false, leetcode: false, codeforces: false })

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // Auto-fetch if username saved but data not loaded
  useEffect(() => {
    const autoFetch = async () => {
      if (!githubData && githubUsername) {
        setFetching(f => ({ ...f, github: true }))
        try {
          const res = await api.get(`/github/stats?username=${githubUsername}`)
          setGithubData(res.data)
        } catch (e) { console.log('GitHub auto-fetch failed') }
        setFetching(f => ({ ...f, github: false }))
      }
      if (!leetcodeData && leetcodeUsername) {
        setFetching(f => ({ ...f, leetcode: true }))
        try {
          const res = await api.get(`/leetcode/stats?username=${leetcodeUsername}`)
          setLeetcodeData(res.data)
        } catch (e) { console.log('LeetCode auto-fetch failed') }
        setFetching(f => ({ ...f, leetcode: false }))
      }
      if (!codeforcesData && codeforcesHandle) {
        setFetching(f => ({ ...f, codeforces: true }))
        try {
          const res = await api.get(`/codeforces/stats?handle=${codeforcesHandle}`)
          setCodeforcesData(res.data)
        } catch (e) { console.log('Codeforces auto-fetch failed') }
        setFetching(f => ({ ...f, codeforces: false }))
      }
    }
    autoFetch()
  }, [])

  // Summary stats
  const totalSolved = (leetcodeData?.totalSolved || 0) + (codeforcesData?.totalSolved || 0)
  const bestRating = Math.max(leetcodeData?.contestRating || 0, codeforcesData?.rating || 0)
  const githubCommits = githubData?.recentCommits || 0
  const weakTopics = recommendationsData?.topics?.filter(t => t.level === 'Weak').length ?? '—'

  // Recent activity merged from all platforms
  const recentActivity = [
    ...(githubData?.recentActivity?.slice(0, 3).map(a => ({
      platform: 'github', text: a.text, time: a.time
    })) || []),
    ...(leetcodeData?.recentSubmissions?.slice(0, 3).map(s => ({
      platform: 'leetcode', text: `Solved ${s.title}`, time: s.time
    })) || []),
    ...(codeforcesData?.recentActivity?.slice(0, 3).map(a => ({
      platform: 'codeforces',
      text: `${a.verdict === 'OK' ? 'Solved' : 'Attempted'} ${a.problem}`,
      time: a.time
    })) || []),
  ].slice(0, 8)

  const dotColors = { leetcode: '#f89f1b', github: '#24292e', codeforces: '#4285f4' }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">

        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            {greeting()}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-sm text-gray-400 italic mt-0.5">
            Here's your coding activity overview
          </p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <StatCard
            label="Total solved"
            value={totalSolved || '—'}
            sub={totalSolved ? `LC + CF combined` : 'Connect platforms'}
            dotColor={totalSolved ? '#22c55e' : undefined}
          />
          <StatCard
            label="Best rating"
            value={bestRating || '—'}
            sub={leetcodeData?.contestBadge || codeforcesData?.rank || 'No contests yet'}
            dotColor={bestRating ? '#f89f1b' : undefined}
          />
          <StatCard
            label="GitHub commits"
            value={githubCommits || '—'}
            sub={githubData ? `${githubData.publicRepos} repos · ${githubData.totalStars} stars` : 'Connect GitHub'}
            dotColor={githubCommits ? '#6366f1' : undefined}
          />
          <StatCard
            label="Weak topics"
            value={weakTopics}
            sub={recommendationsData ? 'From analysis' : 'Run recommendations'}
            dotColor={typeof weakTopics === 'number' ? '#ef4444' : undefined}
          />
        </div>

        {/* Platform cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <PlatformCard
            icon={<LeetCodeIcon />}
            iconBg="#fff7e6"
            name="LeetCode"
            badge={leetcodeData?.contestBadge || 'Active'}
            badgeStyle={{ background: '#fff7e6', color: '#b45309' }}
            connected={!!leetcodeData}
            onConnect={() => navigate('/dashboard/leetcode')}
            path="/dashboard/leetcode"
            stats={leetcodeData ? [
              { label: 'Problems solved', value: leetcodeData.totalSolved },
              { label: 'Easy', value: leetcodeData.easySolved, color: 'text-green-500' },
              { label: 'Medium', value: leetcodeData.mediumSolved, color: 'text-yellow-500' },
              { label: 'Hard', value: leetcodeData.hardSolved, color: 'text-red-500' },
              { label: 'Contest rating', value: leetcodeData.contestRating || '—' },
              { label: 'Global rank', value: leetcodeData.topPercentage ? `Top ${leetcodeData.topPercentage?.toFixed(1)}%` : '—' },
            ] : []}
          />
          <PlatformCard
            icon={<GitHubIcon />}
            iconBg="#f5f5f5"
            name="GitHub"
            badge="Active"
            badgeStyle={{ background: '#f5f5f5', color: '#444' }}
            connected={!!githubData}
            onConnect={() => navigate('/dashboard/github')}
            path="/dashboard/github"
            stats={githubData ? [
              { label: 'Total commits', value: githubData.recentCommits?.toLocaleString() || '—' },
              { label: 'Repositories', value: githubData.publicRepos },
              { label: 'Stars earned', value: githubData.totalStars },
              { label: 'Top language', value: githubData.topLanguages?.[0]?.lang || '—' },
              { label: 'Followers', value: githubData.followers },
              { label: 'Following', value: githubData.following },
            ] : []}
          />
          <PlatformCard
            icon={<CodeforcesIcon />}
            iconBg="#e8f0fe"
            name="Codeforces"
            badge={codeforcesData?.rank || 'Active'}
            badgeStyle={{ background: '#e8f0fe', color: '#1a56db' }}
            connected={!!codeforcesData}
            onConnect={() => navigate('/dashboard/codeforces')}
            path="/dashboard/codeforces"
            stats={codeforcesData ? [
              { label: 'Current rating', value: codeforcesData.rating },
              { label: 'Max rating', value: codeforcesData.maxRating },
              { label: 'Problems solved', value: codeforcesData.totalSolved },
              { label: 'Contests', value: codeforcesData.contestCount },
              { label: 'Best rank', value: codeforcesData.recentContests?.[0]?.rank ? `#${codeforcesData.recentContests[0].rank}` : '—' },
              { label: 'Contribution', value: codeforcesData.contribution },
            ] : []}
          />
        </div>

        {/* Bottom row — weakness + activity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

          {/* Weakness analysis */}
          <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-900">Topic weakness analysis</p>
              {!recommendationsData && (
                <button onClick={() => navigate('/dashboard/recommendations')}
                  className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition">
                  Run analysis
                </button>
              )}
            </div>

            {recommendationsData ? (
              <div className="space-y-2.5">
                {recommendationsData.topics.slice(0, 8).map((t, i) => (
                  <WeaknessBar
                    key={i}
                    topic={t.topic}
                    score={t.score}
                    thresholds={t.thresholds}
                  />
                ))}
                <button onClick={() => navigate('/dashboard/recommendations')}
                  className="text-xs text-gray-400 hover:text-gray-600 mt-2 transition">
                  View all topics →
                </button>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-gray-400 italic mb-3">
                  No analysis yet — run recommendations to see your weak topics
                </p>
                <button onClick={() => navigate('/dashboard/recommendations')}
                  className="text-xs bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
                  Go to Recommendations
                </button>
              </div>
            )}
          </div>

          {/* Recent activity */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm font-semibold text-gray-900 mb-4">Recent activity</p>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((a, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: dotColors[a.platform] }} />
                    <div>
                      <p className="text-xs text-gray-700 leading-snug">{a.text}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-xs text-gray-400 italic">
                  Connect your platforms to see recent activity
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}