const axios = require('axios')

const CF_API = 'https://codeforces.com/api'

const getCodeforcesStats = async (handle) => {
  // Fetch user info, submissions, and rating history in parallel
  const [userRes, submissionsRes, ratingRes] = await Promise.all([
    axios.get(`${CF_API}/user.info?handles=${handle}`),
    axios.get(`${CF_API}/user.status?handle=${handle}&from=1&count=1000`),
    axios.get(`${CF_API}/user.rating?handle=${handle}`)
  ])

  if (userRes.data.status !== 'OK') throw new Error('User not found')

  const user = userRes.data.result[0]
  const submissions = submissionsRes.data.result
  const ratingHistory = ratingRes.data.result

  // Solved problems (unique, only accepted)
  const solvedSet = new Set()
  submissions.forEach(s => {
    if (s.verdict === 'OK') {
      solvedSet.add(`${s.problem.contestId}-${s.problem.index}`)
    }
  })

  // Tag analysis
  const tagMap = {}
  const solvedProblems = submissions.filter(s => s.verdict === 'OK')
  solvedProblems.forEach(s => {
    s.problem.tags?.forEach(tag => {
      tagMap[tag] = (tagMap[tag] || 0) + 1
    })
  })

  const topTags = Object.entries(tagMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag, count]) => ({ tag, count }))

  // Difficulty breakdown (by problem rating)
  const diffMap = { '800-1000': 0, '1100-1400': 0, '1500-1800': 0, '1900-2200': 0, '2300+': 0 }
  solvedProblems.forEach(s => {
    const r = s.problem.rating
    if (!r) return
    if (r <= 1000) diffMap['800-1000']++
    else if (r <= 1400) diffMap['1100-1400']++
    else if (r <= 1800) diffMap['1500-1800']++
    else if (r <= 2200) diffMap['1900-2200']++
    else diffMap['2300+']++
  })

  // Contest history (last 10)
  const recentContests = ratingHistory.slice().reverse().map(c => ({
    contestId: c.contestId,
    contestName: c.contestName,
    rank: c.rank,
    oldRating: c.oldRating,
    newRating: c.newRating,
    change: c.newRating - c.oldRating,
    date: new Date(c.ratingUpdateTimeSeconds * 1000).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }))

  // Rating chart data (last 20 contests)
  const ratingChartData = ratingHistory.slice().map(c => ({
    contest: c.contestName.slice(0, 20),
    rating: c.newRating,
    date: new Date(c.ratingUpdateTimeSeconds * 1000).toLocaleDateString('en-US', {
      month: 'short', year: '2-digit'
    })
  }))

  // Recent activity
  const recentActivity = submissions.slice(0, 10).map(s => ({
    problem: `${s.problem.name}`,
    verdict: s.verdict,
    rating: s.problem.rating,
    time: new Date(s.creationTimeSeconds * 1000).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }))

  return {
    handle: user.handle,
    rating: user.rating || 0,
    maxRating: user.maxRating || 0,
    rank: user.rank || 'unrated',
    maxRank: user.maxRank || 'unrated',
    avatar: user.titlePhoto,
    country: user.country,
    city: user.city,
    organization: user.organization,
    friendOfCount: user.friendOfCount || 0,
    contribution: user.contribution || 0,
    totalSolved: solvedSet.size,
    totalSubmissions: submissions.length,
    contestCount: ratingHistory.length,
    topTags,
    difficultyBreakdown: diffMap,
    recentContests,
    ratingChartData,
    recentActivity
  }
}

module.exports = { getCodeforcesStats }