export default function GlassCard({ children, className = '', hover = true, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10
        ${hover ? 'transition-all duration-300 hover:bg-white/[0.08] hover:border-white/15 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
