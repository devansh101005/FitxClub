/**
 * DashboardTopBar — white 72px bar for authenticated pages.
 * Matches PublicNavbar structure but with user menu instead of CTAs.
 */
import { Link, useNavigate } from 'react-router-dom';
import { HiMenu, HiLogout, HiSearch, HiBell } from 'react-icons/hi';
import { useAuth } from '../../../context/AuthContext';
import logo from '../../../assets/logo.png';

const ROLE_HOME = {
  MEMBER: '/member',
  TRAINER: '/trainer',
  RECEPTIONIST: '/receptionist',
  ADMIN: '/admin',
  MANAGER: '/admin',
};

export default function DashboardTopBar({ onMenuToggle, roleLabel }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitials = user?.email
    ? user.email.split('@')[0].slice(0, 2).toUpperCase()
    : 'FC';

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E5E5E5]">
      <div className="flex items-center justify-between h-[72px] px-6 lg:px-10">
        {/* Left — mobile toggle + logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 text-[#111] hover:text-[#757575] transition-colors"
            aria-label="Toggle menu"
          >
            <HiMenu className="w-5 h-5" />
          </button>

          <Link
            to={user ? ROLE_HOME[user.role] : '/'}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <img src={logo} alt="Fitness Club Logo" className="w-8 h-8 object-contain" />
            <span className="font-extrabold text-[1.2rem] text-[#111] tracking-[-0.02em] hidden sm:block">
              FitnessClub
            </span>
          </Link>

          {roleLabel && (
            <>
              <span className="hidden md:block w-px h-5 bg-[#E5E5E5] mx-2" />
              <span className="hidden md:inline-block text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-[#9A9A9A]">
                {roleLabel}
              </span>
            </>
          )}
        </div>

        {/* Right — search + bell + user + logout */}
        <div className="flex items-center gap-3">
          <button
            className="hidden md:flex items-center gap-2 bg-[#F5F5F5] rounded-full px-4 py-2 hover:bg-[#E5E5E5] transition-colors duration-200"
            aria-label="Search"
          >
            <HiSearch className="w-[18px] h-[18px] text-[#111]" />
            <span className="text-[0.85rem] text-[#757575]">Search</span>
          </button>

          <button
            className="p-2 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
            aria-label="Notifications"
          >
            <HiBell className="w-5 h-5" />
          </button>

          {/* User identity */}
          <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-[#E5E5E5]">
            <div className="w-9 h-9 bg-[#0A0A0A] rounded-full flex items-center justify-center">
              <span className="font-heading text-[0.8rem] text-[#C9A96E]">{userInitials}</span>
            </div>
            <div className="text-right leading-tight">
              <p className="text-[0.8rem] font-semibold text-[#1A1A1A]">
                {user?.email?.split('@')[0]}
              </p>
              <p className="text-[0.65rem] font-semibold tracking-[0.1em] uppercase text-[#9A9A9A]">
                {user?.role}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
            aria-label="Log out"
            title="Log out"
          >
            <HiLogout className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
