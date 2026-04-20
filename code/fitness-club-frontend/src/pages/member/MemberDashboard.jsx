import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiArrowRight,
  HiCalendar,
  HiAcademicCap,
  HiQrcode,
  HiClock,
  HiUser,
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { memberApi, reservationApi, ptApi } from '../../services/api';
import {
  Eyebrow,
  SectionHeader,
  Button,
  Badge,
  Spinner,
} from '../../components/editorial';

/* ── Mock fallback data (renders if backend is down) ── */
const FALLBACK_CLASSES = [
  { id: 1, name: 'Power HIIT',        time: 'Today, 18:00',    trainer: 'Alex Morgan',  category: 'HIIT',    status: 'CONFIRMED' },
  { id: 2, name: 'Morning Yoga',      time: 'Tomorrow, 08:00', trainer: 'Sarah Chen',   category: 'Yoga',    status: 'CONFIRMED' },
  { id: 3, name: 'Lunchtime Cycling', time: 'Wed, 12:00',       trainer: 'Mike Torres',  category: 'Cycling', status: 'CONFIRMED' },
];

const FALLBACK_PT = [
  { id: 1, focus: 'Upper Body Strength', trainer: 'Alex Morgan',  date: 'Tomorrow · 10:00' },
  { id: 2, focus: 'Boxing Fundamentals', trainer: 'Priya Singh',  date: 'Friday · 17:00' },
];

const FALLBACK_STATS = [
  { value: '12',  label: 'Classes this month' },
  { value: '04',  label: 'Upcoming PT' },
  { value: '47',  label: 'Lifetime check-ins' },
  { value: '18',  label: 'Days to renewal' },
];

/* ── Deterministic QR-like visual (not a real QR) ── */
function MockQR({ seed = 1001, size = 144 }) {
  const grid = 9;
  const cells = Array.from({ length: grid * grid }, (_, i) => {
    const x = i % grid;
    const y = Math.floor(i / grid);
    if ((x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5)) return true;
    const v = (seed * 2654435761 * (i + 1)) % 100;
    return v > 45;
  });
  return (
    <div className="inline-block bg-white p-4 border border-ink/10">
      <div
        className="grid gap-px"
        style={{ gridTemplateColumns: `repeat(${grid}, 1fr)`, width: size, height: size }}
      >
        {cells.map((filled, i) => (
          <div key={i} className={filled ? 'bg-coal' : 'bg-white'} />
        ))}
      </div>
    </div>
  );
}

/* ── Normalize reservation DTO from backend to display shape ── */
function normalizeReservation(r) {
  return {
    id: r.id,
    name: r.className || r.facilityName || 'Reservation',
    time: r.slotDate
      ? `${r.slotDate}${r.startTime ? ', ' + String(r.startTime).slice(0, 5) : ''}`
      : r.time || '',
    trainer: r.trainerName || r.trainer || null,
    category: r.bookingType === 'CLASS' ? 'Class' : r.bookingType === 'COURT' ? 'Court' : r.category || 'Booking',
    status: r.status || 'CONFIRMED',
  };
}

/* ── Normalize PT session DTO from backend to display shape ── */
function normalizePT(s) {
  return {
    id: s.id,
    focus: s.notes || s.focus || 'PT Session',
    trainer: s.trainerName || s.trainer || 'Trainer',
    date: s.sessionDate
      ? `${s.sessionDate}${s.startTime ? ' · ' + String(s.startTime).slice(0, 5) : ''}`
      : s.date || '',
    status: s.status || 'SCHEDULED',
  };
}

export default function MemberDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState(null);
  const [classes, setClasses] = useState(FALLBACK_CLASSES);
  const [ptSessions, setPtSessions] = useState(FALLBACK_PT);
  const [stats, setStats] = useState(FALLBACK_STATS);

  useEffect(() => {
    let alive = true;

    async function fetchData() {
      try {
        // Fetch all three in parallel
        const [memberRes, reservRes, ptRes] = await Promise.allSettled([
          memberApi.getMe(),
          reservationApi.getMine(),
          ptApi.getMine(),
        ]);

        if (!alive) return;

        // Process member profile
        if (memberRes.status === 'fulfilled' && memberRes.value?.data) {
          setMember(memberRes.value.data);
        }

        // Process reservations — show upcoming only
        if (reservRes.status === 'fulfilled') {
          const raw = reservRes.value?.data ?? reservRes.value ?? [];
          if (Array.isArray(raw) && raw.length > 0) {
            const today = new Date().toISOString().split('T')[0];
            const upcoming = raw
              .filter((r) => {
                const d = r.slotDate || r.date;
                return d >= today && r.status !== 'CANCELLED';
              })
              .slice(0, 5)
              .map(normalizeReservation);
            if (upcoming.length > 0) setClasses(upcoming);
          }
        }

        // Process PT sessions — show upcoming only
        if (ptRes.status === 'fulfilled') {
          const raw = ptRes.value?.data ?? ptRes.value ?? [];
          if (Array.isArray(raw) && raw.length > 0) {
            const today = new Date().toISOString().split('T')[0];
            const upcoming = raw
              .filter((s) => {
                const d = s.sessionDate || s.date;
                return d >= today && s.status !== 'CANCELLED';
              })
              .slice(0, 5)
              .map(normalizePT);
            if (upcoming.length > 0) setPtSessions(upcoming);
          }
        }

        // Build dynamic stats from real data
        const reservations = reservRes.status === 'fulfilled'
          ? (reservRes.value?.data ?? reservRes.value ?? [])
          : [];
        const pts = ptRes.status === 'fulfilled'
          ? (ptRes.value?.data ?? ptRes.value ?? [])
          : [];
        const memberData = memberRes.status === 'fulfilled'
          ? memberRes.value?.data
          : null;

        const today = new Date().toISOString().split('T')[0];
        const upcomingClassCount = Array.isArray(reservations)
          ? reservations.filter((r) => (r.slotDate || r.date) >= today && r.status !== 'CANCELLED').length
          : 0;
        const upcomingPTCount = Array.isArray(pts)
          ? pts.filter((s) => (s.sessionDate || s.date) >= today && s.status !== 'CANCELLED').length
          : 0;
        const completedCount = Array.isArray(reservations)
          ? reservations.filter((r) => r.status === 'COMPLETED' || r.status === 'CONFIRMED').length
          : 0;
        const daysToRenewal = memberData?.expiryDate
          ? Math.max(0, Math.ceil((new Date(memberData.expiryDate) - new Date()) / 86400000))
          : 18;

        if (upcomingClassCount > 0 || upcomingPTCount > 0 || completedCount > 0) {
          setStats([
            { value: String(upcomingClassCount).padStart(2, '0'), label: 'Upcoming bookings' },
            { value: String(upcomingPTCount).padStart(2, '0'), label: 'Upcoming PT' },
            { value: String(completedCount).padStart(2, '0'), label: 'Total bookings' },
            { value: String(daysToRenewal), label: 'Days to renewal' },
          ]);
        }
      } catch (err) {
        console.warn('MemberDashboard: API fetch failed, using fallbacks', err);
      } finally {
        if (alive) setLoading(false);
      }
    }

    fetchData();
    return () => { alive = false; };
  }, []);

  const firstName = member?.firstName
    || (user?.email || 'member').split('@')[0].replace(/[._-]/g, ' ').trim()
    || 'Member';

  const membershipType = member?.membershipType || 'GOLD';
  const memberId = member?.memberId || user?.userId || '1001';
  const memberStatus = member?.status || 'ACTIVE';
  const expiryDate = member?.expiryDate
    ? new Date(member.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Dec 31, 2025';
  const startDate = member?.startDate
    ? new Date(member.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    : 'Jan 2023';

  if (loading) {
    return (
      <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
        <Spinner text="Loading dashboard" />
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      {/* ═══════════════════════ WELCOME BAND ═══════════════════════ */}
      <section className="mb-16">
        <Eyebrow className="mb-6">Your Dashboard</Eyebrow>
        <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05] mb-6 capitalize">
          Welcome back,<br />
          {firstName}.
        </h1>
        <p className="text-[15px] text-ink-2 font-light leading-[1.7] max-w-xl mb-10">
          You have <span className="text-ink font-semibold">{classes.length} bookings</span> and{' '}
          <span className="text-ink font-semibold">{ptSessions.length} PT sessions</span> coming up.
          Every session compounds.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" to="/member/book-class" icon={HiArrowRight}>
            Book a Class
          </Button>
          <Button variant="outlineDark" to="/member/book-pt">
            Book PT Session
          </Button>
        </div>
      </section>

      {/* ═══════════════════════ STATS STRIP ═══════════════════════ */}
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
        {/* ── LEFT: Upcoming ── */}
        <div>
          {/* Upcoming Classes */}
          <SectionHeader
            eyebrow="This Week"
            title="Upcoming Bookings"
            action={
              <Button variant="link" to="/member/reservations" icon={HiArrowRight}>
                View All
              </Button>
            }
            className="mb-10"
          />
          <div className="space-y-px bg-ink/10 border border-ink/10 mb-16">
            {classes.map((c) => (
              <article
                key={c.id}
                className="bg-white flex items-center gap-6 px-6 py-6 hover:bg-cream transition-colors duration-300"
              >
                <div className="w-12 h-12 border border-ink/10 flex items-center justify-center shrink-0">
                  <HiCalendar className="w-5 h-5 text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <Eyebrow tone="gold">{c.category}</Eyebrow>
                  </div>
                  <h3 className="font-heading text-[1.25rem] font-bold text-ink tracking-[-0.01em] leading-tight">
                    {c.name}
                  </h3>
                  <p className="text-[13px] text-ink-3 mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <HiClock className="w-3.5 h-3.5" />
                      {c.time}
                    </span>
                    {c.trainer && (
                      <>
                        <span className="text-ink/20">·</span>
                        <span className="flex items-center gap-1.5">
                          <HiUser className="w-3.5 h-3.5" />
                          {c.trainer}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <Badge status={c.status} />
              </article>
            ))}
          </div>

          {/* Upcoming PT Sessions */}
          <SectionHeader
            eyebrow="Personal Training"
            title="Upcoming PT Sessions"
            action={
              <Button variant="link" to="/member/pt-sessions" icon={HiArrowRight}>
                View All
              </Button>
            }
            className="mb-10"
          />
          <div className="space-y-px bg-ink/10 border border-ink/10">
            {ptSessions.map((s) => (
              <article
                key={s.id}
                className="bg-white flex items-center gap-6 px-6 py-6 hover:bg-cream transition-colors duration-300"
              >
                <div className="w-12 h-12 border border-ink/10 flex items-center justify-center shrink-0">
                  <HiAcademicCap className="w-5 h-5 text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <Eyebrow tone="gold">PT Session</Eyebrow>
                  <h3 className="font-heading text-[1.25rem] font-bold text-ink tracking-[-0.01em] leading-tight mt-1">
                    {s.focus}
                  </h3>
                  <p className="text-[13px] text-ink-3 mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <HiClock className="w-3.5 h-3.5" />
                      {s.date}
                    </span>
                    <span className="text-ink/20">·</span>
                    <span className="flex items-center gap-1.5">
                      <HiUser className="w-3.5 h-3.5" />
                      {s.trainer}
                    </span>
                  </p>
                </div>
                <Badge status={s.status || 'CONFIRMED'} />
              </article>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Member card + QR ── */}
        <aside>
          {/* Membership card */}
          <div className="bg-coal text-white p-10 rounded-lg overflow-hidden relative mb-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gold/10 rounded-full blur-3xl" />
            <Eyebrow tone="gold" className="mb-4">{membershipType} Member</Eyebrow>
            <h2 className="font-heading text-[1.75rem] font-bold tracking-[-0.01em] leading-tight mb-6 capitalize">
              {member ? `${member.firstName} ${member.lastName}` : firstName}
            </h2>

            <div className="space-y-4 text-[13px] font-light">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-white/40 text-[0.7rem] font-semibold tracking-[0.15em] uppercase">
                  Member ID
                </span>
                <span className="font-mono text-gold">
                  {member?.memberId || `#${memberId}`}
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-white/40 text-[0.7rem] font-semibold tracking-[0.15em] uppercase">
                  Status
                </span>
                <span className="text-sage">{memberStatus}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-white/40 text-[0.7rem] font-semibold tracking-[0.15em] uppercase">
                  Valid Until
                </span>
                <span>{expiryDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-[0.7rem] font-semibold tracking-[0.15em] uppercase">
                  Member Since
                </span>
                <span>{startDate}</span>
              </div>
            </div>

            <Link
              to="/member/profile"
              className="mt-8 inline-flex items-center gap-2 text-[0.75rem] font-semibold tracking-widest uppercase text-gold hover:text-white transition-colors"
            >
              View Profile <HiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* QR entry code */}
          <div className="bg-white p-10 rounded-lg border border-ink/10 text-center">
            <Eyebrow tone="gold" className="mb-5 justify-center flex">Entry Pass</Eyebrow>
            <div className="flex justify-center mb-5">
              <MockQR seed={user?.userId || 1001} />
            </div>
            <div className="flex items-center justify-center gap-2 text-[13px] text-ink-2">
              <HiQrcode className="w-4 h-4 text-gold" />
              <span className="font-mono">{member?.memberId || `#${memberId}`}</span>
            </div>
            <p className="text-[0.7rem] font-semibold tracking-[0.12em] uppercase text-ink-3 mt-3">
              Show at Reception
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
