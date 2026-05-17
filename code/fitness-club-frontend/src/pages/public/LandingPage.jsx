import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiMenu, HiX, HiArrowRight, HiCheck, HiStar, HiSearch,
} from 'react-icons/hi';
import { FiInstagram, FiTwitter, FiYoutube, FiFacebook } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

/* ── DATA ── */

const STATS = [
  { value: '2,400+', label: 'Active Members' },
  { value: '48', label: 'Expert Trainers' },
  { value: '12', label: 'Facilities' },
  { value: '98%', label: 'Satisfaction' },
];

const FEATURES = [
  { num: '01', title: 'Smart Class Booking', desc: 'Book any class from any device. Real-time availability, instant confirmation, and a frictionless experience across every touchpoint.' },
  { num: '02', title: 'Personal Training', desc: 'Connect with certified trainers for 1-on-1 sessions. Track your progress, set goals, and achieve results that last.' },
  { num: '03', title: 'Facility Access', desc: 'QR-powered contactless entry, live occupancy tracking, and seamless check-in at every location.' },
];

const CAPABILITIES = [
  { title: 'Real-time Analytics', desc: 'Live dashboards tracking revenue, attendance, and performance.' },
  { title: 'Role-based Access', desc: 'Tailored views for members, trainers, receptionists, and admins.' },
  { title: 'Integrated Payments', desc: 'Razorpay-powered billing with automatic invoicing.' },
  { title: 'QR Access Control', desc: 'Secure, contactless entry across all your facilities.' },
];

const TRAINERS = [
  { initials: 'RS', name: 'Rahul Sharma', role: 'Strength & Conditioning', rating: 4.9 },
  { initials: 'SC', name: 'Sarah Chen', role: 'Yoga & Mindfulness', rating: 4.8 },
  { initials: 'PM', name: 'Prateek Malhotra', role: 'CrossFit & Cardio', rating: 4.9 },
];

/* ── COMPONENT ── */

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const NAV_LINKS = [
    { label: 'Classes', href: '#features' },
    { label: 'Trainers', href: '#trainers' },
    { label: 'Programs', href: '#features' },
    { label: 'Facilities', to: '/facilities' },
  ];

  const roleHome = {
    MEMBER: '/member',
    TRAINER: '/trainer',
    RECEPTIONIST: '/receptionist',
    ADMIN: '/admin',
    MANAGER: '/admin',
  };

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <div className="font-editorial text-[#1A1A1A] scroll-smooth">

      {/* ═══════════════════════ UTILITY BAR ═══════════════════════ */}
      <div className="w-full h-8 bg-[#F5F5F5] border-b border-[#E5E5E5] hidden md:flex items-center justify-end px-10">
        {['Find a Club', 'Help', 'Join Us'].map((item, i) => (
          <a
            key={item}
            href="#"
            className={`text-[0.7rem] font-medium text-[#111] hover:text-[#757575] transition-colors duration-200 px-3 ${
              i > 0 ? 'border-l border-[#A0A0A0]' : ''
            }`}
          >
            {item}
          </a>
        ))}
      </div>

      {/* ═══════════════════════ NAVBAR — Solid White, Sticky ═══════════════════════ */}
      <nav className={`sticky top-0 z-50 w-full bg-white border-b border-[#E5E5E5] transition-shadow duration-300 ${
        scrolled ? 'shadow-[0_2px_8px_rgba(0,0,0,0.08)]' : ''
      }`}>
        <div className="relative flex items-center justify-between h-[72px] px-6 lg:px-10">
          {/* Logo — left */}
          <Link to="/" className="flex items-center gap-2 z-10 flex-shrink-0">
            <img src={logo} alt="Fitness Club Logo" className="w-8 h-8 object-contain" />
            <span className="font-extrabold text-[1.2rem] text-[#111] tracking-[-0.02em]">FitnessClub</span>
          </Link>

          {/* Center nav links — absolute centered on viewport */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {NAV_LINKS.map((link) => {
              const El = link.to ? Link : 'a';
              const props = link.to ? { to: link.to } : { href: link.href };
              return (
                <El
                  key={link.label}
                  {...props}
                  className="relative text-[0.95rem] font-medium text-[#111] py-1 group"
                >
                  {link.label}
                  <span className="absolute bottom-[-2px] left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[#111] transition-all duration-300 group-hover:w-full" />
                </El>
              );
            })}
          </div>

          {/* Right — Search + Login + CTA */}
          <div className="hidden md:flex items-center gap-4">
            <button className="flex items-center gap-2 bg-[#F5F5F5] rounded-full px-4 py-2 hover:bg-[#E5E5E5] transition-colors duration-200">
              <HiSearch className="w-[18px] h-[18px] text-[#111]" />
              <span className="text-[0.85rem] text-[#757575]">Search</span>
            </button>
            {user ? (
              <>
                <Link to={roleHome[user.role] || '/'} className="text-[0.85rem] font-medium text-[#111] hover:text-[#757575] transition-colors duration-200">
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="bg-[#111] text-white text-[0.8rem] font-medium px-5 py-2 rounded-full hover:bg-[#333] transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-[0.85rem] font-medium text-[#111] hover:text-[#757575] transition-colors duration-200">
                  Login
                </Link>
                <Link to="/signup" className="bg-[#111] text-white text-[0.8rem] font-medium px-5 py-2 rounded-full hover:bg-[#333] transition-colors duration-200">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-[#111]" aria-label="Toggle menu">
            {mobileOpen ? <HiX className="w-5 h-5" /> : <HiMenu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-[#E5E5E5] px-6 py-5 space-y-1">
            {NAV_LINKS.map((link) => {
              const El = link.to ? Link : 'a';
              const props = link.to ? { to: link.to } : { href: link.href };
              return (
                <El
                  key={link.label}
                  {...props}
                  onClick={() => setMobileOpen(false)}
                  className="block text-[0.95rem] font-medium text-[#111] py-3 hover:text-[#757575] transition-colors"
                >
                  {link.label}
                </El>
              );
            })}
            <div className="pt-4 space-y-3 border-t border-[#E5E5E5]">
              {user ? (
                <>
                  <Link to={roleHome[user.role] || '/'} onClick={() => setMobileOpen(false)} className="block text-center py-2.5 text-[0.85rem] font-medium text-[#111] hover:text-[#757575] transition-colors">Dashboard</Link>
                  <button type="button" onClick={handleLogout} className="block w-full text-center py-2.5 bg-[#111] text-white text-[0.85rem] font-medium rounded-full">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-center py-2.5 text-[0.85rem] font-medium text-[#111] hover:text-[#757575] transition-colors">Login</Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)} className="block text-center py-2.5 bg-[#111] text-white text-[0.85rem] font-medium rounded-full">Get Started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ═══════════════════════ PAGE LABEL BAR ═══════════════════════ */}
      <div className="w-full py-3 px-6 lg:px-10 bg-white border-b border-[#E5E5E5]">
        <span className="text-[0.95rem] font-bold text-[#111] tracking-[-0.01em]">Premium Training</span>
      </div>

      {/* ═══════════════════════ HERO — VIDEO BACKGROUND (below nav) ═══════════════════════ */}
      <section className="relative w-full h-[calc(100vh-64px-48px-36px)] min-h-[500px] max-h-[800px] overflow-hidden flex items-center justify-center bg-[#0A0A0A]">
        {/* Video wrapper */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80"
            className="w-full h-full object-cover object-center md:block hidden"
          >
            <source src="/gym-video.mp4" type="video/mp4" />
          </video>
          {/* Mobile: poster-only fallback */}
          <div
            className="md:hidden absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80')" }}
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-b from-black/15 via-black/40 to-black/60" />
        </div>

        {/* Hero content — centered */}
        <div className="relative z-5 text-center max-w-[800px] px-8 animate-fade-in-up">
          <span className="block text-[0.75rem] font-semibold tracking-[0.2em] uppercase text-white/70 mb-6">
            Premium Fitness
          </span>

          <h1 className="font-heading text-[clamp(2.5rem,5vw,5rem)] font-bold tracking-[-0.02em] leading-[1.05] text-white mb-4">
            Elevate Your<br />Potential
          </h1>

          <p className="text-[1.1rem] font-light text-white/80 leading-relaxed max-w-[500px] mx-auto mb-10">
            World-class training. Luxury facilities. Results that speak.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/signup"
              className="bg-white text-[#0A0A0A] text-[0.8rem] font-semibold tracking-[0.15em] uppercase px-10 py-4 transition-all duration-300 hover:bg-[#C9A96E] hover:text-white hover:-translate-y-0.5"
            >
              Start Your Journey
            </Link>
            <a
              href="#features"
              className="border border-white/40 text-white text-[0.8rem] font-medium tracking-[0.12em] uppercase px-10 py-4 transition-all duration-300 hover:bg-white/10 hover:border-white/80"
            >
              Explore Classes
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-5 flex flex-col items-center gap-3">
          <span className="text-[0.7rem] tracking-[0.15em] uppercase text-white/50 font-medium">Scroll</span>
          <div className="w-px h-10 bg-white/30 relative overflow-hidden">
            <div className="absolute left-0 w-full h-full bg-white/80 animate-scroll-down" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════ STATS ═══════════════════════ */}
      <section className="bg-[#0A0A0A] py-20 lg:py-24 border-t border-white/[0.04]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16">
            {STATS.map((s, i) => (
              <div key={i} className="text-center">
                <span className="font-heading text-[clamp(2.5rem,4vw,4rem)] font-bold text-[#C9A96E] leading-none block">{s.value}</span>
                <p className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-white/35 mt-3">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FEATURES ═══════════════════════ */}
      <section id="features" className="bg-[#FAFAF9] py-24 lg:py-36">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          {/* Section header */}
          <div className="mb-20">
            <span className="text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-[#C9A96E]">What We Offer</span>
            <h2 className="font-heading text-[clamp(2rem,3.5vw,3.2rem)] font-bold tracking-[-0.02em] text-[#1A1A1A] mt-4 leading-[1.1]">
              Everything you need.<br />
              <span className="text-[#1A1A1A]/25">Nothing you don&apos;t.</span>
            </h2>
          </div>

          {/* Numbered editorial feature list */}
          <div className="border-t border-[#1A1A1A]/10">
            {FEATURES.map((f) => (
              <div key={f.num} className="grid md:grid-cols-[80px_1fr_1.2fr] gap-4 md:gap-12 py-10 lg:py-14 border-b border-[#1A1A1A]/10 group">
                <span className="font-heading text-[2.5rem] font-bold text-[#C9A96E]/25 leading-none group-hover:text-[#C9A96E]/50 transition-colors duration-500">{f.num}</span>
                <h3 className="text-[1.3rem] font-semibold text-[#1A1A1A] tracking-[-0.01em] self-center">{f.title}</h3>
                <p className="text-[15px] text-[#6B6B6B] leading-[1.7] self-center">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ WHY — SPLIT SECTION ═══════════════════════ */}
      <section className="bg-[#0A0A0A]">
        <div className="grid md:grid-cols-2 max-w-[1400px] mx-auto">
          {/* Image side */}
          <div className="relative min-h-[400px] md:min-h-[600px] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80"
              alt="Athlete training"
              className="absolute inset-0 w-full h-full object-cover brightness-[0.7] hover:scale-[1.03] transition-transform duration-700"
            />
          </div>

          {/* Content side */}
          <div className="py-16 lg:py-24 px-8 lg:px-16 flex flex-col justify-center">
            <span className="text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-[#C9A96E] mb-5">Why FitnessClub</span>
            <h2 className="font-heading text-[clamp(2rem,3vw,3rem)] font-bold tracking-[-0.02em] text-white leading-[1.1] mb-4">
              The Platform Built<br />for Champions.
            </h2>
            <p className="text-[15px] text-white/40 font-light leading-[1.7] mb-10 max-w-sm">
              Designed for premium fitness clubs that demand more from their technology.
            </p>

            <div className="space-y-5">
              {CAPABILITIES.map((c, i) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="w-5 h-5 border border-[#C9A96E]/40 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-[#C9A96E]/10 transition-colors duration-300">
                    <HiCheck className="w-3 h-3 text-[#C9A96E]" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-semibold text-white mb-0.5">{c.title}</h4>
                    <p className="text-[13px] text-white/40 leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ TRAINERS ═══════════════════════ */}
      <section id="trainers" className="bg-[#F5F5F0] py-24 lg:py-36">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between mb-16">
            <div>
              <span className="text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-[#C9A96E]">Expert Trainers</span>
              <h2 className="font-heading text-[clamp(2rem,3.5vw,3.2rem)] font-bold tracking-[-0.02em] text-[#1A1A1A] mt-4 leading-[1.1]">
                World-class<br />instruction.
              </h2>
            </div>
            <Link to="/trainers" className="hidden md:flex items-center gap-2 text-[0.8rem] font-medium tracking-[0.08em] uppercase text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors duration-300 pb-3">
              View All <HiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {TRAINERS.map((t, i) => (
              <div key={i} className="bg-white rounded-lg p-7 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-[#0A0A0A] rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#C9A96E] transition-colors duration-300">
                  <span className="font-heading text-lg text-white">{t.initials}</span>
                </div>
                <h3 className="text-[17px] font-semibold text-[#1A1A1A] mb-1">{t.name}</h3>
                <p className="text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-[#9A9A9A] mb-5">{t.role}</p>
                <div className="flex items-center gap-1.5 pt-5 border-t border-[#1A1A1A]/[0.06]">
                  <HiStar className="w-4 h-4 text-[#C9A96E]" />
                  <span className="text-[14px] font-semibold text-[#1A1A1A]">{t.rating}</span>
                  <span className="text-[12px] text-[#9A9A9A] ml-1">rating</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ CTA BANNER — FULL-BLEED IMAGE ═══════════════════════ */}
      <section className="relative py-28 lg:py-36 bg-[#0A0A0A]">
        <img
          src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1920&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover brightness-[0.25]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 via-transparent to-[#0A0A0A]/40" />

        <div className="relative text-center max-w-2xl mx-auto px-6">
          <span className="text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-[#C9A96E] block mb-6">
            Start Today
          </span>
          <h2 className="font-heading text-[clamp(2.5rem,5vw,4rem)] font-bold tracking-[-0.02em] text-white leading-[1.1] mb-5">
            Ready to Transform?
          </h2>
          <p className="text-[15px] text-white/45 font-light leading-[1.7] mb-12 max-w-md mx-auto">
            Join thousands of athletes and premium clubs already achieving more with FitnessClub.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/signup"
              className="bg-white text-[#0A0A0A] text-[0.8rem] font-semibold tracking-[0.15em] uppercase px-10 py-4 transition-all duration-300 hover:bg-[#C9A96E] hover:text-white hover:-translate-y-0.5"
            >
              Get Started Today
            </Link>
            <button className="border border-white/30 text-white text-[0.8rem] font-medium tracking-[0.12em] uppercase px-10 py-4 transition-all duration-300 hover:bg-white/10 hover:border-white/60">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FOOTER ═══════════════════════ */}
      <footer className="bg-[#FAFAF9] relative">
        {/* Glass divider strip */}
        <div className="relative">
          <div className="h-px bg-linear-to-r from-transparent via-black/[0.06] to-transparent" />
          <div className="absolute -top-2 inset-x-0 h-4 bg-linear-to-b from-transparent to-white/60 backdrop-blur-[4px] pointer-events-none" />
        </div>

        {/* Main footer content */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-20 pb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-16">
            {/* Column 1 — Resources */}
            <div>
              <h4 className="text-[0.85rem] font-bold tracking-[0.1em] uppercase text-[#1A1A1A] mb-6">Resources</h4>
              <ul className="space-y-0">
                {['Gift Cards', 'Find a Location', 'Membership', 'Journal'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-[0.875rem] text-[#6B6B6B] leading-[2.2] hover:text-[#1A1A1A] transition-colors duration-300">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2 — Help */}
            <div>
              <h4 className="text-[0.85rem] font-bold tracking-[0.1em] uppercase text-[#1A1A1A] mb-6">Help</h4>
              <ul className="space-y-0">
                {['Get Help', 'Contact Us', 'FAQs', 'Returns'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-[0.875rem] text-[#6B6B6B] leading-[2.2] hover:text-[#1A1A1A] transition-colors duration-300">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 — Company */}
            <div>
              <h4 className="text-[0.85rem] font-bold tracking-[0.1em] uppercase text-[#1A1A1A] mb-6">Company</h4>
              <ul className="space-y-0">
                {['About Us', 'Careers', 'News', 'Investors'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-[0.875rem] text-[#6B6B6B] leading-[2.2] hover:text-[#1A1A1A] transition-colors duration-300">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4 — Connect */}
            <div>
              <h4 className="text-[0.85rem] font-bold tracking-[0.1em] uppercase text-[#1A1A1A] mb-6">Connect</h4>
              <div className="flex items-center gap-5">
                <a href="#" aria-label="Instagram" className="text-[#9A9A9A] hover:text-[#1A1A1A] transition-colors duration-300">
                  <FiInstagram className="w-5 h-5" />
                </a>
                <a href="#" aria-label="Twitter" className="text-[#9A9A9A] hover:text-[#1A1A1A] transition-colors duration-300">
                  <FiTwitter className="w-5 h-5" />
                </a>
                <a href="#" aria-label="YouTube" className="text-[#9A9A9A] hover:text-[#1A1A1A] transition-colors duration-300">
                  <FiYoutube className="w-5 h-5" />
                </a>
                <a href="#" aria-label="Facebook" className="text-[#9A9A9A] hover:text-[#1A1A1A] transition-colors duration-300">
                  <FiFacebook className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-black/[0.08]">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[0.75rem] text-[#9A9A9A]">&copy; 2025 FitnessClub. All Rights Reserved.</p>
            <div className="flex items-center gap-2 text-[0.75rem] text-[#9A9A9A]">
              <a href="#" className="hover:text-[#1A1A1A] transition-colors duration-300">Privacy Policy</a>
              <span className="text-[#D4D4D4]">&middot;</span>
              <a href="#" className="hover:text-[#1A1A1A] transition-colors duration-300">Terms of Use</a>
              <span className="text-[#D4D4D4]">&middot;</span>
              <a href="#" className="hover:text-[#1A1A1A] transition-colors duration-300">Cookie Settings</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
