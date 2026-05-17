import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiArrowRight, HiExclamationCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Eyebrow, Input, Button, Select } from '../../components/editorial';
import logo from '../../assets/logo.png';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&q=80';

const MEMBERSHIP_OPTIONS = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'ANNUAL', label: 'Annual' },
];

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    membershipType: 'MONTHLY',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signup({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        membershipType: form.membershipType,
      });
      toast.success('Welcome to Fitness Club.');
      navigate('/member');
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-editorial min-h-screen grid lg:grid-cols-[1fr_1.1fr] bg-[#FAFAF9]">
      {/* ═══════════════ LEFT — FORM ═══════════════ */}
      <div className="relative flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-16 order-2 lg:order-1">
        {/* Mobile brand mark */}
        <Link to="/" className="lg:hidden flex items-center gap-2 mb-12">
          <img src={logo} alt="Fitness Club Logo" className="w-8 h-8 object-contain" />
          <span className="font-extrabold text-[1.2rem] text-[#111] tracking-[-0.02em]">
            FitnessClub
          </span>
        </Link>

        <div className="max-w-md w-full mx-auto animate-fade-in-up">
          <Eyebrow className="mb-5">Create Account</Eyebrow>
          <h1 className="font-heading text-[clamp(2.25rem,4vw,3.25rem)] font-bold tracking-[-0.02em] text-[#1A1A1A] leading-[1.05] mb-5">
            Begin Your<br />Membership.
          </h1>
          <p className="text-[15px] text-[#6B6B6B] font-light leading-[1.7] mb-10">
            One account. Every facility. All-access by default — change it anytime.
          </p>

          {error && (
            <div className="mb-8 flex items-start gap-3 border-l-2 border-red-500 bg-red-500/5 px-5 py-4">
              <HiExclamationCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-red-600 mb-1">
                  Signup Failed
                </p>
                <p className="text-[14px] text-[#1A1A1A]">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-5">
              <Input
                label="First Name"
                value={form.firstName}
                onChange={update('firstName')}
                placeholder="Jane"
                required
                autoComplete="given-name"
              />
              <Input
                label="Last Name"
                value={form.lastName}
                onChange={update('lastName')}
                placeholder="Doe"
                required
                autoComplete="family-name"
              />
            </div>

            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={update('email')}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />

            <Input
              label="Phone"
              type="tel"
              value={form.phone}
              onChange={update('phone')}
              placeholder="9999999999"
              required
              autoComplete="tel"
            />

            <Select
              label="Membership Plan"
              value={form.membershipType}
              onChange={update('membershipType')}
            >
              {MEMBERSHIP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>

            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={update('password')}
              placeholder="At least 8 characters"
              required
              autoComplete="new-password"
            />

            <Input
              label="Confirm Password"
              type="password"
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading}
              icon={HiArrowRight}
              className="w-full !mt-8"
            >
              {loading ? 'Creating Account…' : 'Create Account'}
            </Button>
          </form>

          <div className="flex items-center gap-4 my-10">
            <div className="flex-1 h-px bg-[#1A1A1A]/10" />
            <span className="text-[0.65rem] font-semibold tracking-[0.2em] uppercase text-[#9A9A9A]">
              Already a Member
            </span>
            <div className="flex-1 h-px bg-[#1A1A1A]/10" />
          </div>

          <div className="text-center">
            <p className="text-[14px] text-[#6B6B6B] font-light leading-[1.7] mb-4">
              Already have an account? Sign in to continue.
            </p>
            <Button variant="link" to="/login" icon={HiArrowRight}>
              Sign In Instead
            </Button>
          </div>
        </div>

        <Link
          to="/"
          className="absolute bottom-8 left-6 sm:left-12 lg:left-20 text-[0.7rem] font-semibold tracking-[0.12em] uppercase text-[#9A9A9A] hover:text-[#1A1A1A] transition-colors"
        >
          ← Back to Home
        </Link>
      </div>

      {/* ═══════════════ RIGHT — EDITORIAL IMAGE ═══════════════ */}
      <div className="relative hidden lg:block overflow-hidden bg-[#0A0A0A] order-1 lg:order-2">
        <img
          src={HERO_IMAGE}
          alt="Training"
          className="absolute inset-0 w-full h-full object-cover brightness-[0.6]"
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#0A0A0A]/30 via-transparent to-[#0A0A0A]/85" />

        <Link to="/" className="absolute top-10 right-10 flex items-center gap-2 z-10">
          <img src={logo} alt="Fitness Club Logo" className="w-8 h-8 object-contain filter brightness-0 invert" />
          <span className="font-extrabold text-[1.2rem] text-white tracking-[-0.02em]">
            FitnessClub
          </span>
        </Link>

        <div className="absolute bottom-12 left-10 right-10 z-10 max-w-md">
          <Eyebrow tone="gold" className="mb-5">What&apos;s Included</Eyebrow>
          <p className="font-heading text-[1.6rem] font-normal italic text-white leading-[1.35] mb-8">
            &ldquo;The first session is the hardest. Every one after compounds.&rdquo;
          </p>
          <ul className="space-y-3 text-[14px] text-white/80 font-light">
            <li className="flex items-start gap-3">
              <span className="w-1 h-1 bg-gold mt-2.5 shrink-0" />
              <span>Full access to all facilities — gym, pool, courts, studios.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1 h-1 bg-gold mt-2.5 shrink-0" />
              <span>Personal QR pass for keyless entry.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1 h-1 bg-gold mt-2.5 shrink-0" />
              <span>Book classes, courts, and 1-on-1 PT sessions in seconds.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
