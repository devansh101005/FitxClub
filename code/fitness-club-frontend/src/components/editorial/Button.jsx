/**
 * Editorial Button — square corners, wide tracking, uppercase.
 * Matches the CTAs used throughout LandingPage.jsx.
 *
 * Variants:
 *   - primary         : bg #111, white text  (default light-section CTA)
 *   - primaryLight    : bg white, black text (dark-section CTA — e.g. hero)
 *   - outlineDark     : transparent w/ dark border (light-section secondary)
 *   - outlineLight    : transparent w/ white border (dark-section secondary)
 *   - pill            : bg #111 rounded-full (navbar "Get Started")
 *   - gold            : bg gold (strong accent CTA — use sparingly)
 *   - link            : underline-on-hover text link w/ optional arrow
 *
 * Sizes:
 *   - sm  : px-6 py-3
 *   - md  : px-10 py-4  (default — hero CTA size)
 *   - lg  : px-14 py-5
 */
import { Link } from 'react-router-dom';

const base =
  'inline-flex items-center justify-center gap-2 font-semibold ' +
  'text-[0.8rem] tracking-[0.15em] uppercase ' +
  'transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed';

const variants = {
  primary:
    'bg-[#111] text-white hover:bg-[#C9A96E] hover:-translate-y-0.5',
  primaryLight:
    'bg-white text-[#0A0A0A] hover:bg-[#C9A96E] hover:text-white hover:-translate-y-0.5',
  outlineDark:
    'border border-[#1A1A1A]/30 text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A]',
  outlineLight:
    'border border-white/40 text-white hover:bg-white/10 hover:border-white/80',
  pill:
    'bg-[#111] text-white rounded-full hover:bg-[#333] !tracking-normal !normal-case font-medium',
  gold:
    'bg-[#C9A96E] text-white hover:bg-[#B8943F] hover:-translate-y-0.5',
  link:
    'text-[#6B6B6B] hover:text-[#1A1A1A] !tracking-[0.08em] ' +
    'relative pb-1 after:absolute after:bottom-0 after:left-0 after:h-px ' +
    'after:w-0 after:bg-current after:transition-all after:duration-300 ' +
    'hover:after:w-full',
};

const sizes = {
  sm: 'px-6 py-3',
  md: 'px-10 py-4',
  lg: 'px-14 py-5',
  pillSize: 'px-5 py-2 text-[0.8rem]',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  className = '',
  icon: Icon,
  iconPosition = 'right',
  ...props
}) {
  const sizeClass = variant === 'pill' ? sizes.pillSize : variant === 'link' ? '' : sizes[size];
  const classes = `${base} ${variants[variant]} ${sizeClass} ${className}`;

  const content = (
    <>
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    );
  }
  return (
    <button className={classes} {...props}>
      {content}
    </button>
  );
}
