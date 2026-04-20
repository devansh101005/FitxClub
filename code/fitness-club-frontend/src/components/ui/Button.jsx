const variants = {
  primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40',
  secondary: 'bg-white/10 hover:bg-white/15 text-white border border-white/10 hover:border-white/20',
  accent: 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/25',
  danger: 'bg-red-500/80 hover:bg-red-500 text-white shadow-lg shadow-red-500/25',
  ghost: 'bg-transparent hover:bg-white/5 text-gray-400 hover:text-white',
  success: 'bg-emerald-500/80 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/25',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-8 py-3.5 text-base rounded-xl',
};

export default function Button({ children, variant = 'primary', size = 'md', className = '', disabled, ...props }) {
  return (
    <button
      className={`
        font-medium transition-all duration-200 inline-flex items-center justify-center gap-2
        active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
