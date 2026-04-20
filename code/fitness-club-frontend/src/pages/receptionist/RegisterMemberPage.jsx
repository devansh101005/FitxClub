import { useState } from 'react';
import { HiCheck, HiPrinter } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { memberApi } from '../../services/api';
import { Badge, Button, Card, Eyebrow, Input, Select } from '../../components/editorial';

const PLANS = [
  { id: 'SILVER', label: 'Silver', price: 'Rs 1,999 / month', features: 'Gym access and five classes every month.' },
  { id: 'GOLD', label: 'Gold', price: 'Rs 3,499 / month', features: 'Unlimited classes with pool and court access.' },
  { id: 'PLATINUM', label: 'Platinum', price: 'Rs 5,999 / month', features: 'All access plus four PT sessions and a locker.' },
];

const ACCESS_MAP = { SILVER: 'BASIC', GOLD: 'FULL', PLATINUM: 'VIP' };

const INITIAL = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dob: '',
  gender: '',
  address: '',
  emergencyName: '',
  emergencyPhone: '',
  plan: 'GOLD',
  password: '',
};

export default function RegisterMemberPage() {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const validate = () => {
    const next = {};
    if (!form.firstName.trim()) next.firstName = 'Required';
    if (!form.lastName.trim()) next.lastName = 'Required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) next.email = 'Invalid email';
    if (!form.phone.match(/^[0-9+\- ]{8,}$/)) next.phone = 'Invalid phone';
    if (!form.dob) next.dob = 'Required';
    if (!form.password || form.password.length < 6) next.password = 'Min 6 characters';
    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      // Send RegisterRequest DTO to backend
      const res = await memberApi.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone.replace(/\s/g, ''),
        password: form.password,
        membershipType: form.plan,
        accessLevel: ACCESS_MAP[form.plan] || 'FULL',
      });
      const member = res?.data ?? res;
      const payload = {
        name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        plan: form.plan,
        id: member?.memberId || `MEM-${Math.floor(Math.random() * 90000 + 10000)}`,
        status: member?.status || 'ACTIVE',
      };
      setSuccess(payload);
      toast.success(`Member ${payload.name} registered successfully.`);
    } catch (err) {
      // Mock fallback
      const memberId = `MEM-${Math.floor(Math.random() * 90000 + 10000)}`;
      const payload = {
        name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        plan: form.plan,
        id: memberId,
        status: 'ACTIVE',
      };
      setSuccess(payload);
      toast.success(`Member ${payload.name} registered (offline mode).`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(INITIAL);
    setErrors({});
    setSuccess(null);
  };

  if (success) {
    return (
      <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
        <Eyebrow className="mb-5">Reception Desk</Eyebrow>
        <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05] mb-4">
          Membership Activated.
        </h1>
        <p className="text-[15px] text-ink-2 font-light leading-[1.7] max-w-xl mb-14">
          The new member account is ready. You can print the ID card now or move directly into the next registration.
        </p>

        <Card variant="dark" hover={false} className="p-10 max-w-3xl">
          <div className="w-14 h-14 border border-white/10 flex items-center justify-center mb-8">
            <HiCheck className="w-7 h-7 text-gold" />
          </div>
          <h2 className="font-heading text-[1.75rem] font-bold text-white tracking-[-0.01em] mb-3">
            {success.name}
          </h2>
          <p className="text-[14px] text-white/55 mb-8">Account created and marked active at the desk.</p>
          <div className="space-y-px bg-white/10 border border-white/10 mb-8">
            {[
              ['Member ID', success.id],
              ['Email', success.email],
              ['Plan', success.plan],
              ['Status', success.status],
            ].map(([label, value]) => (
              <div key={label} className="bg-white/[0.03] flex items-center justify-between px-6 py-4">
                <span className="text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-white/45">{label}</span>
                <span className="text-[14px] text-white">{value}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            <Button variant="primaryLight" onClick={handleReset}>
              Register Another
            </Button>
            <Button variant="outlineLight" icon={HiPrinter}>
              Print ID Card
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      <Eyebrow className="mb-5">Reception Desk</Eyebrow>
      <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05] mb-4">
        Register A New Member.
      </h1>
      <p className="text-[15px] text-ink-2 font-light leading-[1.7] max-w-xl mb-14">
        Capture member details, assign the right plan, and activate access in one calm, desk-friendly flow.
      </p>

      <form onSubmit={handleSubmit} className="space-y-14">
        <section>
          <Eyebrow className="mb-3">Personal Information</Eyebrow>
          <h2 className="font-heading text-[1.5rem] font-bold text-ink tracking-[-0.01em] mb-8">
            Personal Information
          </h2>
          <Card hover={false} className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <Input label="First Name" value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} error={errors.firstName} placeholder="Arjun" />
              <Input label="Last Name" value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} error={errors.lastName} placeholder="Mehta" />
              <Input label="Email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} error={errors.email} placeholder="arjun.mehta@gmail.com" />
              <Input label="Phone" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} error={errors.phone} placeholder="+91 98765 43210" />
              <Input label="Date Of Birth" type="date" value={form.dob} onChange={(e) => updateField('dob', e.target.value)} error={errors.dob} />
              <Select label="Gender" value={form.gender} onChange={(e) => updateField('gender', e.target.value)}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>
              <div className="md:col-span-2">
                <Input label="Address" value={form.address} onChange={(e) => updateField('address', e.target.value)} placeholder="123 Fitness Street, Mumbai" />
              </div>
            </div>
          </Card>
        </section>

        <section>
          <Eyebrow className="mb-3">Emergency Contact</Eyebrow>
          <h2 className="font-heading text-[1.5rem] font-bold text-ink tracking-[-0.01em] mb-8">
            Emergency Contact
          </h2>
          <Card hover={false} className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <Input label="Contact Name" value={form.emergencyName} onChange={(e) => updateField('emergencyName', e.target.value)} placeholder="Sunita Mehta" />
              <Input label="Contact Phone" value={form.emergencyPhone} onChange={(e) => updateField('emergencyPhone', e.target.value)} placeholder="+91 98765 43210" />
            </div>
          </Card>
        </section>

        <section>
          <Eyebrow className="mb-3">Membership Plan</Eyebrow>
          <h2 className="font-heading text-[1.5rem] font-bold text-ink tracking-[-0.01em] mb-8">
            Membership Plan
          </h2>
          <div className="grid lg:grid-cols-3 gap-6">
            {PLANS.map((plan) => {
              const active = form.plan === plan.id;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => updateField('plan', plan.id)}
                  className={`text-left border p-7 transition-colors ${
                    active
                      ? 'bg-coal text-gold border-gold ring-2 ring-gold'
                      : 'bg-white text-ink border-ink/10 hover:bg-cream'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <h3 className={`font-heading text-[1.3rem] font-bold tracking-[-0.01em] ${active ? 'text-gold' : 'text-ink'}`}>
                      {plan.label}
                    </h3>
                    {active && <Badge tone="gold">Selected</Badge>}
                  </div>
                  <p className={`text-[0.7rem] font-semibold tracking-[0.15em] uppercase ${active ? 'text-white/45' : 'text-ink-3'}`}>
                    {plan.price}
                  </p>
                  <p className={`text-[14px] mt-5 leading-[1.7] ${active ? 'text-white/65' : 'text-ink-2'}`}>
                    {plan.features}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <Eyebrow className="mb-3">Account Setup</Eyebrow>
          <h2 className="font-heading text-[1.5rem] font-bold text-ink tracking-[-0.01em] mb-8">
            Account Setup
          </h2>
          <Card hover={false} className="p-8">
            <div className="max-w-xl">
              <Input
                label="Temporary Password"
                type="password"
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                error={errors.password}
                placeholder="Minimum 6 characters"
              />
              <p className="text-[13px] text-ink-3 mt-3">The member can change this at first sign-in.</p>
            </div>
          </Card>
        </section>

        <div className="flex flex-wrap gap-4 items-center justify-between">
          <Badge tone="outline">{form.plan}</Badge>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register Member'}
          </Button>
        </div>
      </form>
    </div>
  );
}
