const colors = {
  ACTIVE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  CONFIRMED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  GRANTED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  CAPTURED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  COMPLETED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  PAID: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  EXPIRED: 'bg-red-500/20 text-red-400 border-red-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
  FAILED: 'bg-red-500/20 text-red-400 border-red-500/30',
  DENIED: 'bg-red-500/20 text-red-400 border-red-500/30',
  OVERDUE: 'bg-red-500/20 text-red-400 border-red-500/30',
  WAITLISTED: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  REQUESTED: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  PENDING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  CREATED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  NO_SHOW: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  INACTIVE: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function StatusBadge({ status }) {
  const key = Object.keys(colors).find((k) => status?.toUpperCase().includes(k));
  const color = colors[key] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {status}
    </span>
  );
}
