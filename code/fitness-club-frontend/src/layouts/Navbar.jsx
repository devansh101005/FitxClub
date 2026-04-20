import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiLogout, HiMenu } from 'react-icons/hi';
import Button from '../components/ui/Button';
import logo from '../assets/logo.png';

export default function Navbar({ onMenuToggle, showMenu = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleHome = {
    MEMBER: '/member', TRAINER: '/trainer', RECEPTIONIST: '/receptionist',
    ADMIN: '/admin', MANAGER: '/admin',
  };

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-xl bg-black/40 border-b border-white/10">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          {showMenu && (
            <button onClick={onMenuToggle} className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors">
              <HiMenu className="w-5 h-5" />
            </button>
          )}
          <Link to={user ? roleHome[user.role] : '/'} className="flex items-center gap-2">
            <img src={logo} alt="Fitness Club Logo" className="w-8 h-8 object-contain" />
            <span className="font-bold text-lg hidden sm:block">FitnessClub</span>
          </Link>
        </div>

        {!user ? (
          <div className="flex items-center gap-4">
            <Link to="/schedule" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">Schedule</Link>
            <Link to="/trainers" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">Trainers</Link>
            <Link to="/facilities" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">Facilities</Link>
            <Link to="/login"><Button size="sm">Login</Button></Link>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">{user.email}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white" title="Logout">
              <HiLogout className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
