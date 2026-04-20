import { useState } from 'react';
import { HiUsers, HiPencil, HiCheck, HiX } from 'react-icons/hi';
import { adminApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Eyebrow,
  Button,
  Card,
  Badge,
} from '../../components/editorial';

const INIT_FACILITIES = [
  { id: 1, name: 'Main Gym Floor', type: 'Gym', capacity: 60, current: 34, open: true, hours: '05:00–23:00', lastUpdated: '2m ago' },
  { id: 2, name: 'Aquatic Center', type: 'Pool', capacity: 30, current: 12, open: true, hours: '06:00–21:00', lastUpdated: '5m ago' },
  { id: 3, name: 'Yoga Studio', type: 'Studio', capacity: 20, current: 6, open: true, hours: '07:00–20:00', lastUpdated: '10m ago' },
  { id: 4, name: 'Basketball Court', type: 'Court', capacity: 20, current: 20, open: true, hours: '08:00–22:00', lastUpdated: '1m ago' },
  { id: 5, name: 'Squash Courts', type: 'Court', capacity: 8, current: 2, open: true, hours: '06:00–22:00', lastUpdated: '15m ago' },
  { id: 6, name: 'Spin Studio', type: 'Studio', capacity: 25, current: 0, open: false, hours: 'Closed', lastUpdated: '1h ago' },
  { id: 7, name: 'Steam & Sauna', type: 'Wellness', capacity: 12, current: 5, open: true, hours: '07:00–21:00', lastUpdated: '20m ago' },
  { id: 8, name: 'Rooftop Track', type: 'Outdoor', capacity: 40, current: 15, open: true, hours: '06:00–20:00', lastUpdated: '8m ago' },
];

function CapacityBar({ current, capacity }) {
  const pct = Math.min(100, Math.round((current / (capacity || 1)) * 100));
  const tone = pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-gold' : 'bg-sage';
  return (
    <div className="mt-3">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[0.65rem] font-semibold tracking-widest uppercase text-ink-3">
          <HiUsers className="w-3 h-3 inline mr-1" />{current}/{capacity}
        </span>
        <span className="text-[0.65rem] font-semibold tracking-widest uppercase text-ink-3">{pct}%</span>
      </div>
      <div className="h-1 bg-ink/6 overflow-hidden">
        <div className={`h-full transition-all duration-500 ${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function FacilityManagement() {
  const [facilities, setFacilities] = useState(INIT_FACILITIES);
  const [editingCap, setEditingCap] = useState(null);
  const [newCap, setNewCap] = useState('');
  const [toggling, setToggling] = useState(null);

  const toggleStatus = async (id) => {
    setToggling(id);
    try {
      const f = facilities.find((x) => x.id === id);
      await adminApi.updateStatus(id, !f.open);
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
    setFacilities((prev) => prev.map((f) => f.id === id ? { ...f, open: !f.open, current: f.open ? 0 : f.current, lastUpdated: 'just now' } : f));
    setToggling(null);
    const f = facilities.find((x) => x.id === id);
    toast.success(`${f.name} ${f.open ? 'closed' : 'opened'}`);
  };

  const saveCapacity = async (id) => {
    const cap = parseInt(newCap);
    if (!cap || cap < 1) { toast.error('Invalid capacity'); return; }
    try {
      await adminApi.updateCapacity(id, cap);
    } catch { /* mock */ }
    setFacilities((prev) => prev.map((f) => f.id === id ? { ...f, capacity: cap, lastUpdated: 'just now' } : f));
    setEditingCap(null);
    setNewCap('');
    toast.success('Capacity updated');
  };

  const openCount = facilities.filter((f) => f.open).length;
  const totalCapacity = facilities.filter((f) => f.open).reduce((a, f) => a + f.capacity, 0);
  const currentOccupancy = facilities.reduce((a, f) => a + f.current, 0);
  const avgUtilization = totalCapacity > 0 ? Math.round((currentOccupancy / totalCapacity) * 100) : 0;

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      {/* ═══════════════════════ HEADER ═══════════════════════ */}
      <Eyebrow className="mb-5">Administration</Eyebrow>
      <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05] mb-4">
        Facility Management
      </h1>
      <p className="text-[15px] text-ink-2 font-light leading-[1.7] max-w-xl mb-14">
        Manage facility status, capacity, and live occupancy.
      </p>

      {/* ═══════════════════════ STATS ═══════════════════════ */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-10 border-y border-ink/10 py-12 mb-16">
        {[
          { value: facilities.length, label: 'Total Facilities' },
          { value: openCount, label: 'Open' },
          { value: facilities.length - openCount, label: 'Closed' },
          { value: `${avgUtilization}%`, label: 'Avg Utilization' },
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

      {/* ═══════════════════════ FACILITY CARDS ═══════════════════════ */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-7">
        {facilities.map((f) => (
          <Card key={f.id} hover={false} className={`p-7 ${!f.open ? 'opacity-60' : ''}`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <Eyebrow tone="gold" className="mb-2">{f.type}</Eyebrow>
                <h3 className="font-heading text-[1.15rem] font-bold text-ink tracking-[-0.01em]">
                  {f.name}
                </h3>
              </div>
              <Badge status={f.open ? 'ACTIVE' : 'INACTIVE'}>
                {f.open ? 'Open' : 'Closed'}
              </Badge>
            </div>

            <p className="text-[12px] text-ink-3 mb-4">{f.hours}</p>

            {/* Capacity bar */}
            <CapacityBar current={f.current} capacity={f.capacity} />

            {/* Capacity editor */}
            <div className="flex items-center gap-2 mt-5 text-[13px]">
              <span className="text-ink-3">Capacity:</span>
              {editingCap === f.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="number"
                    value={newCap}
                    onChange={(e) => setNewCap(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveCapacity(f.id)}
                    autoFocus
                    className="w-16 bg-transparent border-b border-ink/15 px-0 py-1 text-[13px] text-ink focus:outline-none focus:border-gold transition-colors"
                  />
                  <button type="button" onClick={() => saveCapacity(f.id)} className="text-sage hover:text-ink transition-colors">
                    <HiCheck className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => { setEditingCap(null); setNewCap(''); }} className="text-ink-3 hover:text-ink transition-colors">
                    <HiX className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-semibold text-ink">{f.capacity}</span>
                  <button type="button" onClick={() => { setEditingCap(f.id); setNewCap(String(f.capacity)); }}
                    className="text-ink-3 hover:text-ink transition-colors">
                    <HiPencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Toggle + timestamp */}
            <div className="flex items-center justify-between mt-5 pt-5 border-t border-ink/10">
              <Button
                variant="outlineDark"
                size="sm"
                onClick={() => toggleStatus(f.id)}
                disabled={toggling === f.id}
              >
                {f.open ? 'Close' : 'Open'}
              </Button>
              <span className="text-[11px] text-ink-3">Updated {f.lastUpdated}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
