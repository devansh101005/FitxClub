import { useEffect, useState } from 'react';
import {
  HiPencil,
  HiCheck,
  HiX,
  HiPlus,
  HiStar,
  HiBadgeCheck,
  HiMail,
  HiPhone,
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { trainerApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Eyebrow,
  Button,
  Card,
  Input,
  Textarea,
  Badge,
  Spinner,
} from '../../components/editorial';

const SPECIALTIES_ALL = [
  'HIIT', 'Yoga', 'Pilates', 'Cycling', 'Strength', 'Boxing',
  'Zumba', 'Stretching', 'Cardio', 'CrossFit', 'Nutrition', 'Rehabilitation',
];

const FALLBACK_PROFILE = {
  firstName: 'Alex',
  lastName: 'Morgan',
  phone: '+91 99887 76655',
  bio: 'NSCA-certified strength coach with 8 years of experience transforming lives through fitness. Passionate about helping clients unlock their full potential using evidence-based training methodologies.',
  specialties: ['HIIT', 'Strength', 'Boxing'],
  certs: ['NSCA-CPT', 'CrossFit L2', 'TRX Certified', 'First Aid & CPR'],
  experience: '8',
  instagram: '@alexmorganfitness',
  rating: 4.9,
  totalSessions: 842,
};

const STATS = [
  { value: '47', label: 'Active Clients' },
  { value: '18', label: 'Classes / Month' },
  { value: '842', label: 'PT Sessions' },
  { value: '8+', label: 'Years Experience' },
];

function normalizeProfile(data) {
  if (!data) return FALLBACK_PROFILE;

  const fullName = data.name || '';
  const [firstName = FALLBACK_PROFILE.firstName, ...rest] = fullName.split(' ').filter(Boolean);
  const lastName = rest.join(' ') || FALLBACK_PROFILE.lastName;

  return {
    ...FALLBACK_PROFILE,
    ...data,
    firstName,
    lastName,
    phone: data.phone || FALLBACK_PROFILE.phone,
    specialties: data.specialties
      || (typeof data.specialization === 'string'
        ? data.specialization.split(',').map((s) => s.trim()).filter(Boolean)
        : FALLBACK_PROFILE.specialties),
    certs: data.certs
      || (typeof data.certifications === 'string'
        ? data.certifications.split(',').map((s) => s.trim()).filter(Boolean)
        : FALLBACK_PROFILE.certs),
  };
}

export default function TrainerProfile() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(FALLBACK_PROFILE);
  const [certInput, setCertInput] = useState('');

  useEffect(() => {
    let alive = true;
    trainerApi
      .getMyProfile()
      .then((res) => {
        if (!alive) return;
        const data = res?.data ?? res;
        if (data) setProfile(normalizeProfile(data));
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const toggleSpecialty = (s) => {
    setProfile((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(s)
        ? prev.specialties.filter((x) => x !== s)
        : [...prev.specialties, s],
    }));
  };

  const addCert = () => {
    const name = certInput.trim();
    if (!name) return;
    setProfile((prev) => ({ ...prev, certs: [...prev.certs, name] }));
    setCertInput('');
  };

  const removeCert = (c) =>
    setProfile((prev) => ({ ...prev, certs: prev.certs.filter((x) => x !== c) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await trainerApi.updateProfile({
        specialization: profile.specialties.join(', '),
        bio: profile.bio,
        certifications: profile.certs.join(', '),
      });
    } catch {
      // mock
    }
    setSaving(false);
    setEditing(false);
    toast.success('Profile updated successfully!');
  };

  const initials =
    `${(profile.firstName || '')[0] || ''}${(profile.lastName || '')[0] || ''}`.toUpperCase() || 'TR';

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
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
        <div>
          <Eyebrow className="mb-5">Trainer Profile</Eyebrow>
          <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05]">
            My Profile
          </h1>
          <p className="text-[15px] text-ink-2 font-light leading-[1.7] mt-4 max-w-lg">
            Manage your trainer profile visible to members and clients.
          </p>
        </div>
        {editing ? (
          <div className="flex gap-3">
            <Button
              variant="outlineDark"
              size="sm"
              onClick={() => setEditing(false)}
              icon={HiX}
              iconPosition="left"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={saving}
              icon={HiCheck}
              iconPosition="left"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        ) : (
          <Button
            variant="outlineDark"
            size="sm"
            onClick={() => setEditing(true)}
            icon={HiPencil}
            iconPosition="left"
          >
            Edit Profile
          </Button>
        )}
      </div>

      {/* ═══════════════════════ MAIN GRID ═══════════════════════ */}
      <div className="grid lg:grid-cols-[1fr_1.8fr] gap-14 lg:gap-20">
        {/* ── LEFT: Identity + Stats ── */}
        <div className="space-y-10">
          {/* Identity card */}
          <Card hover={false} variant="dark" className="p-8 text-center">
            <div className="w-20 h-20 bg-gold text-coal font-heading text-[1.75rem] font-bold flex items-center justify-center mx-auto mb-5">
              {initials}
            </div>
            <h3 className="font-heading text-[1.5rem] font-bold text-white leading-tight">
              {profile.firstName} {profile.lastName}
            </h3>
            <p className="text-[13px] text-white/50 mt-1">{user?.email}</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <HiStar className="w-4 h-4 text-gold" />
              <span className="font-heading text-[1rem] font-bold text-white">
                {profile.rating}
              </span>
              <span className="text-[12px] text-white/40">
                · {profile.totalSessions} sessions
              </span>
            </div>
            <Badge status="ACTIVE" className="mt-5">Active Trainer</Badge>
          </Card>

          {/* Stats */}
          <div className="space-y-5">
            <Eyebrow tone="muted">Statistics</Eyebrow>
            <div className="space-y-px bg-ink/10 border border-ink/10">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="bg-white px-6 py-4 flex items-center justify-between"
                >
                  <span className="text-[13px] text-ink-3">{s.label}</span>
                  <span className="font-heading text-[1.15rem] font-bold text-ink">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-5">
            <Eyebrow tone="muted">Contact</Eyebrow>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-[13px] text-ink-2">
                <HiMail className="w-4 h-4 text-gold shrink-0" />
                {user?.email || 'trainer@fitnessclub.com'}
              </div>
              <div className="flex items-center gap-3 text-[13px] text-ink-2">
                <HiPhone className="w-4 h-4 text-gold shrink-0" />
                {profile.phone}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Profile Sections ── */}
        <div className="space-y-14">
          {/* Personal Details */}
          <section>
            <Eyebrow tone="muted" className="mb-3">Personal Information</Eyebrow>
            <h2 className="font-heading text-[1.5rem] font-bold text-ink tracking-[-0.01em] mb-8">
              Details
            </h2>
            <div className="grid sm:grid-cols-2 gap-8">
              {editing ? (
                <>
                  <Input
                    label="First Name"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  />
                  <Input
                    label="Last Name"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  />
                  <Input
                    label="Phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                  <Input
                    label="Years Experience"
                    value={profile.experience}
                    onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                  />
                  <Input
                    label="Instagram"
                    value={profile.instagram}
                    onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                  />
                </>
              ) : (
                <>
                  {[
                    ['First Name', profile.firstName],
                    ['Last Name', profile.lastName],
                    ['Phone', profile.phone],
                    ['Years Experience', profile.experience],
                    ['Instagram', profile.instagram],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-gold mb-2">
                        {label}
                      </p>
                      <p className="text-[15px] text-ink border-b border-ink/10 pb-3">
                        {val || '—'}
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </section>

          {/* Bio */}
          <section>
            <Eyebrow tone="muted" className="mb-3">About</Eyebrow>
            <h2 className="font-heading text-[1.5rem] font-bold text-ink tracking-[-0.01em] mb-8">
              Bio
            </h2>
            {editing ? (
              <Textarea
                label="Your Bio"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={4}
                placeholder="Tell members about your training philosophy…"
              />
            ) : (
              <p className="text-[15px] text-ink-2 font-light leading-[1.7]">
                {profile.bio}
              </p>
            )}
          </section>

          {/* Specialties */}
          <section>
            <Eyebrow tone="muted" className="mb-3">Expertise</Eyebrow>
            <h2 className="font-heading text-[1.5rem] font-bold text-ink tracking-[-0.01em] mb-8">
              Specialties
            </h2>
            {editing ? (
              <div className="flex flex-wrap gap-3">
                {SPECIALTIES_ALL.map((s) => {
                  const active = profile.specialties.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSpecialty(s)}
                      className={`px-4 py-2 text-[0.7rem] font-semibold tracking-[0.12em] uppercase border transition-colors ${
                        active
                          ? 'bg-coal text-gold border-coal'
                          : 'bg-transparent text-ink-3 border-ink/15 hover:border-ink/30'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {profile.specialties.map((s) => (
                  <span
                    key={s}
                    className="px-4 py-2 text-[0.7rem] font-semibold tracking-[0.12em] uppercase bg-coal text-gold"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Certifications */}
          <section>
            <div className="flex items-end justify-between mb-8">
              <div>
                <Eyebrow tone="muted" className="mb-3">Credentials</Eyebrow>
                <h2 className="font-heading text-[1.5rem] font-bold text-ink tracking-[-0.01em]">
                  Certifications
                </h2>
              </div>
            </div>

            <div className="space-y-px bg-ink/10 border border-ink/10">
              {profile.certs.map((c) => (
                <div
                  key={c}
                  className="bg-white px-6 py-4 flex items-center gap-4"
                >
                  <HiBadgeCheck className="w-5 h-5 text-gold shrink-0" />
                  <span className="text-[14px] text-ink flex-1">{c}</span>
                  {editing && (
                    <button
                      type="button"
                      onClick={() => removeCert(c)}
                      className="text-ink-3 hover:text-red-500 transition-colors"
                    >
                      <HiX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {editing && (
              <div className="flex items-end gap-4 mt-6">
                <div className="flex-1">
                  <Input
                    label="Add Certification"
                    value={certInput}
                    onChange={(e) => setCertInput(e.target.value)}
                    placeholder="e.g. ACE-CPT"
                  />
                </div>
                <Button
                  variant="outlineDark"
                  size="sm"
                  onClick={addCert}
                  icon={HiPlus}
                  iconPosition="left"
                >
                  Add
                </Button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
