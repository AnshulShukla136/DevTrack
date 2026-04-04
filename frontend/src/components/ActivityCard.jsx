const defaultActivity = [
  { platform: 'leetcode', text: 'Solved Longest Substring on LeetCode', time: '2 hours ago' },
  { platform: 'github', text: 'Pushed 3 commits to algo-practice', time: '5 hours ago' },
  { platform: 'codeforces', text: 'Participated in Codeforces Rd. 921', time: 'Yesterday' },
  { platform: 'leetcode', text: 'Solved Binary Tree Paths on LeetCode', time: '2 days ago' },
  { platform: 'leetcode', text: 'Rating increased to 1847 on LeetCode', time: '3 days ago' },
]

const dotColors = {
  leetcode: '#f89f1b',
  github: '#24292e',
  codeforces: '#4285f4',
}

export default function ActivityCard({ data = defaultActivity }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-sm font-semibold text-gray-900 mb-4">Recent activity</p>
      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div
              className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
              style={{ background: dotColors[item.platform] || '#9ca3af' }}
            />
            <div>
              <p className="text-xs text-gray-700 leading-snug">{item.text}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}