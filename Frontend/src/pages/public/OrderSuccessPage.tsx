import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // If somehow landed here directly without auth, push back to home safely.
    if (!isAuthenticated) {
      navigate('/');
    }
    // Scroll to top
    window.scrollTo(0, 0);
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-neutral-cream py-20 flex items-center justify-center">
      <div className="max-w-2xl px-4 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="bg-white rounded-2xl shadow-premium border border-gray-100 overflow-hidden"
        >
          {/* Header Banner */}
          <div className="bg-primary-950 p-10 text-center relative overflow-hidden">
            {/* Soft decorative blur */}
            <div className="absolute inset-0 bg-accent/20 filter blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 opacity-50"></div>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10"
            >
              <CheckCircle size={40} className="text-primary-950" strokeWidth={2} />
            </motion.div>
            
            <h1 className="text-3xl font-serif text-white mb-2 relative z-10">Order Confirmed!</h1>
            <p className="text-primary-100 text-sm tracking-wide relative z-10">
              Thank you for shopping with Vasanthi Creations, {user?.name?.split(' ')[0]}.
            </p>
          </div>

          <div className="p-8 sm:p-12">
            
            {/* Order Snippet */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-8 flex flex-col sm:flex-row sm:items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold mb-1">Order Reference</p>
                <p className="text-lg font-bold text-primary-950">{orderId}</p>
              </div>
              <div className="mt-4 sm:mt-0 text-left sm:text-right">
                <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold mb-1">Date</p>
                <p className="text-sm font-medium text-gray-900">{new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            <div className="space-y-6 mb-10 text-center sm:text-left">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                  <Package size={20} className="text-primary-800" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Preparing for Dispatch</h4>
                  <p className="text-sm text-gray-600 leading-relaxed max-w-sm">
                    We've received your order and are preparing it closely. You will receive an email confirmation with tracking details once your handcrafted items ship.
                  </p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/my/orders" 
                className="flex-1 border border-primary-300 text-primary-800 rounded py-3.5 flex items-center justify-center text-sm font-bold uppercase tracking-widest hover:bg-primary-50 transition-colors"
              >
                Track Order
              </Link>
              <Link 
                to="/shop" 
                className="flex-1 bg-primary-950 text-white rounded py-3.5 flex items-center justify-center text-sm font-bold uppercase tracking-widest hover:bg-primary-800 transition-colors shadow-soft group"
              >
                <span>Continue Shopping</span>
                <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>
        </motion.div>
        
        <div className="mt-8 text-center">
          <Link to="/" className="inline-flex items-center text-gray-500 hover:text-primary-700 transition-colors text-sm font-medium">
            <Home size={16} className="mr-2" />
            Back to Homepage
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccessPage;
