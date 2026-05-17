/**
 * PublicNavbar — sticky white 72px navbar with:
 *  - FC logo mark (left)
 *  - absolute-centered nav links (hover underline grows from center)
 *  - search pill + login + "Get Started" CTA (right)
 *  - mobile hamburger drawer
 *
 * Extracted verbatim from LandingPage.jsx so every public page reads
 * identical at the top.
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiMenu, HiX, HiSearch } from 'react-icons/hi';
import { useAuth } from '../../../context/AuthContext';
import logo from '../../../assets/logo.png';

const DEFAULT_LINKS = [
  { label: 'Classes', to: '/schedule' },
  { label: 'Trainers', to: '/trainers' },
  { label: 'Facilities', to: '/facilities' },
  { label: 'Membership', href: '#membership' },
];

export default function PublicNavbar({ links = DEFAULT_LINKS, className = '' }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 w-full bg-white border-b border-[#E5E5E5] transition-shadow duration-300 ${
        scrolled ? 'shadow-[0_2px_8px_rgba(0,0,0,0.08)]' : ''
      } ${className}`}
    >
      <div className="relative flex items-center justify-between h-[72px] px-6 lg:px-10">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <img src={logo} alt="Fitness Club Logo" className="w-8 h-8 object-contain" />
          <span className="font-extrabold text-[1.2rem] text-[#111] tracking-[-0.02em]">
            FitnessClub
          </span>
        </Link>

        {/* Center nav — absolute centered */}
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {links.map((link) => {
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

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-4">
          <button className="flex items-center gap-2 bg-[#F5F5F5] rounded-full px-4 py-2 hover:bg-[#E5E5E5] transition-colors duration-200">
            <HiSearch className="w-[18px] h-[18px] text-[#111]" />
            <span className="text-[0.85rem] text-[#757575]">Search</span>
          </button>
          {user ? (
            <>
              <Link
                to={roleHome[user.role] || '/'}
                className="text-[0.85rem] font-medium text-[#111] hover:text-[#757575] transition-colors duration-200"
              >
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
              <Link
                to="/login"
                className="text-[0.85rem] font-medium text-[#111] hover:text-[#757575] transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-[#111] text-white text-[0.8rem] font-medium px-5 py-2 rounded-full hover:bg-[#333] transition-colors duration-200"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-[#111]"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <HiX className="w-5 h-5" /> : <HiMenu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[#E5E5E5] px-6 py-5 space-y-1">
          {links.map((link) => {
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
                <Link
                  to={roleHome[user.role] || '/'}
                  onClick={() => setMobileOpen(false)}
                  className="block text-center py-2.5 text-[0.85rem] font-medium text-[#111] hover:text-[#757575] transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full text-center py-2.5 bg-[#111] text-white text-[0.85rem] font-medium rounded-full"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center py-2.5 text-[0.85rem] font-medium text-[#111] hover:text-[#757575] transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center py-2.5 bg-[#111] text-white text-[0.85rem] font-medium rounded-full"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
