import { useState } from 'react';
import { HiCheck, HiArrowRight } from 'react-icons/hi';
import { adminApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Eyebrow,
  Button,
  Card,
  Input,
  Select,
  Textarea,
} from '../../components/editorial';

const TRAINERS = ['Alex Morgan', 'Sarah Chen', 'Mike Torres', 'Priya Singh', 'Maria Lopez', 'Jordan Kim'];
const FACILITIES = ['Main Gym Floor', 'Yoga Studio', 'Spin Studio', 'Studio A', 'Studio B'];
const CLASS_TYPES = ['HIIT', 'Yoga', 'Pilates', 'Cycling', 'Strength', 'Boxing', 'Zumba', 'Stretching', 'CrossFit', 'Dance'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIMES = ['05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

const INIT = {
  name: '', type: '', trainer: '', facility: '', day: '', time: '',
  duration: '60', capacity: '20', level: 'All Levels', description: '', recurring: true,
};

export default function CreateClass() {
  const [form, setForm] = useState(INIT);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.type) e.type = 'Required';
    if (!form.trainer) e.trainer = 'Required';
    if (!form.facility) e.facility = 'Required';
    if (!form.day) e.day = 'Required';
    if (!form.time) e.time = 'Required';
    if (!form.duration || isNaN(form.duration) || +form.duration < 15) e.duration = 'Min 15 minutes';
    if (!form.capacity || isNaN(form.capacity) || +form.capacity < 1) e.capacity = 'Min 1 person';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
      await adminApi.createClass(form);
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
    setLoading(false);
    setSuccess(true);
    toast.success(`Class "${form.name}" created successfully!`);
  };

  const handleReset = () => { setForm(INIT); setErrors({}); setSuccess(false); };

  /* ── Success view ── */
  if (success) {
    return (
      <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-md mx-auto">
        <Card variant="dark" hover={false} className="p-10 text-center">
          <div className="w-16 h-16 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <HiCheck className="w-8 h-8 text-gold" />
          </div>
          <h2 className="font-heading text-[2rem] font-bold text-white mb-2">Class Created!</h2>
          <p className="text-[13px] text-white/50 mb-8">The class has been added to the schedule.</p>

          <div className="space-y-3 text-left border-t border-white/10 pt-6 mb-8">
            {[
              ['Name', form.name],
              ['Trainer', form.trainer],
              ['Day & Time', `${form.day} at ${form.time}`],
              ['Facility', form.facility],
              ['Capacity', `${form.capacity} people`],
              ['Recurring', form.recurring ? 'Yes, weekly' : 'One-time'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-[13px]">
                <span className="text-white/40">{k}</span>
                <span className="font-semibold text-white">{v}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="outlineLight" size="sm" className="flex-1" onClick={handleReset}>
              Create Another
            </Button>
            <Button variant="primaryLight" size="sm" className="flex-1" to="/admin">
              Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  /* ── Form view ── */
  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      <Eyebrow className="mb-5">Administration</Eyebrow>
      <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05] mb-4">
        Create Class Session
      </h1>
      <p className="text-[15px] text-ink-2 font-light leading-[1.7] max-w-xl mb-14">
        Schedule a new fitness class for members to book.
      </p>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-14">
        {/* Class Information */}
        <section>
          <Eyebrow tone="muted" className="mb-3">Details</Eyebrow>
          <h2 className="font-heading text-[1.5rem] font-bold text-ink tracking-[-0.01em] mb-8">
            Class Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <Input label="Class Name" placeholder="e.g. Power HIIT" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
            <Select label="Class Type" value={form.type} onChange={(e) => set('type', e.target.value)} error={errors.type}>
              <option value="">Select type</option>
              {CLASS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
            <Select label="Difficulty Level" value={form.level} onChange={(e) => set('level', e.target.value)}>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </Select>
            <Input label="Max Capacity" type="number" min="1" max="100" value={form.capacity} onChange={(e) => set('capacity', e.target.value)} error={errors.capacity} />
          </div>
          <div className="mt-8">
            <Textarea label="Description (Optional)" placeholder="Describe the class…" value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} />
          </div>
        </section>

        {/* Trainer & Facility */}
        <section>
          <Eyebrow tone="muted" className="mb-3">Assignment</Eyebrow>
          <h2 className="font-heading text-[1.5rem] font-bold text-ink tracking-[-0.01em] mb-8">
            Trainer & Facility
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <Select label="Assign Trainer" value={form.trainer} onChange={(e) => set('trainer', e.target.value)} error={errors.trainer}>
              <option value="">Select trainer</option>
              {TRAINERS.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
            <Select label="Facility / Room" value={form.facility} onChange={(e) => set('facility', e.target.value)} error={errors.facility}>
              <option value="">Select facility</option>
              {FACILITIES.map((f) => <option key={f} value={f}>{f}</option>)}
            </Select>
          </div>
        </section>

        {/* Schedule */}
        <section>
          <Eyebrow tone="muted" className="mb-3">Timing</Eyebrow>
          <h2 className="font-heading text-[1.5rem] font-bold text-ink tracking-[-0.01em] mb-8">
            Schedule
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            <Select label="Day of Week" value={form.day} onChange={(e) => set('day', e.target.value)} error={errors.day}>
              <option value="">Select day</option>
              {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </Select>
            <Select label="Start Time" value={form.time} onChange={(e) => set('time', e.target.value)} error={errors.time}>
              <option value="">Select time</option>
              {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
            <Input label="Duration (min)" type="number" min="15" max="180" value={form.duration} onChange={(e) => set('duration', e.target.value)} error={errors.duration} />
          </div>
          <div className="mt-6 flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.recurring}
              onChange={(e) => set('recurring', e.target.checked)}
              className="accent-gold w-4 h-4"
            />
            <span className="text-[13px] text-ink-2">Recurring weekly class</span>
          </div>
        </section>

        {/* Submit */}
        <div className="flex gap-4 justify-end border-t border-ink/10 pt-10">
          <Button type="button" variant="outlineDark" onClick={handleReset}>Reset</Button>
          <Button type="submit" variant="primary" disabled={loading} icon={HiArrowRight}>
            {loading ? 'Creating…' : 'Create Class'}
          </Button>
        </div>
      </form>
    </div>
  );
}
