import { Outlet, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { IMAGES } from '../constants/assets';


const AuthLayout = () => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (isAuthenticated) {
     const redirect = new URLSearchParams(location.search).get('redirect');
     if (redirect) return <Navigate to={redirect} replace />;
     
     // Only redirect if on a generic auth page. 
     // Allow access to specialized login pages if the user specifically navigated there.
     const isSpecializedLogin = ['/manager/login', '/tailor/login', '/admin/login'].includes(location.pathname);
     
     if (!isSpecializedLogin) {
       if (user?.role === 'admin' || user?.role === 'super_admin') {
         return <Navigate to="/admin" replace />;
       }
       if (user?.role === 'manager') {
         return <Navigate to="/manager/dashboard" replace />;
       }
       if (user?.role === 'tailor') {
         return <Navigate to="/tailor/dashboard" replace />;
       }
       return <Navigate to="/my/profile" replace />;
     }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-neutral-cream">
      {/* Left side Form Area */}
      <div className="flex flex-col justify-center px-4 sm:px-12 lg:px-24 xl:px-32 relative py-20 md:py-0">
        <Link to="/" className="absolute top-6 sm:top-8 left-4 sm:left-12 text-2xl font-serif font-bold text-primary-700 tracking-wide">
          Vasanthi
        </Link>
        <div className="w-full max-w-md mx-auto">
          <Outlet />
        </div>
      </div>
      
      {/* Right side Image/Branding Area */}
      <div className="hidden md:flex bg-primary-900 justify-center items-center relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
          style={{ backgroundImage: `url('${IMAGES.bridal}')` }}
        ></div>
        <div className="relative z-10 text-center p-12 text-neutral-cream max-w-lg">
          <h2 className="text-4xl font-serif mb-6 leading-tight">Authentic Elegance <br/>For Every Occasion</h2>
          <p className="text-lg opacity-80 text-neutral-beige">
            Discover a curated collection of premium ethnic wear crafted with passion and tradition.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
