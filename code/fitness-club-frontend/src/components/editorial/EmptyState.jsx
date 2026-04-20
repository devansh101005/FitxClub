/**
 * Editorial empty state — generous whitespace, uppercase caption,
 * optional serif headline and action.
 *
 *   <EmptyState
 *     icon={HiCalendar}
 *     eyebrow="No Bookings"
 *     title="Nothing scheduled yet."
 *     description="Book your first class and start your journey."
 *     action={<Button to="/member/book-class">Book a Class</Button>}
 *   />
 */
import Eyebrow from './Eyebrow';

export default function EmptyState({
  icon: Icon,
  eyebrow,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-20 px-6 ${className}`}>
      {Icon && (
        <div className="w-14 h-14 border border-[#1A1A1A]/10 flex items-center justify-center mb-8 rounded-lg">
          <Icon className="w-6 h-6 text-[#C9A96E]" />
        </div>
      )}
      {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
      {title && (
        <h3 className="font-heading text-[1.75rem] font-bold tracking-[-0.01em] text-[#1A1A1A] leading-[1.15] max-w-md">
          {title}
        </h3>
      )}
      {description && (
        <p className="mt-4 text-[15px] text-[#6B6B6B] leading-[1.7] max-w-sm font-light">
          {description}
        </p>
      )}
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}
