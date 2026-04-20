/**
 * StatNumber — big Playfair gold number + uppercase caption.
 * Matches the stats band on LandingPage (2,400+ members, 48 trainers, etc.)
 *
 *   <StatNumber value="2,400+" label="Active Members" />
 *
 * Tones:
 *   - goldOnDark  : gold number, white/35 label (default, for #0A0A0A sections)
 *   - inkOnLight  : black number, muted label (for light sections)
 *   - goldOnLight : gold number, muted label (editorial accent on warm bg)
 */
export default function StatNumber({
  value,
  label,
  tone = 'goldOnDark',
  size = 'md',      // 'sm' | 'md' | 'lg'
  align = 'center', // 'left' | 'center'
  sub,
  className = '',
}) {
  const tones = {
    goldOnDark: { num: 'text-[#C9A96E]', lab: 'text-white/35' },
    inkOnLight: { num: 'text-[#1A1A1A]', lab: 'text-[#9A9A9A]' },
    goldOnLight: { num: 'text-[#C9A96E]', lab: 'text-[#9A9A9A]' },
  }[tone];

  const sizes = {
    sm: 'text-[clamp(1.8rem,3vw,2.5rem)]',
    md: 'text-[clamp(2.5rem,4vw,4rem)]',
    lg: 'text-[clamp(3rem,5vw,5rem)]',
  };

  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <div className={`flex flex-col ${alignClass} ${className}`}>
      <span
        className={`font-heading font-bold leading-none block ${sizes[size]} ${tones.num}`}
      >
        {value}
      </span>
      {label && (
        <p className={`text-[0.7rem] font-semibold tracking-[0.15em] uppercase mt-3 ${tones.lab}`}>
          {label}
        </p>
      )}
      {sub && <p className="text-[13px] text-[#6B6B6B] mt-2">{sub}</p>}
    </div>
  );
}
