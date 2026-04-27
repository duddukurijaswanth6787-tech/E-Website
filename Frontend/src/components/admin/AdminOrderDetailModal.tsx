import React, { useState, useEffect } from 'react';
import { X, Package, MapPin, CreditCard, User, Clock, Wallet } from 'lucide-react';
import { orderService } from '../../api/services/order.service';
import toast from 'react-hot-toast';

interface OrderDetailModalProps {
  orderId: string;
  onClose: () => void;
  onUpdate: () => void;
}

const AdminOrderDetailModal: React.FC<OrderDetailModalProps> = ({ orderId, onClose, onUpdate }) => {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await orderService.getAdminOrderById(orderId);
        setOrder(res.data);
      } catch (err) {
        toast.error("Failed to load order details");
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [orderId]);

  const handleStatusUpdate = async (status: string) => {
    try {
      setUpdating(true);
      await orderService.updateOrderStatus(orderId, status);
      toast.success(`Status updated to ${status}`);
      const res = await orderService.getAdminOrderById(orderId);
      setOrder(res.data);
      onUpdate();
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentUpdate = async (status: string) => {
    try {
      setUpdating(true);
      await orderService.updatePaymentStatus(orderId, status);
      toast.success(`Payment marked as ${status}`);
      const res = await orderService.getAdminOrderById(orderId);
      setOrder(res.data);
      onUpdate();
    } catch (err) {
      toast.error("Failed to update payment status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-4xl p-12 text-center">
          <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Assembling order data package...</p>
        </div>
      </div>
    );
  }

  const statusOptions = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];
  const paymentOptions = ['pending', 'paid', 'failed', 'refunded'];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl relative my-auto animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-serif text-gray-900 leading-none">Order #{order.orderNumber || order._id.substring(0,8).toUpperCase()}</h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2 flex items-center">
              <Clock className="w-3 h-3 mr-1" /> PLACED ON {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-3 gap-10 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {/* Left: Items & Totals */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h3 className="text-lg font-serif text-primary-950 mb-5 flex items-center">
                <Package className="w-5 h-5 mr-3 text-primary-700" /> Items Summary List
              </h3>
              <div className="space-y-4">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-5 p-5 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-primary-200 transition-colors">
                    <div className="w-20 h-28 bg-white rounded-xl overflow-hidden shadow-sm flex-shrink-0 border border-gray-100">
                      <img src={item.image || item.product?.images?.[0] || 'https://placehold.co/400x600'} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 py-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-primary-800 transition-colors">{item.name}</h4>
                        <p className="text-xs text-gray-500 mt-1 uppercase font-semibold tracking-wider">SKU: {item.sku || 'N/A'}</p>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-sm text-gray-600">Qty: <span className="font-bold text-gray-900">{item.quantity}</span></p>
                        <p className="text-primary-800 font-bold">₹{item.price.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary-800 mb-5 text-center">Order Financials</h3>
              <div className="space-y-3 font-medium text-sm">
                <div className="flex justify-between text-gray-600"><span>Basket Subtotal</span><span>₹{(order.subtotal || 0).toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between text-gray-600"><span>Logistics / Shipping</span><span>{order.shippingCharge ? `₹${order.shippingCharge.toLocaleString('en-IN')}` : 'Free'}</span></div>
                {order.couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Coupon Applied ({order.couponCode})</span><span>-₹{order.couponDiscount.toLocaleString('en-IN')}</span></div>}
                <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-serif text-gray-900">
                  <span>Grand Total</span>
                  <span>₹{(order.total || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right: Info & Status Controls */}
          <div className="space-y-8">
            
            {/* Customer Info */}
            <section className="bg-white p-6 rounded-2xl border border-primary-50 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-4 flex items-center">
                <User className="w-3 h-3 mr-2" /> Recipient Details
              </h3>
              <div className="space-y-3">
                <p className="text-base font-serif text-gray-900">{order.address?.name || order.user?.name}</p>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-primary-600 shrink-0" />
                  <span>
                    {order.address?.line1}<br/>
                    {order.address?.line2 && <>{order.address.line2}<br/></>}
                    {order.address?.city}, {order.address?.state} {order.address?.pincode}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CreditCard className="w-4 h-4 mr-2 text-primary-600" />
                  {order.address?.mobile} {order.address?.altMobile ? ` / ${order.address.altMobile}` : ''}
                </div>
              </div>
            </section>

            {/* Status Controls */}
            <section className="space-y-4">
              <div>
                <label className="block text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-2">Fulfillment Stage</label>
                <select 
                  value={order.status} 
                  disabled={updating}
                  onChange={(e) => handleStatusUpdate(e.target.value)}
                  className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-primary-500 focus:border-primary-500 transition-all font-semibold uppercase tracking-wider disabled:opacity-50"
                >
                  {statusOptions.map(opt => <option key={opt} value={opt}>{opt.toUpperCase()}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-2">Payment Disposition</label>
                <select 
                  value={order.paymentStatus} 
                  disabled={updating}
                  onChange={(e) => handlePaymentUpdate(e.target.value)}
                  className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-green-500 focus:border-green-500 transition-all font-semibold uppercase tracking-wider disabled:opacity-50"
                >
                  {paymentOptions.map(opt => <option key={opt} value={opt}>{opt.toUpperCase()}</option>)}
                </select>
                <p className="text-[0.6rem] text-gray-400 mt-2 font-medium tracking-wide flex items-center">
                  <Wallet className="w-3 h-3 mr-1" /> METHOD: {order.paymentMethod?.toUpperCase()}
                </p>
              </div>
            </section>

            {/* Tracking Info (if any) */}
            <section className="bg-primary-50 p-6 rounded-2xl border border-primary-100">
               <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-primary-800 mb-3">Logistic Dispatch</h3>
               {order.status === 'shipped' || order.status === 'delivered' ? (
                 <div className="space-y-3">
                   <div className="text-sm font-medium text-primary-900 break-all">TRACK #: {order.trackingNumber || 'PENDING ASSIGNMENT'}</div>
                   <button className="w-full bg-primary-900 text-white text-[0.65rem] font-bold uppercase tracking-[0.2em] py-3 rounded-lg hover:bg-primary-800 transition-all">Assign Label</button>
                 </div>
               ) : (
                 <p className="text-xs text-primary-700 italic">Tracking details will unlock once order is marked as SHIPPED.</p>
               )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailModal;
