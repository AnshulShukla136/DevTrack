const axios = require('axios')

const LC_API = 'https://leetcode.com/graphql'

const getLeetCodeStats = async (username) => {
  const headers = {
    'Content-Type': 'application/json',
    'Referer': 'https://leetcode.com',
    'User-Agent': 'Mozilla/5.0'
  }

  const [profileRes, solvedRes, contestRes, recentRes, calendarRes] = await Promise.all([

    axios.post(LC_API, {
      query: `query userProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            realName
            userAvatar
            ranking
            reputation
            starRating
            countryName
            company
            school
            aboutMe
          }
          badges { name icon }
          submitStatsGlobal {
            acSubmissionNum { difficulty count submissions }
          }
        }
      }`,
      variables: { username }
    }, { headers }),

    axios.post(LC_API, {
      query: `query userSolvedProblems($username: String!) {
        matchedUser(username: $username) {
          submitStatsGlobal {
            acSubmissionNum { difficulty count submissions }
          }
          tagProblemCounts {
            advanced { tagName problemsSolved }
            intermediate { tagName problemsSolved }
            fundamental { tagName problemsSolved }
          }
        }
      }`,
      variables: { username }
    }, { headers }),

    axios.post(LC_API, {
      query: `query userContestRanking($username: String!) {
        userContestRanking(username: $username) {
          attendedContestsCount
          rating
          globalRanking
          totalParticipants
          topPercentage
          badge { name }
        }
        userContestRankingHistory(username: $username) {
          attended
          rating
          ranking
          contest { title startTime }
        }
      }`,
      variables: { username }
    }, { headers }),

    axios.post(LC_API, {
      query: `query recentSubmissions($username: String!, $limit: Int!) {
        recentAcSubmissionList(username: $username, limit: $limit) {
          id
          title
          titleSlug
          timestamp
        }
      }`,
      variables: { username, limit: 10 }
    }, { headers }),

    axios.post(LC_API, {
      query: `query userProfileCalendar($username: String!) {
        matchedUser(username: $username) {
          userCalendar {
            activeYears
            streak
            totalActiveDays
            submissionCalendar
          }
        }
      }`,
      variables: { username }
    }, { headers }),
  ])

  const profile = profileRes.data?.data?.matchedUser
  if (!profile) throw new Error('User not found')

  const solvedData = solvedRes.data?.data?.matchedUser
  const contestData = contestRes.data?.data
  const recentData = recentRes.data?.data?.recentAcSubmissionList || []
  const calendarData = calendarRes.data?.data?.matchedUser?.userCalendar

  const acStats = profile.submitStatsGlobal?.acSubmissionNum || []
  const totalSolved = acStats.find(s => s.difficulty === 'All')?.count || 0
  const easySolved = acStats.find(s => s.difficulty === 'Easy')?.count || 0
  const mediumSolved = acStats.find(s => s.difficulty === 'Medium')?.count || 0
  const hardSolved = acStats.find(s => s.difficulty === 'Hard')?.count || 0

  const tagData = solvedData?.tagProblemCounts
  const allTags = [
    ...(tagData?.fundamental || []),
    ...(tagData?.intermediate || []),
    ...(tagData?.advanced || []),
  ]
  .filter(t => t.problemsSolved > 0)
  .sort((a, b) => b.problemsSolved - a.problemsSolved)
  .slice(0, 10)

  const contestRanking = contestData?.userContestRanking
  const contestHistory = (contestData?.userContestRankingHistory || [])
    .filter(c => c.attended)
    .slice(-30)
    .map(c => ({
      title: c.contest?.title,
      rating: Math.round(c.rating),
      ranking: c.ranking,
      date: new Date(c.contest?.startTime * 1000).toLocaleDateString('en-US', {
        month: 'short', year: '2-digit'
      })
    }))

  const recentSubmissions = recentData.map(s => ({
    title: s.title,
    slug: s.titleSlug,
    time: new Date(s.timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }),
    url: `https://leetcode.com/problems/${s.titleSlug}/`
  }))

  return {
    username: profile.username,
    name: profile.profile?.realName,
    avatar: profile.profile?.userAvatar,
    ranking: profile.profile?.ranking,
    reputation: profile.profile?.reputation,
    country: profile.profile?.countryName,
    company: profile.profile?.company,
    school: profile.profile?.school,
    totalSolved,
    easySolved,
    mediumSolved,
    hardSolved,
    badges: profile.badges?.slice(0, 5) || [],
    topTags: allTags,
    contestRating: Math.round(contestRanking?.rating || 0),
    contestRank: contestRanking?.globalRanking,
    contestBadge: contestRanking?.badge?.name,
    topPercentage: contestRanking?.topPercentage,
    attendedContests: contestRanking?.attendedContestsCount || 0,
    contestHistory,
    recentSubmissions,
    totalActiveDays: calendarData?.totalActiveDays || 0,
    activeYears: calendarData?.activeYears || []
  }
}
const calculateStreak = (calendarStr) => {
  if (!calendarStr) return 0

  const calendar = JSON.parse(calendarStr) // { timestamp: count }

  const days = Object.keys(calendar)
    .map(ts => parseInt(ts))
    .sort((a, b) => b - a) // latest first

  let streak = 0
  let currentDay = Math.floor(Date.now() / 1000)

  for (let ts of days) {
    const diff = Math.floor((currentDay - ts) / 86400)

    if (diff === streak) {
      streak++
    } else if (diff > streak) {
      break
    }
  }
console.log("FULL CALENDAR RESPONSE:", calendarRes.data)
console.log("CALENDAR DATA:", calendarData)
  return streak
}

const getLeetCodeTagStats = async (username) => {
  const headers = {
    'Content-Type': 'application/json',
    'Referer': 'https://leetcode.com'
  }

  const [tagRes, statsRes, skillRes] = await Promise.all([
    // existing tag query
    axios.post(LC_API, {
      query: `query userTagStats($username: String!) {
        matchedUser(username: $username) {
          tagProblemCounts {
            advanced { tagName tagSlug problemsSolved }
            intermediate { tagName tagSlug problemsSolved }
            fundamental { tagName tagSlug problemsSolved }
          }
        }
      }`,
      variables: { username }
    }, { headers }),

    // global difficulty stats
    axios.post(LC_API, {
      query: `query userStats($username: String!) {
        matchedUser(username: $username) {
          submitStatsGlobal {
            acSubmissionNum { difficulty count }
          }
        }
      }`,
      variables: { username }
    }, { headers }),

    // skill stats — this has heap, prefix sum etc.
    axios.post(LC_API, {
      query: `query skillStats($username: String!) {
        matchedUser(username: $username) {
          problemsSolvedBeatsStats {
            difficulty
            percentage
          }
          languageProblemCount {
            languageName
            problemsSolved
          }
        }
        userProfileUserQuestionProgressV2(userSlug: $username) {
          numAcceptedQuestions {
            count
            difficulty
          }
          userSessionBeatsPercentage {
            difficulty
            percentage
          }
        }
      }`,
      variables: { username }
    }, { headers }),
  ])

  const tagData = tagRes.data?.data?.matchedUser?.tagProblemCounts
  const acStats = statsRes.data?.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum || []

  const totalEasy = acStats.find(s => s.difficulty === 'Easy')?.count || 0
  const totalMedium = acStats.find(s => s.difficulty === 'Medium')?.count || 0
  const totalHard = acStats.find(s => s.difficulty === 'Hard')?.count || 0
  const totalSolved = totalEasy + totalMedium + totalHard || 1

  const easyRatio = totalEasy / totalSolved
  const mediumRatio = totalMedium / totalSolved
  const hardRatio = totalHard / totalSolved

  const allTags = [
    ...(tagData?.fundamental || []),
    ...(tagData?.intermediate || []),
    ...(tagData?.advanced || []),
  ]

  const tagStats = {}
  allTags.forEach(t => {
    const total = t.problemsSolved || 0
    if (total === 0) return
    tagStats[t.tagName.toLowerCase()] = {
      total,
      easy: Math.round(total * easyRatio),
      medium: Math.round(total * mediumRatio),
      hard: Math.round(total * hardRatio),
    }
  })
// Heap and prefix sum are not returned by LeetCode's tagProblemCounts
  // Estimate based on total solved problems
  const totalProblems = totalEasy + totalMedium + totalHard

  // If user has solved 25+ total problems, estimate heap as ~8% of total
  if (totalProblems >= 25 && !tagStats['heap (priority queue)'] && !tagStats['heap']) {
    const heapEstimate = Math.round(totalProblems * 0.08)
    tagStats['heap'] = {
      total: heapEstimate,
      easy: Math.round(heapEstimate * easyRatio),
      medium: Math.round(heapEstimate * mediumRatio),
      hard: Math.round(heapEstimate * hardRatio),
    }
  }

  // Prefix sum ~5% of total
  if (totalProblems >= 20 && !tagStats['prefix sum']) {
    const prefixEstimate = Math.round(totalProblems * 0.05)
    tagStats['prefix sum'] = {
      total: prefixEstimate,
      easy: Math.round(prefixEstimate * easyRatio),
      medium: Math.round(prefixEstimate * mediumRatio),
      hard: Math.round(prefixEstimate * hardRatio),
    }
  }

  return tagStats
  return tagStats
}

module.exports = { getLeetCodeStats, getLeetCodeTagStats }