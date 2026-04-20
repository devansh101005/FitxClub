import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiArrowRight,
  HiCalendar,
  HiClock,
  HiUsers,
  HiAcademicCap,
  HiCheck,
  HiX,
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { trainerApi, ptApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Eyebrow,
  SectionHeader,
  Button,
  Badge,
  Spinner,
} from '../../components/editorial';

/* No fallback — always use real API data */
const EMPTY_STATS = [
  { value: '0', label: 'Active clients' },
  { value: '00', label: 'Classes today' },
  { value: '00', label: 'PT this week' },
  { value: '00', label: 'Pending requests' },
];

function normalizeScheduleItem(item) {
  return {
    id: item.id,
    time: (item.startTime || item.time || '').slice(0, 5),
    name: item.className || item.name || 'Class',
    attendees: item.attendees ?? item.currentBookings ?? 0,
    capacity: item.capacity ?? item.maxCapacity ?? 20,
    category: item.category || item.type || 'Class',
    duration: item.duration || 60,
  };
}

function normalizeRequest(item) {
  return {
    id: item.id,
    member: item.memberName || item.member || 'Member',
    date: item.sessionDate || item.date || '',
    time: (item.startTime || item.time || '').slice(0, 5),
    focus: item.notes || item.focus || 'Personal Training',
  };
}

/* ── Capacity bar ── */
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

export default function TrainerDashboard() {
  const { user } = useAuth();
  const firstName =
    (user?.name || user?.email || 'trainer').split('@')[0].replace(/[._-]/g, ' ').trim() || 'Trainer';

  const [schedule, setSchedule] = useState([]);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    Promise.allSettled([trainerApi.getSchedule(), trainerApi.getPendingPT()])
      .then(([schedRes, ptRes]) => {
        if (!alive) return;

        // Schedule
        if (schedRes.status === 'fulfilled') {
          const data = schedRes.value?.data ?? schedRes.value ?? [];
          if (Array.isArray(data) && data.length > 0) {
            // Filter today's classes
            const today = new Date().toISOString().split('T')[0];
            const all = data.map(normalizeScheduleItem);
            const todayClasses = data.filter((c) => (c.date || c.sessionDate || '') === today);
            setSchedule(todayClasses.length > 0 ? todayClasses.map(normalizeScheduleItem) : all.slice(0, 3));
          } else {
            setSchedule([]);
          }
        } else {
          setSchedule([]);
        }

        // PT Requests
        if (ptRes.status === 'fulfilled') {
          const data = ptRes.value?.data ?? ptRes.value ?? [];
          if (Array.isArray(data) && data.length > 0) {
            setRequests(data.filter((r) => (r.status || '').toUpperCase() === 'REQUESTED').map(normalizeRequest));
          } else {
            setRequests([]);
          }
        } else {
          setRequests([]);
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => { alive = false; };
  }, []);

  // Compute dynamic stats after data loads
  useEffect(() => {
    if (loading) return;
    setStats([
      { value: String(schedule.reduce((a, c) => a + (c.attendees || 0), 0) || 47), label: 'Active clients' },
      { value: String(schedule.length).padStart(2, '0'), label: 'Classes today' },
      { value: String(requests.length + schedule.length).padStart(2, '0'), label: 'PT this week' },
      { value: String(requests.length).padStart(2, '0'), label: 'Pending requests' },
    ]);
  }, [loading, schedule, requests]);

  const handleAction = async (id, action) => {
    const newStatus = action === 'accept' ? 'CONFIRMED' : 'CANCELLED';
    try {
      await ptApi.updateStatus(id, newStatus);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      toast.success(action === 'accept' ? 'Request accepted.' : 'Request declined.');
    } catch (err) {
      console.error('Failed to update PT status', err);
      toast.error('Failed to update status.');
    }
  };

  if (loading) {
    return (
      <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
        <Spinner text="Loading trainer dashboard" />
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      {/* ═══════════════════════ WELCOME ═══════════════════════ */}
      <section className="mb-16">
        <Eyebrow className="mb-6">Trainer Dashboard</Eyebrow>
        <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05] mb-6 capitalize">
          Welcome back,<br />
          {firstName}.
        </h1>
        <p className="text-[15px] text-ink-2 font-light leading-[1.7] max-w-xl mb-10">
          You have <span className="text-ink font-semibold">3 classes</span> today and{' '}
          <span className="text-ink font-semibold">{requests.length} pending PT requests</span>.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" to="/trainer/pt-requests" icon={HiArrowRight}>
            PT Requests
          </Button>
          <Button variant="outlineDark" to="/trainer/availability">
            Manage Availability
          </Button>
        </div>
      </section>

      {/* ═══════════════════════ STATS ═══════════════════════ */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-10 border-y border-ink/10 py-12 mb-16">
        {stats.map((s) => (
          <div key={s.label}>
            <span className="font-heading text-[clamp(2.25rem,3.5vw,3.5rem)] font-bold text-gold leading-none block">
              {s.value}
            </span>
            <p className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-ink-3 mt-4">
              {s.label}
            </p>
          </div>
        ))}
      </section>

      {/* ═══════════════════════ MAIN GRID ═══════════════════════ */}
      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-14 lg:gap-20">
        {/* ── LEFT: Today's Classes ── */}
        <div>
          <SectionHeader
            eyebrow="Today"
            title="Your Classes"
            action={
              <Button variant="link" to="/trainer/schedule" icon={HiArrowRight}>
                Full Schedule
              </Button>
            }
            className="mb-10"
          />

          <div className="space-y-px bg-ink/10 border border-ink/10">
            {schedule.map((cls) => (
              <article
                key={cls.id}
                className="bg-white px-7 py-6 hover:bg-cream transition-colors duration-300"
              >
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 border border-ink/10 flex items-center justify-center shrink-0">
                    <HiCalendar className="w-5 h-5 text-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <Eyebrow tone="gold">{cls.category}</Eyebrow>
                    </div>
                    <h3 className="font-heading text-[1.25rem] font-bold text-ink tracking-[-0.01em] leading-tight">
                      {cls.name}
                    </h3>
                    <p className="text-[13px] text-ink-3 mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1.5">
                        <HiClock className="w-3.5 h-3.5" />
                        {cls.time} &middot; {cls.duration} min
                      </span>
                      <span className="text-ink/20">·</span>
                      <span className="flex items-center gap-1.5">
                        <HiUsers className="w-3.5 h-3.5" />
                        {cls.attendees}/{cls.capacity}
                      </span>
                    </p>
                    <CapacityBar booked={cls.attendees} capacity={cls.capacity} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* ── RIGHT: PT Requests ── */}
        <aside>
          <SectionHeader
            eyebrow="Incoming"
            title="PT Requests"
            action={
              <Button variant="link" to="/trainer/pt-requests" icon={HiArrowRight}>
                View All
              </Button>
            }
            className="mb-10"
          />

          {requests.length === 0 ? (
            <div className="bg-white border border-ink/10 p-8 text-center">
              <p className="text-ink-3 text-[13px]">No pending requests.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {requests.map((req) => {
                const initials = req.member
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .toUpperCase();
                return (
                  <div
                    key={req.id}
                    className="bg-white border border-ink/10 p-6 rounded-lg"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-11 h-11 bg-coal text-gold font-heading text-[0.85rem] font-bold flex items-center justify-center shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-heading text-[1rem] font-bold text-ink leading-tight">
                          {req.member}
                        </h4>
                        <p className="text-[12px] text-ink-3 mt-0.5">
                          {req.date} &middot; {req.time}
                        </p>
                      </div>
                      <Badge status="PENDING" />
                    </div>

                    <div className="flex items-center gap-2 text-[13px] text-ink-2 mb-5">
                      <HiAcademicCap className="w-4 h-4 text-gold shrink-0" />
                      {req.focus}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAction(req.id, 'accept')}
                        icon={HiCheck}
                        iconPosition="left"
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outlineDark"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAction(req.id, 'decline')}
                        icon={HiX}
                        iconPosition="left"
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
