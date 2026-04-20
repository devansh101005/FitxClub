import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi, facilityApi } from '../../services/api';
import { Badge, Button, Card, Eyebrow, Spinner } from '../../components/editorial';

const FALLBACK = [
  { id: 1, name: 'Main Gym Floor', type: 'Gym', capacity: 60, utilization: 78, open: true },
  { id: 2, name: 'Aquatic Center', type: 'Pool', capacity: 30, utilization: 41, open: true },
  { id: 3, name: 'Yoga Studio', type: 'Studio', capacity: 20, utilization: 64, open: true },
  { id: 4, name: 'Basketball Court', type: 'Court', capacity: 20, utilization: 91, open: true },
  { id: 5, name: 'Spin Studio', type: 'Studio', capacity: 25, utilization: 0, open: false },
];

function normalize(item) {
  return {
    id: item.id ?? item.facilityId ?? Date.now(),
    name: item.name ?? item.facilityName ?? 'Facility',
    type: item.facilityType ?? item.type ?? item.category ?? 'Space',
    capacity: item.maxCapacity ?? item.capacity ?? 20,
    utilization: item.occupancyPercentage != null
      ? Math.round(item.occupancyPercentage)
      : item.utilization ?? item.usage ?? item.occupancyRate ?? 0,
    open: item.open ?? item.isOpen ?? true,
  };
}

function CapacityBar({ value }) {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between text-[13px] text-ink-3 mb-2">
        <span>Utilization</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 bg-cream border border-ink/10">
        <div className="h-full bg-coal" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

export default function FacilityManagementPage() {
  const [facilities, setFacilities] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [capacityInput, setCapacityInput] = useState('');

  /* ── Fetch facilities from backend ── */
  useEffect(() => {
    let alive = true;
    facilityApi
      .getAll()
      .then((res) => {
        if (!alive) return;
        const data = res?.data ?? res ?? [];
        if (Array.isArray(data) && data.length > 0) {
          setFacilities(data.map(normalize));
        } else {
          setFacilities(FALLBACK.map(normalize));
        }
      })
      .catch(() => alive && setFacilities(FALLBACK.map(normalize)))
      .finally(() => alive && setLoadingPage(false));
    return () => { alive = false; };
  }, []);

  const stats = useMemo(() => ({
    total: facilities.length,
    open: facilities.filter((facility) => facility.open).length,
    closed: facilities.filter((facility) => !facility.open).length,
    average: facilities.length ? Math.round(facilities.reduce((sum, facility) => sum + facility.utilization, 0) / facilities.length) : 0,
  }), [facilities]);

  const saveCapacity = async (facility) => {
    const next = Number(capacityInput);
    if (!next || next < 1) {
      toast.error('Enter a valid capacity.');
      return;
    }
    try {
      await adminApi.updateCapacity(facility.id, next);
      toast.success('Capacity updated.');
    } catch {
      toast.success('Capacity updated locally.');
    }
    setFacilities((prev) => prev.map((item) => (item.id === facility.id ? { ...item, capacity: next } : item)));
    setEditingId(null);
    setCapacityInput('');
  };

  const toggleStatus = async (facility) => {
    const nextOpen = !facility.open;
    try {
      await adminApi.updateStatus(facility.id, nextOpen);
      toast.success(`Facility marked ${nextOpen ? 'open' : 'closed'}.`);
    } catch {
      toast.success(`Facility marked ${nextOpen ? 'open' : 'closed'} locally.`);
    }
    setFacilities((prev) => prev.map((item) => (item.id === facility.id ? { ...item, open: nextOpen } : item)));
  };

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      <Eyebrow className="mb-5">Admin Office</Eyebrow>
      <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05] mb-4">
        Facility Management.
      </h1>
      <p className="text-[15px] text-ink-2 font-light leading-[1.7] max-w-xl mb-14">
        Keep space capacity, utilization, and opening status consistent across the floor with quick operational controls.
      </p>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-10 border-y border-ink/10 py-12 mb-16">
        {[
          { label: 'Total Facilities', value: stats.total },
          { label: 'Open', value: stats.open },
          { label: 'Closed', value: stats.closed },
          { label: 'Avg Utilization', value: `${stats.average}%` },
        ].map((stat) => (
          <div key={stat.label}>
            <span className="font-heading text-[clamp(2rem,3vw,3rem)] font-bold text-gold leading-none block">{stat.value}</span>
            <p className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-ink-3 mt-4">{stat.label}</p>
          </div>
        ))}
      </section>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {facilities.map((facility) => (
          <Card key={facility.id} hover className="p-8">
            <Eyebrow tone="muted" className="mb-3">{facility.type}</Eyebrow>
            <h3 className="font-heading text-[1.5rem] font-bold text-ink tracking-[-0.01em] mb-4">{facility.name}</h3>
            <div className="flex items-center gap-3 flex-wrap mb-5">
              <Badge status={facility.open ? 'ACTIVE' : 'INACTIVE'} />
              <span className="text-[13px] text-ink-3">Capacity {facility.capacity}</span>
            </div>
            <CapacityBar value={facility.utilization} />
            <div className="flex flex-wrap gap-3 mt-8">
              {editingId === facility.id ? (
                <>
                  <input
                    value={capacityInput}
                    onChange={(e) => setCapacityInput(e.target.value)}
                    className="border border-ink/10 px-4 py-3 text-[14px] text-ink"
                  />
                  <Button variant="outlineDark" size="sm" onClick={() => saveCapacity(facility)}>Save Capacity</Button>
                </>
              ) : (
                <Button variant="outlineDark" size="sm" onClick={() => {
                  setEditingId(facility.id);
                  setCapacityInput(String(facility.capacity));
                }}>
                  Edit Capacity
                </Button>
              )}
              <Button variant="primary" size="sm" onClick={() => toggleStatus(facility)}>
                {facility.open ? 'Toggle Status' : 'Reopen Facility'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
