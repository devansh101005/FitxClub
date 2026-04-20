/**
 * UtilityBar — 32px tall gray strip above the navbar.
 * Holds top-of-viewport utility links ("Find a Club", "Help", "Join Us").
 * Desktop-only; hidden on mobile.
 *
 * Extracted verbatim from LandingPage.jsx.
 */
export default function UtilityBar({
  items = ['Find a Club', 'Help', 'Join Us'],
  className = '',
}) {
  return (
    <div
      className={`w-full h-8 bg-[#F5F5F5] border-b border-[#E5E5E5] hidden md:flex items-center justify-end px-10 ${className}`}
    >
      {items.map((item, i) => {
        const label = typeof item === 'string' ? item : item.label;
        const href = typeof item === 'string' ? '#' : item.href || '#';
        return (
          <a
            key={label}
            href={href}
            className={`text-[0.7rem] font-medium text-[#111] hover:text-[#757575] transition-colors duration-200 px-3 ${
              i > 0 ? 'border-l border-[#A0A0A0]' : ''
            }`}
          >
            {label}
          </a>
        );
      })}
    </div>
  );
}
