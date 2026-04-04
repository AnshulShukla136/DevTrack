const topics = [
  { name: 'Dynamic prog.', pct: 28, color: '#ef4444', badge: 'Weak', badgeBg: '#fef2f2', badgeColor: '#b91c1c' },
  { name: 'Graphs', pct: 35, color: '#f97316', badge: 'Weak', badgeBg: '#fff7ed', badgeColor: '#c2410c' },
  { name: 'Segment tree', pct: 20, color: '#ef4444', badge: 'Weak', badgeBg: '#fef2f2', badgeColor: '#b91c1c' },
  { name: 'Bit manip.', pct: 42, color: '#f89f1b', badge: 'Fair', badgeBg: '#fffbeb', badgeColor: '#b45309' },
  { name: 'Arrays', pct: 78, color: '#22c55e', badge: 'Good', badgeBg: '#f0fdf4', badgeColor: '#15803d' },
  { name: 'Two pointers', pct: 65, color: '#22c55e', badge: 'Good', badgeBg: '#f0fdf4', badgeColor: '#15803d' },
]

export default function WeaknessCard({ data = topics }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-sm font-semibold text-gray-900 mb-4">Topic weakness analysis</p>
      <div className="space-y-2.5">
        {data.map((t, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span className="text-xs text-gray-600 w-24 flex-shrink-0">{t.name}</span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${t.pct}%`, background: t.color }} />
            </div>
            <span className="text-[11px] font-mono text-gray-400 w-8 text-right">{t.pct}%</span>
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ background: t.badgeBg, color: t.badgeColor }}
            >
              {t.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}