import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../api/services/auth.service';
import { 
  Scissors, 
  LayoutDashboard, 
  LogOut, 
  Menu,
  X,
  Activity
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import NotificationBell from '../components/notifications/NotificationBell';
import NotificationDrawer from '../components/notifications/NotificationDrawer';
import AttendanceControls from '../components/workforce/AttendanceControls';

const TailorLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize Realtime operational hooks


  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      toast.success('Logged out successfully');
      navigate('/tailor/login');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/tailor/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'My Tasks', path: '/tailor/tasks', icon: <Scissors size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-900">
      
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200">
        <div className="h-16 flex items-center justify-center border-b border-gray-200 bg-gray-50/50">
          <h1 className="text-xl font-bold tracking-widest text-gray-900 uppercase">Production</h1>
        </div>

        <div className="p-4 flex items-center space-x-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold overflow-hidden">
             {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
             ) : (
                user?.name.charAt(0)
             )}
          </div>
          <div>
            <p className="text-sm font-semibold truncate max-w-[140px]">{user?.name}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Tailor</p>
          </div>
        </div>

        {/* Realtime Status Indicator */}
        <div className="px-6 py-3 border-b border-gray-50 bg-gray-50/30">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
              System Online
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navLinks.map((link) => (
              <li key={link.name}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-gray-900 text-white shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <span className="mr-3">{link.icon}</span>
                  <span className="font-medium text-sm">{link.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>

        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-20 shadow-sm shrink-0">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-lg font-bold tracking-widest text-gray-900 uppercase">Production</h1>
          </div>
          <NotificationBell />
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex h-20 bg-white border-b border-gray-200 items-center justify-between px-8 z-10 shrink-0">
           <div className="flex items-center gap-4">
             <div className="p-1.5 bg-emerald-100 rounded-md">
               <Activity size={16} className="text-emerald-600" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
               Live Production Node
             </span>
           </div>
           <div className="flex items-center gap-6">
             <AttendanceControls />
             <NotificationBell />
           </div>
        </header>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-10">
             <nav className="py-2">
              <ul className="space-y-1 px-2">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <NavLink
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-3 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-gray-900 text-white' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`
                      }
                    >
                      <span className="mr-3">{link.icon}</span>
                      <span className="font-medium text-sm">{link.name}</span>
                    </NavLink>
                  </li>
                ))}
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <LogOut size={20} className="mr-3" />
                    Sign Out
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      <NotificationDrawer />
    </div>
  );
};

export default TailorLayout;
