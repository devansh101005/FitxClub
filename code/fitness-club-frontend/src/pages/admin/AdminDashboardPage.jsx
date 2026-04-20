import { useEffect, useState } from 'react';
import { HiArrowRight, HiCalendar, HiCurrencyRupee, HiOfficeBuilding, HiUsers } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/api';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge, Button, Card, Eyebrow, SectionHeader, Spinner } from '../../components/editorial';

const FALLBACK_REVENUE = [
  { month: 'Jun', revenue: 124000 },
  { month: 'Jul', revenue: 138000 },
  { month: 'Aug', revenue: 152000 },
  { month: 'Sep', revenue: 145000 },
  { month: 'Oct', revenue: 168000 },
  { month: 'Nov', revenue: 189000 },
];

const FALLBACK_CHECKIN = [
  { day: 'Mon', count: 87 },
  { day: 'Tue', count: 73 },
  { day: 'Wed', count: 91 },
  { day: 'Thu', count: 68 },
  { day: 'Fri', count: 96 },
  { day: 'Sat', count: 112 },
  { day: 'Sun', count: 64 },
];

const FALLBACK_ACTIVITY = [
  { id: 1, action: 'New member registered', user: 'Rohit Verma', time: '2 minutes ago', type: 'ACTIVE' },
  { id: 2, action: 'Morning Yoga created', user: 'Alex Morgan', time: '15 minutes ago', type: 'PENDING' },
  { id: 3, action: 'Membership renewed', user: 'Priya Mehta', time: '31 minutes ago', type: 'COMPLETED' },
  { id: 4, action: 'PT session booked', user: 'Dev Kumar', time: '45 minutes ago', type: 'REQUESTED' },
];

const FALLBACK_STATS = [
  { label: 'Total Members', value: '312' },
  { label: 'Monthly Revenue', value: 'Rs 1.89L' },
  { label: 'Active Classes', value: '24' },
  { label: 'Facility Usage', value: '78%' },
];

const QUICK_LINKS = [
  { to: '/admin/members', title: 'Member Management', text: 'Review plans, account status, and bulk actions.' },
  { to: '/admin/create-class', title: 'Create Class', text: 'Schedule new sessions with trainers and room capacity.' },
  { to: '/admin/facilities', title: 'Facility Management', text: 'Adjust live capacity and open or close spaces.' },
  { to: '/admin/reports', title: 'Reports', text: 'Generate operational and financial exports.' },
];

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#0A0A0A',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#FAFAF9',
    fontSize: '12px',
    fontFamily: 'Plus Jakarta Sans',
  },
};

function formatRevenue(val) {
  if (val >= 100000) return `Rs ${(val / 100000).toFixed(2)}L`;
  if (val >= 1000) return `Rs ${(val / 1000).toFixed(0)}k`;
  return `Rs ${val}`;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const name = user?.name || user?.email?.split('@')[0] || 'Admin';
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(FALLBACK_STATS);
  const [revenueData, setRevenueData] = useState(FALLBACK_REVENUE);
  const [checkinData, setCheckinData] = useState(FALLBACK_CHECKIN);
  const [activity, setActivity] = useState(FALLBACK_ACTIVITY);

  useEffect(() => {
    let alive = true;

    async function fetchData() {
      try {
        const [dashRes, revRes, peakRes] = await Promise.allSettled([
          adminApi.getDashboard(),
          adminApi.getRevenue(),
          adminApi.getPeakHours(),
        ]);

        if (!alive) return;

        // Process DashboardSummary
        if (dashRes.status === 'fulfilled') {
          const d = dashRes.value?.data ?? dashRes.value;
          if (d) {
            const rev = d.revenueThisMonth
              ? formatRevenue(Number(d.revenueThisMonth))
              : FALLBACK_STATS[1].value;
            const facilityPct = d.totalFacilities > 0
              ? `${Math.round((d.openFacilities / d.totalFacilities) * 100)}%`
              : FALLBACK_STATS[3].value;

            setStats([
              { label: 'Total Members', value: String(d.totalMembers ?? 312) },
              { label: 'Monthly Revenue', value: rev },
              { label: 'Bookings Today', value: String(d.totalBookingsToday ?? 24) },
              { label: 'Facilities Open', value: facilityPct },
            ]);
          }
        }

        // Process RevenueStats monthly breakdown
        if (revRes.status === 'fulfilled') {
          const r = revRes.value?.data ?? revRes.value;
          if (r?.monthlyBreakdown && Array.isArray(r.monthlyBreakdown) && r.monthlyBreakdown.length > 0) {
            setRevenueData(
              r.monthlyBreakdown.map((m) => ({
                month: m.month || 'Month',
                revenue: Number(m.amount || 0),
              })),
            );
          }
        }

        // Process peak hours for weekly checkins
        if (peakRes.status === 'fulfilled') {
          const p = peakRes.value?.data ?? peakRes.value;
          if (p?.comparison && Array.isArray(p.comparison) && p.comparison.length > 0) {
            setCheckinData(
              p.comparison.map((item) => ({
                day: item.day || item.label || 'Day',
                count: item.occupancy || item.value || 0,
              })),
            );
          }
        }
      } catch {
        // Fallbacks already set
      } finally {
        if (alive) setLoading(false);
      }
    }

    fetchData();
    return () => { alive = false; };
  }, []);

  if (loading) {
    return (
      <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
        <Spinner text="Loading admin dashboard" />
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      <Eyebrow className="mb-5">Admin Office</Eyebrow>
      <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05] mb-4">
        Welcome Back, {name}.
      </h1>
      <p className="text-[15px] text-ink-2 font-light leading-[1.7] max-w-xl mb-14">
        Today&apos;s overview keeps revenue, attendance, and operations inside the same warm editorial system as the public experience.
      </p>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-10 border-y border-ink/10 py-12 mb-16">
        {stats.map((stat) => (
          <div key={stat.label}>
            <span className="font-heading text-[clamp(2rem,3vw,3rem)] font-bold text-gold leading-none block">
              {stat.value}
            </span>
            <p className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-ink-3 mt-4">
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      <div className="grid lg:grid-cols-2 gap-10 mb-16">
        <Card hover={false} className="p-8">
          <Eyebrow tone="muted" className="mb-3">Revenue</Eyebrow>
          <h3 className="font-heading text-[1.25rem] font-bold text-ink tracking-[-0.01em] mb-8">Monthly Revenue Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,26,0.08)" />
                <XAxis dataKey="month" tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `Rs${Math.round(value / 1000)}k`} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(value) => [`Rs ${Number(value).toLocaleString()}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#C9A96E" strokeWidth={3} dot={{ fill: '#C9A96E', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card hover={false} className="p-8">
          <Eyebrow tone="muted" className="mb-3">Attendance</Eyebrow>
          <h3 className="font-heading text-[1.25rem] font-bold text-ink tracking-[-0.01em] mb-8">Weekly Check-Ins</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={checkinData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,26,0.08)" />
                <XAxis dataKey="day" tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(value) => [value, 'Check-ins']} />
                <Bar dataKey="count" fill="#1A1A1A" radius={[0, 0, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <section className="mb-16">
        <SectionHeader eyebrow="Operations Feed" title="Recent Activity" className="mb-8" />
        <div className="space-y-px bg-ink/10 border border-ink/10">
          {activity.map((item) => (
            <article key={item.id} className="bg-white flex flex-col sm:flex-row sm:items-center gap-5 px-7 py-6">
              <div className="w-11 h-11 border border-ink/10 flex items-center justify-center shrink-0">
                <HiCalendar className="w-5 h-5 text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h3 className="font-heading text-[1.15rem] font-bold text-ink tracking-[-0.01em]">{item.action}</h3>
                  <Badge status={item.type} />
                </div>
                <p className="text-[13px] text-ink-3 flex items-center gap-3 flex-wrap">
                  <span>{item.user}</span>
                  <span>{item.time}</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="Navigation" title="Quick Links" className="mb-8" />
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          {QUICK_LINKS.map((link, index) => {
            const icons = [HiUsers, HiCalendar, HiOfficeBuilding, HiCurrencyRupee];
            const Icon = icons[index];
            return (
              <Card key={link.to} hover className="p-7">
                <div className="w-11 h-11 border border-ink/10 flex items-center justify-center mb-6">
                  <Icon className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-heading text-[1.25rem] font-bold text-ink tracking-[-0.01em] mb-3">{link.title}</h3>
                <p className="text-[14px] text-ink-2 leading-[1.7] mb-6">{link.text}</p>
                <Button variant="link" to={link.to} icon={HiArrowRight}>Open</Button>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
