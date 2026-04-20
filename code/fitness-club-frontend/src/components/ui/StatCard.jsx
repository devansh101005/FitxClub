import GlassCard from './GlassCard';

export default function StatCard({ icon: Icon, label, value, sub, color = 'text-indigo-400' }) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl bg-white/5 ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </GlassCard>
  );
}
