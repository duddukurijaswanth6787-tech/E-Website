import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-neutral-cream">
      {/* Left side Form Area */}
      <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-24 xl:px-32 relative">
        <Link to="/" className="absolute top-8 left-8 sm:left-12 text-2xl font-serif font-bold text-primary-700 tracking-wide">
          Vasanthi
        </Link>
        <div className="w-full max-w-md mx-auto">
          <Outlet />
        </div>
      </div>
      
      {/* Right side Image/Branding Area */}
      <div className="hidden md:flex bg-primary-900 justify-center items-center relative overflow-hidden">
        {/* Placeholder image overlay */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1610030469983-98e550d61b36?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
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
