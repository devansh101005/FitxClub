/**
 * DashboardSidebar — editorial sidebar for authenticated pages.
 *  - Warm off-white bg (#FAFAF9) with subtle right border
 *  - Uppercase section label at top
 *  - Nav items: minimal, gold left-rail on active, no neon glows
 *  - Mobile drawer variant on < lg
 *
 * Pulls menu config from routes/sidebarMenus.js based on user role.
 */
import { NavLink } from 'react-router-dom';
import { HiX } from 'react-icons/hi';
import { useAuth } from '../../../context/AuthContext';
import { sidebarMenus } from '../../../routes/sidebarMenus';

const ROLE_ROOTS = ['/member', '/trainer', '/receptionist', '/admin'];

export default function DashboardSidebar({ open, onClose }) {
  const { user } = useAuth();
  const menu = sidebarMenus[user?.role] || [];

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-[#0A0A0A]/30 backdrop-blur-[2px] z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-[260px] bg-[#FAFAF9] border-r border-[#E5E5E5]
          transform transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto lg:flex-shrink-0
          flex flex-col
        `}
      >
        {/* Mobile close bar */}
        <div className="flex items-center justify-between h-[72px] px-6 border-b border-[#E5E5E5] lg:hidden">
          <span className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-[#9A9A9A]">
            Menu
          </span>
          <button
            onClick={onClose}
            className="p-2 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
            aria-label="Close menu"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop section label */}
        <div className="hidden lg:block px-8 pt-10 pb-6">
          <span className="text-[0.65rem] font-semibold tracking-[0.2em] uppercase text-[#C9A96E]">
            {user?.role || 'Account'}
          </span>
          <p className="mt-2 font-heading text-[1.25rem] font-bold text-[#1A1A1A] leading-tight">
            {user?.email?.split('@')[0] || 'Welcome'}
          </p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-4 lg:px-5 pb-8 space-y-1">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={ROLE_ROOTS.includes(item.path)}
              onClick={onClose}
              className={({ isActive }) => `
                group flex items-center gap-3 pl-4 pr-3 py-3
                text-[0.85rem] font-medium tracking-[0.01em]
                border-l-2 transition-all duration-200
                ${
                  isActive
                    ? 'border-l-[#C9A96E] text-[#1A1A1A] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)]'
                    : 'border-l-transparent text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-l-[#1A1A1A]/30'
                }
              `}
            >
              {item.icon && (
                <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              )}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer tag */}
        <div className="hidden lg:block px-8 py-5 border-t border-[#E5E5E5]">
          <p className="text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-[#9A9A9A]">
            FitnessClub &middot; v1.0
          </p>
        </div>
      </aside>
    </>
  );
}
