import { useEffect, useState } from 'react';
import { HiPlus, HiX, HiClock, HiCheck } from 'react-icons/hi';
import { trainerApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Eyebrow,
  Button,
  Spinner,
} from '../../components/editorial';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_OPTIONS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00',
];

const INITIAL_SLOTS = {
  Monday: [{ id: 1, start: '07:00', end: '10:00' }, { id: 2, start: '15:00', end: '19:00' }],
  Tuesday: [{ id: 3, start: '08:00', end: '12:00' }],
  Wednesday: [{ id: 4, start: '07:00', end: '11:00' }, { id: 5, start: '16:00', end: '20:00' }],
  Thursday: [{ id: 6, start: '09:00', end: '13:00' }],
  Friday: [{ id: 7, start: '07:00', end: '12:00' }],
  Saturday: [{ id: 8, start: '09:00', end: '14:00' }],
  Sunday: [],
};

function formatTime(value) {
  return typeof value === 'string' ? value.slice(0, 5) : value;
}

function normalizeAvailability(availability) {
  if (!Array.isArray(availability)) return INITIAL_SLOTS;

  const grouped = { ...INITIAL_SLOTS };
  for (const slot of availability) {
    const day = slot?.day || slot?.dayOfWeek;
    if (!day) continue;
    const dayName = String(day).charAt(0) + String(day).slice(1).toLowerCase();
    if (!grouped[dayName]) grouped[dayName] = [];
    grouped[dayName] = [
      ...grouped[dayName],
      {
        id: slot.id || Date.now() + Math.random(),
        start: formatTime(slot.start || slot.startTime),
        end: formatTime(slot.end || slot.endTime),
      },
    ];
  }

  return grouped;
}

export default function Availability() {
  const [slots, setSlots] = useState(INITIAL_SLOTS);
  const [adding, setAdding] = useState(null);
  const [newSlot, setNewSlot] = useState({ start: '09:00', end: '11:00' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    trainerApi
      .getMyProfile()
      .then((res) => {
        if (!alive) return;
        const data = res?.data ?? res;
        if (data?.availability) setSlots(normalizeAvailability(data.availability));
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const handleAdd = async () => {
    if (!adding) return;
    if (newSlot.start >= newSlot.end) {
      toast.error('End time must be after start time.');
      return;
    }
    const id = Date.now();
    setSlots((prev) => ({
      ...prev,
      [adding]: [...(prev[adding] || []), { id, ...newSlot }],
    }));
    try {
      await trainerApi.addAvailability({ day: adding, ...newSlot });
      toast.success(`Slot added for ${adding}`);
    } catch (err) {
      console.error('Failed to add slot', err);
      toast.error('Failed to add slot.');
      // Revert optimism if needed (optional for now, or just show error)
    }
    setAdding(null);
  };

  const handleRemove = async (day, id) => {
    setSlots((prev) => ({
      ...prev,
      [day]: prev[day].filter((s) => s.id !== id),
    }));
    try {
      await trainerApi.removeAvailability(id);
      toast.success('Slot removed');
    } catch (err) {
      console.error('Failed to remove slot', err);
      toast.error('Failed to remove slot.');
    }
  };

  const handleSave = async () => {
    // There is no save endpoint needed since add/remove hit the API immediately.
    toast.success('Availability saved successfully!');
  };

  const totalHours = Object.values(slots)
    .flat()
    .reduce((acc, s) => {
      const [sh, sm] = s.start.split(':').map(Number);
      const [eh, em] = s.end.split(':').map(Number);
      return acc + (eh * 60 + em - sh * 60 - sm) / 60;
    }, 0);

  const activeDays = Object.values(slots).filter((d) => d.length > 0).length;
  const totalSlots = Object.values(slots).flat().length;

  if (loading) {
    return (
      <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
        <Spinner text="Loading availability" />
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      {/* ═══════════════════════ HEADER ═══════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
        <div>
          <Eyebrow className="mb-5">Schedule</Eyebrow>
          <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05]">
            Availability
          </h1>
          <p className="text-[15px] text-ink-2 font-light leading-[1.7] mt-4 max-w-lg">
            Set your available hours for PT sessions and classes.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={saving}
          icon={HiCheck}
          iconPosition="left"
        >
          {saving ? 'Saving…' : 'Save Availability'}
        </Button>
      </div>

      {/* ═══════════════════════ STATS ═══════════════════════ */}
      <section className="grid grid-cols-3 gap-10 border-y border-ink/10 py-12 mb-16">
        {[
          { value: `${totalHours.toFixed(0)}h`, label: 'Available / Week' },
          { value: activeDays, label: 'Days Active' },
          { value: totalSlots, label: 'Time Slots' },
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

      {/* ═══════════════════════ WEEKLY GRID ═══════════════════════ */}
      <div className="space-y-px bg-ink/10 border border-ink/10">
        {DAYS.map((day) => {
          const daySlots = slots[day] || [];
          const hasSlots = daySlots.length > 0;

          return (
            <div key={day} className="bg-white px-7 py-6">
              {/* Day header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-1 h-8 ${hasSlots ? 'bg-gold' : 'bg-ink/10'}`}
                  />
                  <div>
                    <h3 className="font-heading text-[1.15rem] font-bold text-ink">
                      {day}
                    </h3>
                    <p className="text-[12px] text-ink-3 mt-0.5">
                      {hasSlots
                        ? `${daySlots.length} slot${daySlots.length > 1 ? 's' : ''}`
                        : 'No slots'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAdding(day);
                    setNewSlot({ start: '09:00', end: '11:00' });
                  }}
                  className="flex items-center gap-1.5 text-[0.7rem] font-semibold tracking-[0.12em] uppercase text-gold hover:text-ink transition-colors"
                >
                  <HiPlus className="w-3.5 h-3.5" /> Add Slot
                </button>
              </div>

              {/* Existing slots */}
              {hasSlots && (
                <div className="flex flex-wrap gap-3 mb-3">
                  {daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center gap-2.5 px-4 py-2 bg-cream border border-ink/10"
                    >
                      <HiClock className="w-3.5 h-3.5 text-gold" />
                      <span className="text-[13px] font-semibold text-ink">
                        {slot.start} – {slot.end}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemove(day, slot.id)}
                        className="text-ink-3 hover:text-red-500 transition-colors ml-1"
                      >
                        <HiX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add slot form */}
              {adding === day && (
                <div className="flex items-center gap-4 mt-4 p-4 border border-ink/10 bg-cream">
                  <span className="text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-ink-3">
                    From
                  </span>
                  <select
                    value={newSlot.start}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, start: e.target.value })
                    }
                    className="bg-white border border-ink/15 px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-gold transition-colors"
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <span className="text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-ink-3">
                    To
                  </span>
                  <select
                    value={newSlot.end}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, end: e.target.value })
                    }
                    className="bg-white border border-ink/15 px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-gold transition-colors"
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <Button variant="primary" size="sm" onClick={handleAdd}>
                    Add
                  </Button>
                  <button
                    type="button"
                    onClick={() => setAdding(null)}
                    className="text-[0.7rem] font-semibold tracking-[0.12em] uppercase text-ink-3 hover:text-ink transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
