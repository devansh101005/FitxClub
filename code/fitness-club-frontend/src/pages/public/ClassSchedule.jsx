import { useEffect, useMemo, useState } from 'react';
import { HiClock, HiUser, HiArrowRight, HiUsers } from 'react-icons/hi';
import { classApi } from '../../services/api';
import {
  PageHero,
  SectionHeader,
  Eyebrow,
  Button,
  Spinner,
  EmptyState,
  Badge,
} from '../../components/editorial';

/* ── Editorial imagery for each class category ── */
const CATEGORY_IMAGERY = {
  HIIT: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&q=80',
  Yoga: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&q=80',
  Pilates: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=900&q=80',
  Cycling: 'https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=900&q=80',
  Strength: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=900&q=80',
  Boxing: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=900&q=80',
  Zumba: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=900&q=80',
  DEFAULT: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=80',
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const CATEGORIES = ['All', 'HIIT', 'Yoga', 'Pilates', 'Cycling', 'Strength', 'Boxing', 'Zumba'];

/* ── Fallback data matches backend shape (ClassSessionResponse + editorial extras) ── */
const FALLBACK_CLASSES = [
  { id: 1, day: 'Monday', startTime: '06:00', endTime: '07:00', className: 'Power HIIT', trainer: 'Rahul Sharma', category: 'HIIT', capacity: 20, confirmedBookings: 18, level: 'Advanced' },
  { id: 2, day: 'Monday', startTime: '08:00', endTime: '09:00', className: 'Morning Yoga', trainer: 'Sarah Chen', category: 'Yoga', capacity: 15, confirmedBookings: 9, level: 'Beginner' },
  { id: 3, day: 'Monday', startTime: '12:00', endTime: '12:45', className: 'Lunchtime Cycling', trainer: 'Prateek Malhotra', category: 'Cycling', capacity: 12, confirmedBookings: 12, level: 'Intermediate' },
  { id: 4, day: 'Monday', startTime: '18:00', endTime: '19:00', className: 'Boxing Fundamentals', trainer: 'Rahul Sharma', category: 'Boxing', capacity: 16, confirmedBookings: 11, level: 'Intermediate' },
  { id: 5, day: 'Tuesday', startTime: '07:00', endTime: '07:50', className: 'Core Strength', trainer: 'Rahul Sharma', category: 'Strength', capacity: 18, confirmedBookings: 14, level: 'Intermediate' },
  { id: 6, day: 'Tuesday', startTime: '09:00', endTime: '10:00', className: 'Pilates Fusion', trainer: 'Sarah Chen', category: 'Pilates', capacity: 12, confirmedBookings: 7, level: 'Beginner' },
  { id: 7, day: 'Tuesday', startTime: '19:00', endTime: '20:00', className: 'CrossFit WOD', trainer: 'Prateek Malhotra', category: 'Strength', capacity: 25, confirmedBookings: 20, level: 'All Levels' },
  { id: 8, day: 'Wednesday', startTime: '06:30', endTime: '07:15', className: 'Sunrise HIIT', trainer: 'Prateek Malhotra', category: 'HIIT', capacity: 20, confirmedBookings: 15, level: 'Advanced' },
  { id: 9, day: 'Wednesday', startTime: '10:00', endTime: '11:00', className: 'Vinyasa Flow', trainer: 'Sarah Chen', category: 'Yoga', capacity: 15, confirmedBookings: 13, level: 'Intermediate' },
  { id: 10, day: 'Wednesday', startTime: '18:30', endTime: '19:30', className: 'Strength Circuit', trainer: 'Rahul Sharma', category: 'Strength', capacity: 18, confirmedBookings: 12, level: 'Intermediate' },
  { id: 11, day: 'Thursday', startTime: '07:00', endTime: '08:00', className: 'Strength & Tone', trainer: 'Rahul Sharma', category: 'Strength', capacity: 18, confirmedBookings: 10, level: 'All Levels' },
  { id: 12, day: 'Thursday', startTime: '12:00', endTime: '12:45', className: 'Express Pilates', trainer: 'Sarah Chen', category: 'Pilates', capacity: 12, confirmedBookings: 6, level: 'Beginner' },
  { id: 13, day: 'Thursday', startTime: '17:30', endTime: '18:30', className: 'Kickboxing Drills', trainer: 'Rahul Sharma', category: 'Boxing', capacity: 16, confirmedBookings: 14, level: 'Intermediate' },
  { id: 14, day: 'Friday', startTime: '06:00', endTime: '07:00', className: 'HIIT Blast', trainer: 'Prateek Malhotra', category: 'HIIT', capacity: 20, confirmedBookings: 19, level: 'Advanced' },
  { id: 15, day: 'Friday', startTime: '09:00', endTime: '10:00', className: 'Pilates Core Sculpt', trainer: 'Sarah Chen', category: 'Pilates', capacity: 12, confirmedBookings: 8, level: 'Beginner' },
  { id: 16, day: 'Friday', startTime: '18:00', endTime: '19:00', className: 'Spin Endurance', trainer: 'Prateek Malhotra', category: 'Cycling', capacity: 12, confirmedBookings: 10, level: 'Advanced' },
  { id: 17, day: 'Saturday', startTime: '08:00', endTime: '09:30', className: 'Weekend Warriors', trainer: 'Rahul Sharma', category: 'HIIT', capacity: 24, confirmedBookings: 22, level: 'All Levels' },
  { id: 18, day: 'Saturday', startTime: '10:30', endTime: '11:30', className: 'Guided Meditation', trainer: 'Sarah Chen', category: 'Yoga', capacity: 25, confirmedBookings: 18, level: 'All Levels' },
  { id: 19, day: 'Saturday', startTime: '16:00', endTime: '17:00', className: 'CrossFit Blast', trainer: 'Prateek Malhotra', category: 'Strength', capacity: 16, confirmedBookings: 9, level: 'Beginner' },
  { id: 20, day: 'Sunday', startTime: '09:00', endTime: '10:15', className: 'Restorative Yoga', trainer: 'Sarah Chen', category: 'Yoga', capacity: 15, confirmedBookings: 11, level: 'Beginner' },
  { id: 21, day: 'Sunday', startTime: '11:00', endTime: '12:00', className: 'Sunday Strength', trainer: 'Rahul Sharma', category: 'Strength', capacity: 18, confirmedBookings: 8, level: 'Intermediate' },
];

const STATS = [
  { value: '70+', label: 'Classes / Week' },
  { value: '8', label: 'Categories' },
  { value: '12', label: 'Coaches' },
  { value: '05:00', label: 'First Class' },
];

/* ── Duration helper ── */
function durationMins(start, end) {
  if (!start || !end) return 60;
  const [sh, sm] = String(start).split(':').map(Number);
  const [eh, em] = String(end).split(':').map(Number);
  return Math.max(0, eh * 60 + em - (sh * 60 + sm));
}

/* ── Get day name from LocalDate ── */
function dayFromDate(dateStr) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return DAYS[(d.getDay() + 6) % 7]; // Mon=0 in our array
  } catch {
    return null;
  }
}

/* ═══════════════════════ CAPACITY METER ═══════════════════════ */
function CapacityMeter({ booked, capacity }) {
  const safe = capacity || 1;
  const pct = Math.min(100, Math.round((booked / safe) * 100));
  const tone = pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-gold' : 'bg-sage';
  const toneText = pct >= 90 ? 'text-red-600' : pct >= 60 ? 'text-[#8B7339]' : 'text-[#5F7358]';

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[0.7rem] font-semibold tracking-widest uppercase text-ink-3">
          Capacity
        </span>
        <span className={`text-[0.7rem] font-semibold tracking-widest uppercase ${toneText}`}>
          {booked}/{capacity} &middot; {pct}%
        </span>
      </div>
      <div className="h-1 bg-ink/6 overflow-hidden">
        <div className={`h-full transition-all duration-500 ${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ═══════════════════════ CLASS CARD ═══════════════════════ */
function ClassCard({ cls }) {
  const category = cls.category || 'DEFAULT';
  const image = CATEGORY_IMAGERY[category] || CATEGORY_IMAGERY.DEFAULT;
  const booked = cls.confirmedBookings ?? cls.booked ?? 0;
  const capacity = cls.capacity ?? 0;
  const isFull = capacity > 0 && booked >= capacity;
  const mins = durationMins(cls.startTime, cls.endTime);

  return (
    <article
      className={`group bg-white rounded-lg overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 ${
        isFull ? 'opacity-70' : ''
      }`}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-coal">
        <img
          src={image}
          alt={cls.className}
          className="absolute inset-0 w-full h-full object-cover brightness-[0.85] group-hover:scale-[1.03] transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-linear-to-t from-coal/80 via-transparent to-transparent" />

        <div className="absolute top-5 left-5 right-5 flex items-start justify-between">
          <Eyebrow tone="white">{category}</Eyebrow>
          {isFull ? (
            <Badge status="CANCELLED">Full</Badge>
          ) : (
            <Badge status="ACTIVE">{capacity - booked} spots</Badge>
          )}
        </div>

        <div className="absolute bottom-5 left-5 right-5">
          <h3 className="font-heading text-[1.5rem] font-bold text-white tracking-[-0.01em] leading-[1.1]">
            {cls.className}
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="p-7">
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-[13px] text-ink-2">
            <HiClock className="w-4 h-4 text-gold shrink-0" />
            <span className="font-medium text-ink">{cls.startTime}</span>
            <span className="text-ink-3">&middot; {mins} min</span>
          </div>
          <div className="flex items-center gap-3 text-[13px] text-ink-2">
            <HiUser className="w-4 h-4 text-gold shrink-0" />
            {cls.trainer || 'FitnessClub Coach'}
          </div>
          {cls.level && (
            <div className="flex items-center gap-3 text-[13px] text-ink-2">
              <HiUsers className="w-4 h-4 text-gold shrink-0" />
              {cls.level}
            </div>
          )}
        </div>

        <div className="pb-6 border-b border-ink/8">
          <CapacityMeter booked={booked} capacity={capacity} />
        </div>

        {/* CTA */}
        <div className="mt-6">
          <Button
            variant="link"
            to={isFull ? '#' : '/login'}
            icon={HiArrowRight}
          >
            {isFull ? 'Waitlist Only' : 'Reserve Spot'}
          </Button>
        </div>
      </div>
    </article>
  );
}

/* ═══════════════════════ PAGE ═══════════════════════ */
export default function ClassSchedule() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState('Monday');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    let alive = true;
    classApi
      .getSchedule()
      .then((res) => {
        if (!alive) return;
        const data = res?.data ?? res ?? [];
        if (!Array.isArray(data) || data.length === 0) {
          setClasses(FALLBACK_CLASSES);
          return;
        }
        // Normalise backend shape → editorial card shape
        const mapped = data.map((c) => ({
          id: c.id,
          className: c.className,
          day: c.day || dayFromDate(c.date) || 'Monday',
          startTime: typeof c.startTime === 'string' ? c.startTime.slice(0, 5) : c.startTime,
          endTime: typeof c.endTime === 'string' ? c.endTime.slice(0, 5) : c.endTime,
          capacity: c.capacity,
          confirmedBookings: c.confirmedBookings,
          category: c.category || 'DEFAULT',
          trainer: c.trainer || c.trainerName,
          level: c.level,
        }));
        setClasses(mapped);
      })
      .catch((err) => {
        if (!alive) return;
        console.warn('Class schedule API unavailable — using fallback data.', err);
        setClasses(FALLBACK_CLASSES);
      })
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

  const dayCount = useMemo(() => {
    const counts = {};
    DAYS.forEach((d) => {
      counts[d] = classes.filter((c) => c.day === d).length;
    });
    return counts;
  }, [classes]);

  return (
    <>
      <PageHero
        eyebrow="Weekly Timetable"
        title="Class Schedule"
        description="Every week, dozens of classes across eight disciplines. Browse the roster, check live capacity, and book the sessions that fit your life."
        image="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1920&q=80"
        height="md"
      />

      {/* ═══════════════════════ DARK STATS STRIP ═══════════════════════ */}
      <section className="bg-coal py-14 border-t border-white/4">
        <div className="max-w-350 mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-center gap-3 mb-10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gold" />
            </span>
            <span className="text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-gold">
              Live Weekly Schedule
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <span className="font-heading text-[clamp(2rem,3.5vw,3.25rem)] font-bold text-gold leading-none block">
                  {s.value}
                </span>
                <p className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-white/35 mt-3">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ SCHEDULE ═══════════════════════ */}
      <section className="bg-cream py-24 lg:py-32">
        <div className="max-w-350 mx-auto px-6 lg:px-10">
          <SectionHeader
            eyebrow="This Week"
            title={<>Pick your day.<br />Claim your spot.</>}
            description="Filter by day and discipline. Classes are released on a rolling 7-day window — reserve early for popular sessions."
            className="mb-12"
          />

          {/* Day tabs — editorial underline style */}
          <div className="border-b border-ink/10 mb-10 -mx-6 px-6 lg:-mx-10 lg:px-10 overflow-x-auto">
            <div className="flex gap-8 min-w-max">
              {DAYS.map((day) => {
                const active = activeDay === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setActiveDay(day)}
                    className={`relative pb-5 pt-1 text-left transition-colors ${
                      active ? 'text-ink' : 'text-ink-3 hover:text-ink'
                    }`}
                  >
                    <span className="block text-[0.65rem] font-semibold tracking-[0.2em] uppercase text-ink-3 mb-2">
                      {dayCount[day] ?? 0} classes
                    </span>
                    <span className="font-heading text-[1.5rem] font-bold tracking-[-0.01em] leading-none">
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

          {/* Category chips */}
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

          {loading && <Spinner text="Loading schedule" />}

          {!loading && filtered.length === 0 && (
            <EmptyState
              eyebrow="Nothing Scheduled"
              title={`No ${activeCategory === 'All' ? '' : activeCategory + ' '}classes on ${activeDay}`}
              description="Try a different day or clear your category filter to see the full roster."
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
              {filtered.map((cls) => (
                <ClassCard key={cls.id} cls={cls} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════ CTA BANNER ═══════════════════════ */}
      <section className="relative py-24 lg:py-32 bg-coal overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover brightness-[0.25]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-coal/80 via-transparent to-coal/40" />
        <div className="relative text-center max-w-2xl mx-auto px-6">
          <Eyebrow tone="gold" className="mb-6">Group Classes</Eyebrow>
          <h2 className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-white leading-[1.1] mb-5">
            Train together.<br />Go further.
          </h2>
          <p className="text-[15px] text-white/50 font-light leading-[1.7] mb-10 max-w-md mx-auto">
            Unlimited class access is included with every membership. One sign-in away from your first session.
          </p>
          <Button variant="primaryLight" to="/login" icon={HiArrowRight}>
            Sign In to Book
          </Button>
        </div>
      </section>
    </>
  );
}
