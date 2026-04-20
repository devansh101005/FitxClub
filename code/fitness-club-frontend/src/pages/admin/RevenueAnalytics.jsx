import { useEffect, useState } from 'react';
import { HiArrowUp, HiArrowDown } from 'react-icons/hi';
import { adminApi } from '../../services/api';
import {
  Eyebrow,
  SectionHeader,
  Card,
  Badge,
} from '../../components/editorial';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const CHART_COLORS = ['#C9A96E', '#8B9D83', '#1A1A1A', '#9A9A9A', '#E8DDD3'];

const FALLBACK_MONTHLY = [
  { month: 'Jan', revenue: 89000, memberships: 62000, pt: 15000, courts: 12000 },
  { month: 'Feb', revenue: 95000, memberships: 68000, pt: 16000, courts: 11000 },
  { month: 'Mar', revenue: 112000, memberships: 79000, pt: 19000, courts: 14000 },
  { month: 'Apr', revenue: 108000, memberships: 76000, pt: 18000, courts: 14000 },
  { month: 'May', revenue: 124000, memberships: 87000, pt: 22000, courts: 15000 },
  { month: 'Jun', revenue: 138000, memberships: 97000, pt: 25000, courts: 16000 },
  { month: 'Jul', revenue: 152000, memberships: 108000, pt: 28000, courts: 16000 },
  { month: 'Aug', revenue: 145000, memberships: 103000, pt: 26000, courts: 16000 },
  { month: 'Sep', revenue: 168000, memberships: 118000, pt: 30000, courts: 20000 },
  { month: 'Oct', revenue: 175000, memberships: 124000, pt: 32000, courts: 19000 },
  { month: 'Nov', revenue: 189000, memberships: 134000, pt: 34000, courts: 21000 },
];

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', color: '#FAFAF9', fontSize: '12px',
  },
};

function normalize(raw) {
  if (!raw || !Array.isArray(raw)) return null;
  return raw.map((m) => ({
    month: m.month,
    revenue: m.revenue ?? m.total ?? 0,
    memberships: m.memberships ?? m.membership ?? 0,
    pt: m.pt ?? m.personalTraining ?? 0,
    courts: m.courts ?? m.courtBookings ?? 0,
  }));
}

export default function RevenueAnalytics() {
  const [monthly, setMonthly] = useState(FALLBACK_MONTHLY);

  useEffect(() => {
    let alive = true;
    adminApi.getRevenue()
      .then((res) => { if (alive) { const d = normalize(res.data); if (d) setMonthly(d); } })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const current = monthly[monthly.length - 1];
  const prev = monthly[monthly.length - 2];
  const growth = prev ? (((current.revenue - prev.revenue) / prev.revenue) * 100).toFixed(1) : '0.0';
  const ytd = monthly.reduce((a, m) => a + m.revenue, 0);

  const pieData = [
    { name: 'Memberships', value: current.memberships },
    { name: 'PT Sessions', value: current.pt },
    { name: 'Court Bookings', value: current.courts },
  ];

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      {/* ═══════════════════════ HEADER ═══════════════════════ */}
      <Eyebrow className="mb-5">Administration</Eyebrow>
      <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05] mb-4">
        Revenue Analytics
      </h1>
      <p className="text-[15px] text-ink-2 font-light leading-[1.7] max-w-xl mb-14">
        Financial performance, revenue trends, and category breakdowns.
      </p>

      {/* ═══════════════════════ STATS ═══════════════════════ */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-10 border-y border-ink/10 py-12 mb-16">
        {[
          { value: `₹${(current.revenue / 1000).toFixed(0)}K`, label: 'This Month' },
          { value: `₹${(ytd / 100000).toFixed(2)}L`, label: 'YTD Revenue' },
          { value: `${growth}%`, label: 'MoM Growth' },
          { value: `₹${(current.memberships / 1000).toFixed(0)}K`, label: 'Memberships' },
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

      {/* ═══════════════════════ REVENUE TREND ═══════════════════════ */}
      <Card hover={false} className="p-8 mb-10">
        <div className="flex items-start justify-between mb-8">
          <div>
            <Eyebrow tone="muted" className="mb-2">Financial</Eyebrow>
            <h3 className="font-heading text-[1.25rem] font-bold text-ink tracking-[-0.01em]">
              Monthly Revenue Trend
            </h3>
          </div>
          <Badge tone="gold">11 Months</Badge>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,26,0.08)" />
              <XAxis dataKey="month" tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`₹${v.toLocaleString()}`, '']} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#9A9A9A' }} />
              <Line type="monotone" dataKey="revenue" name="Total" stroke={CHART_COLORS[0]} strokeWidth={2.5} dot={{ fill: CHART_COLORS[0], r: 3 }} />
              <Line type="monotone" dataKey="memberships" name="Memberships" stroke={CHART_COLORS[1]} strokeWidth={2} dot={false} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="pt" name="PT Sessions" stroke={CHART_COLORS[2]} strokeWidth={2} dot={false} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ═══════════════════════ BREAKDOWN ROW ═══════════════════════ */}
      <div className="grid lg:grid-cols-2 gap-10 mb-16">
        {/* Pie chart */}
        <Card hover={false} className="p-8">
          <Eyebrow tone="muted" className="mb-2">Breakdown</Eyebrow>
          <h3 className="font-heading text-[1.25rem] font-bold text-ink tracking-[-0.01em] mb-8">
            This Month's Split
          </h3>
          <div className="flex items-center gap-8">
            <div className="w-[55%]">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" strokeWidth={0}>
                    {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                  </Pie>
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`₹${v.toLocaleString()}`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-5">
              {pieData.map((d, i) => (
                <div key={d.name}>
                  <div className="flex justify-between text-[13px] mb-1.5">
                    <span className="flex items-center gap-2 text-ink-3">
                      <span className="w-2 h-2 shrink-0" style={{ backgroundColor: CHART_COLORS[i] }} />
                      {d.name}
                    </span>
                    <span className="font-semibold text-ink">₹{(d.value / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="h-1 bg-ink/6 overflow-hidden">
                    <div className="h-full transition-all duration-500" style={{ width: `${Math.round((d.value / current.revenue) * 100)}%`, backgroundColor: CHART_COLORS[i] }} />
                  </div>
                  <p className="text-[11px] text-ink-3 mt-1">{Math.round((d.value / current.revenue) * 100)}% of total</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Stacked bar */}
        <Card hover={false} className="p-8">
          <Eyebrow tone="muted" className="mb-2">Comparison</Eyebrow>
          <h3 className="font-heading text-[1.25rem] font-bold text-ink tracking-[-0.01em] mb-8">
            Revenue by Category (Q4)
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly.slice(-3)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,26,0.08)" />
                <XAxis dataKey="month" tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`₹${v.toLocaleString()}`, '']} />
                <Bar dataKey="memberships" name="Memberships" stackId="a" fill={CHART_COLORS[0]} />
                <Bar dataKey="pt" name="PT Sessions" stackId="a" fill={CHART_COLORS[1]} />
                <Bar dataKey="courts" name="Courts" stackId="a" fill={CHART_COLORS[2]} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ═══════════════════════ TABLE ═══════════════════════ */}
      <SectionHeader eyebrow="Data" title="Monthly Revenue Table" className="mb-10" />
      <Card hover={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink/10">
                {['Month', 'Total', 'Memberships', 'PT Sessions', 'Courts', 'MoM'].map((h) => (
                  <th key={h} className="text-left px-6 py-5 text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-ink-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...monthly].reverse().map((m, i) => {
                const p = monthly[monthly.length - 2 - i];
                const mom = p ? (((m.revenue - p.revenue) / p.revenue) * 100).toFixed(1) : null;
                return (
                  <tr key={m.month} className={`hover:bg-cream transition-colors ${i < monthly.length - 1 ? 'border-b border-ink/6' : ''}`}>
                    <td className="px-6 py-5 text-[14px] font-semibold text-ink">{m.month} 2025</td>
                    <td className="px-6 py-5 text-[14px] font-bold text-gold">₹{m.revenue.toLocaleString()}</td>
                    <td className="px-6 py-5 text-[14px] text-ink-2">₹{m.memberships.toLocaleString()}</td>
                    <td className="px-6 py-5 text-[14px] text-ink-2">₹{m.pt.toLocaleString()}</td>
                    <td className="px-6 py-5 text-[14px] text-ink-2">₹{m.courts.toLocaleString()}</td>
                    <td className="px-6 py-5">
                      {mom && (
                        <span className={`inline-flex items-center gap-1 text-[13px] font-semibold ${+mom > 0 ? 'text-sage' : 'text-red-500'}`}>
                          {+mom > 0 ? <HiArrowUp className="w-3 h-3" /> : <HiArrowDown className="w-3 h-3" />}
                          {Math.abs(+mom)}%
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
