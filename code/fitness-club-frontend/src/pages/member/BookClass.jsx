import { useEffect, useMemo, useState } from 'react';
import { HiClock, HiUser, HiCheck, HiArrowRight } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { classApi, reservationApi } from '../../services/api';
import {
  Eyebrow,
  Button,
  Badge,
  Spinner,
  EmptyState,
  Card,
} from '../../components/editorial';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const CATEGORIES = ['All', 'HIIT', 'Yoga', 'Pilates', 'Cycling', 'Strength', 'Boxing', 'Zumba'];

/* No fallback — always use real API data */

function durationMins(start, end) {
  if (!start || !end) return 60;
  const [sh, sm] = String(start).split(':').map(Number);
  const [eh, em] = String(end).split(':').map(Number);
  return Math.max(0, eh * 60 + em - (sh * 60 + sm));
}

function dayFromDate(dateStr) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return DAYS[(d.getDay() + 6) % 7];
  } catch {
    return null;
  }
}

/* ── Capacity bar ── */
function CapacityBar({ booked, capacity }) {
  const pct = Math.min(100, Math.round((booked / (capacity || 1)) * 100));
  const tone = pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-gold' : 'bg-sage';
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[0.65rem] font-semibold tracking-widest uppercase text-ink-3">
          {booked}/{capacity}
        </span>
        <span className="text-[0.65rem] font-semibold tracking-widest uppercase text-ink-3">
          {pct}%
        </span>
      </div>
      <div className="h-1 bg-ink/6 overflow-hidden">
        <div className={`h-full transition-all duration-500 ${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function BookClass() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState('Monday');
  const [activeCategory, setActiveCategory] = useState('All');
  const [booked, setBooked] = useState(new Set());
  const [bookingId, setBookingId] = useState(null);

  useEffect(() => {
    let alive = true;
    classApi
      .getSchedule()
      .then((res) => {
        if (!alive) return;
        const data = res?.data ?? res ?? [];
        if (!Array.isArray(data) || data.length === 0) {
          setClasses([]);
          return;
        }
        setClasses(
          data.map((c) => ({
            id: c.id,
            className: c.className,
            day: c.day || dayFromDate(c.date) || 'Monday',
            startTime: typeof c.startTime === 'string' ? c.startTime.slice(0, 5) : c.startTime,
            endTime: typeof c.endTime === 'string' ? c.endTime.slice(0, 5) : c.endTime,
            capacity: c.capacity,
            confirmedBookings: c.confirmedBookings,
            category: c.category || 'DEFAULT',
            trainer: c.trainer || c.trainerName,
          })),
        );
      })
      .catch(() => alive && setClasses([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return classes
      .filter((c) => c.day === activeDay)
      .filter((c) => activeCategory === 'All' || c.category === activeCategory)
      .sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)));
  }, [classes, activeDay, activeCategory]);

  const handleBook = async (cls) => {
    if (booked.has(cls.id) || bookingId) return;
    setBookingId(cls.id);
    try {
      await reservationApi.bookClass({ classSessionId: cls.id });
      toast.success(`Booked: ${cls.className}`);
    } catch (err) {
      console.error('Failed to book class', err);
      toast.error('Failed to book class.');
      setBookingId(null);
      return;
    }
    setBooked((prev) => new Set([...prev, cls.id]));
    setBookingId(null);
  };

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      {/* ═══════════════════════ HEADER ═══════════════════════ */}
      <Eyebrow className="mb-5">Classes</Eyebrow>
      <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05] mb-4">
        Book a Class
      </h1>
      <p className="text-[15px] text-ink-2 font-light leading-[1.7] max-w-xl mb-14">
        Browse the weekly timetable, filter by day and discipline, and reserve your spot instantly.
      </p>

      {/* ═══════════════════════ DAY TABS ═══════════════════════ */}
      <div className="border-b border-ink/10 mb-10 overflow-x-auto">
        <div className="flex gap-8 min-w-max">
          {DAYS.map((day) => {
            const active = activeDay === day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setActiveDay(day)}
                className={`relative pb-4 text-left transition-colors ${
                  active ? 'text-ink' : 'text-ink-3 hover:text-ink'
                }`}
              >
                <span className="font-heading text-[1.25rem] font-bold tracking-[-0.01em] leading-none">
                  {day}
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

      {/* ═══════════════════════ CATEGORY CHIPS ═══════════════════════ */}
      <div className="flex flex-wrap gap-2 mb-14">
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`text-[0.7rem] font-semibold tracking-[0.12em] uppercase px-4 py-2 border transition-all duration-300 ${
                active
                  ? 'bg-ink text-white border-ink'
                  : 'bg-transparent text-ink-2 border-ink/15 hover:border-ink hover:text-ink'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════ GRID ═══════════════════════ */}
      {loading && <Spinner text="Loading schedule" />}

      {!loading && filtered.length === 0 && (
        <EmptyState
          eyebrow="Nothing Scheduled"
          title={`No ${activeCategory === 'All' ? '' : activeCategory + ' '}classes on ${activeDay}`}
          description="Try a different day or clear your filter."
          action={
            activeCategory !== 'All' ? (
              <Button variant="outlineDark" onClick={() => setActiveCategory('All')}>
                Clear Filter
              </Button>
            ) : null
          }
        />
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-7">
          {filtered.map((cls) => {
            const cap = cls.capacity || 0;
            const bk = cls.confirmedBookings ?? 0;
            const isFull = cap > 0 && bk >= cap;
            const isBooked = booked.has(cls.id);
            const mins = durationMins(cls.startTime, cls.endTime);

            return (
              <Card key={cls.id} hover className="p-7">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <Eyebrow tone="gold">{cls.category || 'Class'}</Eyebrow>
                    <h3 className="font-heading text-[1.35rem] font-bold tracking-[-0.01em] text-ink leading-tight mt-2">
                      {cls.className}
                    </h3>
                  </div>
                  {isBooked && <Badge status="CONFIRMED">Booked</Badge>}
                  {isFull && !isBooked && <Badge status="CANCELLED">Full</Badge>}
                </div>

                <div className="space-y-3 text-[13px] text-ink-2 mb-6">
                  <div className="flex items-center gap-3">
                    <HiClock className="w-4 h-4 text-gold shrink-0" />
                    <span className="font-medium text-ink">{cls.startTime}</span>
                    <span className="text-ink-3">&middot; {mins} min</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <HiUser className="w-4 h-4 text-gold shrink-0" />
                    {cls.trainer || 'FitnessClub Coach'}
                  </div>
                </div>

                <div className="pb-6 border-b border-ink/8 mb-6">
                  <CapacityBar booked={bk} capacity={cap} />
                </div>

                <Button
                  variant={isBooked ? 'gold' : isFull ? 'outlineDark' : 'primary'}
                  size="sm"
                  className="w-full"
                  disabled={isFull || isBooked || bookingId === cls.id}
                  onClick={() => handleBook(cls)}
                  icon={isBooked ? HiCheck : HiArrowRight}
                >
                  {bookingId === cls.id
                    ? 'Booking…'
                    : isBooked
                    ? 'Booked'
                    : isFull
                    ? 'Class Full'
                    : 'Book Now'}
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
