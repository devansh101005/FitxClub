/**
 * Editorial Card — max border-radius 8px, soft atmospheric shadow.
 * Matches the trainer cards on LandingPage.
 *
 * Variants:
 *   - light  : bg white, soft shadow, on #FAFAF9 / #F5F5F0 sections (default)
 *   - dark   : minimal glass on #0A0A0A dark sections
 *   - bare   : no bg, just structure + border (for split layouts)
 */
export default function Card({
  children,
  variant = 'light',
  hover = true,
  onClick,
  className = '',
  as: Tag = 'div',
  ...props
}) {
  const base = 'rounded-lg transition-all duration-300';

  const variants = {
    light:
      'bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)] ' +
      (hover ? 'hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]' : ''),
    dark:
      'bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] ' +
      (hover ? 'hover:bg-white/[0.06] hover:border-white/[0.15] hover:-translate-y-1' : ''),
    bare:
      'border border-[#1A1A1A]/10 ' +
      (hover ? 'hover:border-[#1A1A1A]/20' : ''),
  };

  const cursor = onClick ? 'cursor-pointer' : '';

  return (
    <Tag
      onClick={onClick}
      className={`${base} ${variants[variant]} ${cursor} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
