import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../../api/services/order.service';
import { ArrowLeft, Clock, CheckCircle, Package, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const UserOrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        const res = await orderService.getOrderById(id);
        setOrder(res.data);
      } catch (err: any) {
        toast.error('Failed to load order details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
       <div className="p-8 flex justify-center items-center min-h-[400px]">
         <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-800 rounded-full animate-spin"></div>
       </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 md:p-8 min-h-screen text-center">
        <h2 className="text-2xl font-serif text-primary-950 mb-4">Order Not Found</h2>
        <Link to="/my/orders" className="text-primary-700 hover:text-primary-900 font-medium">Return to Orders</Link>
      </div>
    );
  }

  const status = (order.status || 'pending').toUpperCase();
  const isDelivered = status === 'DELIVERED';
  const StatusIcon = isDelivered ? CheckCircle : Clock;

  return (
    <div className="p-6 md:p-8 min-h-screen">
      <Link to="/my/orders" className="inline-flex items-center text-sm font-semibold tracking-widest uppercase text-gray-500 hover:text-primary-700 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
      </Link>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-serif text-primary-950 mb-1">Order #{order._id.substring(0,8).toUpperCase()}</h1>
          <p className="text-gray-500 text-sm">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <div className={`mt-4 md:mt-0 inline-flex items-center px-4 py-2 rounded-full border text-sm font-semibold ${isDelivered ? 'bg-green-50 text-green-700 border-green-200' : status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
          <StatusIcon className="w-4 h-4 mr-2" /> {order.status}
        </div>
      </div>

      {/* Premium Tracking Visualization */}
      {status !== 'CANCELLED' && (
        <div className="mb-12 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
             <Truck size={120} className="rotate-12" />
          </div>
          
          <div className="flex items-center justify-between mb-10">
             <h3 className="font-serif text-xl text-primary-950">Shipment Milestone Journey</h3>
             {order.trackingNumber && <span className="text-[0.6rem] font-bold uppercase tracking-widest text-primary-700 bg-primary-50 px-3 py-1.5 rounded-full border border-primary-100">Tracking: {order.trackingNumber}</span>}
          </div>

          <div className="relative mx-4 h-16 flex items-center mb-4">
            <div className="absolute left-0 right-0 h-1 bg-gray-50 rounded-full overflow-hidden">
               <div className="absolute inset-0 shimmer-luxury opacity-30"></div>
            </div>

            {/* Animated Progress Fill */}
            {(() => {
              const timelineSteps = [
                { status: 'PENDING', icon: Clock, label: 'Ordered' },
                { status: 'CONFIRMED', icon: CheckCircle, label: 'Confirmed' },
                { status: 'PACKED', icon: Package, label: 'Packed' },
                { status: 'SHIPPED', icon: Truck, label: 'Shipped' },
                { status: 'DELIVERED', icon: CheckCircle, label: 'Arrived' }
              ];
              const getProgress = (s: string) => {
                const upS = s.toUpperCase();
                if (upS === 'DELIVERED') return 4;
                if (upS === 'SHIPPED') return 3;
                if (upS === 'PACKED') return 2;
                if (upS === 'CONFIRMED' || upS === 'PROCESSING') return 1;
                return 0;
              };
              const progressIndex = getProgress(order.status);
              
              return (
                <>
                  <motion.div 
                    className="absolute left-0 h-1 bg-gradient-to-r from-primary-900 via-primary-700 to-accent rounded-full z-10" 
                    initial={{ width: 0 }}
                    animate={{ width: `${(progressIndex / (timelineSteps.length - 1)) * 100}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                  />
                  
                  <div className="relative w-full flex justify-between">
                    {timelineSteps.map((step, stepIdx) => {
                      const isCompleted = stepIdx < progressIndex;
                      const isCurrent = stepIdx === progressIndex;
                      return (
                        <div key={stepIdx} className="flex flex-col items-center group/step">
                          <div className="relative">
                             {isCurrent && (
                                <div className="absolute inset-0 -m-3 rounded-full border border-accent/40 animate-pulse-luxury"></div>
                             )}
                             <motion.div 
                               initial={{ scale: 0.8, opacity: 0 }}
                               animate={{ scale: isCurrent ? 1.25 : 1, opacity: 1 }}
                               transition={{ delay: 0.3 + (stepIdx * 1.1) }}
                               className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-20 transition-all duration-500 shadow-md
                                 ${isCompleted ? 'bg-primary-900 border-primary-900 text-accent' : 
                                   isCurrent ? 'bg-white border-accent text-primary-900' : 
                                   'bg-white border-gray-100 text-gray-200'} 
                               `}
                             >
                               {isCompleted ? <CheckCircle className="w-4 h-4" strokeWidth={3} /> : <step.icon className={`w-4 h-4 ${isCurrent ? 'text-accent' : ''}`} strokeWidth={2.5} />}
                             </motion.div>
                             <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.55rem] font-bold uppercase tracking-widest text-gray-500 text-center">
                                {step.label}
                             </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-serif text-lg text-primary-950 mb-4 border-b border-gray-100 pb-2">Items Overview</h3>
          {order.items.map((item: any, idx: number) => (
            <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="w-20 h-28 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                <img src={item.image || item.product?.images?.[0] || 'https://placehold.co/400x600/f3f4f6/A51648?text=Item'} alt={item.name || item.product?.name || 'Product'} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.name || item.product?.name || 'Vasanthi Product'}</h4>
                <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                <p className="text-primary-800 font-semibold mt-2">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-serif text-lg text-primary-950 mb-4 border-b border-gray-100 pb-2">Payment Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{(order.subtotal || 0).toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.shippingCharge ? `₹${(order.shippingCharge || 0).toLocaleString('en-IN')}` : 'Free'}</span></div>
              {order.couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{order.couponDiscount.toLocaleString('en-IN')}</span></div>}
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base"><span>Total</span><span>₹{(order.total || 0).toLocaleString('en-IN')}</span></div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Payment Method</p>
              <p className="text-sm text-gray-900 font-medium">{order.paymentMethod === 'RAZORPAY' ? 'Prepaid (Razorpay)' : 'Cash on Delivery'}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-serif text-lg text-primary-950 mb-4 border-b border-gray-100 pb-2">Shipping Address</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-semibold">{order.address?.name}</span><br/>
              {order.address?.line1}<br/>
              {order.address?.line2 && <>{order.address.line2}<br/></>}
              {order.address?.city}, {order.address?.state} {order.address?.pincode}<br/>
              {order.address?.country || 'India'}<br/>
              <span className="text-xs text-gray-500 mt-1 inline-block">Phone: {order.address?.mobile}</span>
            </p>
          </div>

          {order.trackingNumber && (
            <div className="bg-primary-50 p-6 rounded-xl border border-primary-100 shadow-sm">
              <h3 className="font-serif text-lg text-primary-950 mb-4 border-b border-primary-200 pb-2">Tracking Information</h3>
              <p className="text-sm text-primary-900 mb-2 font-medium">Tracking #: {order.trackingNumber}</p>
              {order.trackingUrl && (
                <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="inline-block bg-primary-950 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-primary-800 transition-colors">
                  Track Delivery
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserOrderDetail;
