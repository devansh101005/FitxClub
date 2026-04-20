/**
 * Editorial Spinner — thin gold ring, minimal.
 */
export default function Spinner({ text, size = 'md', tone = 'gold', className = '' }) {
  const sizes = {
    sm: 'w-5 h-5 border-[1.5px]',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-2',
  };

  const tones = {
    gold: 'border-[#C9A96E]/20 border-t-[#C9A96E]',
    ink: 'border-[#1A1A1A]/10 border-t-[#1A1A1A]',
    white: 'border-white/20 border-t-white',
  };

  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className={`rounded-full animate-spin ${sizes[size]} ${tones[tone]}`} />
      {text && (
        <p className="mt-5 text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-[#9A9A9A]">
          {text}
        </p>
      )}
    </div>
  );
}
