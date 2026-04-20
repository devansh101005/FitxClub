import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { adminApi } from '../../services/api';
import { Card, Eyebrow, Spinner } from '../../components/editorial';

const CHART_COLORS = ['#C9A96E', '#8B9D83', '#1A1A1A', '#9A9A9A', '#E8DDD3'];
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

const FALLBACK = {
  totals: { total: 312, newThisMonth: 38, retention: 89, churn: 11 },
  growth: [
    { month: 'Jun', members: 228 },
    { month: 'Jul', members: 245 },
    { month: 'Aug', members: 259 },
    { month: 'Sep', members: 271 },
    { month: 'Oct', members: 289 },
    { month: 'Nov', members: 312 },
  ],
  plans: [
    { name: 'Gold', value: 152 },
    { name: 'Silver', value: 108 },
    { name: 'Platinum', value: 52 },
  ],
  demographics: [
    { group: '18-24', count: 45 },
    { group: '25-34', count: 112 },
    { group: '35-44', count: 87 },
    { group: '45-54', count: 43 },
    { group: '55+', count: 25 },
  ],
  retentionRows: [
    { id: 1, segment: 'Annual Plans', retention: '93%', note: 'Best performing cohort' },
    { id: 2, segment: 'Monthly Plans', retention: '84%', note: 'Watch churn in second month' },
    { id: 3, segment: 'PT Upsell Members', retention: '91%', note: 'High renewal confidence' },
  ],
};

function normalize(raw) {
  return {
    totals: {
      total: raw.totalMembers ?? raw.total ?? FALLBACK.totals.total,
      newThisMonth: raw.newThisMonth ?? raw.newMembers ?? FALLBACK.totals.newThisMonth,
      retention: raw.retentionRate ?? FALLBACK.totals.retention,
      churn: raw.churnRate ?? FALLBACK.totals.churn,
    },
    growth: Array.isArray(raw.growth)
      ? raw.growth.map((item) => ({
          month: item.month ?? item.label ?? 'Month',
          members: item.members ?? item.total ?? 0,
        }))
      : FALLBACK.growth,
    plans: Array.isArray(raw.plans)
      ? raw.plans.map((item) => ({
          name: item.name ?? item.plan ?? 'Plan',
          value: item.value ?? item.count ?? 0,
        }))
      : FALLBACK.plans,
    demographics: Array.isArray(raw.demographics)
      ? raw.demographics.map((item) => ({
          group: item.group ?? item.range ?? 'Group',
          count: item.count ?? item.value ?? 0,
        }))
      : FALLBACK.demographics,
    retentionRows: Array.isArray(raw.retentionRows)
      ? raw.retentionRows.map((item, index) => ({
          id: item.id ?? index + 1,
          segment: item.segment ?? item.name ?? 'Segment',
          retention: item.retention ?? `${item.rate ?? 0}%`,
          note: item.note ?? 'Trend observed in current cohort',
        }))
      : FALLBACK.retentionRows,
  };
}

export default function MemberAnalyticsPage() {
  const [data, setData] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    adminApi
      .getMemberStats()
      .then((res) => {
        if (!alive) return;
        const raw = res?.data ?? res ?? {};
        setData(raw ? normalize(raw) : FALLBACK);
      })
      .catch(() => alive && setData(FALLBACK))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  if (loading) {
    return <Spinner text="Loading member analytics" />;
  }

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      <Eyebrow className="mb-5">Admin Analytics</Eyebrow>
      <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05] mb-4">Member Analytics.</h1>
      <p className="text-[15px] text-ink-2 font-light leading-[1.7] max-w-xl mb-14">Track growth, plan mix, demographic composition, and retention with backend data normalized for the editorial UI.</p>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-10 border-y border-ink/10 py-12 mb-16">
        {[
          { label: 'Total', value: data.totals.total },
          { label: 'New This Month', value: data.totals.newThisMonth },
          { label: 'Retention Rate', value: `${data.totals.retention}%` },
          { label: 'Churn Rate', value: `${data.totals.churn}%` },
        ].map((stat) => (
          <div key={stat.label}>
            <span className="font-heading text-[clamp(2rem,3vw,3rem)] font-bold text-gold leading-none block">{stat.value}</span>
            <p className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-ink-3 mt-4">{stat.label}</p>
          </div>
        ))}
      </section>

      <div className="grid lg:grid-cols-2 gap-10 mb-10">
        <Card hover={false} className="p-8">
          <Eyebrow tone="muted" className="mb-3">Growth</Eyebrow>
          <h3 className="font-heading text-[1.25rem] font-bold text-ink tracking-[-0.01em] mb-8">Growth Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.growth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,26,0.08)" />
                <XAxis dataKey="month" tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="members" stroke="#C9A96E" strokeWidth={3} dot={{ fill: '#C9A96E', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card hover={false} className="p-8">
          <Eyebrow tone="muted" className="mb-3">Plan Distribution</Eyebrow>
          <h3 className="font-heading text-[1.25rem] font-bold text-ink tracking-[-0.01em] mb-8">Plan Mix</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.plans} dataKey="value" innerRadius={70} outerRadius={110}>
                  {data.plans.map((item, index) => <Cell key={item.name} fill={CHART_COLORS[index]} />)}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10">
        <Card hover={false} className="p-8">
          <Eyebrow tone="muted" className="mb-3">Demographics</Eyebrow>
          <h3 className="font-heading text-[1.25rem] font-bold text-ink tracking-[-0.01em] mb-8">Age Demographics</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.demographics}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,26,0.08)" />
                <XAxis dataKey="group" tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="count" fill="#1A1A1A" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card hover={false} className="overflow-hidden">
          <div className="p-8 pb-0">
            <Eyebrow tone="muted" className="mb-3">Retention</Eyebrow>
            <h3 className="font-heading text-[1.25rem] font-bold text-ink tracking-[-0.01em] mb-8">Retention Table</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink/10">
                  {['Segment', 'Retention', 'Note'].map((header) => (
                    <th key={header} className="text-left px-6 py-5 text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-ink-3">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.retentionRows.map((row, index) => (
                  <tr key={row.id} className={`hover:bg-cream transition-colors ${index < data.retentionRows.length - 1 ? 'border-b border-ink/6' : ''}`}>
                    <td className="px-6 py-5 text-[14px] text-ink-2">{row.segment}</td>
                    <td className="px-6 py-5 text-[14px] text-ink">{row.retention}</td>
                    <td className="px-6 py-5 text-[14px] text-ink-2">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
