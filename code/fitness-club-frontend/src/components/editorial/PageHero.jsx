/**
 * PageHero — editorial banner for inner pages (Facilities, Trainers,
 * Classes, etc.) Smaller than the landing page's full-viewport hero
 * but still uses a real Unsplash image + serif headline.
 *
 *   <PageHero
 *     eyebrow="Our Club"
 *     title="World-Class Facilities"
 *     description="Every space designed with intention."
 *     image="https://images.unsplash.com/..."
 *   />
 *
 * Variants:
 *   - image    : full-bleed dimmed photo + overlay text (default)
 *   - minimal  : warm off-white bg, no image — for dashboards
 */
import Eyebrow from './Eyebrow';

export default function PageHero({
  eyebrow,
  title,
  description,
  image,
  variant = 'image',
  height = 'md',        // 'sm' | 'md' | 'lg'
  align = 'left',       // 'left' | 'center'
  children,
  className = '',
}) {
  const heights = {
    sm: 'min-h-[280px] md:min-h-[340px]',
    md: 'min-h-[380px] md:min-h-[460px]',
    lg: 'min-h-[500px] md:min-h-[600px]',
  };

  if (variant === 'minimal') {
    return (
      <section className={`bg-[#FAFAF9] border-b border-[#1A1A1A]/[0.08] py-16 lg:py-20 ${className}`}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className={align === 'center' ? 'text-center max-w-2xl mx-auto' : 'max-w-2xl'}>
            {eyebrow && <Eyebrow className="mb-5">{eyebrow}</Eyebrow>}
            {title && (
              <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-[#1A1A1A] leading-[1.1]">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-5 text-[1.1rem] font-light text-[#6B6B6B] leading-[1.7] max-w-xl">
                {description}
              </p>
            )}
            {children && <div className="mt-8">{children}</div>}
          </div>
        </div>
      </section>
    );
  }

  const alignClass = align === 'center' ? 'text-center items-center mx-auto' : 'text-left';

  return (
    <section className={`relative w-full overflow-hidden bg-[#0A0A0A] ${heights[height]} flex items-end ${className}`}>
      {/* Background image */}
      {image && (
        <>
          <img
            src={image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover brightness-[0.55]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/85 via-[#0A0A0A]/40 to-transparent" />
        </>
      )}

      {/* Content */}
      <div className="relative w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-12 lg:pb-16">
        <div className={`flex flex-col max-w-2xl ${alignClass}`}>
          {eyebrow && <Eyebrow className="mb-5">{eyebrow}</Eyebrow>}
          {title && (
            <h1 className="font-heading text-[clamp(2.5rem,5vw,4.5rem)] font-bold tracking-[-0.02em] text-white leading-[1.05]">
              {title}
            </h1>
          )}
          {description && (
            <p className="mt-5 text-[1.1rem] font-light text-white/70 leading-[1.7] max-w-lg">
              {description}
            </p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  );
}
