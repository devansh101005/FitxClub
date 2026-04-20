import { useEffect, useState } from 'react';
import {
  HiCalendar,
  HiClock,
  HiUsers,
  HiChevronDown,
  HiChevronUp,
  HiCheck,
} from 'react-icons/hi';
import { trainerApi } from '../../services/api';
import {
  Eyebrow,
  Badge,
  Spinner,
  EmptyState,
} from '../../components/editorial';

/* ── Fallback data ── */
const FALLBACK = [
  {
    id: 1, date: '2025-12-02', day: 'Monday', time: '07:00', name: 'Core Strength',
    type: 'Strength', duration: 50, capacity: 18,
    attendees: [
      { name: 'Rahul S.', initials: 'RS', checked: true },
      { name: 'Aisha P.', initials: 'AP', checked: true },
      { name: 'Dev K.', initials: 'DK', checked: false },
      { name: 'Priya M.', initials: 'PM', checked: true },
      { name: 'Arjun L.', initials: 'AL', checked: false },
    ],
  },
  {
    id: 2, date: '2025-12-02', day: 'Monday', time: '12:00', name: 'Power HIIT',
    type: 'HIIT', duration: 60, capacity: 20,
    attendees: [
      { name: 'Meera J.', initials: 'MJ', checked: true },
      { name: 'Vikram B.', initials: 'VB', checked: true },
      { name: 'Anjali R.', initials: 'AR', checked: true },
    ],
  },
  {
    id: 3, date: '2025-12-03', day: 'Tuesday', time: '18:00', name: 'Evening Boxing',
    type: 'Boxing', duration: 60, capacity: 16,
    attendees: [
      { name: 'Rohan T.', initials: 'RT', checked: false },
      { name: 'Sneha G.', initials: 'SG', checked: false },
      { name: 'Kiran M.', initials: 'KM', checked: false },
      { name: 'Tanya B.', initials: 'TB', checked: false },
    ],
  },
  {
    id: 4, date: '2025-12-04', day: 'Wednesday', time: '07:00', name: 'Core Strength',
    type: 'Strength', duration: 50, capacity: 18,
    attendees: [
      { name: 'Rahul S.', initials: 'RS', checked: false },
      { name: 'Aisha P.', initials: 'AP', checked: false },
    ],
  },
  {
    id: 5, date: '2025-12-06', day: 'Friday', time: '06:00', name: 'HIIT Blast',
    type: 'HIIT', duration: 60, capacity: 20,
    attendees: [
      { name: 'Vikram B.', initials: 'VB', checked: false },
      { name: 'Anjali R.', initials: 'AR', checked: false },
    ],
  },
];

/* ── Capacity bar (reused from dashboard) ── */
function CapacityBar({ booked, capacity }) {
  const pct = Math.min(100, Math.round((booked / (capacity || 1)) * 100));
  const tone = pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-gold' : 'bg-sage';
  return (
    <div className="mt-3">
      <div className="flex items-baseline justify-between mb-1.5">
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

function toDayName(dateStr) {
  if (!dateStr) return 'Scheduled';
  const parsed = new Date(dateStr);
  return Number.isNaN(parsed.getTime())
    ? 'Scheduled'
    : parsed.toLocaleDateString('en-US', { weekday: 'long' });
}

function minutesBetween(start, end) {
  if (!start || !end) return 60;
  const [sh, sm] = String(start).slice(0, 5).split(':').map(Number);
  const [eh, em] = String(end).slice(0, 5).split(':').map(Number);
  return Math.max(0, eh * 60 + em - (sh * 60 + sm)) || 60;
}

function normalizeClass(item) {
  const date = item?.date || '';
  const startTime = item?.time || item?.startTime || '';
  const endTime = item?.endTime || '';
  return {
    ...item,
    date: typeof date === 'string' ? date : String(date),
    day: item?.day || toDayName(date),
    time: typeof startTime === 'string' ? startTime.slice(0, 5) : String(startTime || ''),
    endTime: typeof endTime === 'string' ? endTime.slice(0, 5) : endTime,
    name: item?.name || item?.className || 'Class Session',
    type: item?.type || item?.category || 'Class',
    duration: item?.duration || minutesBetween(startTime, endTime),
    attendees: Array.isArray(item?.attendees) ? item.attendees : [],
  };
}

export default function TrainerSchedule() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    let alive = true;
    trainerApi
      .getSchedule()
      .then((res) => {
        if (!alive) return;
        const data = res?.data ?? res ?? [];
        setSchedule(Array.isArray(data) && data.length > 0 ? data.map(normalizeClass) : FALLBACK);
      })
      .catch(() => alive && setSchedule(FALLBACK))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const today = new Date().toISOString().split('T')[0];

  /* Group by date */
  const grouped = schedule.reduce((acc, cls) => {
    const key = cls.date;
    if (!acc[key]) acc[key] = { day: cls.day, date: cls.date, classes: [] };
    acc[key].classes.push(cls);
    return acc;
  }, {});

  const totalAttendees = schedule.reduce((a, c) => a + (c.attendees?.length || 0), 0);
  const totalHours = Math.round(schedule.reduce((a, c) => a + (c.duration || 60), 0) / 60);

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      {/* ═══════════════════════ HEADER ═══════════════════════ */}
      <Eyebrow className="mb-5">Schedule</Eyebrow>
      <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05] mb-4">
        My Schedule
      </h1>
      <p className="text-[15px] text-ink-2 font-light leading-[1.7] max-w-xl mb-14">
        View your upcoming classes and attendee lists.
      </p>

      {loading && <Spinner text="Loading schedule" />}

      {!loading && (
        <>
          {/* ═══════════════════════ STATS ═══════════════════════ */}
          <section className="grid grid-cols-3 gap-10 border-y border-ink/10 py-12 mb-16">
            {[
              { value: schedule.length, label: 'Classes This Week' },
              { value: totalAttendees, label: 'Total Attendees' },
              { value: `${totalHours}h`, label: 'Teaching Hours' },
            ].map((s) => (
              <div key={s.label}>
                <span className="font-heading text-[clamp(2rem,3vw,3rem)] font-bold text-gold leading-none block">
                  {s.value}
                </span>
                <p className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-ink-3 mt-4">
                  {s.label}
                </p>
              </div>
            ))}
          </section>

          {/* ═══════════════════════ SCHEDULE ═══════════════════════ */}
          {Object.keys(grouped).length === 0 ? (
            <EmptyState
              eyebrow="No Classes"
              title="No classes scheduled."
              description="Check back later or contact the front desk."
            />
          ) : (
            <div className="space-y-12">
              {Object.values(grouped).map((group) => (
                <div key={group.date}>
                  {/* Day header */}
                  <div className="flex items-center gap-4 mb-5">
                    <h2 className="font-heading text-[1.25rem] font-bold text-ink">
                      {group.day}
                    </h2>
                    <span className="text-[12px] text-ink-3">{group.date}</span>
                    {group.date === today && (
                      <Badge status="ACTIVE">Today</Badge>
                    )}
                  </div>

                  {/* Classes */}
                  <div className="space-y-px bg-ink/10 border border-ink/10">
                    {group.classes.map((cls) => {
                      const isExpanded = expanded === cls.id;
                      const attendees = cls.attendees || [];

                      return (
                        <div key={cls.id} className="bg-white">
                          {/* Class row */}
                          <div
                            className="px-7 py-6 flex items-center gap-6 cursor-pointer hover:bg-cream transition-colors duration-300"
                            onClick={() =>
                              setExpanded(isExpanded ? null : cls.id)
                            }
                          >
                            <div className="w-12 h-12 border border-ink/10 flex items-center justify-center shrink-0">
                              <HiCalendar className="w-5 h-5 text-gold" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-heading text-[1.15rem] font-bold text-ink tracking-[-0.01em]">
                                  {cls.name}
                                </h3>
                                <Eyebrow tone="gold">{cls.type}</Eyebrow>
                              </div>
                              <p className="text-[13px] text-ink-3 flex items-center gap-3">
                                <span className="flex items-center gap-1.5">
                                  <HiClock className="w-3.5 h-3.5" />
                                  {cls.time} · {cls.duration} min
                                </span>
                                <span className="text-ink/20">·</span>
                                <span className="flex items-center gap-1.5">
                                  <HiUsers className="w-3.5 h-3.5" />
                                  {attendees.length}/{cls.capacity}
                                </span>
                              </p>
                              <CapacityBar
                                booked={attendees.length}
                                capacity={cls.capacity}
                              />
                            </div>

                            {isExpanded ? (
                              <HiChevronUp className="w-5 h-5 text-ink-3 shrink-0" />
                            ) : (
                              <HiChevronDown className="w-5 h-5 text-ink-3 shrink-0" />
                            )}
                          </div>

                          {/* Expanded attendees */}
                          {isExpanded && (
                            <div className="border-t border-ink/10 px-7 py-6 bg-cream">
                              <Eyebrow tone="muted" className="mb-5">
                                Attendees ({attendees.length})
                              </Eyebrow>
                              {attendees.length === 0 ? (
                                <p className="text-[13px] text-ink-3">
                                  No attendees registered yet.
                                </p>
                              ) : (
                                <div className="grid sm:grid-cols-2 gap-3">
                                  {attendees.map((a, i) => (
                                    <div
                                      key={i}
                                      className="flex items-center gap-3 bg-white px-4 py-3 border border-ink/10"
                                    >
                                      <div className="w-9 h-9 bg-coal text-gold font-heading text-[0.7rem] font-bold flex items-center justify-center shrink-0">
                                        {a.initials || a.avatar || '??'}
                                      </div>
                                      <span className="text-[13px] text-ink flex-1">
                                        {a.name}
                                      </span>
                                      {a.checked && (
                                        <span className="flex items-center gap-1 text-[11px] text-sage font-semibold">
                                          <HiCheck className="w-3 h-3" /> In
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
