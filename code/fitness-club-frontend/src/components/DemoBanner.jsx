import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { HiX } from 'react-icons/hi';

const HIDE_ON = ['/login', '/signup'];

export default function DemoBanner() {
  const location = useLocation();
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem('demo-banner-dismissed') === '1';
  });

  if (dismissed) return null;
  if (HIDE_ON.some((path) => location.pathname.startsWith(path))) return null;

  const handleDismiss = () => {
    sessionStorage.setItem('demo-banner-dismissed', '1');
    setDismissed(true);
  };

  return (
    <div className="bg-[#0A0A0A] text-white px-4 sm:px-6 py-2 flex items-center justify-center gap-3 text-[0.7rem] sm:text-[0.75rem] font-medium tracking-[0.05em] relative z-50">
      <span className="text-[#C9A96E] font-semibold tracking-[0.15em] uppercase text-[0.65rem] sm:text-[0.7rem]">
        Demo
      </span>
      <span className="text-white/70">
        This is a portfolio demo. All data resets daily — please don&apos;t enter real personal information.
      </span>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss banner"
        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
      >
        <HiX className="w-4 h-4" />
      </button>
    </div>
  );
}
