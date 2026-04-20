import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sidebarMenus } from '../routes/sidebarMenus';
import { HiX } from 'react-icons/hi';

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const menu = sidebarMenus[user?.role] || [];

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-black/60 backdrop-blur-xl border-r border-white/10
        transform transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10 lg:hidden">
          <span className="font-bold">Menu</span>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10"><HiX className="w-5 h-5" /></button>
        </div>
        <div className="hidden lg:block h-16" />
        <nav className="p-3 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === `/member` || item.path === `/trainer` || item.path === `/receptionist` || item.path === `/admin`}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }
              `}
            >
              <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
