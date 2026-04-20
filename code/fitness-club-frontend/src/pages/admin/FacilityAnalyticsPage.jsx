import { useEffect, useState } from 'react';
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
import { adminApi } from '../../services/api';
import { Card, Eyebrow, Spinner } from '../../components/editorial';

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
  summary: { total: 8, average: 56, mostPopular: 'Basketball Court', leastUsed: 'Spin Studio' },
  utilization: [
    { facility: 'Gym Floor', utilization: 78, hourly: 72 },
    { facility: 'Aquatic Center', utilization: 55, hourly: 48 },
    { facility: 'Yoga Studio', utilization: 72, hourly: 61 },
    { facility: 'Basketball Court', utilization: 91, hourly: 75 },
    { facility: 'Spin Studio', utilization: 0, hourly: 0 },
  ],
  hourly: [
    { hour: '06:00', usage: 35 },
    { hour: '08:00', usage: 62 },
    { hour: '10:00', usage: 49 },
    { hour: '12:00', usage: 38 },
    { hour: '16:00', usage: 58 },
    { hour: '18:00', usage: 79 },
    { hour: '20:00', usage: 65 },
  ],
};

function normalize(raw) {
  const items = Array.isArray(raw.facilities)
    ? raw.facilities.map((item) => ({
        facility: item.facility ?? item.name ?? 'Facility',
        utilization: item.utilization ?? item.usage ?? 0,
        hourly: item.hourly ?? item.averageHourly ?? item.utilization ?? 0,
      }))
    : FALLBACK.utilization;

  return {
    summary: {
      total: raw.totalFacilities ?? items.length,
      average: raw.averageUtilization ?? Math.round(items.reduce((sum, item) => sum + item.utilization, 0) / items.length),
      mostPopular: raw.mostPopular ?? items.slice().sort((a, b) => b.utilization - a.utilization)[0]?.facility ?? FALLBACK.summary.mostPopular,
      leastUsed: raw.leastUsed ?? items.slice().sort((a, b) => a.utilization - b.utilization)[0]?.facility ?? FALLBACK.summary.leastUsed,
    },
    utilization: items,
    hourly: Array.isArray(raw.hourly)
      ? raw.hourly.map((item) => ({
          hour: item.hour ?? item.time ?? 'Hour',
          usage: item.usage ?? item.count ?? 0,
        }))
      : FALLBACK.hourly,
  };
}

export default function FacilityAnalyticsPage() {
  const [data, setData] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    adminApi
      .getFacilityStats()
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
    return <Spinner text="Loading facility analytics" />;
  }

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      <Eyebrow className="mb-5">Admin Analytics</Eyebrow>
      <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05] mb-4">Facility Analytics.</h1>
      <p className="text-[15px] text-ink-2 font-light leading-[1.7] max-w-xl mb-14">Measure which spaces carry the club, where utilization drops, and how hourly usage changes throughout the day.</p>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-10 border-y border-ink/10 py-12 mb-16">
        {[
          { label: 'Total Facilities', value: data.summary.total },
          { label: 'Avg Utilization', value: `${data.summary.average}%` },
          { label: 'Most Popular', value: data.summary.mostPopular },
          { label: 'Least Used', value: data.summary.leastUsed },
        ].map((stat) => (
          <div key={stat.label}>
            <span className="font-heading text-[clamp(1.5rem,2.5vw,2.25rem)] font-bold text-gold leading-none block">{stat.value}</span>
            <p className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-ink-3 mt-4">{stat.label}</p>
          </div>
        ))}
      </section>

      <div className="grid lg:grid-cols-2 gap-10 mb-10">
        <Card hover={false} className="p-8">
          <Eyebrow tone="muted" className="mb-3">Utilization</Eyebrow>
          <h3 className="font-heading text-[1.25rem] font-bold text-ink tracking-[-0.01em] mb-8">Facility Utilization</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.utilization}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,26,0.08)" />
                <XAxis dataKey="facility" tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="utilization" fill="#C9A96E" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card hover={false} className="p-8">
          <Eyebrow tone="muted" className="mb-3">Hourly Flow</Eyebrow>
          <h3 className="font-heading text-[1.25rem] font-bold text-ink tracking-[-0.01em] mb-8">Hourly Usage</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.hourly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,26,0.08)" />
                <XAxis dataKey="hour" tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="usage" stroke="#1A1A1A" strokeWidth={3} dot={{ fill: '#1A1A1A', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card hover={false} className="overflow-hidden">
        <div className="p-8 pb-0">
          <Eyebrow tone="muted" className="mb-3">Comparison</Eyebrow>
          <h3 className="font-heading text-[1.25rem] font-bold text-ink tracking-[-0.01em] mb-8">Facility Comparison Table</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink/10">
                {['Facility', 'Utilization', 'Hourly Index'].map((header) => (
                  <th key={header} className="text-left px-6 py-5 text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-ink-3">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.utilization.map((item, index) => (
                <tr key={item.facility} className={`hover:bg-cream transition-colors ${index < data.utilization.length - 1 ? 'border-b border-ink/6' : ''}`}>
                  <td className="px-6 py-5 text-[14px] text-ink-2">{item.facility}</td>
                  <td className="px-6 py-5 text-[14px] text-ink">{item.utilization}%</td>
                  <td className="px-6 py-5 text-[14px] text-ink-2">{item.hourly}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
