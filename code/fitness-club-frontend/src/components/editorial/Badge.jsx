/**
 * Editorial Badge — subtle status chip.
 * Uses muted tints (no neon glows). Small uppercase text.
 *
 *   <Badge status="CONFIRMED" />
 *   <Badge tone="gold">New</Badge>
 */

const statusMap = {
  ACTIVE:     { bg: 'bg-[#8B9D83]/10',  text: 'text-[#5F7358]',  border: 'border-[#8B9D83]/30' },
  CONFIRMED:  { bg: 'bg-[#8B9D83]/10',  text: 'text-[#5F7358]',  border: 'border-[#8B9D83]/30' },
  GRANTED:    { bg: 'bg-[#8B9D83]/10',  text: 'text-[#5F7358]',  border: 'border-[#8B9D83]/30' },
  COMPLETED:  { bg: 'bg-[#8B9D83]/10',  text: 'text-[#5F7358]',  border: 'border-[#8B9D83]/30' },
  CAPTURED:   { bg: 'bg-[#8B9D83]/10',  text: 'text-[#5F7358]',  border: 'border-[#8B9D83]/30' },
  PAID:       { bg: 'bg-[#8B9D83]/10',  text: 'text-[#5F7358]',  border: 'border-[#8B9D83]/30' },

  PENDING:    { bg: 'bg-[#C9A96E]/10',  text: 'text-[#8B7339]',  border: 'border-[#C9A96E]/40' },
  REQUESTED:  { bg: 'bg-[#C9A96E]/10',  text: 'text-[#8B7339]',  border: 'border-[#C9A96E]/40' },
  WAITLISTED: { bg: 'bg-[#C9A96E]/10',  text: 'text-[#8B7339]',  border: 'border-[#C9A96E]/40' },
  CREATED:    { bg: 'bg-[#C9A96E]/10',  text: 'text-[#8B7339]',  border: 'border-[#C9A96E]/40' },

  CANCELLED:  { bg: 'bg-[#1A1A1A]/5',   text: 'text-[#9A9A9A]',  border: 'border-[#1A1A1A]/15' },
  EXPIRED:    { bg: 'bg-[#1A1A1A]/5',   text: 'text-[#9A9A9A]',  border: 'border-[#1A1A1A]/15' },
  FAILED:     { bg: 'bg-red-500/10',    text: 'text-red-600',    border: 'border-red-500/30' },
  DENIED:     { bg: 'bg-red-500/10',    text: 'text-red-600',    border: 'border-red-500/30' },
  OVERDUE:    { bg: 'bg-red-500/10',    text: 'text-red-600',    border: 'border-red-500/30' },
  NO_SHOW:    { bg: 'bg-[#1A1A1A]/5',   text: 'text-[#9A9A9A]',  border: 'border-[#1A1A1A]/15' },
  INACTIVE:   { bg: 'bg-[#1A1A1A]/5',   text: 'text-[#9A9A9A]',  border: 'border-[#1A1A1A]/15' },
};

const toneMap = {
  gold:    { bg: 'bg-[#C9A96E]/10', text: 'text-[#8B7339]', border: 'border-[#C9A96E]/40' },
  ink:     { bg: 'bg-[#1A1A1A]/5',  text: 'text-[#1A1A1A]', border: 'border-[#1A1A1A]/15' },
  cream:   { bg: 'bg-[#E8DDD3]',    text: 'text-[#8B7339]', border: 'border-[#C9A96E]/30' },
  outline: { bg: 'bg-transparent',  text: 'text-[#6B6B6B]', border: 'border-[#1A1A1A]/20' },
};

export default function Badge({ status, tone, children, className = '' }) {
  let style;
  if (status) {
    const key = Object.keys(statusMap).find((k) => status?.toUpperCase().includes(k));
    style = statusMap[key] || toneMap.outline;
  } else {
    style = toneMap[tone || 'outline'];
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-[0.65rem] font-semibold tracking-[0.12em] uppercase border ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      {children || status}
    </span>
  );
}
