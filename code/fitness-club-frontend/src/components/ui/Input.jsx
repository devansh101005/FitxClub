export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>}
      <input
        className={`
          w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
          transition-all duration-200
          ${error ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>}
      <select
        className={`
          w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white
          focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
          transition-all duration-200 appearance-none
          ${error ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'}
        `}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>}
      <textarea
        className={`
          w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
          transition-all duration-200 resize-none
          ${error ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
