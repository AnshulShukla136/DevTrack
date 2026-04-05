const axios = require('axios')

const GITHUB_API = 'https://api.github.com'

const getGitHubStats = async (username) => {
  const headers = {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json'
  }

  // Fetch user profile, repos, events in parallel
  const [userRes, reposRes, eventsRes] = await Promise.all([
    axios.get(`${GITHUB_API}/users/${username}`, { headers }),
    axios.get(`${GITHUB_API}/users/${username}/repos?per_page=100&sort=updated`, { headers }),
    axios.get(`${GITHUB_API}/users/${username}/events/public?per_page=100`, { headers }),
  ])

  const user = userRes.data
  const repos = reposRes.data
  const events = eventsRes.data

  // Language breakdown
  const langMap = {}
  repos.forEach(r => {
    if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1
  })
  const topLanguages = Object.entries(langMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lang, count]) => ({ lang, count }))

  // Total stars
  const totalStars = repos.reduce((acc, r) => acc + r.stargazers_count, 0)

  // Total forks
  const totalForks = repos.reduce((acc, r) => acc + r.forks_count, 0)

  // ── Better commit counting ──────────────────────────────────
  // Method 1: Count from push events (recent activity)
  const pushEvents = events.filter(e => e.type === 'PushEvent')
  const recentCommits = pushEvents.reduce((acc, e) => acc + (e.payload?.commits?.length || 0), 0)

  // Method 2: Get total commits across all repos using search API
  let totalCommits = 0
  try {
    const commitSearchRes = await axios.get(
      `${GITHUB_API}/search/commits?q=author:${username}&per_page=1`,
      {
        headers: {
          ...headers,
          Accept: 'application/vnd.github.cloak-preview+json'
        }
      }
    )
    totalCommits = commitSearchRes.data.total_count || 0
  } catch (e) {
    // fallback to counting from repos
    totalCommits = recentCommits
    console.log('Commit search failed, using events count')
  }

  // Method 3: Get contribution count from each repo
  let repoCommits = 0
  try {
    const commitPromises = repos.slice(0, 10).map(repo =>
      axios.get(
        `${GITHUB_API}/repos/${username}/${repo.name}/commits?author=${username}&per_page=1`,
        { headers }
      ).then(res => {
        // Get total from Link header
        const link = res.headers.link || ''
        const match = link.match(/page=(\d+)>; rel="last"/)
        return match ? parseInt(match[1]) : res.data.length
      }).catch(() => 0)
    )
    const counts = await Promise.all(commitPromises)
    repoCommits = counts.reduce((a, b) => a + b, 0)
  } catch (e) {
    console.log('Repo commits count failed')
  }

  // Use the best available count
  const bestCommitCount = Math.max(totalCommits, repoCommits, recentCommits)

  // Recent activity feed
  const recentActivity = events.slice(0, 10).map(e => {
    let text = ''
    if (e.type === 'PushEvent') {
      const count = e.payload?.commits?.length || 0
      text = `Pushed ${count} commit${count > 1 ? 's' : ''} to ${e.repo?.name}`
    } else if (e.type === 'CreateEvent') {
      text = `Created ${e.payload?.ref_type} in ${e.repo?.name}`
    } else if (e.type === 'WatchEvent') {
      text = `Starred ${e.repo?.name}`
    } else if (e.type === 'ForkEvent') {
      text = `Forked ${e.repo?.name}`
    } else if (e.type === 'IssuesEvent') {
      text = `${e.payload?.action} issue in ${e.repo?.name}`
    } else if (e.type === 'PullRequestEvent') {
      text = `${e.payload?.action} PR in ${e.repo?.name}`
    } else {
      text = `${e.type.replace('Event', '')} on ${e.repo?.name}`
    }
    return {
      type: e.type,
      text,
      time: e.created_at,
      repo: e.repo?.name
    }
  }).filter(a => a.text)

  // Top repos by stars
  const topRepos = repos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5)
    .map(r => ({
      name: r.name,
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language,
      url: r.html_url,
      description: r.description
    }))

  return {
  username: user.login,
  name: user.name,
  avatar: user.avatar_url,
  bio: user.bio,
  followers: user.followers,
  following: user.following,
  publicRepos: user.public_repos,
  totalStars,
  totalForks,
  recentCommits: bestCommitCount,
  topLanguages,
  topRepos,
  recentActivity,
  profileUrl: user.html_url
}
}
module.exports = { getGitHubStats }