export default function StatCard({ label, value, sub, dotColor }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1.5">{label}</p>
      <p className="text-2xl font-bold text-gray-900 font-mono">{value}</p>
      {sub && (
        <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
          {dotColor && (
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: dotColor }} />
          )}
          {sub}
        </p>
      )}
    </div>
  )
}