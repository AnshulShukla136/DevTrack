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

  // Commit count from events (last 100 public events)
  const commitEvents = events.filter(e => e.type === 'PushEvent')
  const recentCommits = commitEvents.reduce((acc, e) => acc + (e.payload?.commits?.length || 0), 0)

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
    recentCommits,
    topLanguages,
    topRepos,
    recentActivity,
    profileUrl: user.html_url
  }
}

module.exports = { getGitHubStats }