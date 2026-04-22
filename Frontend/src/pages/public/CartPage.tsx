import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';

const CartPage = () => {
  const { items, updateQuantity, removeItem, subtotal } = useCartStore();
  const navigate = useNavigate();

  const total = subtotal();
  const shipping = total > 5000 ? 0 : 250; 
  const grandTotal = total + shipping;

  return (
    <div className="min-h-screen bg-neutral-cream py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-serif text-primary-950 mb-4">Your Shopping Bag</h1>
          <div className="h-0.5 w-16 bg-accent mx-auto"></div>
        </div>

        {items.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center max-w-2xl mx-auto"
          >
            <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag size={40} className="text-primary-300" strokeWidth={1} />
            </div>
            <h2 className="text-2xl font-serif text-primary-950 mb-3">Your bag is empty</h2>
            <p className="text-gray-500 mb-8 max-w-sm">
              Looks like you haven't added any of our handcrafted pieces to your bag yet.
            </p>
            <Link 
              to="/shop" 
              className="bg-primary-950 text-white font-semibold uppercase tracking-widest px-8 py-4 rounded hover:bg-primary-800 transition-colors shadow-soft"
            >
              Continue Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10">
            
            {/* Left: Cart Items */}
            <div className="w-full lg:w-2/3 flex flex-col gap-6">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className="flex flex-col sm:flex-row bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 gap-6"
                  >
                    {/* Item Image */}
                    <Link to={`/product/${item.slug}`} className="w-full sm:w-32 aspect-[3/4] flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden group">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </Link>
                    
                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <Link to={`/product/${item.slug}`}>
                            <h3 className="font-serif text-lg text-primary-950 hover:text-primary-700 transition-colors mb-1">
                              {item.name}
                            </h3>
                          </Link>
                          {item.fabric && (
                            <p className="text-xs text-gray-500 mb-2">Fabric: {item.fabric}</p>
                          )}
                          <p className="text-sm font-semibold text-primary-800">
                            ₹{item.price.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors flex-shrink-0"
                          title="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-6 sm:mt-0">
                        {/* Quantity Control */}
                        <div className="flex items-center border border-gray-200 rounded-md">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1.5 text-gray-500 hover:text-primary-700 hover:bg-gray-50 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-gray-900">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1.5 text-gray-500 hover:text-primary-700 hover:bg-gray-50 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Line Total */}
                        <p className="text-base font-semibold text-primary-950">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Continue Shopping Link beneath items */}
              <div className="pt-4">
                <Link to="/shop" className="inline-flex items-center text-sm font-semibold tracking-widest uppercase text-primary-700 hover:text-primary-900 transition-colors border-b border-primary-700 pb-1">
                  &larr; Continue Shopping
                </Link>
              </div>
            </div>

            {/* Right: Order Summary Sidebar */}
            <div className="w-full lg:w-1/3 mt-8 lg:mt-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 lg:sticky lg:top-28">
                <h3 className="font-serif text-2xl text-primary-950 mb-6 border-b border-gray-100 pb-4">Order Summary</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({items.length} items)</span>
                    <span className="font-medium text-gray-900">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    {shipping === 0 ? (
                      <span className="font-medium text-green-600">Free</span>
                    ) : (
                      <span className="font-medium text-gray-900">₹{shipping.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-primary-600 text-right">
                      Add ₹{(5000 - total).toLocaleString('en-IN')} more to unlock free shipping!
                    </p>
                  )}
                </div>

                {/* Coupon Code Section */}
                <div className="border-t border-b border-gray-100 py-6 mb-6">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Gift Card or Discount Code</label>
                  <div className="flex">
                    <input 
                      type="text" 
                      placeholder="Enter code" 
                      className="flex-1 bg-gray-50 border border-gray-300 rounded-l-md px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 uppercase"
                    />
                    <button className="bg-primary-900 text-white px-4 py-2.5 rounded-r-md text-sm font-medium hover:bg-primary-950 transition-colors">
                      Apply
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-8">
                  <span className="text-lg font-semibold text-primary-950">Estimated Total</span>
                  <span className="text-2xl font-bold text-primary-900">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={() => navigate('/checkout')}
                    className="w-full bg-accent text-primary-950 font-bold uppercase tracking-widest px-6 py-4 rounded hover:bg-accent-light transition-colors shadow-premium flex items-center justify-center space-x-2"
                  >
                    <span>Secure Checkout</span>
                    <ArrowRight size={18} />
                  </button>
                  
                  <div className="flex items-center justify-center space-x-2 text-xs font-medium text-gray-500 bg-gray-50 p-3 rounded-md">
                    <ShieldCheck size={16} className="text-green-600" />
                    <span>SSL Encrypted Secure Payment</span>
                  </div>
                </div>
                
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
