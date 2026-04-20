import { useEffect, useState } from 'react';
import {
  HiAcademicCap,
  HiCalendar,
  HiClock,
  HiUser,
  HiCheckCircle,
  HiArrowRight,
} from 'react-icons/hi';
import { trainerApi, ptApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Eyebrow,
  Button,
  Badge,
  Spinner,
  EmptyState,
} from '../../components/editorial';

/* ── Fallback data ── */
const FALLBACK = [
  { id: 1, member: 'Arjun Lal', initials: 'AL', focus: 'Athletic Performance', date: '2025-12-03', time: '14:00', duration: 60, status: 'SCHEDULED', notes: 'Agility drills + sprint intervals' },
  { id: 2, member: 'Rahul Sharma', initials: 'RS', focus: 'Weight Loss Circuit', date: '2025-12-04', time: '10:00', duration: 60, status: 'CONFIRMED', notes: 'HIIT + strength superset' },
  { id: 3, member: 'Aisha Patel', initials: 'AP', focus: 'Muscle Building', date: '2025-12-05', time: '16:00', duration: 60, status: 'SCHEDULED', notes: 'Push day — chest, shoulders, triceps' },
  { id: 4, member: 'Dev Kumar', initials: 'DK', focus: 'Strength Training', date: '2025-12-06', time: '08:00', duration: 75, status: 'CONFIRMED', notes: 'Squat technique review + deadlifts' },
  { id: 5, member: 'Arjun Lal', initials: 'AL', focus: 'Speed & Agility', date: '2025-11-28', time: '14:00', duration: 60, status: 'COMPLETED', notes: 'Session completed. Great progress.' },
  { id: 6, member: 'Rahul Sharma', initials: 'RS', focus: 'Fat Burn HIIT', date: '2025-11-21', time: '10:00', duration: 60, status: 'COMPLETED', notes: 'Lost 0.8kg this week. Excellent!' },
  { id: 7, member: 'Meera Joshi', initials: 'MJ', focus: 'Beginners Strength', date: '2025-11-15', time: '11:00', duration: 45, status: 'COMPLETED', notes: '' },
];

function getInitials(name) {
  return String(name || 'Member')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function minutesBetween(start, end) {
  if (!start || !end) return 60;
  const [sh, sm] = String(start).slice(0, 5).split(':').map(Number);
  const [eh, em] = String(end).slice(0, 5).split(':').map(Number);
  return Math.max(0, eh * 60 + em - (sh * 60 + sm)) || 60;
}

function normalizeSession(item) {
  const date = item?.date || item?.sessionDate || '';
  const time = item?.time || item?.startTime || '';
  const endTime = item?.endTime || '';
  return {
    ...item,
    member: item?.member || item?.memberName || 'Member',
    date: typeof date === 'string' ? date : String(date),
    time: typeof time === 'string' ? time.slice(0, 5) : String(time || ''),
    endTime: typeof endTime === 'string' ? endTime.slice(0, 5) : endTime,
    duration: item?.duration || minutesBetween(time, endTime),
    focus: item?.focus || item?.notes || 'Personal Training',
    status: String(item?.status || 'SCHEDULED').toUpperCase(),
  };
}

export default function TrainerPTSessions() {
  const [tab, setTab] = useState('upcoming');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    trainerApi
      .getPTSessions()
      .then((res) => {
        if (!alive) return;
        const data = res?.data ?? res ?? [];
        setSessions(Array.isArray(data) && data.length > 0 ? data.map(normalizeSession) : FALLBACK);
      })
      .catch(() => alive && setSessions(FALLBACK))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const upcoming = sessions.filter(
    (s) => s.date >= today && s.status !== 'CANCELLED' && s.status !== 'COMPLETED',
  );
  const completed = sessions.filter(
    (s) => s.date < today || s.status === 'COMPLETED',
  );
  const displayed = tab === 'upcoming' ? upcoming : completed;

  const markComplete = async (id) => {
    try {
      await ptApi.updateStatus(id, 'COMPLETED');
    } catch {
      // mock
    }
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'COMPLETED' } : s)),
    );
    toast.success('Session marked as completed');
  };

  const stats = [
    { value: upcoming.length, label: 'Upcoming' },
    { value: sessions.filter((s) => s.status === 'COMPLETED').length, label: 'Completed' },
    { value: new Set(sessions.map((s) => s.member)).size, label: 'Unique Clients' },
    {
      value: `${Math.round(sessions.filter((s) => s.status === 'COMPLETED').reduce((a, s) => a + (s.duration || 60), 0) / 60)}h`,
      label: 'Hours Trained',
    },
  ];

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      {/* ═══════════════════════ HEADER ═══════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
        <div>
          <Eyebrow className="mb-5">Personal Training</Eyebrow>
          <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05]">
            PT Sessions
          </h1>
          <p className="text-[15px] text-ink-2 font-light leading-[1.7] mt-4 max-w-lg">
            Track all your personal training sessions with members.
          </p>
        </div>
        <Button variant="primary" size="sm" to="/trainer/pt-requests" icon={HiArrowRight}>
          View Requests
        </Button>
      </div>

      {loading && <Spinner text="Loading sessions" />}

      {!loading && (
        <>
          {/* ═══════════════════════ STATS ═══════════════════════ */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-10 border-y border-ink/10 py-12 mb-16">
            {stats.map((s) => (
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

          {/* ═══════════════════════ TABS ═══════════════════════ */}
          <div className="border-b border-ink/10 mb-12">
            <div className="flex gap-8">
              {[
                ['upcoming', upcoming.length],
                ['completed', completed.length],
              ].map(([t, count]) => {
                const active = tab === t;
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
              title={`No ${tab} PT sessions.`}
              description="Sessions will appear here once scheduled."
              action={
                <Button variant="outlineDark" to="/trainer/pt-requests" icon={HiArrowRight}>
                  View Requests
                </Button>
              }
            />
          ) : (
            <div className="space-y-px bg-ink/10 border border-ink/10">
              {displayed.map((s) => {
                const initials = s.initials || getInitials(s.member);
                return (
                  <article
                    key={s.id}
                    className="bg-white flex flex-col sm:flex-row sm:items-center gap-5 px-7 py-6"
                  >
                    <div className="w-11 h-11 bg-coal text-gold font-heading text-[0.8rem] font-bold flex items-center justify-center shrink-0">
                      {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-1">
                        <h3 className="font-heading text-[1.15rem] font-bold text-ink tracking-[-0.01em]">
                          {s.focus}
                        </h3>
                        <Badge status={s.status} />
                      </div>
                      <p className="text-[13px] text-ink-3 flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <HiUser className="w-3.5 h-3.5" />
                          {s.member}
                        </span>
                        <span className="text-ink/20">·</span>
                        <span className="flex items-center gap-1.5">
                          <HiCalendar className="w-3.5 h-3.5" />
                          {s.date} at {s.time}{s.endTime ? ` - ${s.endTime}` : ''}
                        </span>
                        <span className="text-ink/20">·</span>
                        <span className="flex items-center gap-1.5">
                          <HiClock className="w-3.5 h-3.5" />
                          {s.duration || 60} min
                        </span>
                      </p>
                      {s.notes && (
                        <p className="text-[12px] text-ink-3 mt-2 italic">
                          {s.notes}
                        </p>
                      )}
                    </div>

                    {(s.status === 'SCHEDULED' || s.status === 'CONFIRMED') && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="shrink-0"
                        onClick={() => markComplete(s.id)}
                        icon={HiCheckCircle}
                        iconPosition="left"
                      >
                        Mark Done
                      </Button>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
