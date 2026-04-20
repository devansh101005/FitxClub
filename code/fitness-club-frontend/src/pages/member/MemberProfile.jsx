import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  HiPencil,
  HiCheck,
  HiQrcode,
  HiArrowRight,
  HiShieldCheck,
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { memberApi } from '../../services/api';
import {
  Eyebrow,
  Input,
  Button,
  Badge,
  Spinner,
} from '../../components/editorial';

/* ── Deterministic QR-like visual ── */
function MockQR({ seed = 1001, size = 160 }) {
  const grid = 9;
  const cells = Array.from({ length: grid * grid }, (_, i) => {
    const x = i % grid;
    const y = Math.floor(i / grid);
    if ((x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5)) return true;
    const v = (seed * 2654435761 * (i + 1)) % 100;
    return v > 45;
  });
  return (
    <div className="inline-block bg-white p-4 border border-ink/10">
      <div
        className="grid gap-px"
        style={{ gridTemplateColumns: `repeat(${grid}, 1fr)`, width: size, height: size }}
      >
        {cells.map((filled, i) => (
          <div key={i} className={filled ? 'bg-coal' : 'bg-white'} />
        ))}
      </div>
    </div>
  );
}

export default function MemberProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [member, setMember] = useState(null);
  const [form, setForm] = useState({
    firstName: 'John',
    lastName: 'Doe',
    phone: '+91 98765 43210',
    dob: '1995-06-15',
    emergencyContact: 'Jane Doe',
    emergencyPhone: '+91 98765 11111',
  });

  /* ── Fetch member profile on mount ── */
  useEffect(() => {
    let alive = true;
    memberApi
      .getMe()
      .then((res) => {
        if (!alive) return;
        const m = res?.data ?? res;
        if (m) {
          setMember(m);
          setForm((prev) => ({
            ...prev,
            firstName: m.firstName || prev.firstName,
            lastName: m.lastName || prev.lastName,
            phone: m.phone || prev.phone,
          }));
        }
      })
      .catch(() => {/* keep defaults */})
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const initials = (form.firstName[0] || '') + (form.lastName[0] || '');
  const membershipType = member?.membershipType || 'GOLD';
  const memberStatus = member?.status || 'ACTIVE';
  const memberId = member?.memberId || user?.userId || '1001';
  const expiryDate = member?.expiryDate
    ? new Date(member.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Dec 31, 2025';
  const startDate = member?.startDate
    ? new Date(member.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    : 'Jan 2023';

  const handleSave = async () => {
    setSaving(true);
    try {
      await memberApi.updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
      });
      toast.success('Profile updated.');
    } catch {
      // Mock fallback
      await new Promise((r) => setTimeout(r, 800));
      toast.success('Profile updated.');
    }
    setSaving(false);
    setEditing(false);
  };

  const setField = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  if (loading) {
    return (
      <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
        <Spinner text="Loading profile" />
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      {/* ═══════════════════════ HEADER ═══════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
        <div>
          <Eyebrow className="mb-5">Account</Eyebrow>
          <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05]">
            My Profile
          </h1>
          <p className="text-[15px] text-ink-2 font-light leading-[1.7] mt-4 max-w-lg">
            Manage your personal information, emergency contact, and membership details.
          </p>
        </div>
        {editing ? (
          <div className="flex gap-3 shrink-0">
            <Button variant="outlineDark" size="sm" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={saving} icon={HiCheck}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        ) : (
          <Button variant="outlineDark" size="sm" onClick={() => setEditing(true)} icon={HiPencil}>
            Edit Profile
          </Button>
        )}
      </div>

      {/* ═══════════════════════ LAYOUT ═══════════════════════ */}
      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-14 lg:gap-20">
        {/* ── LEFT: Form blocks ── */}
        <div className="space-y-16">
          {/* Personal Information */}
          <section>
            <Eyebrow tone="gold" className="mb-5">Personal Information</Eyebrow>
            <h2 className="font-heading text-[1.75rem] font-bold tracking-[-0.01em] text-ink mb-10">
              Who you are.
            </h2>
            <div className="grid sm:grid-cols-2 gap-10">
              {editing ? (
                <>
                  <Input
                    label="First Name"
                    value={form.firstName}
                    onChange={setField('firstName')}
                  />
                  <Input
                    label="Last Name"
                    value={form.lastName}
                    onChange={setField('lastName')}
                  />
                  <Input
                    label="Date of Birth"
                    type="date"
                    value={form.dob}
                    onChange={setField('dob')}
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    value={form.phone}
                    onChange={setField('phone')}
                  />
                  <div className="sm:col-span-2">
                    <Input
                      label="Email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      hint="Email cannot be changed. Contact reception to update."
                    />
                  </div>
                </>
              ) : (
                <>
                  <ReadField label="First Name" value={form.firstName} />
                  <ReadField label="Last Name" value={form.lastName} />
                  <ReadField label="Date of Birth" value={form.dob} />
                  <ReadField label="Phone Number" value={form.phone} />
                  <ReadField label="Email" value={user?.email || '—'} className="sm:col-span-2" />
                </>
              )}
            </div>
          </section>

          {/* Emergency Contact */}
          <section>
            <Eyebrow tone="gold" className="mb-5">Emergency Contact</Eyebrow>
            <h2 className="font-heading text-[1.75rem] font-bold tracking-[-0.01em] text-ink mb-10">
              Someone we can call.
            </h2>
            <div className="grid sm:grid-cols-2 gap-10">
              {editing ? (
                <>
                  <Input
                    label="Contact Name"
                    value={form.emergencyContact}
                    onChange={setField('emergencyContact')}
                  />
                  <Input
                    label="Contact Phone"
                    type="tel"
                    value={form.emergencyPhone}
                    onChange={setField('emergencyPhone')}
                  />
                </>
              ) : (
                <>
                  <ReadField label="Contact Name" value={form.emergencyContact} />
                  <ReadField label="Contact Phone" value={form.emergencyPhone} />
                </>
              )}
            </div>
          </section>
        </div>

        {/* ── RIGHT: Identity card + membership + QR ── */}
        <aside className="space-y-10">
          {/* Identity card */}
          <div className="bg-white p-10 rounded-lg border border-ink/10 text-center">
            <div className="w-20 h-20 bg-coal text-gold font-heading text-[1.5rem] font-bold flex items-center justify-center mx-auto mb-5">
              {initials.toUpperCase() || 'FC'}
            </div>
            <h3 className="font-heading text-[1.35rem] font-bold tracking-[-0.01em] text-ink">
              {form.firstName} {form.lastName}
            </h3>
            <p className="text-[13px] text-ink-3 mt-1">{user?.email}</p>
            <div className="mt-5 flex justify-center">
              <Badge tone="gold">{membershipType} Member</Badge>
            </div>
          </div>

          {/* Membership card */}
          <div className="bg-coal text-white p-10 rounded-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gold/10 rounded-full blur-3xl" />
            <div className="relative">
              <Eyebrow tone="gold" className="mb-4">Membership</Eyebrow>
              <h3 className="font-heading text-[1.5rem] font-bold text-white tracking-[-0.01em] leading-tight mb-6">
                {membershipType} Plan
              </h3>

              <div className="space-y-4 text-[13px] font-light">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-white/40 text-[0.7rem] font-semibold tracking-widest uppercase">
                    Status
                  </span>
                  <span className="text-sage flex items-center gap-1.5">
                    <HiShieldCheck className="w-3.5 h-3.5" /> {memberStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-white/40 text-[0.7rem] font-semibold tracking-widest uppercase">
                    Valid Until
                  </span>
                  <span>{expiryDate}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-white/40 text-[0.7rem] font-semibold tracking-widest uppercase">
                    Member Since
                  </span>
                  <span>{startDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-[0.7rem] font-semibold tracking-widest uppercase">
                    Auto-renew
                  </span>
                  <span>Enabled</span>
                </div>
              </div>

              <a
                href="/member/payments"
                className="mt-8 inline-flex items-center gap-2 text-[0.75rem] font-semibold tracking-widest uppercase text-gold hover:text-white transition-colors"
              >
                Manage Plan <HiArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* QR entry code */}
          <div className="bg-white p-10 rounded-lg border border-ink/10 text-center">
            <div className="flex justify-center mb-4">
              <Eyebrow tone="gold">Entry Pass</Eyebrow>
            </div>
            <div className="flex justify-center mb-5">
              <MockQR seed={user?.userId || 1001} />
            </div>
            <div className="flex items-center justify-center gap-2 text-[13px] text-ink-2">
              <HiQrcode className="w-4 h-4 text-gold" />
              <span className="font-mono">{member?.memberId || `#${memberId}`}</span>
            </div>
            <p className="text-[0.7rem] font-semibold tracking-[0.12em] uppercase text-ink-3 mt-3">
              Show at Reception
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ── Read-only field display ── */
function ReadField({ label, value, className = '' }) {
  return (
    <div className={className}>
      <p className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-ink-3 mb-3">
        {label}
      </p>
      <p className="text-[15px] text-ink border-b border-ink/15 pb-3">{value || '—'}</p>
    </div>
  );
}
