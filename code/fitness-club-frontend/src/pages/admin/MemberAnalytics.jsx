import { useEffect, useState } from 'react';
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

const FALLBACK_PLANS = [
  { name: 'Gold', value: 152 },
  { name: 'Silver', value: 108 },
  { name: 'Platinum', value: 52 },
];

const FALLBACK_MONTHLY = [
  { month: 'Jun', new: 28, churned: 12, net: 16 },
  { month: 'Jul', new: 34, churned: 14, net: 20 },
  { month: 'Aug', new: 31, churned: 11, net: 20 },
  { month: 'Sep', new: 40, churned: 18, net: 22 },
  { month: 'Oct', new: 42, churned: 15, net: 27 },
  { month: 'Nov', new: 38, churned: 14, net: 24 },
];

const FALLBACK_AGE = [
  { range: '18–24', count: 45 },
  { range: '25–34', count: 112 },
  { range: '35–44', count: 87 },
  { range: '45–54', count: 43 },
  { range: '55+', count: 25 },
];

const FALLBACK_RETENTION = [
  { month: 'Jun', rate: 82 },
  { month: 'Jul', rate: 84 },
  { month: 'Aug', rate: 83 },
  { month: 'Sep', rate: 86 },
  { month: 'Oct', rate: 87 },
  { month: 'Nov', rate: 89 },
];

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', color: '#FAFAF9', fontSize: '12px',
  },
};

export default function MemberAnalytics() {
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [monthly, setMonthly] = useState(FALLBACK_MONTHLY);
  const [age, setAge] = useState(FALLBACK_AGE);
  const [retention, setRetention] = useState(FALLBACK_RETENTION);

  useEffect(() => {
    let alive = true;
    adminApi.getMemberStats()
      .then((res) => {
        if (!alive) return;
        const d = res.data;
        if (d?.plans) setPlans(d.plans);
        if (d?.monthly) setMonthly(d.monthly);
        if (d?.age) setAge(d.age);
        if (d?.retention) setRetention(d.retention);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const total = plans.reduce((a, p) => a + p.value, 0);
  const latestMonth = monthly[monthly.length - 1];
  const latestRetention = retention[retention.length - 1];

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      {/* ═══════════════════════ HEADER ═══════════════════════ */}
      <Eyebrow className="mb-5">Administration</Eyebrow>
      <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05] mb-4">
        Member Analytics
      </h1>
      <p className="text-[15px] text-ink-2 font-light leading-[1.7] max-w-xl mb-14">
        Membership trends, demographics, and retention metrics.
      </p>

      {/* ═══════════════════════ STATS ═══════════════════════ */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-10 border-y border-ink/10 py-12 mb-16">
        {[
          { value: total, label: 'Total Members' },
          { value: latestMonth.new, label: 'New This Month' },
          { value: latestMonth.churned, label: 'Churned' },
          { value: `${latestRetention.rate}%`, label: 'Retention Rate' },
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

      {/* ═══════════════════════ TOP CHARTS ═══════════════════════ */}
      <div className="grid lg:grid-cols-2 gap-10 mb-10">
        {/* Plan distribution */}
        <Card hover={false} className="p-8">
          <Eyebrow tone="muted" className="mb-2">Distribution</Eyebrow>
          <h3 className="font-heading text-[1.25rem] font-bold text-ink tracking-[-0.01em] mb-8">
            Membership Plans
          </h3>
          <div className="flex items-center gap-8">
            <div className="w-[55%]">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={plans} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" strokeWidth={0}>
                    {plans.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                  </Pie>
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [v, 'Members']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-5">
              {plans.map((p, i) => (
                <div key={p.name}>
                  <div className="flex justify-between text-[13px] mb-1.5">
                    <span className="flex items-center gap-2 text-ink-3">
                      <span className="w-2 h-2 shrink-0" style={{ backgroundColor: CHART_COLORS[i] }} />
                      {p.name}
                    </span>
                    <span className="font-semibold text-ink">{p.value}</span>
                  </div>
                  <div className="h-1 bg-ink/6 overflow-hidden">
                    <div className="h-full transition-all duration-500" style={{ width: `${Math.round((p.value / total) * 100)}%`, backgroundColor: CHART_COLORS[i] }} />
                  </div>
                  <p className="text-[11px] text-ink-3 mt-1">{Math.round((p.value / total) * 100)}%</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Retention trend */}
        <Card hover={false} className="p-8">
          <Eyebrow tone="muted" className="mb-2">Loyalty</Eyebrow>
          <h3 className="font-heading text-[1.25rem] font-bold text-ink tracking-[-0.01em] mb-8">
            Retention Rate Trend
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={retention}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,26,0.08)" />
                <XAxis dataKey="month" tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} domain={[75, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Retention']} />
                <Line type="monotone" dataKey="rate" stroke={CHART_COLORS[0]} strokeWidth={2.5} dot={{ fill: CHART_COLORS[0], r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ═══════════════════════ BOTTOM CHARTS ═══════════════════════ */}
      <div className="grid lg:grid-cols-2 gap-10">
        {/* New vs churned */}
        <Card hover={false} className="p-8">
          <Eyebrow tone="muted" className="mb-2">Growth</Eyebrow>
          <h3 className="font-heading text-[1.25rem] font-bold text-ink tracking-[-0.01em] mb-8">
            New vs Churned Members
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,26,0.08)" />
                <XAxis dataKey="month" tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#9A9A9A' }} />
                <Bar dataKey="new" name="New" fill={CHART_COLORS[1]} radius={[2, 2, 0, 0]} maxBarSize={30} />
                <Bar dataKey="churned" name="Churned" fill={CHART_COLORS[2]} radius={[2, 2, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Age distribution */}
        <Card hover={false} className="p-8">
          <Eyebrow tone="muted" className="mb-2">Demographics</Eyebrow>
          <h3 className="font-heading text-[1.25rem] font-bold text-ink tracking-[-0.01em] mb-8">
            Age Distribution
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={age} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,26,0.08)" />
                <XAxis type="number" tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="range" type="category" tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} width={50} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [v, 'Members']} />
                <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[0, 2, 2, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
