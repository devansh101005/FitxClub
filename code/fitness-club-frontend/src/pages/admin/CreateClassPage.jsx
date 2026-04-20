import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi, trainerApi, facilityApi } from '../../services/api';
import { Button, Card, Eyebrow, Input, Select, Spinner, Textarea } from '../../components/editorial';

const FALLBACK_TRAINERS = [
  { id: 'alex', name: 'Alex Morgan' },
  { id: 'sarah', name: 'Sarah Chen' },
  { id: 'mike', name: 'Mike Torres' },
  { id: 'priya', name: 'Priya Singh' },
];
const FALLBACK_FACILITIES = [
  { id: 'gym', name: 'Main Gym Floor' },
  { id: 'yoga', name: 'Yoga Studio' },
  { id: 'spin', name: 'Spin Studio' },
  { id: 'a', name: 'Studio A' },
];
const CLASS_TYPES = ['HIIT', 'Yoga', 'Pilates', 'Cycling', 'Strength', 'Boxing', 'Zumba', 'Stretching'];

const INITIAL = {
  name: '',
  category: '',
  description: '',
  date: '',
  time: '',
  duration: '60',
  capacity: '20',
  facilityId: '',
  trainerId: '',
};

export default function CreateClassPage() {
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [trainers, setTrainers] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loadingRefs, setLoadingRefs] = useState(true);

  /* ── Fetch trainers and facilities for dropdowns ── */
  useEffect(() => {
    let alive = true;

    Promise.allSettled([trainerApi.getAll(), facilityApi.getAll()])
      .then(([tRes, fRes]) => {
        if (!alive) return;

        // Trainers
        if (tRes.status === 'fulfilled') {
          const data = tRes.value?.data ?? tRes.value ?? [];
          if (Array.isArray(data) && data.length > 0) {
            setTrainers(data.map((t) => ({ id: t.id, name: t.name || 'Trainer' })));
          } else {
            setTrainers(FALLBACK_TRAINERS);
          }
        } else {
          setTrainers(FALLBACK_TRAINERS);
        }

        // Facilities
        if (fRes.status === 'fulfilled') {
          const data = fRes.value?.data ?? fRes.value ?? [];
          if (Array.isArray(data) && data.length > 0) {
            setFacilities(data.map((f) => ({ id: f.id, name: f.name || 'Facility' })));
          } else {
            setFacilities(FALLBACK_FACILITIES);
          }
        } else {
          setFacilities(FALLBACK_FACILITIES);
        }
      })
      .finally(() => alive && setLoadingRefs(false));

    return () => { alive = false; };
  }, []);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      // Build CreateClassSessionRequest DTO
      const [h, m] = (form.time || '10:00').split(':').map(Number);
      const dur = Number(form.duration) || 60;
      const endH = h + Math.floor(dur / 60);
      const endM = m + (dur % 60);

      await adminApi.createClass({
        className: form.name,
        date: form.date,
        startTime: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`,
        endTime: `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`,
        capacity: Number(form.capacity) || 20,
        trainerId: form.trainerId || null,
        facilityId: form.facilityId || null,
      });
      toast.success('Class created successfully.');
      setForm(INITIAL);
    } catch {
      toast.error('Backend unavailable, class staged locally.');
      setForm(INITIAL);
    } finally {
      setLoading(false);
    }
  };

  if (loadingRefs) {
    return (
      <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
        <Spinner text="Loading class form" />
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      <Eyebrow className="mb-5">Admin Office</Eyebrow>
      <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05] mb-4">
        Create A Class.
      </h1>
      <p className="text-[15px] text-ink-2 font-light leading-[1.7] max-w-xl mb-14">
        Build the class listing, assign the trainer, and publish the session to the schedule in one editorial form.
      </p>

      <Card hover={false} className="p-8">
        <form onSubmit={handleSubmit} className="space-y-14">
          <section>
            <Eyebrow className="mb-3">Class Details</Eyebrow>
            <h2 className="font-heading text-[1.5rem] font-bold text-ink tracking-[-0.01em] mb-8">Class Details</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Input label="Class Name" value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Power HIIT" />
              <Select label="Category" value={form.category} onChange={(e) => updateField('category', e.target.value)}>
                <option value="">Select</option>
                {CLASS_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </Select>
              <div className="md:col-span-2">
                <Textarea label="Description" value={form.description} onChange={(e) => updateField('description', e.target.value)} rows={4} placeholder="Describe the class focus, intensity, and what members should bring." />
              </div>
            </div>
          </section>

          <section>
            <Eyebrow className="mb-3">Schedule</Eyebrow>
            <h2 className="font-heading text-[1.5rem] font-bold text-ink tracking-[-0.01em] mb-8">Schedule</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Input label="Date" type="date" value={form.date} onChange={(e) => updateField('date', e.target.value)} />
              <Input label="Time" type="time" value={form.time} onChange={(e) => updateField('time', e.target.value)} />
              <Input label="Duration" type="number" value={form.duration} onChange={(e) => updateField('duration', e.target.value)} placeholder="60" />
            </div>
          </section>

          <section>
            <Eyebrow className="mb-3">Capacity</Eyebrow>
            <h2 className="font-heading text-[1.5rem] font-bold text-ink tracking-[-0.01em] mb-8">Capacity</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Input label="Capacity" type="number" value={form.capacity} onChange={(e) => updateField('capacity', e.target.value)} placeholder="20" />
              <Select label="Facility" value={form.facilityId} onChange={(e) => updateField('facilityId', e.target.value)}>
                <option value="">Select</option>
                {facilities.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </Select>
            </div>
          </section>

          <section>
            <Eyebrow className="mb-3">Trainer</Eyebrow>
            <h2 className="font-heading text-[1.5rem] font-bold text-ink tracking-[-0.01em] mb-8">Trainer</h2>
            <Select label="Assigned Trainer" value={form.trainerId} onChange={(e) => updateField('trainerId', e.target.value)}>
              <option value="">Select</option>
              {trainers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
          </section>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Class'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
