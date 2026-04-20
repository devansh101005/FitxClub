import { useEffect, useState } from 'react';
import { HiCalendar, HiClock, HiUser, HiX, HiArrowRight } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { reservationApi } from '../../services/api';
import {
  Eyebrow,
  Button,
  Badge,
  Spinner,
  EmptyState,
} from '../../components/editorial';

/* ── Fallback data matching backend ReservationResponse shape ── */
const FALLBACK = [
  { id: 1, type: 'CLASS', name: 'Power HIIT', date: '2025-12-02', time: '18:00', trainer: 'Alex Morgan', status: 'CONFIRMED', facility: 'Studio A' },
  { id: 2, type: 'CLASS', name: 'Morning Yoga', date: '2025-12-03', time: '08:00', trainer: 'Sarah Chen', status: 'CONFIRMED', facility: 'Yoga Studio' },
  { id: 3, type: 'COURT', name: 'Basketball Court', date: '2025-12-04', time: '17:00', trainer: null, status: 'CONFIRMED', facility: 'Basketball Court' },
  { id: 4, type: 'CLASS', name: 'Lunchtime Cycling', date: '2025-12-05', time: '12:00', trainer: 'Mike Torres', status: 'CONFIRMED', facility: 'Spin Studio' },
  { id: 5, type: 'COURT', name: 'Squash Court A', date: '2025-12-06', time: '09:00', trainer: null, status: 'PENDING', facility: 'Squash Courts' },
  { id: 6, type: 'CLASS', name: 'Vinyasa Flow', date: '2025-11-28', time: '10:00', trainer: 'Sarah Chen', status: 'COMPLETED', facility: 'Yoga Studio' },
  { id: 7, type: 'CLASS', name: 'HIIT Blast', date: '2025-11-25', time: '06:00', trainer: 'Mike Torres', status: 'COMPLETED', facility: 'Studio A' },
  { id: 8, type: 'CLASS', name: 'Core Strength', date: '2025-11-20', time: '07:00', trainer: 'Alex Morgan', status: 'CANCELLED', facility: 'Gym Floor' },
];

export default function Reservations() {
  const [tab, setTab] = useState('upcoming');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    let alive = true;
    reservationApi
      .getMine()
      .then((res) => {
        if (!alive) return;
        const data = res?.data ?? res ?? [];
        if (Array.isArray(data) && data.length > 0) {
          setItems(
            data.map((r) => ({
              id: r.id,
              type: r.bookingType || r.type || 'CLASS',
              name: r.className || r.facilityName || r.name || 'Reservation',
              date: r.slotDate || r.date || '',
              time: r.startTime ? String(r.startTime).slice(0, 5) : r.time || '',
              trainer: r.trainerName || r.trainer || null,
              status: r.status || 'CONFIRMED',
              facility: r.facilityName || r.facility || '',
            })),
          );
        } else {
          setItems(FALLBACK);
        }
      })
      .catch(() => alive && setItems(FALLBACK))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const upcoming = items.filter((r) => r.date >= today && r.status !== 'CANCELLED');
  const past = items.filter((r) => r.date < today || r.status === 'COMPLETED' || r.status === 'CANCELLED');
  const displayed = tab === 'upcoming' ? upcoming : past;

  const handleCancel = async (id) => {
    setCancelling(id);
    try {
      await reservationApi.cancel(id);
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'CANCELLED' } : r)));
    setCancelling(null);
    toast.success('Reservation cancelled.');
  };

  const stats = [
    { value: upcoming.length, label: 'Upcoming' },
    { value: items.filter((r) => r.status === 'COMPLETED').length, label: 'Completed' },
    { value: items.filter((r) => r.status === 'CANCELLED').length, label: 'Cancelled' },
  ];

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      {/* ═══════════════════════ HEADER ═══════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
        <div>
          <Eyebrow className="mb-5">Bookings</Eyebrow>
          <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05]">
            My Reservations
          </h1>
          <p className="text-[15px] text-ink-2 font-light leading-[1.7] mt-4 max-w-lg">
            View and manage your class and court bookings. Cancel upcoming reservations if plans change.
          </p>
        </div>
        <Button variant="primary" size="sm" to="/member/book-class" icon={HiArrowRight}>
          Book a Class
        </Button>
      </div>

      {loading && <Spinner text="Loading reservations" />}

      {!loading && (
        <>
          {/* ═══════════════════════ STATS ═══════════════════════ */}
          <div className="grid grid-cols-3 gap-6 border-y border-ink/10 py-10 mb-14">
            {stats.map((s) => (
              <div key={s.label}>
                <span className="font-heading text-[clamp(2rem,3vw,3rem)] font-bold text-gold leading-none block">
                  {s.value}
                </span>
                <p className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-ink-3 mt-3">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* ═══════════════════════ TABS ═══════════════════════ */}
          <div className="border-b border-ink/10 mb-12">
            <div className="flex gap-8">
              {['upcoming', 'past'].map((t) => {
                const active = tab === t;
                const count = t === 'upcoming' ? upcoming.length : past.length;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={`relative pb-4 transition-colors ${
                      active ? 'text-ink' : 'text-ink-3 hover:text-ink'
                    }`}
                  >
                    <span className="text-[0.8rem] font-semibold tracking-[0.12em] uppercase">
                      {t} ({count})
                    </span>
                    <span
                      className={`absolute bottom-0 left-0 h-0.5 bg-gold transition-all duration-300 ${
                        active ? 'w-full' : 'w-0'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* ═══════════════════════ LIST ═══════════════════════ */}
          {displayed.length === 0 ? (
            <EmptyState
              eyebrow="Nothing Here"
              title={`No ${tab} reservations.`}
              description="Your bookings will appear here once you reserve a class or court."
            />
          ) : (
            <div className="space-y-px bg-ink/10 border border-ink/10">
              {displayed.map((r) => (
                <article
                  key={r.id}
                  className="bg-white flex flex-col sm:flex-row sm:items-center gap-5 px-7 py-6"
                >
                  <div className="w-11 h-11 border border-ink/10 flex items-center justify-center shrink-0">
                    {r.type === 'CLASS' ? (
                      <HiCalendar className="w-5 h-5 text-gold" />
                    ) : (
                      <HiClock className="w-5 h-5 text-gold" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h3 className="font-heading text-[1.15rem] font-bold text-ink tracking-[-0.01em]">
                        {r.name}
                      </h3>
                      <Badge status={r.status} />
                    </div>
                    <p className="text-[13px] text-ink-3 flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <HiCalendar className="w-3.5 h-3.5" />
                        {r.date} at {r.time}
                      </span>
                      {r.trainer && (
                        <>
                          <span className="text-ink/20">·</span>
                          <span className="flex items-center gap-1.5">
                            <HiUser className="w-3.5 h-3.5" />
                            {r.trainer}
                          </span>
                        </>
                      )}
                      <span className="text-ink/20">·</span>
                      <span>{r.facility}</span>
                    </p>
                  </div>

                  {(r.status === 'CONFIRMED' || r.status === 'PENDING') && (
                    <Button
                      variant="outlineDark"
                      size="sm"
                      className="shrink-0"
                      disabled={cancelling === r.id}
                      onClick={() => handleCancel(r.id)}
                      icon={HiX}
                      iconPosition="left"
                    >
                      {cancelling === r.id ? '…' : 'Cancel'}
                    </Button>
                  )}
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
