export default function PlatformCard({ icon, iconBg, name, badge, badgeStyle, stats }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: iconBg }}>
          {icon}
        </div>
        <span className="text-sm font-semibold text-gray-900">{name}</span>
        <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full" style={badgeStyle}>
          {badge}
        </span>
      </div>
      <div className="space-y-0">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
            <span className="text-xs text-gray-500">{s.label}</span>
            <span className={`text-xs font-semibold font-mono ${s.color || 'text-gray-900'}`}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}