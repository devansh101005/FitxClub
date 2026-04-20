import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import {
  Eyebrow,
  Card,
} from '../../components/editorial';
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const HOURS = ['05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const FALLBACK_HEATMAP = {
  Mon: [8, 22, 48, 67, 54, 38, 28, 41, 29, 22, 31, 45, 58, 72, 81, 63, 42, 18],
  Tue: [6, 19, 44, 61, 49, 34, 26, 37, 25, 19, 28, 41, 55, 68, 77, 58, 39, 15],
  Wed: [9, 24, 52, 71, 58, 42, 30, 44, 32, 24, 34, 48, 62, 78, 87, 68, 45, 20],
  Thu: [7, 21, 46, 63, 51, 36, 27, 39, 27, 20, 30, 44, 57, 70, 79, 61, 41, 17],
  Fri: [10, 28, 58, 79, 64, 48, 34, 50, 36, 28, 38, 54, 67, 89, 95, 78, 52, 24],
  Sat: [12, 35, 68, 91, 84, 72, 58, 62, 48, 38, 52, 68, 74, 82, 88, 71, 48, 22],
  Sun: [6, 16, 38, 52, 47, 62, 71, 64, 52, 44, 48, 55, 58, 52, 44, 36, 28, 14],
};

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', color: '#FAFAF9', fontSize: '12px',
  },
};

function getHeatColor(value) {
  if (value >= 80) return 'bg-red-500';
  if (value >= 65) return 'bg-gold';
  if (value >= 50) return 'bg-gold/70';
  if (value >= 35) return 'bg-sage/80';
  if (value >= 20) return 'bg-sage/40';
  if (value >= 10) return 'bg-ink/15';
  return 'bg-ink/5';
}

function getTextColor(value) {
  if (value >= 50) return 'text-white';
  if (value >= 35) return 'text-ink';
  return 'text-ink-3';
}

export default function PeakHours() {
  const [heatmap, setHeatmap] = useState(FALLBACK_HEATMAP);

  useEffect(() => {
    let alive = true;
    adminApi.getPeakHours()
      .then((res) => { if (alive && res.data?.heatmap) setHeatmap(res.data.heatmap); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const hourlyAvg = HOURS.map((h) => ({
    hour: `${h}:00`,
    avg: Math.round(DAYS.reduce((a, d) => a + heatmap[d][HOURS.indexOf(h)], 0) / DAYS.length),
  }));

  const peakHour = hourlyAvg.reduce((a, b) => (a.avg > b.avg ? a : b));
  const peakDay = DAYS.reduce((a, d) => {
    const sum = heatmap[d].reduce((x, y) => x + y, 0);
    const aSum = heatmap[a].reduce((x, y) => x + y, 0);
    return sum > aSum ? d : a;
  });
  const dailyAvg = Math.round(hourlyAvg.reduce((a, h) => a + h.avg, 0));

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      {/* ═══════════════════════ HEADER ═══════════════════════ */}
      <Eyebrow className="mb-5">Administration</Eyebrow>
      <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05] mb-4">
        Peak Hours
      </h1>
      <p className="text-[15px] text-ink-2 font-light leading-[1.7] max-w-xl mb-14">
        When your facility is busiest throughout the week.
      </p>

      {/* ═══════════════════════ STATS ═══════════════════════ */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-10 border-y border-ink/10 py-12 mb-16">
        {[
          { value: peakHour.hour, label: 'Peak Hour' },
          { value: peakDay, label: 'Busiest Day' },
          { value: dailyAvg, label: 'Daily Avg Check-ins' },
          { value: '22:00', label: 'Quietest Hour' },
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

      {/* ═══════════════════════ HEATMAP ═══════════════════════ */}
      <Card hover={false} className="p-8 mb-10">
        <Eyebrow tone="muted" className="mb-2">Occupancy</Eyebrow>
        <h3 className="font-heading text-[1.25rem] font-bold text-ink tracking-[-0.01em] mb-8">
          Weekly Heatmap
        </h3>
        <div className="overflow-x-auto">
          <div className="min-w-160">
            {/* Hour headers */}
            <div className="grid mb-2" style={{ gridTemplateColumns: '72px repeat(18, 1fr)' }}>
              <div />
              {HOURS.map((h) => (
                <div key={h} className="text-center text-[0.6rem] font-semibold tracking-widest uppercase text-ink-3 pb-1">{h}</div>
              ))}
            </div>
            {/* Day rows */}
            {DAYS.map((day) => (
              <div key={day} className="grid mb-1 items-center" style={{ gridTemplateColumns: '72px repeat(18, 1fr)' }}>
                <span className="text-[0.7rem] font-semibold tracking-[0.12em] uppercase text-ink-3 pr-3">{day}</span>
                {heatmap[day].map((val, i) => (
                  <div
                    key={i}
                    className={`h-9 mx-px flex items-center justify-center text-[0.6rem] font-semibold transition-all ${getHeatColor(val)} ${getTextColor(val)}`}
                    title={`${day} ${HOURS[i]}:00 — ${val} check-ins`}
                  >
                    {val >= 35 ? val : ''}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-6 flex-wrap">
          <span className="text-[0.6rem] font-semibold tracking-[0.12em] uppercase text-ink-3">Intensity:</span>
          {[
            { cls: 'bg-ink/5', label: '0–10' },
            { cls: 'bg-ink/15', label: '10–20' },
            { cls: 'bg-sage/40', label: '20–35' },
            { cls: 'bg-sage/80', label: '35–50' },
            { cls: 'bg-gold/70', label: '50–65' },
            { cls: 'bg-gold', label: '65–80' },
            { cls: 'bg-red-500', label: '80+' },
          ].map((l) => (
            <span key={l.label} className="flex items-center gap-1.5 text-[11px] text-ink-3">
              <span className={`w-4 h-4 ${l.cls}`} />{l.label}
            </span>
          ))}
        </div>
      </Card>

      {/* ═══════════════════════ HOURLY BAR CHART ═══════════════════════ */}
      <Card hover={false} className="p-8">
        <Eyebrow tone="muted" className="mb-2">Averages</Eyebrow>
        <h3 className="font-heading text-[1.25rem] font-bold text-ink tracking-[-0.01em] mb-8">
          Average Check-ins by Hour
        </h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyAvg}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,26,0.08)" />
              <XAxis dataKey="hour" tick={{ fill: '#9A9A9A', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9A9A9A', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [v, 'Avg Check-ins']} />
              <Bar dataKey="avg" fill="#C9A96E" radius={[2, 2, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
