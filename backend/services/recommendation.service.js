const { getLeetCodeTagStats } = require('./leetcode.service')
const { getCodeforcesStats } = require('./codeforces.service')

const topicConfig = {
  'dynamic programming': {
     thresholds: { weak: 150, intermediate: 350, advanced: 600 },
    aliases: ['Dynamic Drogramming', 'dp'],
    problems: [
      { title: 'Climbing Stairs', slug: 'climbing-stairs', difficulty: 'Easy', platform: 'leetcode' },
      { title: 'House Robber', slug: 'house-robber', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Maximum Subarray', slug: 'maximum-subarray', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Unique Paths', slug: 'unique-paths', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Coin Change', slug: 'coin-change', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Longest Increasing Subsequence', slug: 'longest-increasing-subsequence', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Edit Distance', slug: 'edit-distance', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Burst Balloons', slug: 'burst-balloons', difficulty: 'Hard', platform: 'leetcode' },
    ]
  },
  'graphs': {
     thresholds: { weak: 150, intermediate: 350, advanced: 600 },
    aliases: [
      'Graph Theory', 'graph', 'Depth-First Search', 'breadth first search',
      'dfs', 'bfs', 'shortest path', 'topological sort', 'union find',
      'depth-first search', 'breadth-first search', 'dfs and similar'
    ],
    problems: [
      { title: 'Number of Islands', slug: 'number-of-islands', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Clone Graph', slug: 'clone-graph', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Course Schedule', slug: 'course-schedule', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Pacific Atlantic Water Flow', slug: 'pacific-atlantic-water-flow', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Network Delay Time', slug: 'network-delay-time', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Word Ladder', slug: 'word-ladder', difficulty: 'Hard', platform: 'leetcode' },
      { title: 'Alien Dictionary', slug: 'alien-dictionary', difficulty: 'Hard', platform: 'leetcode' },
    ]
  },
  'trees': {
     thresholds: { weak: 100, intermediate: 250, advanced: 400 },
    aliases: [
      'trees', 'tree', 'binary tree', 'binary search tree',
      'trie', 'segment tree', 'divide and conquer'
    ],
    problems: [
      { title: 'Maximum Depth of Binary Tree', slug: 'maximum-depth-of-binary-tree', difficulty: 'Easy', platform: 'leetcode' },
      { title: 'Invert Binary Tree', slug: 'invert-binary-tree', difficulty: 'Easy', platform: 'leetcode' },
      { title: 'Binary Tree Level Order Traversal', slug: 'binary-tree-level-order-traversal', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Validate Binary Search Tree', slug: 'validate-binary-search-tree', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Lowest Common Ancestor', slug: 'lowest-common-ancestor-of-a-binary-tree', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Binary Tree Maximum Path Sum', slug: 'binary-tree-maximum-path-sum', difficulty: 'Hard', platform: 'leetcode' },
      { title: 'Serialize and Deserialize Binary Tree', slug: 'serialize-and-deserialize-binary-tree', difficulty: 'Hard', platform: 'leetcode' },
    ]
  },
  'binary search': {
     thresholds: { weak: 60, intermediate: 150, advanced: 280 },
    aliases: [
      'binary search', 'binary-search', 'lower bound', 'upper bound'
    ],
    problems: [
      { title: 'Binary Search', slug: 'binary-search', difficulty: 'Easy', platform: 'leetcode' },
      { title: 'Search in Rotated Sorted Array', slug: 'search-in-rotated-sorted-array', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Find Minimum in Rotated Sorted Array', slug: 'find-minimum-in-rotated-sorted-array', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Koko Eating Bananas', slug: 'koko-eating-bananas', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Median of Two Sorted Arrays', slug: 'median-of-two-sorted-arrays', difficulty: 'Hard', platform: 'leetcode' },
    ]
  },
  'two pointers': {
     thresholds: { weak: 50, intermediate: 120, advanced: 220 },
    aliases: ['two pointers', 'two-pointers'],
    problems: [
      { title: 'Valid Palindrome', slug: 'valid-palindrome', difficulty: 'Easy', platform: 'leetcode' },
      { title: 'Two Sum II', slug: 'two-sum-ii-input-array-is-sorted', difficulty: 'Medium', platform: 'leetcode' },
      { title: '3Sum', slug: '3sum', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Container With Most Water', slug: 'container-with-most-water', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Trapping Rain Water', slug: 'trapping-rain-water', difficulty: 'Hard', platform: 'leetcode' },
    ]
  },
  'sliding window': {
     thresholds: {weak: 30, intermediate: 80, advanced: 150 },
    aliases: ['sliding window', 'sliding-window'],
    problems: [
      { title: 'Best Time to Buy and Sell Stock', slug: 'best-time-to-buy-and-sell-stock', difficulty: 'Easy', platform: 'leetcode' },
      { title: 'Longest Substring Without Repeating Characters', slug: 'longest-substring-without-repeating-characters', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Permutation in String', slug: 'permutation-in-string', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Minimum Window Substring', slug: 'minimum-window-substring', difficulty: 'Hard', platform: 'leetcode' },
      { title: 'Sliding Window Maximum', slug: 'sliding-window-maximum', difficulty: 'Hard', platform: 'leetcode' },
    ]
  },
  'greedy': {
     thresholds: { weak: 80, intermediate: 200, advanced: 380 },
    aliases: ['greedy'],
    problems: [
      { title: 'Jump Game', slug: 'jump-game', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Jump Game II', slug: 'jump-game-ii', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Gas Station', slug: 'gas-station', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Partition Labels', slug: 'partition-labels', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Candy', slug: 'candy', difficulty: 'Hard', platform: 'leetcode' },
    ]
  },
  'stack': {
     thresholds: { weak: 40, intermediate: 100, advanced: 200},
    aliases: ['stack', 'monotonic stack'],
    problems: [
      { title: 'Valid Parentheses', slug: 'valid-parentheses', difficulty: 'Easy', platform: 'leetcode' },
      { title: 'Min Stack', slug: 'min-stack', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Daily Temperatures', slug: 'daily-temperatures', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Car Fleet', slug: 'car-fleet', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Largest Rectangle in Histogram', slug: 'largest-rectangle-in-histogram', difficulty: 'Hard', platform: 'leetcode' },
    ]
  },
  'heap': {
     thresholds: { weak: 40, intermediate: 100, advanced: 200 },
    aliases: [
      'heap', 'priority queue', 'Heap (Priority Queue)'
    ],
    problems: [
      { title: 'Kth Largest Element in Array', slug: 'kth-largest-element-in-an-array', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Top K Frequent Elements', slug: 'top-k-frequent-elements', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'K Closest Points to Origin', slug: 'k-closest-points-to-origin', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Task Scheduler', slug: 'task-scheduler', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Find Median from Data Stream', slug: 'find-median-from-data-stream', difficulty: 'Hard', platform: 'leetcode' },
    ]
  },
  'backtracking': {
     thresholds: { weak: 40, intermediate: 100, advanced: 200 },
    aliases: ['backtracking'],
    problems: [
      { title: 'Subsets', slug: 'subsets', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Permutations', slug: 'permutations', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Combination Sum', slug: 'combination-sum', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Word Search', slug: 'word-search', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'N-Queens', slug: 'n-queens', difficulty: 'Hard', platform: 'leetcode' },
    ]
  },
  'math': {
     thresholds: { weak: 80, intermediate: 200, advanced: 350 },
    aliases: ['math', 'number theory', 'combinatorics', 'geometry'],
    problems: [
      { title: 'Happy Number', slug: 'happy-number', difficulty: 'Easy', platform: 'leetcode' },
      { title: 'Pow(x, n)', slug: 'powx-n', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Count Primes', slug: 'count-primes', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Reverse Integer', slug: 'reverse-integer', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Excel Sheet Column Number', slug: 'excel-sheet-column-number', difficulty: 'Easy', platform: 'leetcode' },
    ]
  },
  'bit manipulation': {
     thresholds: { weak: 25, intermediate: 60, advanced: 120 },
    aliases: [
      'bitmasks', 'bit manipulation', 'bitwise', 'bitmask'
    ],
    problems: [
      { title: 'Single Number', slug: 'single-number', difficulty: 'Easy', platform: 'leetcode' },
      { title: 'Number of 1 Bits', slug: 'number-of-1-bits', difficulty: 'Easy', platform: 'leetcode' },
      { title: 'Counting Bits', slug: 'counting-bits', difficulty: 'Easy', platform: 'leetcode' },
      { title: 'Reverse Bits', slug: 'reverse-bits', difficulty: 'Easy', platform: 'leetcode' },
      { title: 'Sum of Two Integers', slug: 'sum-of-two-integers', difficulty: 'Medium', platform: 'leetcode' },
    ]
  },
  'strings': {
     thresholds: { weak: 80, intermediate: 200, advanced: 350 },
    aliases: [
      'strings', 'string', 'string matching',
      'string hashing', 'rolling hash'
    ],
    problems: [
      { title: 'Valid Anagram', slug: 'valid-anagram', difficulty: 'Easy', platform: 'leetcode' },
      { title: 'Group Anagrams', slug: 'group-anagrams', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Longest Palindromic Substring', slug: 'longest-palindromic-substring', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Minimum Window Substring', slug: 'minimum-window-substring', difficulty: 'Hard', platform: 'leetcode' },
      { title: 'Regular Expression Matching', slug: 'regular-expression-matching', difficulty: 'Hard', platform: 'leetcode' },
    ]
  },
  'prefix sum': {
     thresholds: { weak: 20, intermediate: 50, advanced: 100 },
    aliases: ['prefix sum', 'prefix sums'],
    problems: [
      { title: 'Running Sum of 1d Array', slug: 'running-sum-of-1d-array', difficulty: 'Easy', platform: 'leetcode' },
      { title: 'Range Sum Query', slug: 'range-sum-query-immutable', difficulty: 'Easy', platform: 'leetcode' },
      { title: 'Subarray Sum Equals K', slug: 'subarray-sum-equals-k', difficulty: 'Medium', platform: 'leetcode' },
      { title: 'Product of Array Except Self', slug: 'product-of-array-except-self', difficulty: 'Medium', platform: 'leetcode' },
    ]
  },
}

// ------------------ HELPERS ------------------

const normalize = (str) =>
  str.toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/[()]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const matchTag = (tag) => {
  const lower = normalize(tag)
 console.log(`RAW: "${tag}" | NORMALIZED: "${lower}"`)
  const exactMap = {
    // Dynamic Programming
    'dynamic programming': 'dynamic programming',

    // Graphs
    'depth first search': 'graphs',
    'breadth first search': 'graphs',
    'depth-first search': 'graphs',
    'breadth-first search': 'graphs',
    'union find': 'graphs',
    'topological sort': 'graphs',
    'shortest path': 'graphs',
    'graph': 'graphs',

    // Trees
    'tree': 'trees',
    'binary tree': 'trees',
    'binary search tree': 'trees',
    'trie': 'trees',
    'divide and conquer': 'trees',

    // Binary Search
    'binary search': 'binary search',

    // Two Pointers
    'two pointers': 'two pointers',

    // Sliding Window
    'sliding window': 'sliding window',

    // Greedy
    'greedy': 'greedy',

    // Stack
    'stack': 'stack',
    'monotonic stack': 'stack',

    // Heap — all variations after normalize() removes parentheses
    'heap priority queue': 'heap',
    'heap': 'heap',
    'priority queue': 'heap',

    // Backtracking
    'backtracking': 'backtracking',

    // Math
    'math': 'math',
    'number theory': 'math',
    'combinatorics': 'math',
    'geometry': 'math',

    // Bit Manipulation
    'bit manipulation': 'bit manipulation',
    'bitmask': 'bit manipulation',
    'bitmasks': 'bit manipulation',

    // Strings
    'string': 'strings',
    'string matching': 'strings',
    'string hashing': 'strings',
    'rolling hash': 'strings',

    // Prefix Sum
    'prefix sum': 'prefix sum',

    // Explicitly null — don't map these
    'array': null,
    'hash table': null,
    'sorting': null,
    'simulation': null,
    'counting': null,
    'recursion': null,
    'memoization': null,
    'linked list': null,
    'matrix': null,
    'queue': null,
    'design': null,
    'iterator': null,
    'ordered set': null,
    'enumeration': null,
    'randomized': null,
  }

  // Check normalized version against exactMap
  if (exactMap[lower] !== undefined) {
    if (exactMap[lower]) console.log(`MATCHED: "${tag}" → "${exactMap[lower]}"`)
    else console.log(`SKIPPED: "${tag}"`)
    return exactMap[lower]
  }

  // Alias fallback
  for (const [topic, config] of Object.entries(topicConfig)) {
    if (config.aliases.some(alias => lower.includes(normalize(alias)))) {
      console.log(`ALIAS MATCH: "${tag}" → "${topic}"`)
      return topic
    }
  }

  console.log(`NO MATCH: "${tag}"`)
  return null
}

// ------------------ SCORING ------------------

const computeScore = (easy, medium, hard) => {
  return (easy * 1) + (medium * 3) + (hard * 5)
}

const getLevel = (score, totalSolved, thresholds) => {
  if (totalSolved === 0) return 'Not started'
  if (score < thresholds.weak) return 'Weak'
  if (score < thresholds.intermediate) return 'Intermediate'
  if (score < thresholds.advanced) return 'Advanced'
  return 'Master'
}
const getRecommendedDifficulty = (score, thresholds) => {
  return ['Easy', 'Medium', 'Hard']
}

const getReason = (score, total, thresholds) => {
  if (total === 0) return 'No problems solved in this topic yet'
  if (score < thresholds.weak) return 'Weak fundamentals — start with Easy and Medium problems'
  if (score < thresholds.intermediate) return 'Making progress — focus on Medium problems'
  if (score < thresholds.advanced) return 'Strong — push Hard problems to reach Master'
  return 'Excellent mastery of this topic!'
}

// ------------------ MAIN FUNCTION ------------------

const getRecommendations = async (leetcodeUsername, codeforcesHandle) => {
  const topicData = {}

  Object.keys(topicConfig).forEach(t => {
    topicData[t] = { easy: 0, medium: 0, hard: 0, total: 0 }
  })

  // -------- LeetCode --------
  if (leetcodeUsername) {
    try {
      const tagStats = await getLeetCodeTagStats(leetcodeUsername)
      Object.entries(tagStats).forEach(([tag, stats]) => {
        const topic = matchTag(tag)
        if (!topic) return
        topicData[topic].easy += stats.easy
        topicData[topic].medium += stats.medium
        topicData[topic].hard += stats.hard
        topicData[topic].total += stats.total
        console.log(`LC TAG: "${tag}" → "${topic}" (${stats.total} solved)`)
      })
    } catch (e) {
      console.log('LC error:', e.message)
    }
  }

  // -------- Codeforces --------
  if (codeforcesHandle) {
    try {
      const cf = await getCodeforcesStats(codeforcesHandle)
      cf.topTags?.forEach(t => {
        const topic = matchTag(t.tag)
        if (!topic) return
        topicData[topic].total += t.count
        console.log(`CF TAG: "${t.tag}" → "${topic}" (${t.count} solved)`)
      })
    } catch (e) {
      console.log('CF error:', e.message)
    }
  }

  // -------- Final results --------
const results = Object.entries(topicConfig).map(([topic, config]) => {
  const d = topicData[topic]
  const score = computeScore(d.easy, d.medium, d.hard)
  const thresholds = config.thresholds
  const level = getLevel(score, d.total, thresholds)
  const recommendedDifficulty = getRecommendedDifficulty(score, thresholds)

  const filteredProblems = config.problems.filter(p =>
    recommendedDifficulty.includes(p.difficulty)
  )

  return {
    topic,
    score,
    level,
    easy: d.easy,
    medium: d.medium,
    hard: d.hard,
    totalSolved: d.total,
    thresholds,
    recommendedDifficulty,
    reason: getReason(score, d.total, thresholds),
    problems: filteredProblems.length > 0 ? filteredProblems : config.problems
  }
})

  results.sort((a, b) => a.score - b.score)

  console.log('FINAL TOPIC DATA:', JSON.stringify(topicData, null, 2))

  return {
    topics: results,
    summary: {
  notstarted: results.filter(r => r.level === 'Not started').length,
  weak: results.filter(r => r.level === 'Weak').length,
  intermediate: results.filter(r => r.level === 'Intermediate').length,
  advanced: results.filter(r => r.level === 'Advanced').length,
  master: results.filter(r => r.level === 'Master').length,
}
  }
}

module.exports = { getRecommendations, topicConfig }
