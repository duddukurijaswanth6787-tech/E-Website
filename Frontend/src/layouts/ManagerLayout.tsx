import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { managerAuthService } from '../api/services/managerAuth.service';
import { 
  LayoutDashboard, 
  KanbanSquare, 
  UsersRound, 
  LineChart,
  LogOut,
  Search,
  Settings,
  Menu,
  AlertTriangle,
  X as CloseIcon
} from 'lucide-react';

import NotificationBell from '../components/notifications/NotificationBell';
import NotificationDrawer from '../components/notifications/NotificationDrawer';
import ManagerSecurityGuard from '../components/manager/ManagerSecurityGuard';
import AttendanceControls from '../components/workforce/AttendanceControls';

const ManagerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, refreshToken } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize Realtime operational hooks

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await managerAuthService.logout(refreshToken);
      }
    } catch (err) {
      console.error(err);
    } finally {
      logout();
      navigate('/manager/login');
    }
  };

  const navItems = [
    { name: 'Dashboard Overview', path: '/manager/dashboard', icon: LayoutDashboard },
    { name: 'Workflow Board', path: '/manager/workflows', icon: KanbanSquare },
    { name: 'Workload & Tailors', path: '/manager/tailors', icon: UsersRound },
    { name: 'Escalations', path: '/manager/escalations', icon: AlertTriangle },
    { name: 'Productivity Analytics', path: '/manager/analytics', icon: LineChart },
  ];

  return (
    <ManagerSecurityGuard>
      <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row">
        {/* Sidebar - Industrial Dark Theme */}
        <aside className={`
          fixed inset-y-0 left-0 w-64 bg-stone-900 text-stone-300 flex flex-col shadow-xl z-[150] transition-transform duration-300 transform md:relative md:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="h-16 flex items-center justify-between px-6 border-b border-stone-800 bg-black/20">
            <span className="text-xl font-bold text-amber-500 uppercase tracking-widest">Ops Center</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-1 hover:bg-stone-800 rounded">
              <CloseIcon className="w-5 h-5 text-stone-400" />
            </button>
          </div>
          
          <div className="p-4 border-b border-stone-800 bg-stone-800/30">
            <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold mb-1">Active Manager</p>
            <p className="font-medium text-white truncate">{user?.name}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs text-emerald-400">System Online</span>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${
                    isActive 
                      ? 'bg-amber-500 text-stone-900 shadow-md shadow-amber-500/10' 
                      : 'hover:bg-stone-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-stone-900' : 'text-stone-400'}`} />
                  {item.name}
                </Link>
              );
            })}

          </nav>

          <div className="p-4 border-t border-stone-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 text-stone-400 hover:text-red-400 hover:bg-stone-800 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </aside>
        
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[140] md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-h-screen overflow-hidden bg-stone-50">
          {/* Top Header */}
          <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
            <div className="flex items-center gap-4 flex-1">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 text-stone-500 hover:bg-stone-100 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="relative w-full max-w-md hidden sm:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input 
                  type="text" 
                  placeholder="Search workflows, task IDs, or tailors..." 
                  className="w-full pl-9 pr-4 py-2 bg-stone-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <AttendanceControls />
              <NotificationBell />
              <button className="p-2 text-stone-500 hover:bg-stone-100 rounded-full transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Dynamic Page Content */}
          <div className="flex-1 overflow-auto relative">
            <Outlet />
          </div>
        </main>

        {/* Global Notification Center */}
        <NotificationDrawer />
      </div>
    </ManagerSecurityGuard>
  );
};

export default ManagerLayout;
