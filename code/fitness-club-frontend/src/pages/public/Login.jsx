import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiArrowRight, HiExclamationCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Eyebrow, Input, Button } from '../../components/editorial';
import logo from '../../assets/logo.png';

const ROLE_REDIRECT = {
  MEMBER: '/member',
  TRAINER: '/trainer',
  RECEPTIONIST: '/receptionist',
  ADMIN: '/admin',
  MANAGER: '/admin',
};

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80';

const DEMO_ACCOUNTS = [
  { label: 'Member', email: 'temp@test.com', password: 'Admin@123' },
  { label: 'Trainer', email: 'trainer@fitnessclub.com', password: 'Admin@123' },
  { label: 'Reception', email: 'reception@fitnessclub.com', password: 'Admin@123' },
  { label: 'Manager', email: 'manager@fitnessclub.com', password: 'Admin@123' },
  { label: 'Admin', email: 'admin@fitnessclub.com', password: 'Admin@123' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(email, password);
      toast.success('Welcome back.');
      navigate(ROLE_REDIRECT[user.role] || '/');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (account) => {
    setLoading(true);
    setError('');
    try {
      const user = await login(account.email, account.password);
      toast.success(`Logged in as ${account.label}.`);
      navigate(ROLE_REDIRECT[user.role] || '/');
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-editorial min-h-screen grid lg:grid-cols-[1.1fr_1fr] bg-[#FAFAF9]">
      {/* ═══════════════════════ LEFT — EDITORIAL IMAGE ═══════════════════════ */}
      <div className="relative hidden lg:block overflow-hidden bg-[#0A0A0A]">
        <img
          src={HERO_IMAGE}
          alt="Training"
          className="absolute inset-0 w-full h-full object-cover brightness-[0.6]"
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#0A0A0A]/30 via-transparent to-[#0A0A0A]/85" />

        {/* Brand mark top-left */}
        <Link to="/" className="absolute top-10 left-10 flex items-center gap-2 z-10 group">
          <img src={logo} alt="Fitness Club Logo" className="w-8 h-8 object-contain filter brightness-0 invert" />
          <span className="font-extrabold text-[1.2rem] text-white tracking-[-0.02em]">
            FitnessClub
          </span>
        </Link>

        {/* Quote block bottom */}
        <div className="absolute bottom-12 left-10 right-10 z-10 max-w-md">
          <Eyebrow tone="gold" className="mb-5">Members&apos; Words</Eyebrow>
          <p className="font-heading text-[1.6rem] font-normal italic text-white leading-[1.35] mb-6">
            &ldquo;The transformation wasn&apos;t just physical. It rewired how I show up every day.&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#C9A96E] rounded-full flex items-center justify-center">
              <span className="font-heading text-[0.8rem] text-white">PS</span>
            </div>
            <div>
              <p className="text-[0.85rem] font-semibold text-white">Priya Sharma</p>
              <p className="text-[0.7rem] font-semibold tracking-[0.12em] uppercase text-white/50">
                Member, 3 years
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════ RIGHT — FORM ═══════════════════════ */}
      <div className="relative flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-16">
        {/* Mobile brand mark */}
        <Link to="/" className="lg:hidden flex items-center gap-2 mb-12">
          <img src={logo} alt="Fitness Club Logo" className="w-8 h-8 object-contain" />
          <span className="font-extrabold text-[1.2rem] text-[#111] tracking-[-0.02em]">
            FitnessClub
          </span>
        </Link>

        <div className="max-w-md w-full mx-auto animate-fade-in-up">
          <Eyebrow className="mb-5">Member Access</Eyebrow>
          <h1 className="font-heading text-[clamp(2.25rem,4vw,3.25rem)] font-bold tracking-[-0.02em] text-[#1A1A1A] leading-[1.05] mb-5">
            Welcome<br />Back.
          </h1>
          <p className="text-[15px] text-[#6B6B6B] font-light leading-[1.7] mb-12">
            Sign in to continue your journey. Every session compounds.
          </p>

          {error && (
            <div className="mb-8 flex items-start gap-3 border-l-2 border-red-500 bg-red-500/5 px-5 py-4">
              <HiExclamationCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-red-600 mb-1">
                  Sign-in Failed
                </p>
                <p className="text-[14px] text-[#1A1A1A]">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />

            <div>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <div className="flex justify-end mt-3">
                <button
                  type="button"
                  className="text-[0.7rem] font-semibold tracking-[0.12em] uppercase text-[#9A9A9A] hover:text-[#C9A96E] transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading}
              icon={HiArrowRight}
              className="w-full"
            >
              {loading ? 'Signing In…' : 'Sign In'}
            </Button>
          </form>

          <div className="flex items-center gap-4 my-10">
            <div className="flex-1 h-px bg-[#1A1A1A]/10" />
            <span className="text-[0.65rem] font-semibold tracking-[0.2em] uppercase text-[#9A9A9A]">
              New Here
            </span>
            <div className="flex-1 h-px bg-[#1A1A1A]/10" />
          </div>

          <div className="text-center mb-12">
            <p className="text-[14px] text-[#6B6B6B] font-light leading-[1.7] mb-4">
              Don&apos;t have an account? Sign up in under a minute.
            </p>
            <Button variant="link" to="/signup" icon={HiArrowRight}>
              Create an Account
            </Button>
          </div>

          <div className="border-t border-[#1A1A1A]/10 pt-10">
            <Eyebrow tone="gold" className="mb-3">Try the Demo</Eyebrow>
            <p className="text-[13px] text-[#6B6B6B] font-light leading-[1.6] mb-5">
              Explore any role without signing up. One-click access to a pre-loaded account.
            </p>
            <div className="flex flex-wrap gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.label}
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoLogin(account)}
                  className="text-[0.7rem] font-semibold tracking-[0.12em] uppercase border border-[#1A1A1A]/20 bg-white px-4 py-2.5 text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {account.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Back to home — bottom-left */}
        <Link
          to="/"
          className="absolute bottom-8 left-6 sm:left-12 lg:left-20 text-[0.7rem] font-semibold tracking-[0.12em] uppercase text-[#9A9A9A] hover:text-[#1A1A1A] transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
