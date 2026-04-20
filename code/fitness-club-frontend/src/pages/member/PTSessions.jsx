import { useEffect, useState } from 'react';
import { HiAcademicCap, HiCalendar, HiUser, HiClock, HiX, HiArrowRight } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { ptApi } from '../../services/api';
import {
  Eyebrow,
  Button,
  Badge,
  Spinner,
  EmptyState,
} from '../../components/editorial';

/* ── Fallback data ── */
const FALLBACK = [
  { id: 1, trainer: 'Alex Morgan', specialty: 'HIIT & Strength', date: '2025-12-03', time: '10:00', focus: 'Upper Body Strength', status: 'SCHEDULED', duration: 60, notes: 'Bring gym shoes and water bottle' },
  { id: 2, trainer: 'Priya Singh', specialty: 'Boxing & Kickboxing', date: '2025-12-06', time: '17:00', focus: 'Boxing Fundamentals', status: 'SCHEDULED', duration: 60, notes: 'Wraps will be provided' },
  { id: 3, trainer: 'Sarah Chen', specialty: 'Yoga & Pilates', date: '2025-12-10', time: '09:00', focus: 'Core & Flexibility', status: 'CONFIRMED', duration: 60, notes: 'Wear comfortable clothes' },
  { id: 4, trainer: 'Alex Morgan', specialty: 'HIIT & Strength', date: '2025-11-28', time: '10:00', focus: 'Leg Day Power', status: 'COMPLETED', duration: 60 },
  { id: 5, trainer: 'Sarah Chen', specialty: 'Yoga & Pilates', date: '2025-11-21', time: '09:00', focus: 'Mobility & Stretch', status: 'COMPLETED', duration: 45 },
  { id: 6, trainer: 'Priya Singh', specialty: 'Boxing & Kickboxing', date: '2025-11-14', time: '17:00', focus: 'Cardio Boxing', status: 'COMPLETED', duration: 60 },
  { id: 7, trainer: 'Alex Morgan', specialty: 'HIIT & Strength', date: '2025-11-10', time: '10:00', focus: 'Full Body Circuit', status: 'CANCELLED', duration: 60 },
];

export default function PTSessions() {
  const [tab, setTab] = useState('upcoming');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    ptApi
      .getMine()
      .then((res) => {
        if (!alive) return;
        const data = res?.data ?? res ?? [];
        if (Array.isArray(data) && data.length > 0) {
          setSessions(
            data.map((s) => ({
              id: s.id,
              trainer: s.trainerName || s.trainer || 'Trainer',
              specialty: s.specialty || '',
              date: s.sessionDate || s.date || '',
              time: s.startTime ? String(s.startTime).slice(0, 5) : s.time || '',
              focus: s.notes || s.focus || 'PT Session',
              status: s.status || 'SCHEDULED',
              duration: s.startTime && s.endTime
                ? (() => {
                    const [sh, sm] = String(s.startTime).split(':').map(Number);
                    const [eh, em] = String(s.endTime).split(':').map(Number);
                    return Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
                  })()
                : s.duration || 60,
              notes: s.notes,
            })),
          );
        } else {
          setSessions(FALLBACK);
        }
      })
      .catch(() => alive && setSessions(FALLBACK))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const upcoming = sessions.filter((s) => s.date >= today && s.status !== 'CANCELLED');
  const past = sessions.filter((s) => s.date < today || s.status === 'COMPLETED' || s.status === 'CANCELLED');
  const displayed = tab === 'upcoming' ? upcoming : past;

  const handleCancel = async (id) => {
    try {
      await ptApi.updateStatus?.(id, 'CANCELLED');
    } catch {
      // mock
    }
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'CANCELLED' } : s)));
    toast.success('PT session cancelled.');
  };

  const stats = [
    { value: upcoming.length, label: 'Upcoming' },
    { value: sessions.filter((s) => s.status === 'COMPLETED').length, label: 'Completed' },
    {
      value: Math.round(
        sessions.filter((s) => s.status === 'COMPLETED').reduce((a, s) => a + (s.duration || 60), 0) / 60,
      ),
      label: 'Total Hours',
      suffix: 'h',
    },
    { value: new Set(sessions.map((s) => s.trainer)).size, label: 'Trainers' },
  ];

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      {/* ═══════════════════════ HEADER ═══════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
        <div>
          <Eyebrow className="mb-5">Personal Training</Eyebrow>
          <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05]">
            My PT Sessions
          </h1>
          <p className="text-[15px] text-ink-2 font-light leading-[1.7] mt-4 max-w-lg">
            Track your personal training appointments and session history.
          </p>
        </div>
        <Button variant="primary" size="sm" to="/member/book-pt" icon={HiArrowRight}>
          Book New Session
        </Button>
      </div>

      {loading && <Spinner text="Loading sessions" />}

      {!loading && (
        <>
          {/* ═══════════════════════ STATS ═══════════════════════ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 border-y border-ink/10 py-10 mb-14">
            {stats.map((s) => (
              <div key={s.label}>
                <span className="font-heading text-[clamp(2rem,3vw,3rem)] font-bold text-gold leading-none block">
                  {s.value}
                  {s.suffix || ''}
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
              title={`No ${tab} PT sessions.`}
              description="Book a personal training session to get started."
              action={
                <Button variant="outlineDark" to="/member/book-pt" icon={HiArrowRight}>
                  Book PT
                </Button>
              }
            />
          ) : (
            <div className="space-y-px bg-ink/10 border border-ink/10">
              {displayed.map((s) => (
                <article
                  key={s.id}
                  className="bg-white flex flex-col sm:flex-row sm:items-center gap-5 px-7 py-6"
                >
                  <div className="w-11 h-11 border border-ink/10 flex items-center justify-center shrink-0">
                    <HiAcademicCap className="w-5 h-5 text-gold" />
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
                        {s.trainer}
                      </span>
                      <span className="text-ink/20">·</span>
                      <span className="flex items-center gap-1.5">
                        <HiCalendar className="w-3.5 h-3.5" />
                        {s.date} at {s.time}
                      </span>
                      <span className="text-ink/20">·</span>
                      <span className="flex items-center gap-1.5">
                        <HiClock className="w-3.5 h-3.5" />
                        {s.duration || 60} min
                      </span>
                    </p>
                    {s.notes && (
                      <p className="text-[12px] text-ink-3 mt-2 italic">{s.notes}</p>
                    )}
                  </div>

                  {(s.status === 'SCHEDULED' || s.status === 'CONFIRMED') && (
                    <Button
                      variant="outlineDark"
                      size="sm"
                      className="shrink-0"
                      onClick={() => handleCancel(s.id)}
                      icon={HiX}
                      iconPosition="left"
                    >
                      Cancel
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
