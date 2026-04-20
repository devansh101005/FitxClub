/**
 * Editorial section header — eyebrow + Playfair headline + optional
 * description + optional right-side action (e.g. "View All →").
 *
 * Matches every section on LandingPage (Features, Trainers, CTA, etc.)
 *
 *   <SectionHeader
 *     eyebrow="Expert Trainers"
 *     title={<>World-class<br/>instruction.</>}
 *     description="Our team of certified professionals..."
 *     action={<Button variant="link" to="/trainers" icon={HiArrowRight}>View All</Button>}
 *   />
 */
import Eyebrow from './Eyebrow';

export default function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = 'left',      // 'left' | 'center'
  tone = 'light',      // 'light' (dark text on warm bg) | 'dark' (white text on coal bg)
  size = 'md',         // 'md' (section) | 'lg' (major section) | 'hero' (page hero)
  className = '',
}) {
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left';
  const descWidth = align === 'center' ? 'max-w-xl mx-auto' : 'max-w-lg';

  const titleSize = {
    md: 'text-[clamp(2rem,3.5vw,3.2rem)]',
    lg: 'text-[clamp(2.5rem,4.5vw,4rem)]',
    hero: 'text-[clamp(2.5rem,5vw,5rem)]',
  }[size];

  const titleColor = tone === 'dark' ? 'text-white' : 'text-[#1A1A1A]';
  const descColor = tone === 'dark' ? 'text-white/40' : 'text-[#6B6B6B]';
  const eyebrowTone = tone === 'dark' ? 'gold' : 'gold';

  return (
    <div className={`flex ${action ? 'flex-col md:flex-row md:items-end md:justify-between' : 'flex-col'} gap-6 ${className}`}>
      <div className={`flex flex-col ${alignClass}`}>
        {eyebrow && <Eyebrow tone={eyebrowTone} className="mb-5">{eyebrow}</Eyebrow>}
        {title && (
          <h2
            className={`font-heading font-bold tracking-[-0.02em] leading-[1.1] ${titleSize} ${titleColor}`}
          >
            {title}
          </h2>
        )}
        {description && (
          <p
            className={`mt-5 text-[15px] leading-[1.7] font-light ${descColor} ${descWidth}`}
          >
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0 md:pb-3">
          {action}
        </div>
      )}
    </div>
  );
}
