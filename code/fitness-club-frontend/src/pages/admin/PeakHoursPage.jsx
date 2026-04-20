import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { adminApi } from '../../services/api';
import { Card, Eyebrow, Spinner } from '../../components/editorial';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = ['06', '08', '10', '12', '14', '16', '18', '20'];
const FALLBACK = {
  summary: { peakHour: '18:00', busiestDay: 'Sat', averageOccupancy: '62%', maxCapacity: '95%' },
  heatmap: {
    Mon: [35, 48, 44, 36, 29, 41, 58, 43],
    Tue: [31, 45, 39, 34, 26, 38, 55, 40],
    Wed: [38, 52, 47, 39, 33, 45, 62, 49],
    Thu: [34, 46, 42, 35, 28, 40, 57, 44],
    Fri: [41, 59, 50, 43, 38, 52, 71, 58],
    Sat: [54, 71, 63, 58, 47, 60, 82, 66],
    Sun: [28, 42, 56, 53, 44, 48, 51, 39],
  },
  hourly: [
    { hour: '06:00', value: 37 },
    { hour: '08:00', value: 52 },
    { hour: '10:00', value: 49 },
    { hour: '12:00', value: 43 },
    { hour: '14:00', value: 35 },
    { hour: '16:00', value: 46 },
    { hour: '18:00', value: 62 },
    { hour: '20:00', value: 48 },
  ],
  comparison: [
    { day: 'Mon', occupancy: 42 },
    { day: 'Tue', occupancy: 39 },
    { day: 'Wed', occupancy: 46 },
    { day: 'Thu', occupancy: 41 },
    { day: 'Fri', occupancy: 52 },
    { day: 'Sat', occupancy: 63 },
    { day: 'Sun', occupancy: 45 },
  ],
};

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

function normalize(raw) {
  return {
    summary: {
      peakHour: raw.peakHour ?? FALLBACK.summary.peakHour,
      busiestDay: raw.busiestDay ?? FALLBACK.summary.busiestDay,
      averageOccupancy: raw.averageOccupancy ?? FALLBACK.summary.averageOccupancy,
      maxCapacity: raw.maxCapacity ?? FALLBACK.summary.maxCapacity,
    },
    heatmap: raw.heatmap ?? FALLBACK.heatmap,
    hourly: Array.isArray(raw.hourly)
      ? raw.hourly.map((item) => ({
          hour: item.hour ?? item.time ?? 'Hour',
          value: item.value ?? item.count ?? 0,
        }))
      : FALLBACK.hourly,
    comparison: Array.isArray(raw.comparison)
      ? raw.comparison.map((item) => ({
          day: item.day ?? item.label ?? 'Day',
          occupancy: item.occupancy ?? item.value ?? 0,
        }))
      : FALLBACK.comparison,
  };
}

function getHeatStyle(value) {
  if (value >= 70) return 'bg-coal text-cream';
  if (value >= 55) return 'bg-gold text-coal';
  if (value >= 40) return 'bg-[#E8DDD3] text-ink';
  return 'bg-cream text-ink-3 border border-ink/10';
}

export default function PeakHoursPage() {
  const [data, setData] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    adminApi
      .getPeakHours()
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
    return <Spinner text="Loading peak hours" />;
  }

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      <Eyebrow className="mb-5">Admin Analytics</Eyebrow>
      <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05] mb-4">Peak Hours.</h1>
      <p className="text-[15px] text-ink-2 font-light leading-[1.7] max-w-xl mb-14">See when the club reaches its busiest moments, from daily heat patterns to hourly distribution and day-of-week comparison.</p>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-10 border-y border-ink/10 py-12 mb-16">
        {[
          { label: 'Peak Hour', value: data.summary.peakHour },
          { label: 'Busiest Day', value: data.summary.busiestDay },
          { label: 'Avg Occupancy', value: data.summary.averageOccupancy },
          { label: 'Max Capacity', value: data.summary.maxCapacity },
        ].map((stat) => (
          <div key={stat.label}>
            <span className="font-heading text-[clamp(2rem,3vw,3rem)] font-bold text-gold leading-none block">{stat.value}</span>
            <p className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-ink-3 mt-4">{stat.label}</p>
          </div>
        ))}
      </section>

      <Card hover={false} className="p-8 mb-10">
        <Eyebrow tone="muted" className="mb-3">Heatmap</Eyebrow>
        <h3 className="font-heading text-[1.25rem] font-bold text-ink tracking-[-0.01em] mb-8">Weekly Occupancy Grid</h3>
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="grid mb-3" style={{ gridTemplateColumns: '80px repeat(8, 1fr)' }}>
              <div />
              {HOURS.map((hour) => (
                <div key={hour} className="text-center text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-ink-3">{hour}:00</div>
              ))}
            </div>
            {DAYS.map((day) => (
              <div key={day} className="grid gap-2 mb-2 items-center" style={{ gridTemplateColumns: '80px repeat(8, 1fr)' }}>
                <div className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-ink-3">{day}</div>
                {data.heatmap[day].map((value, index) => (
                  <div key={`${day}-${HOURS[index]}`} className={`h-16 flex items-center justify-center text-[12px] font-semibold ${getHeatStyle(value)}`}>
                    {value}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-10">
        <Card hover={false} className="p-8">
          <Eyebrow tone="muted" className="mb-3">Hourly Distribution</Eyebrow>
          <h3 className="font-heading text-[1.25rem] font-bold text-ink tracking-[-0.01em] mb-8">Hourly Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.hourly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,26,0.08)" />
                <XAxis dataKey="hour" tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="value" fill="#C9A96E" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card hover={false} className="p-8">
          <Eyebrow tone="muted" className="mb-3">Day Comparison</Eyebrow>
          <h3 className="font-heading text-[1.25rem] font-bold text-ink tracking-[-0.01em] mb-8">Day-Of-Week Comparison</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.comparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,26,0.08)" />
                <XAxis dataKey="day" tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="occupancy" fill="#1A1A1A" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
