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

const FALLBACK_MONTHLY = [
  { month: 'Jan', memberships: 62000, pt: 15000, courts: 12000 },
  { month: 'Feb', memberships: 68000, pt: 16000, courts: 11000 },
  { month: 'Mar', memberships: 79000, pt: 19000, courts: 14000 },
  { month: 'Apr', memberships: 76000, pt: 18000, courts: 14000 },
  { month: 'May', memberships: 87000, pt: 22000, courts: 15000 },
  { month: 'Jun', memberships: 97000, pt: 25000, courts: 16000 },
  { month: 'Jul', memberships: 108000, pt: 28000, courts: 16000 },
  { month: 'Aug', memberships: 103000, pt: 26000, courts: 16000 },
  { month: 'Sep', memberships: 118000, pt: 30000, courts: 20000 },
  { month: 'Oct', memberships: 124000, pt: 32000, courts: 19000 },
  { month: 'Nov', memberships: 134000, pt: 34000, courts: 21000 },
].map((item) => ({ ...item, revenue: item.memberships + item.pt + item.courts }));

const FALLBACK_PIE = [
  { name: 'Memberships', value: 134000 },
  { name: 'PT Sessions', value: 34000 },
  { name: 'Court Bookings', value: 21000 },
];

function formatRevenue(val) {
  const n = Number(val || 0);
  if (n >= 100000) return `Rs ${(n / 100000).toFixed(2)}L`;
  if (n >= 1000) return `Rs ${Math.round(n / 1000)}k`;
  return `Rs ${n}`;
}

export default function RevenueAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [monthly, setMonthly] = useState(FALLBACK_MONTHLY);
  const [pieData, setPieData] = useState(FALLBACK_PIE);
  const [statsRow, setStatsRow] = useState([
    { label: 'Total Revenue', value: 'Rs 1.89L' },
    { label: 'MoM Growth', value: '8.0%' },
    { label: 'Avg / Member', value: 'Rs 6,058' },
    { label: 'Top Source', value: 'Memberships' },
  ]);

  useEffect(() => {
    let alive = true;

    adminApi
      .getRevenue()
      .then((res) => {
        if (!alive) return;
        const r = res?.data ?? res;
        if (!r) return;

        // Build stats from RevenueStats DTO
        const totalRev = Number(r.totalRevenue || 0);
        const monthlyRev = Number(r.monthlyRevenue || 0);
        const weeklyRev = Number(r.weeklyRevenue || 0);
        const totalPayments = r.totalPayments || 0;
        const successPayments = r.successfulPayments || 0;

        if (totalRev > 0 || monthlyRev > 0) {
          setStatsRow([
            { label: 'Total Revenue', value: formatRevenue(totalRev) },
            { label: 'Monthly Revenue', value: formatRevenue(monthlyRev) },
            { label: 'Successful Payments', value: String(successPayments) },
            { label: 'Total Payments', value: String(totalPayments) },
          ]);
        }

        // Build chart from monthly breakdown
        if (r.monthlyBreakdown && Array.isArray(r.monthlyBreakdown) && r.monthlyBreakdown.length > 0) {
          const mapped = r.monthlyBreakdown.map((m) => ({
            month: m.month || 'Month',
            memberships: Number(m.amount || 0),
            pt: 0,
            courts: 0,
            revenue: Number(m.amount || 0),
          }));
          setMonthly(mapped);
        }
      })
      .catch(() => {/* fallbacks */})
      .finally(() => alive && setLoading(false));

    return () => { alive = false; };
  }, []);

  const current = monthly[monthly.length - 1];
  const previous = monthly[monthly.length - 2];
  const growth = previous?.revenue > 0
    ? (((current.revenue - previous.revenue) / previous.revenue) * 100).toFixed(1)
    : '0.0';

  if (loading) {
    return (
      <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
        <Spinner text="Loading revenue analytics" />
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      <Eyebrow className="mb-5">Admin Analytics</Eyebrow>
      <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05] mb-4">
        Revenue Analytics.
      </h1>
      <p className="text-[15px] text-ink-2 font-light leading-[1.7] max-w-xl mb-14">
        Review revenue momentum, contribution by service line, and stacked monthly comparison inside the editorial reporting system.
      </p>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-10 border-y border-ink/10 py-12 mb-16">
        {statsRow.map((stat) => (
          <div key={stat.label}>
            <span className="font-heading text-[clamp(2rem,3vw,3rem)] font-bold text-gold leading-none block">{stat.value}</span>
            <p className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-ink-3 mt-4">{stat.label}</p>
          </div>
        ))}
      </section>

      <div className="grid lg:grid-cols-2 gap-10 mb-10">
        <Card hover={false} className="p-8">
          <Eyebrow tone="muted" className="mb-3">Trend</Eyebrow>
          <h3 className="font-heading text-[1.25rem] font-bold text-ink tracking-[-0.01em] mb-8">Revenue Stream Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,26,0.08)" />
                <XAxis dataKey="month" tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Legend />
                <Line type="monotone" dataKey="memberships" stroke={CHART_COLORS[0]} strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="pt" stroke={CHART_COLORS[1]} strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="courts" stroke={CHART_COLORS[2]} strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card hover={false} className="p-8">
          <Eyebrow tone="muted" className="mb-3">Breakdown</Eyebrow>
          <h3 className="font-heading text-[1.25rem] font-bold text-ink tracking-[-0.01em] mb-8">Revenue Breakdown</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={70} outerRadius={110}>
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={CHART_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card hover={false} className="p-8">
        <Eyebrow tone="muted" className="mb-3">Comparison</Eyebrow>
        <h3 className="font-heading text-[1.25rem] font-bold text-ink tracking-[-0.01em] mb-8">Monthly Comparison</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,26,0.08)" />
              <XAxis dataKey="month" tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend />
              <Bar dataKey="memberships" stackId="revenue" fill={CHART_COLORS[0]} />
              <Bar dataKey="pt" stackId="revenue" fill={CHART_COLORS[1]} />
              <Bar dataKey="courts" stackId="revenue" fill={CHART_COLORS[2]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
