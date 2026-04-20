/**
 * Editorial form inputs — bottom-border only, generous spacing,
 * uppercase labels with wide tracking. No rounded pills.
 *
 * Use on light (warm off-white) backgrounds.
 */
import { forwardRef } from 'react';

const labelClass =
  'block text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-[#9A9A9A] mb-3';

const baseField =
  'w-full bg-transparent border-0 border-b border-[#1A1A1A]/15 ' +
  'text-[15px] text-[#1A1A1A] placeholder-[#9A9A9A] ' +
  'px-0 py-3 ' +
  'focus:outline-none focus:border-[#C9A96E] ' +
  'transition-colors duration-300';

const errorField = 'border-red-500/60 focus:border-red-500';

/* ── Input ── */
export const Input = forwardRef(function Input(
  { label, error, hint, className = '', ...props },
  ref
) {
  return (
    <div className={className}>
      {label && <label className={labelClass}>{label}</label>}
      <input
        ref={ref}
        className={`${baseField} ${error ? errorField : ''}`}
        {...props}
      />
      {hint && !error && <p className="mt-2 text-[0.75rem] text-[#9A9A9A]">{hint}</p>}
      {error && <p className="mt-2 text-[0.75rem] text-red-500 font-medium">{error}</p>}
    </div>
  );
});

/* ── Select ── */
export const Select = forwardRef(function Select(
  { label, error, children, className = '', ...props },
  ref
) {
  return (
    <div className={className}>
      {label && <label className={labelClass}>{label}</label>}
      <div className="relative">
        <select
          ref={ref}
          className={`${baseField} appearance-none pr-8 ${error ? errorField : ''}`}
          {...props}
        >
          {children}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[#9A9A9A]"
        >
          ▾
        </span>
      </div>
      {error && <p className="mt-2 text-[0.75rem] text-red-500 font-medium">{error}</p>}
    </div>
  );
});

/* ── Textarea ── */
export const Textarea = forwardRef(function Textarea(
  { label, error, rows = 4, className = '', ...props },
  ref
) {
  return (
    <div className={className}>
      {label && <label className={labelClass}>{label}</label>}
      <textarea
        ref={ref}
        rows={rows}
        className={`${baseField} resize-none ${error ? errorField : ''}`}
        {...props}
      />
      {error && <p className="mt-2 text-[0.75rem] text-red-500 font-medium">{error}</p>}
    </div>
  );
});

export default Input;
