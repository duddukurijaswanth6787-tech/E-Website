import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const UserLayout = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="flex flex-col min-h-screen bg-neutral-cream">
      {/* Simple header for user dashboard */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-serif font-bold text-primary-700 tracking-wide">
            Vasanthi Creations
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Hello, {user?.name || 'Customer'}</span>
            <button onClick={logout} className="text-sm text-red-600 hover:text-red-800">Logout</button>
          </div>
        </div>
      </header>

      <div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-soft p-4 flex flex-col space-y-2 border border-gray-50">
            <Link to="/my" className="px-4 py-2 text-sm font-medium rounded-lg bg-primary-50 text-primary-700">Dashboard</Link>
            <Link to="/my/orders" className="px-4 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 hover:text-primary-700">Orders</Link>
            <Link to="/my/wishlist" className="px-4 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 hover:text-primary-700">Wishlist</Link>
            <Link to="/my/custom-requests" className="px-4 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 hover:text-primary-700">Custom Requests</Link>
            <Link to="/my/addresses" className="px-4 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 hover:text-primary-700">Addresses</Link>
            <Link to="/my/settings" className="px-4 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 hover:text-primary-700">Profile Settings</Link>
          </div>
        </aside>

        {/* Dynamic Content */}
        <main className="flex-grow bg-white rounded-xl shadow-soft border border-gray-50 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
