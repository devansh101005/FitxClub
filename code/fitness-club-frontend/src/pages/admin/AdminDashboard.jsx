import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  HiUsers,
  HiCurrencyRupee,
  HiCalendar,
  HiOfficeBuilding,
  HiArrowRight,
} from 'react-icons/hi';
import { adminApi } from '../../services/api';
import {
  Eyebrow,
  SectionHeader,
  Button,
  Card,
  Badge,
} from '../../components/editorial';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const REVENUE_DATA = [
  { month: 'Jun', revenue: 124000, members: 228 },
  { month: 'Jul', revenue: 138000, members: 245 },
  { month: 'Aug', revenue: 152000, members: 259 },
  { month: 'Sep', revenue: 145000, members: 271 },
  { month: 'Oct', revenue: 168000, members: 289 },
  { month: 'Nov', revenue: 189000, members: 312 },
];

const CHECKIN_DATA = [
  { day: 'Mon', count: 87 }, { day: 'Tue', count: 73 }, { day: 'Wed', count: 91 },
  { day: 'Thu', count: 68 }, { day: 'Fri', count: 96 }, { day: 'Sat', count: 112 }, { day: 'Sun', count: 64 },
];

const RECENT_ACTIVITY = [
  { id: 1, action: 'New member registered', user: 'Rohit Verma', time: '2m ago', type: 'member' },
  { id: 2, action: 'Class created', user: 'Alex Morgan', time: '15m ago', type: 'class' },
  { id: 3, action: 'Membership renewed', user: 'Priya Mehta', time: '31m ago', type: 'payment' },
  { id: 4, action: 'PT session booked', user: 'Dev Kumar', time: '45m ago', type: 'pt' },
  { id: 5, action: 'Facility closed', user: 'Admin', time: '1h ago', type: 'facility' },
];

const STATS = [
  { value: '312', label: 'Total Members' },
  { value: '₹1.89L', label: 'Monthly Revenue' },
  { value: '24', label: 'Active Classes' },
  { value: '78%', label: 'Facility Usage' },
];

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', color: '#FAFAF9', fontSize: '12px',
  },
};

const QUICK_LINKS = [
  { to: '/admin/members', label: 'Members', icon: HiUsers },
  { to: '/admin/create-class', label: 'Create Class', icon: HiCalendar },
  { to: '/admin/facilities', label: 'Facilities', icon: HiOfficeBuilding },
  { to: '/admin/revenue', label: 'Revenue', icon: HiCurrencyRupee },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const firstName =
    (user?.email || 'admin').split('@')[0].replace(/[._-]/g, ' ').trim() || 'Admin';

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      {/* ═══════════════════════ WELCOME ═══════════════════════ */}
      <section className="mb-16">
        <Eyebrow className="mb-6">Admin Dashboard</Eyebrow>
        <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05] mb-6 capitalize">
          Overview.
        </h1>
        <p className="text-[15px] text-ink-2 font-light leading-[1.7] max-w-xl">
          Here's what's happening at FitnessClub today.
        </p>
      </section>

      {/* ═══════════════════════ STATS ═══════════════════════ */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-10 border-y border-ink/10 py-12 mb-16">
        {STATS.map((s) => (
          <div key={s.label}>
            <span className="font-heading text-[clamp(2rem,3.5vw,3rem)] font-bold text-gold leading-none block">
              {s.value}
            </span>
            <p className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-ink-3 mt-4">
              {s.label}
            </p>
          </div>
        ))}
      </section>

      {/* ═══════════════════════ CHARTS ═══════════════════════ */}
      <div className="grid lg:grid-cols-2 gap-10 mb-16">
        {/* Revenue trend */}
        <Card hover={false} className="p-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <Eyebrow tone="muted" className="mb-2">Financial</Eyebrow>
              <h3 className="font-heading text-[1.25rem] font-bold text-ink tracking-[-0.01em]">
                Revenue Trend
              </h3>
            </div>
            <Button variant="link" to="/admin/revenue" icon={HiArrowRight}>Details</Button>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={REVENUE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,26,0.08)" />
                <XAxis dataKey="month" tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#C9A96E" strokeWidth={2.5} dot={{ fill: '#C9A96E', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Weekly check-ins */}
        <Card hover={false} className="p-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <Eyebrow tone="muted" className="mb-2">Attendance</Eyebrow>
              <h3 className="font-heading text-[1.25rem] font-bold text-ink tracking-[-0.01em]">
                Weekly Check-ins
              </h3>
            </div>
            <Button variant="link" to="/admin/peak-hours" icon={HiArrowRight}>Peak Hours</Button>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHECKIN_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,26,0.08)" />
                <XAxis dataKey="day" tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [v, 'Check-ins']} />
                <Bar dataKey="count" fill="#1A1A1A" radius={[2, 2, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ═══════════════════════ ACTIVITY + LINKS ═══════════════════════ */}
      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-14 lg:gap-20">
        {/* Recent activity */}
        <div>
          <SectionHeader eyebrow="Feed" title="Recent Activity" className="mb-10" />
          <div className="space-y-px bg-ink/10 border border-ink/10">
            {RECENT_ACTIVITY.map((a) => (
              <div key={a.id} className="bg-white px-7 py-5 flex items-center gap-4">
                <div className="w-2 h-2 bg-gold shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-ink">{a.action}</p>
                  <p className="text-[12px] text-ink-3 mt-0.5">{a.user} · {a.time}</p>
                </div>
                <Badge tone="outline">{a.type}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <aside>
          <SectionHeader eyebrow="Navigate" title="Quick Links" className="mb-10" />
          <div className="grid grid-cols-2 gap-5">
            {QUICK_LINKS.map((l) => (
              <Card key={l.to} hover className="p-6">
                <Button variant="link" to={l.to} className="w-full flex flex-col items-start gap-4 tracking-normal! normal-case! text-left!">
                  <div className="w-11 h-11 border border-ink/10 flex items-center justify-center">
                    <l.icon className="w-5 h-5 text-gold" />
                  </div>
                  <span className="font-heading text-[1rem] font-bold text-ink">{l.label}</span>
                </Button>
              </Card>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
