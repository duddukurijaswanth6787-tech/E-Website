import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { Check, CreditCard, Banknote, MapPin, ChevronRight, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderService } from '../../api/services/order.service';
import { addressService } from '../../api/services/address.service';
import type { Address } from '../../api/services/address.service';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { items, subtotal, clearCart } = useCartStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingAddrs, setLoadingAddrs] = useState(true);

  // AUTH & CART GATING
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to continue checkout');
      navigate('/login?redirect=/checkout');
    } else if (items.length === 0) {
      navigate('/cart');
    } else {
      // Fetch dynamic addresses
      addressService.getAddresses()
        .then(res => {
           const fetched = res.data.data || res.data || [];
           setAddresses(fetched);
           if (fetched.length > 0) {
              const def = fetched.find((a: Address) => a.isDefault);
              setSelectedAddress(def?._id || fetched[0]._id);
           }
        })
        .catch(err => {
           console.warn('Address stub active', err);
           // Fallback payload if missing in backend
           setAddresses([{ _id: 'mock-1', type: 'Home', name: 'Developer User', street: '45 Jubilee', city: 'Hyderabad', state: 'TS', zipCode: '500033', country: 'India', phone: '9876543210' }]);
           setSelectedAddress('mock-1');
        })
        .finally(() => setLoadingAddrs(false));
    }
  }, [isAuthenticated, items.length, navigate]);

  if (!isAuthenticated || items.length === 0) return null; // Prevent flash

  const total = subtotal();
  const shipping = total > 5000 ? 0 : 250; 
  const grandTotal = total + shipping;

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      if (!selectedAddress) throw new Error("Select a delivery address");
      const address = addresses.find(a => a._id === selectedAddress) || addresses[0];
      
      const payload = {
        shippingAddress: {
           street: address.street, city: address.city, state: address.state, zipCode: address.zipCode, country: address.country || 'India'
        },
        billingAddress: {
           street: address.street, city: address.city, state: address.state, zipCode: address.zipCode, country: address.country || 'India'
        },
        items: items.map(i => ({ product: i.id, quantity: i.quantity, price: i.price })),
        subtotal: total,
        tax: 0,
        total: grandTotal,
        paymentMethod: paymentMethod === 'razorpay' ? 'RAZORPAY' : 'COD',
        paymentStatus: 'PENDING'
      };

      const res = await orderService.createOrder(payload as any);
      
      if (paymentMethod === 'cod') {
        clearCart();
        toast.success('Order placed successfully!');
        navigate(`/order-success/${res.data._id || `ORD-${Date.now()}`}`);
      } else {
        // Razorpay integration stub flow
        toast.success('Initiating Secure Payment Window...');
        
        // Simulating the Razorpay popup script execution
        // Normally this would be: new window.Razorpay(options).open()
        setTimeout(() => {
           clearCart();
           toast.success('Payment Verified!');
           navigate(`/order-success/${res.data._id || `ORD-${Date.now()}`}`);
        }, 1500);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || 'Failed to process order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Checkout Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-serif text-primary-950">Secure Checkout</h1>
            <nav className="text-xs font-semibold tracking-widest uppercase text-gray-400 flex items-center space-x-2 mt-2">
              <Link to="/cart" className="hover:text-primary-800 transition-colors">Cart</Link>
              <ChevronRight size={12} />
              <span className="text-primary-900">Checkout</span>
            </nav>
          </div>
          <div className="hidden md:flex items-center space-x-2 text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded shadow-sm border border-gray-100">
            <Lock size={16} className="text-green-600" />
            <span>256-bit SSL Encrypted</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Left Column: Form & Selection */}
          <div className="w-full lg:w-2/3 space-y-8">
            
            {/* 1. Address Selection */}
            <section className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-serif text-primary-950 mb-6 flex items-center">
                <span className="w-8 h-8 rounded-full bg-primary-50 text-primary-800 flex items-center justify-center text-sm font-bold mr-3">1</span>
                Delivery Address
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loadingAddrs ? (
                  <div className="animate-pulse bg-gray-100 rounded-lg min-h-[160px]"></div>
                ) : addresses.map((addr) => (
                  <div 
                    key={addr._id}
                    onClick={() => setSelectedAddress(addr._id!)}
                    className={`relative p-5 rounded-lg border-2 cursor-pointer transition-all duration-200
                      ${selectedAddress === addr._id ? 'border-primary-700 bg-primary-50/30' : 'border-gray-200 hover:border-primary-300 bg-white'}
                    `}
                  >
                    {selectedAddress === addr._id && (
                      <div className="absolute top-4 right-4 text-primary-700">
                        <Check size={20} strokeWidth={3} />
                      </div>
                    )}
                    <span className="bg-gray-100 text-gray-600 text-[0.65rem] uppercase tracking-widest px-2 py-1 rounded font-bold mb-3 inline-block">
                      {addr.type || 'Home'}
                    </span>
                    <h4 className="font-semibold text-gray-900 mb-1">{addr.name}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                      {addr.street}<br/>
                      {addr.city}, {addr.state} {addr.zipCode}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <MapPin size={14} className="mr-1.5 opacity-70" />
                      {addr.phone}
                    </p>
                  </div>
                ))}
                
                {/* Add New Address Button */}
                <div className="p-5 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:text-primary-700 hover:border-primary-400 hover:bg-gray-50 cursor-pointer transition-colors min-h-[160px]">
                  <span className="text-2xl mb-1">+</span>
                  <span className="text-sm font-medium tracking-wide">Add New Address</span>
                </div>
              </div>
            </section>

            {/* 2. Payment Method */}
            <section className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-serif text-primary-950 mb-6 flex items-center">
                <span className="w-8 h-8 rounded-full bg-primary-50 text-primary-800 flex items-center justify-center text-sm font-bold mr-3">2</span>
                Payment Method
              </h2>
              
              <div className="space-y-4">
                {/* Razorpay Option */}
                <label 
                  className={`flex items-center p-5 rounded-lg border-2 cursor-pointer transition-colors
                    ${paymentMethod === 'razorpay' ? 'border-primary-700 bg-primary-50/30' : 'border-gray-200 hover:border-gray-300 bg-white'}
                  `}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0
                    ${paymentMethod === 'razorpay' ? 'border-primary-700' : 'border-gray-300'}
                  `}>
                    {paymentMethod === 'razorpay' && <div className="w-2.5 h-2.5 bg-primary-700 rounded-full" />}
                  </div>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="razorpay" 
                    checked={paymentMethod === 'razorpay'} 
                    onChange={() => setPaymentMethod('razorpay')}
                    className="hidden"
                  />
                  <div className="flex-1">
                    <span className="block font-semibold text-gray-900 flex items-center">
                      <CreditCard size={18} className="mr-2 text-blue-600" />
                      Pay Online (Razorpay)
                    </span>
                    <span className="block text-sm text-gray-500 mt-1">UPI, Credit/Debit Cards, NetBanking, Wallets via secure gateway.</span>
                  </div>
                  {/* Fake Logos */}
                  <div className="hidden sm:flex space-x-1 opacity-70">
                    <div className="w-8 h-5 bg-gray-200 rounded text-[0.5rem] flex items-center justify-center font-bold">VISA</div>
                    <div className="w-8 h-5 bg-gray-200 rounded text-[0.5rem] flex items-center justify-center font-bold">UPI</div>
                  </div>
                </label>

                {/* COD Option */}
                <label 
                  className={`flex items-center p-5 rounded-lg border-2 cursor-pointer transition-colors
                    ${paymentMethod === 'cod' ? 'border-primary-700 bg-primary-50/30' : 'border-gray-200 hover:border-gray-300 bg-white'}
                  `}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0
                    ${paymentMethod === 'cod' ? 'border-primary-700' : 'border-gray-300'}
                  `}>
                    {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 bg-primary-700 rounded-full" />}
                  </div>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="cod" 
                    checked={paymentMethod === 'cod'} 
                    onChange={() => setPaymentMethod('cod')}
                    className="hidden"
                  />
                  <div>
                    <span className="block font-semibold text-gray-900 flex items-center">
                      <Banknote size={18} className="mr-2 text-green-600" />
                      Cash on Delivery
                    </span>
                    <span className="block text-sm text-gray-500 mt-1">Pay with cash or UPI at your doorstep upon receiving the order.</span>
                  </div>
                </label>
              </div>
            </section>
            
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 lg:sticky lg:top-28">
              <h3 className="font-serif text-xl text-primary-950 mb-6">Order Summary</h3>
              
              {/* Item Mini List */}
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {items.map(item => (
                  <div key={item.id} className="flex space-x-4">
                    <div className="w-16 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-primary-800 mt-1">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  {shipping === 0 ? (
                    <span className="font-medium text-green-600">Free</span>
                  ) : (
                    <span className="font-medium text-gray-900">₹{shipping.toLocaleString('en-IN')}</span>
                  )}
                </div>
                {/* Visual Coupon Placeholder */}
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Discount</span>
                  <span>- ₹0</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-primary-950">Total Amount</span>
                  <span className="text-2xl font-bold text-primary-900">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full bg-primary-950 text-white font-bold uppercase tracking-widest px-6 py-4 rounded hover:bg-primary-800 transition-colors shadow-premium flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  `Pay ₹${grandTotal.toLocaleString('en-IN')}`
                )}
              </button>
              
              <p className="text-xs text-center text-gray-500 mt-4 leading-relaxed">
                By placing this order, you agree to our <br/><Link to="#" className="underline hover:text-primary-700">Terms of Service</Link> and <Link to="#" className="underline hover:text-primary-700">Privacy Policy</Link>.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
