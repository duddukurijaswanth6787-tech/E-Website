import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../../api/services/order.service';
import { ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

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

  const isDelivered = order.orderStatus === 'DELIVERED';
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
        <div className={`mt-4 md:mt-0 inline-flex items-center px-4 py-2 rounded-full border text-sm font-semibold ${isDelivered ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
          <StatusIcon className="w-4 h-4 mr-2" /> {order.orderStatus}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-serif text-lg text-primary-950 mb-4 border-b border-gray-100 pb-2">Items Overview</h3>
          {order.items.map((item: any, idx: number) => (
            <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="w-20 h-28 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                <img src={item.product?.images?.[0] || 'https://placehold.co/400x600/f3f4f6/A51648?text=Item'} alt={item.product?.name || 'Product'} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.product?.name || 'Vasanthi Product'}</h4>
                <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                <p className="text-primary-800 font-semibold mt-2">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-serif text-lg text-primary-950 mb-4 border-b border-gray-100 pb-2">Payment Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{order.subtotal?.toLocaleString('en-IN') || order.totalAmount?.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.shippingCost ? `₹${order.shippingCost.toLocaleString('en-IN')}` : 'Free'}</span></div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base"><span>Total</span><span>₹{order.totalAmount.toLocaleString('en-IN')}</span></div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Payment Method</p>
              <p className="text-sm text-gray-900 font-medium">{order.paymentMethod === 'RAZORPAY' ? 'Prepaid (Razorpay)' : 'Cash on Delivery'}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-serif text-lg text-primary-950 mb-4 border-b border-gray-100 pb-2">Shipping Address</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {order.shippingAddress?.street}<br/>
              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}<br/>
              {order.shippingAddress?.country || 'India'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOrderDetail;
