import { useState } from 'react';
import { HiCheck, HiArrowRight } from 'react-icons/hi';
import toast from 'react-hot-toast';
import {
  Eyebrow,
  Button,
  Card,
  Input,
  Select,
  Badge,
} from '../../components/editorial';

const PLANS = [
  { id: 'SILVER', name: 'Silver', price: '₹1,999/mo', features: 'Gym access, 5 classes/month' },
  { id: 'GOLD', name: 'Gold', price: '₹3,499/mo', features: 'Unlimited classes, pool, courts' },
  { id: 'PLATINUM', name: 'Platinum', price: '₹5,999/mo', features: 'All Gold + 4 PT sessions, locker' },
];

const INITIAL = {
  firstName: '', lastName: '', email: '', phone: '', dob: '',
  gender: '', address: '', emergencyName: '', emergencyPhone: '',
  plan: 'GOLD', password: '',
};

export default function RegisterMember() {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Invalid email';
    if (!form.phone.match(/^[0-9+\- ]{8,}$/)) e.phone = 'Invalid phone';
    if (!form.dob) e.dob = 'Required';
    if (!form.password || form.password.length < 6) e.password = 'Min 6 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    const memberId = `MEM-${Math.floor(Math.random() * 90000 + 10000)}`;
    setSuccess({
      name: `${form.firstName} ${form.lastName}`,
      id: memberId,
      plan: form.plan,
      email: form.email,
    });
    toast.success(`Member ${form.firstName} ${form.lastName} registered successfully!`);
  };

  const handleReset = () => { setForm(INITIAL); setSuccess(null); setErrors({}); };

  /* ── Success view ── */
  if (success) {
    return (
      <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-md mx-auto">
        <Card variant="dark" hover={false} className="p-10 text-center">
          <div className="w-16 h-16 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <HiCheck className="w-8 h-8 text-gold" />
          </div>
          <h2 className="font-heading text-[2rem] font-bold text-white mb-2">
            Member Registered!
          </h2>
          <p className="text-[13px] text-white/50 mb-8">
            Account created and membership activated.
          </p>

          <div className="space-y-3 text-left border-t border-white/10 pt-6 mb-8">
            {[
              ['Name', success.name],
              ['Email', success.email],
              ['Member ID', success.id],
              ['Plan', success.plan],
              ['Status', 'Active'],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between text-[13px]">
                <span className="text-white/40">{label}</span>
                <span
                  className={`font-semibold ${
                    label === 'Status'
                      ? 'text-sage'
                      : label === 'Member ID'
                        ? 'text-gold font-mono'
                        : 'text-white'
                  }`}
                >
                  {val}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="outlineLight" size="sm" className="flex-1" onClick={handleReset}>
              Register Another
            </Button>
            <Button variant="primaryLight" size="sm" className="flex-1">
              Print ID Card
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  /* ── Form view ── */
  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      <Eyebrow className="mb-5">Reception</Eyebrow>
      <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05] mb-4">
        Register New Member
      </h1>
      <p className="text-[15px] text-ink-2 font-light leading-[1.7] max-w-xl mb-14">
        Create a new member account and activate their membership.
      </p>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-14">
        {/* Personal Information */}
        <section>
          <Eyebrow tone="muted" className="mb-3">Step 1</Eyebrow>
          <h2 className="font-heading text-[1.5rem] font-bold text-ink tracking-[-0.01em] mb-8">
            Personal Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <Input label="First Name" placeholder="Arjun" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} error={errors.firstName} />
            <Input label="Last Name" placeholder="Mehta" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} error={errors.lastName} />
            <Input label="Email Address" type="email" placeholder="arjun.mehta@gmail.com" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
            <Input label="Phone Number" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone} />
            <Input label="Date of Birth" type="date" value={form.dob} onChange={(e) => set('dob', e.target.value)} error={errors.dob} />
            <Select label="Gender" value={form.gender} onChange={(e) => set('gender', e.target.value)}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other / Prefer not to say</option>
            </Select>
          </div>
          <div className="mt-8">
            <Input label="Address (Optional)" placeholder="123 Fitness Street, Mumbai" value={form.address} onChange={(e) => set('address', e.target.value)} />
          </div>
        </section>

        {/* Emergency Contact */}
        <section>
          <Eyebrow tone="muted" className="mb-3">Step 2</Eyebrow>
          <h2 className="font-heading text-[1.5rem] font-bold text-ink tracking-[-0.01em] mb-8">
            Emergency Contact
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <Input label="Contact Name" placeholder="Sunita Mehta" value={form.emergencyName} onChange={(e) => set('emergencyName', e.target.value)} />
            <Input label="Contact Phone" type="tel" placeholder="+91 98765 43210" value={form.emergencyPhone} onChange={(e) => set('emergencyPhone', e.target.value)} />
          </div>
        </section>

        {/* Membership Plan */}
        <section>
          <Eyebrow tone="muted" className="mb-3">Step 3</Eyebrow>
          <h2 className="font-heading text-[1.5rem] font-bold text-ink tracking-[-0.01em] mb-8">
            Membership Plan
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {PLANS.map((p) => {
              const isSelected = form.plan === p.id;
              return (
                <Card
                  key={p.id}
                  hover
                  onClick={() => set('plan', p.id)}
                  className={`p-6 cursor-pointer ${isSelected ? 'ring-2 ring-gold' : ''}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Eyebrow tone="gold">{p.name}</Eyebrow>
                    {isSelected && (
                      <span className="w-5 h-5 bg-gold text-coal flex items-center justify-center">
                        <HiCheck className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="font-heading text-[1.25rem] font-bold text-ink mb-2">{p.price}</p>
                  <p className="text-[12px] text-ink-3">{p.features}</p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Account Setup */}
        <section>
          <Eyebrow tone="muted" className="mb-3">Step 4</Eyebrow>
          <h2 className="font-heading text-[1.5rem] font-bold text-ink tracking-[-0.01em] mb-8">
            Account Setup
          </h2>
          <div className="max-w-sm">
            <Input
              label="Temporary Password"
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              error={errors.password}
              hint="Member will be prompted to change on first login."
            />
          </div>
        </section>

        {/* Submit */}
        <div className="flex gap-4 justify-end border-t border-ink/10 pt-10">
          <Button type="button" variant="outlineDark" onClick={() => { setForm(INITIAL); setErrors({}); }}>
            Reset
          </Button>
          <Button type="submit" variant="primary" disabled={loading} icon={HiArrowRight}>
            {loading ? 'Registering…' : 'Register Member'}
          </Button>
        </div>
      </form>
    </div>
  );
}
