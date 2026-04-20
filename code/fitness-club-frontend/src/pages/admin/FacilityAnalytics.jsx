import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import {
  Eyebrow,
  SectionHeader,
  Card,
  Badge,
} from '../../components/editorial';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const CHART_COLORS = ['#C9A96E', '#8B9D83', '#1A1A1A', '#9A9A9A', '#E8DDD3'];

const FALLBACK_UTILIZATION = [
  { facility: 'Gym Floor', utilization: 78, bookings: 342, avgDuration: 75, peakHour: '08:00', satisfaction: 4.8 },
  { facility: 'Aquatic Center', utilization: 55, bookings: 189, avgDuration: 60, peakHour: '07:00', satisfaction: 4.7 },
  { facility: 'Yoga Studio', utilization: 72, bookings: 214, avgDuration: 65, peakHour: '09:00', satisfaction: 4.9 },
  { facility: 'Basketball', utilization: 91, bookings: 127, avgDuration: 90, peakHour: '18:00', satisfaction: 4.6 },
  { facility: 'Squash Courts', utilization: 48, bookings: 98, avgDuration: 60, peakHour: '07:00', satisfaction: 4.7 },
  { facility: 'Spin Studio', utilization: 0, bookings: 0, avgDuration: 0, peakHour: '—', satisfaction: 0 },
  { facility: 'Steam & Sauna', utilization: 62, bookings: 156, avgDuration: 45, peakHour: '20:00', satisfaction: 4.8 },
  { facility: 'Rooftop Track', utilization: 41, bookings: 88, avgDuration: 55, peakHour: '06:00', satisfaction: 4.5 },
];

const FALLBACK_WEEKLY = [
  { day: 'Mon', gymFloor: 74, aquatic: 48, yoga: 65, basketball: 85 },
  { day: 'Tue', gymFloor: 68, aquatic: 42, yoga: 72, basketball: 78 },
  { day: 'Wed', gymFloor: 82, aquatic: 55, yoga: 78, basketball: 91 },
  { day: 'Thu', gymFloor: 71, aquatic: 51, yoga: 68, basketball: 82 },
  { day: 'Fri', gymFloor: 89, aquatic: 62, yoga: 75, basketball: 95 },
  { day: 'Sat', gymFloor: 94, aquatic: 71, yoga: 85, basketball: 98 },
  { day: 'Sun', gymFloor: 65, aquatic: 58, yoga: 90, basketball: 72 },
];

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', color: '#FAFAF9', fontSize: '12px',
  },
};

function UtilBadge({ pct }) {
  if (pct === 0) return <Badge status="INACTIVE">Closed</Badge>;
  if (pct >= 90) return <Badge status="FAILED">{pct}%</Badge>;
  if (pct >= 70) return <Badge status="PENDING">{pct}%</Badge>;
  return <Badge status="ACTIVE">{pct}%</Badge>;
}

export default function FacilityAnalytics() {
  const [utilization, setUtilization] = useState(FALLBACK_UTILIZATION);
  const [weekly, setWeekly] = useState(FALLBACK_WEEKLY);

  useEffect(() => {
    let alive = true;
    adminApi.getFacilityStats()
      .then((res) => {
        if (!alive) return;
        const d = res.data;
        if (d?.utilization) setUtilization(d.utilization);
        if (d?.weekly) setWeekly(d.weekly);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const active = utilization.filter((f) => f.utilization > 0);
  const avgUtil = active.length > 0 ? Math.round(active.reduce((a, f) => a + f.utilization, 0) / active.length) : 0;
  const totalBookings = utilization.reduce((a, f) => a + f.bookings, 0);
  const topFacility = [...active].sort((a, b) => b.utilization - a.utilization)[0];

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      {/* ═══════════════════════ HEADER ═══════════════════════ */}
      <Eyebrow className="mb-5">Administration</Eyebrow>
      <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05] mb-4">
        Facility Analytics
      </h1>
      <p className="text-[15px] text-ink-2 font-light leading-[1.7] max-w-xl mb-14">
        Utilization rates, booking trends, and performance metrics.
      </p>

      {/* ═══════════════════════ STATS ═══════════════════════ */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-10 border-y border-ink/10 py-12 mb-16">
        {[
          { value: utilization.length, label: 'Total Facilities' },
          { value: active.length, label: 'Active' },
          { value: `${avgUtil}%`, label: 'Avg Utilization' },
          { value: totalBookings.toLocaleString(), label: 'Total Bookings' },
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

      {/* ═══════════════════════ UTILIZATION BAR ═══════════════════════ */}
      <Card hover={false} className="p-8 mb-10">
        <Eyebrow tone="muted" className="mb-2">Overview</Eyebrow>
        <h3 className="font-heading text-[1.25rem] font-bold text-ink tracking-[-0.01em] mb-8">
          Facility Utilization Rate
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={utilization} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,26,0.08)" />
              <XAxis type="number" tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
              <YAxis dataKey="facility" type="category" tick={{ fill: '#9A9A9A', fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Utilization']} />
              <Bar dataKey="utilization" radius={[0, 2, 2, 0]} maxBarSize={20} fill={CHART_COLORS[0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ═══════════════════════ WEEKLY TREND ═══════════════════════ */}
      <Card hover={false} className="p-8 mb-16">
        <Eyebrow tone="muted" className="mb-2">Trends</Eyebrow>
        <h3 className="font-heading text-[1.25rem] font-bold text-ink tracking-[-0.01em] mb-8">
          Weekly Utilization by Day
        </h3>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,26,0.08)" />
              <XAxis dataKey="day" tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`${v}%`, '']} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#9A9A9A' }} />
              <Line type="monotone" dataKey="gymFloor" name="Gym Floor" stroke={CHART_COLORS[0]} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="aquatic" name="Aquatic" stroke={CHART_COLORS[1]} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="yoga" name="Yoga Studio" stroke={CHART_COLORS[2]} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="basketball" name="Basketball" stroke={CHART_COLORS[3]} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ═══════════════════════ TABLE ═══════════════════════ */}
      <SectionHeader eyebrow="Data" title="Performance Summary" className="mb-10" />
      <Card hover={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink/10">
                {['Facility', 'Utilization', 'Bookings', 'Avg Duration', 'Peak Hour', 'Rating'].map((h) => (
                  <th key={h} className="text-left px-6 py-5 text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-ink-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {utilization.map((f, i) => (
                <tr key={f.facility} className={`hover:bg-cream transition-colors ${i < utilization.length - 1 ? 'border-b border-ink/6' : ''}`}>
                  <td className="px-6 py-5 text-[14px] font-semibold text-ink">{f.facility}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-1 bg-ink/6 overflow-hidden">
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${f.utilization}%`,
                            backgroundColor: f.utilization >= 90 ? '#ef4444' : f.utilization >= 70 ? '#C9A96E' : f.utilization === 0 ? '#9A9A9A' : '#8B9D83',
                          }}
                        />
                      </div>
                      <UtilBadge pct={f.utilization} />
                    </div>
                  </td>
                  <td className="px-6 py-5 text-[14px] text-ink-2">{f.bookings || '—'}</td>
                  <td className="px-6 py-5 text-[14px] text-ink-2">{f.avgDuration ? `${f.avgDuration}m` : '—'}</td>
                  <td className="px-6 py-5 text-[14px] text-ink-2">{f.peakHour}</td>
                  <td className="px-6 py-5 text-[14px] font-semibold text-gold">
                    {f.satisfaction > 0 ? `★ ${f.satisfaction}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
