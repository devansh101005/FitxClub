/**
 * Eyebrow caption — the small gold uppercase label that sits above
 * every section headline on LandingPage.
 *
 *   <Eyebrow>What We Offer</Eyebrow>
 *
 * Tone: gold by default; muted variant for dark sections where gold
 * would fight with other gold content.
 */
export default function Eyebrow({ children, tone = 'gold', className = '' }) {
  const tones = {
    gold: 'text-[#C9A96E]',
    white: 'text-white/70',
    muted: 'text-[#9A9A9A]',
    ink: 'text-[#1A1A1A]',
  };

  return (
    <span
      className={`inline-block text-[0.7rem] font-semibold tracking-[0.2em] uppercase ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
