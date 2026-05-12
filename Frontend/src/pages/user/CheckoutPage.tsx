import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { Check, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderService } from '../../api/services/order.service';
import { addressService } from '../../api/services/address.service';
import type { Address } from '../../api/services/address.service';
import { AddressFormModal } from '../../components/common/AddressFormModal';
import { Loader } from '../../components/common/Loader';
import { useEventTracker } from '../../hooks/useEventTracker';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { items, subtotal, clearCart } = useCartStore();
  const { trackEvent } = useEventTracker();

  useEffect(() => {
    if (items.length > 0) {
      trackEvent('checkout_start', { 
        metadata: { itemsCount: items.length, total: subtotal() } 
      });
    }
  }, []);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingAddrs, setLoadingAddrs] = useState(true);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const fetchAddresses = () => {
    setLoadingAddrs(true);
    addressService.getAddresses()
      .then(res => {
         const fetched = res.data.data || res.data || [];
         setAddresses(fetched);
         if (fetched.length > 0) {
            const def = fetched.find((a: Address) => a.isDefault);
            setSelectedAddress(def?._id || fetched[0]._id);
         }
      })
      .catch(err => console.warn('Address fetch failed', err))
      .finally(() => setLoadingAddrs(false));
  };

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to continue checkout');
      navigate('/login?redirect=/checkout');
    } else if (items.length === 0) {
      navigate('/cart');
    } else {
      fetchAddresses();
      useCartStore.getState().syncBackendCart();
    }
  }, [isAuthenticated, items.length, navigate]);

  if (!isAuthenticated || items.length === 0) return null;

  const total = subtotal();
  const shipping = total > 5000 ? 0 : 250; 
  const grandTotal = total + shipping;

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      if (!selectedAddress) throw new Error("Select a delivery address");
      const address = addresses.find(a => a._id === selectedAddress);
      if (!address) throw new Error("Selected address not found. Please add a new address.");
      
      const payload = {
        address: {
           name: address.name || 'Customer',
           line1: address.line1,
           line2: address.line2 || '',
           city: address.city,
           state: address.state,
           pincode: address.pincode,
           country: address.country || 'India',
           mobile: address.mobile || '',
           altMobile: address.altMobile || '',
           landmark: address.landmark || '',
           deliveryInstructions: address.deliveryInstructions || ''
        },
        paymentMethod: paymentMethod,
      };

      const res = await orderService.createOrder(payload as any);
      const orderId = (res as any)._id || (res as any).data?._id || `ORD-${Date.now()}`;
      
      if (paymentMethod === 'cod') {
        clearCart();
        trackEvent('purchase', { 
          metadata: { orderId, total: grandTotal, paymentMethod: 'cod' } 
        });
        toast.success('Order placed successfully!');
        navigate(`/order-success/${orderId}`);
      } else {
        // ACTUAL RAZORPAY INTEGRATION BLOCK
        const options = {
          key: (import.meta.env.VITE_RAZORPAY_KEY as string) || 'rzp_test_placeholder',
          amount: grandTotal * 100,
          currency: "INR",
          name: "Vasanthi Creations",
          description: `Order #${orderId}`,
          order_id: (res as any).razorpayOrderId, 
          handler: async function (response: any) {
            try {
              await orderService.verifyPayment(orderId, {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              });
              clearCart();
              trackEvent('purchase', { 
                metadata: { orderId, total: grandTotal, paymentMethod: 'razorpay' } 
              });
              toast.success('Payment Verified!');
              navigate(`/order-success/${orderId}`);
            } catch (err) {
              toast.error('Payment verification failed.');
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
          },
          theme: {
            color: "#1c1917",
          },
          modal: {
            ondismiss: function() {
              setIsProcessing(false);
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to process order.');
    } finally {
      if (paymentMethod === 'cod') setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-serif text-primary-950">Secure Checkout</h1>
            <nav className="text-xs font-semibold tracking-widest uppercase text-gray-400 flex items-center space-x-2 mt-2">
              <Link to="/cart" className="hover:text-primary-800 transition-colors">Cart</Link>
              <ChevronRight size={12} />
              <span className="text-primary-900">Checkout</span>
            </nav>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="w-full lg:w-2/3 space-y-8">
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
                    <h4 className="font-semibold text-gray-900 mb-1">{addr.name}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {addr.line1}<br/>
                      {addr.city}, {addr.state} {addr.pincode}
                    </p>
                  </div>
                ))}
                
                <div 
                  onClick={() => setIsAddressModalOpen(true)}
                  className="p-5 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:text-primary-700 hover:border-primary-400 cursor-pointer min-h-[160px]"
                >
                  <span>+ Add New Address</span>
                </div>
              </div>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-serif text-primary-950 mb-6 flex items-center">
                <span className="w-8 h-8 rounded-full bg-primary-50 text-primary-800 flex items-center justify-center text-sm font-bold mr-3">2</span>
                Payment Method
              </h2>
              
              <div className="space-y-4">
                <label className={`flex items-center p-5 rounded-lg border-2 cursor-pointer ${paymentMethod === 'razorpay' ? 'border-primary-700 bg-primary-50/30' : 'border-gray-200'}`}>
                  <input type="radio" className="mr-4" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} />
                  <span>Pay Online (Razorpay)</span>
                </label>
                <label className={`flex items-center p-5 rounded-lg border-2 cursor-pointer ${paymentMethod === 'cod' ? 'border-primary-700 bg-primary-50/30' : 'border-gray-200'}`}>
                  <input type="radio" className="mr-4" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                  <span>Cash on Delivery</span>
                </label>
              </div>
            </section>
          </div>

          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <h3 className="font-serif text-xl text-primary-950 mb-6">Order Summary</h3>
              <div className="border-t border-gray-200 pt-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-primary-950">Total Amount</span>
                  <span className="text-2xl font-bold text-primary-900">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full bg-primary-950 text-white font-bold uppercase tracking-widest px-6 py-4 rounded hover:bg-primary-800 disabled:opacity-70"
              >
                {isProcessing ? 'Processing...' : `Pay ₹${grandTotal.toLocaleString('en-IN')}`}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <AddressFormModal 
        isOpen={isAddressModalOpen} 
        onClose={() => setIsAddressModalOpen(false)} 
        onSuccess={fetchAddresses} 
      />
      {isProcessing && <Loader fullPage message="Securing your order..." />}
    </div>
  );
};

export default CheckoutPage;
