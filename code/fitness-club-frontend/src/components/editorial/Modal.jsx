/**
 * Editorial Modal — warm off-white panel with subtle shadow,
 * square corners (rounded-lg max), uppercase header.
 * Backdrop is soft cream wash, not solid black.
 */
import { useEffect } from 'react';
import { HiX } from 'react-icons/hi';
import Eyebrow from './Eyebrow';

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

export default function Modal({
  isOpen,
  onClose,
  eyebrow,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const onEsc = (e) => e.key === 'Escape' && onClose?.();
      window.addEventListener('keydown', onEsc);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', onEsc);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      {/* Backdrop — soft warm wash */}
      <div className="absolute inset-0 bg-[#0A0A0A]/40 backdrop-blur-[6px]" />

      {/* Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${sizes[size]} bg-[#FAFAF9] rounded-lg shadow-[0_32px_80px_rgba(0,0,0,0.25)] animate-fade-in-up`}
      >
        {/* Header */}
        {(title || eyebrow) && (
          <div className="flex items-start justify-between gap-6 px-8 pt-8 pb-6 border-b border-[#1A1A1A]/[0.08]">
            <div className="flex-1">
              {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
              {title && (
                <h3 className="font-heading text-[1.75rem] font-bold tracking-[-0.01em] text-[#1A1A1A] leading-[1.15]">
                  {title}
                </h3>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex-shrink-0 -mt-2 -mr-2 p-2 text-[#9A9A9A] hover:text-[#1A1A1A] transition-colors"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-8 py-8 text-[15px] text-[#6B6B6B] leading-[1.7]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-8 py-6 border-t border-[#1A1A1A]/[0.08] flex items-center justify-end gap-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
