import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Filter, Eye, Shield, ShieldOff, X, Package, ShoppingBag,
  Mail, Phone, MapPin, Calendar, TrendingUp, CheckCircle, XCircle, Clock,
  RefreshCw, Truck, ArrowLeft, AlertTriangle
} from 'lucide-react';
import { DataTable } from '../../components/admin/DataTable';
import { userService, type UserNode, type CustomerDetail, type Order } from '../../api/services/user.service';
import toast from 'react-hot-toast';

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  packed:    'bg-indigo-50 text-indigo-700 border-indigo-200',
  shipped:   'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  refunded:  'bg-gray-50 text-gray-700 border-gray-200',
};

const PAY_COLORS: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  paid:    'bg-green-50 text-green-700 border-green-200',
  failed:  'bg-red-50 text-red-700 border-red-200',
  refunded:'bg-gray-50 text-gray-700 border-gray-200',
};

const StatusBadge = ({ status, map }: { status: string; map: Record<string, string> }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-bold uppercase tracking-widest border ${map[status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
    {status}
  </span>
);

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
      <Icon size={18} />
    </div>
    <div>
      <p className="text-[0.65rem] text-gray-500 uppercase tracking-widest font-semibold">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

// ─── Order Detail Modal ───────────────────────────────────────────────────────
const OrderDetailModal = ({ orderId, onClose }: { orderId: string; onClose: () => void }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await userService.getAdminOrderDetail(orderId);
        const data = (res as any)?.data ?? (res as any);
        setOrder(data);
      } catch {
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  const TIMELINE_ICONS: Record<string, any> = {
    pending: Clock,
    confirmed: CheckCircle,
    packed: Package,
    shipped: Truck,
    delivered: CheckCircle,
    cancelled: XCircle,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900 font-serif">Order Detail</h2>
            {order && <p className="text-xs text-gray-500 font-mono mt-0.5">#{order.orderNumber}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-800 rounded-full animate-spin" />
          </div>
        ) : !order ? (
          <div className="py-24 text-center text-gray-500">Order not found.</div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Status Row */}
            <div className="flex flex-wrap gap-3">
              <StatusBadge status={order.status} map={STATUS_COLORS} />
              <StatusBadge status={order.paymentStatus} map={PAY_COLORS} />
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-bold uppercase tracking-widest border bg-gray-50 text-gray-700 border-gray-200">
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay'}
              </span>
              <span className="text-xs text-gray-500 ml-auto">{fmtDate(order.createdAt)}</span>
            </div>

            {/* Customer & Address Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {order.user && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-gray-400 mb-2">Customer</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                      {(order.user.name || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{order.user.name}</p>
                      <p className="text-xs text-gray-500">{order.user.email}</p>
                      {order.user.mobile && <p className="text-xs text-gray-500">{order.user.mobile}</p>}
                    </div>
                  </div>
                </div>
              )}
              {order.address && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-gray-400 mb-2">Delivery Address</p>
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-primary-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-700 space-y-0.5">
                      {order.address.name && <p className="font-medium">{order.address.name}</p>}
                      <p>{order.address.line1 || order.address.street}</p>
                      {order.address.line2 && <p>{order.address.line2}</p>}
                      <p>{order.address.city}, {order.address.state} {order.address.pincode || order.address.zipCode}</p>
                      {(order.address.mobile || order.address.phone) && (
                        <p className="text-gray-500">{order.address.mobile || order.address.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Items */}
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-gray-400 mb-3">Ordered Items</p>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                {order.items.map((item, i) => (
                  <div key={i} className={`flex items-center gap-4 p-4 ${i < order.items.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={20} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">SKU: {item.sku}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} × {fmt(item.price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{fmt(item.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financials */}
            <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
              <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-primary-600 mb-3">Payment Summary</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-700"><span>Subtotal</span><span>{fmt(order.subtotal)}</span></div>
                {order.shippingCharge > 0 && <div className="flex justify-between text-gray-700"><span>Shipping</span><span>{fmt(order.shippingCharge)}</span></div>}
                {order.couponDiscount > 0 && <div className="flex justify-between text-green-700"><span>Coupon Discount</span><span>−{fmt(order.couponDiscount)}</span></div>}
                <div className="flex justify-between font-bold text-gray-900 text-base border-t border-primary-200 pt-2 mt-2">
                  <span>Total</span><span>{fmt(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            {order.timeline && order.timeline.length > 0 && (
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-gray-400 mb-3">Order Timeline</p>
                <div className="relative pl-6">
                  <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200" />
                  {order.timeline.map((entry, i) => {
                    const Icon = TIMELINE_ICONS[entry.status] || Clock;
                    return (
                      <div key={i} className="relative mb-4 last:mb-0">
                        <div className="absolute -left-4 top-0.5 w-5 h-5 rounded-full bg-white border-2 border-primary-300 flex items-center justify-center">
                          <Icon size={10} className="text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 capitalize">{entry.status}</p>
                          {entry.note && <p className="text-xs text-gray-500 mt-0.5">{entry.note}</p>}
                          <p className="text-xs text-gray-400 mt-0.5">{fmtDate(entry.updatedAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {order.note && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-amber-600 mb-1">Admin Notes</p>
                <p className="text-sm text-amber-800">{order.note}</p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

// ─── Customer Detail Drawer ───────────────────────────────────────────────────
const CustomerDetailDrawer = ({
  customerId,
  onClose,
}: {
  customerId: string;
  onClose: () => void;
}) => {
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [blocking, setBlocking] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await userService.getCustomerDetail(customerId);
        const data = (res as any)?.data ?? (res as any);
        setDetail(data);
      } catch {
        toast.error('Failed to load customer details');
      } finally {
        setLoading(false);
      }
    })();
  }, [customerId]);

  const handleBlock = async () => {
    if (!detail) return;
    setBlocking(true);
    try {
      const newState = !detail.user.isBlocked;
      await userService.blockUser(customerId, newState, newState ? 'Admin manual block' : '');
      setDetail(prev => prev ? { ...prev, user: { ...prev.user, isBlocked: newState } } : prev);
      toast.success(`Customer ${newState ? 'blocked' : 'unblocked'} successfully`);
    } catch {
      toast.error('Failed to update customer status');
    } finally {
      setBlocking(false);
    }
  };

  const orderColumns = useMemo(() => [
    {
      header: 'Order #',
      accessor: (row: Order) => (
        <span className="font-mono text-xs text-primary-700 font-bold">#{row.orderNumber}</span>
      ),
    },
    {
      header: 'Date',
      accessor: (row: Order) => (
        <span className="text-xs text-gray-600">{fmtDate(row.createdAt)}</span>
      ),
    },
    {
      header: 'Amount',
      accessor: (row: Order) => (
        <span className="font-bold text-gray-900 text-sm">{fmt(row.total)}</span>
      ),
    },
    {
      header: 'Payment',
      accessor: (row: Order) => (
        <div className="space-y-1">
          <StatusBadge status={row.paymentMethod === 'cod' ? 'cod' : 'online'} map={{ cod: 'bg-gray-50 text-gray-700 border-gray-200', online: 'bg-blue-50 text-blue-700 border-blue-200' }} />
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row: Order) => <StatusBadge status={row.status} map={STATUS_COLORS} />,
    },
    {
      header: 'Action',
      accessor: (row: Order) => (
        <button
          onClick={() => setSelectedOrderId(row._id)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-primary-700 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors"
        >
          <Eye size={13} /> View
        </button>
      ),
    },
  ], []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="fixed right-0 top-0 bottom-0 z-40 w-full max-w-3xl bg-gray-50 shadow-2xl overflow-y-auto"
      >
        {/* Drawer Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-serif">Customer Profile</h2>
              <p className="text-xs text-gray-500">{detail?.user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-800 rounded-full animate-spin" />
          </div>
        ) : !detail ? (
          <div className="py-32 text-center text-gray-500">
            <AlertTriangle className="mx-auto mb-4 text-gray-300" size={48} />
            <p>Customer data unavailable.</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-2xl font-bold text-primary-800">
                    {detail.user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 font-serif">{detail.user.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Mail size={13} className="text-gray-400" />
                      <span className="text-sm text-gray-600">{detail.user.email}</span>
                    </div>
                    {detail.user.mobile && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Phone size={13} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{detail.user.mobile}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 mt-0.5">
                      <Calendar size={13} className="text-gray-400" />
                      <span className="text-xs text-gray-500">Joined {fmtDate(detail.user.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${
                    detail.user.isBlocked
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-green-50 text-green-700 border-green-200'
                  }`}>
                    {detail.user.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                  <button
                    onClick={handleBlock}
                    disabled={blocking}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors disabled:opacity-50 ${
                      detail.user.isBlocked
                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                        : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                    }`}
                  >
                    {detail.user.isBlocked ? <ShieldOff size={13} /> : <Shield size={13} />}
                    {detail.user.isBlocked ? 'Unblock' : 'Block'}
                  </button>
                </div>
              </div>

              {/* Verification Badges */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.65rem] font-bold uppercase border ${
                  detail.user.isEmailVerified ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'
                }`}>
                  <CheckCircle size={10} /> Email {detail.user.isEmailVerified ? 'Verified' : 'Unverified'}
                </span>
                {detail.wishlistCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.65rem] font-bold uppercase border bg-pink-50 text-pink-700 border-pink-200">
                    ♡ {detail.wishlistCount} Wishlisted
                  </span>
                )}
                {detail.addresses.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.65rem] font-bold uppercase border bg-blue-50 text-blue-700 border-blue-200">
                    <MapPin size={10} /> {detail.addresses.length} Address{detail.addresses.length > 1 ? 'es' : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Order Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatCard label="Total Orders" value={detail.stats.totalOrders} icon={ShoppingBag} color="bg-blue-50 text-blue-600" />
              <StatCard label="Total Spent" value={fmt(detail.stats.totalSpent)} icon={TrendingUp} color="bg-purple-50 text-purple-600" />
              <StatCard label="Delivered" value={detail.stats.deliveredOrders} icon={CheckCircle} color="bg-green-50 text-green-600" />
              <StatCard label="Pending" value={detail.stats.pendingOrders} icon={Clock} color="bg-yellow-50 text-yellow-600" />
              <StatCard label="Cancelled" value={detail.stats.cancelledOrders} icon={XCircle} color="bg-red-50 text-red-600" />
            </div>

            {/* Saved Addresses */}
            {detail.addresses.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <MapPin size={15} className="text-primary-600" /> Saved Addresses
                </p>
                <div className="space-y-2">
                  {detail.addresses.map((addr, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className={`mt-0.5 px-1.5 py-0.5 rounded text-[0.6rem] font-bold uppercase ${addr.isDefault ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}`}>
                        {addr.type || 'Home'}
                      </div>
                      <p className="text-xs text-gray-700 flex-1">
                        {[addr.name, addr.line1 || addr.street, addr.line2, addr.city, addr.state, addr.pincode || addr.zipCode, addr.country]
                          .filter(Boolean).join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order History Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Package size={16} className="text-primary-600" />
                <h3 className="text-sm font-bold text-gray-800">Order History</h3>
                <span className="ml-auto text-xs text-gray-400">{detail.orders.length} order{detail.orders.length !== 1 ? 's' : ''}</span>
              </div>
              {detail.orders.length === 0 ? (
                <div className="py-12 text-center">
                  <ShoppingBag size={36} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No orders placed yet.</p>
                </div>
              ) : (
                <DataTable
                  columns={orderColumns as any}
                  data={detail.orders}
                  loading={false}
                  searchable={false}
                  embedded
                  emptyMessage="No orders found."
                />
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrderId && (
          <OrderDetailModal
            orderId={selectedOrderId}
            onClose={() => setSelectedOrderId(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const AdminCustomersPage = () => {
  const [users, setUsers] = useState<UserNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0 });
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filterBlocked, setFilterBlocked] = useState<'' | 'true' | 'false'>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [summaryStats, setSummaryStats] = useState({ total: 0, active: 0, blocked: 0, newThisMonth: 0 });

  const fetchUsers = useCallback(async (page = 1, q = search, blocked = filterBlocked) => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: pagination.limit };
      if (q) params.search = q;
      if (blocked !== '') params.isBlocked = blocked;

      const res = await userService.getAdminUsers(params);
      const raw = (res as any)?.data ?? (res as any);
      const arr: UserNode[] = Array.isArray(raw) ? raw : (raw?.data ?? []);
      const pag = raw?.pagination ?? null;

      setUsers(arr);
      setPagination(prev => ({
        ...prev,
        page,
        total: pag ? pag.totalItems ?? pag.total ?? arr.length : arr.length,
      }));

      // Update summary stats
      const now = new Date();
      setSummaryStats({
        total: pag?.totalItems ?? arr.length,
        active: arr.filter(u => !u.isBlocked).length,
        blocked: arr.filter(u => u.isBlocked).length,
        newThisMonth: arr.filter(u => {
          const d = new Date(u.createdAt);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length,
      });
    } catch (e) {
      toast.error('Failed to load customer records');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [search, filterBlocked, pagination.limit]);

  useEffect(() => {
    fetchUsers(pagination.page);
  }, [pagination.page, search, filterBlocked]);

  const handleSearch = useCallback(() => {
    setSearch(searchInput);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchInput]);

  const handleBlockToggle = useCallback(async (id: string, isBlocked: boolean, name: string) => {
    try {
      await userService.blockUser(id, !isBlocked, !isBlocked ? 'Admin manual block' : '');
      toast.success(`${name} has been ${!isBlocked ? 'blocked' : 'unblocked'}`);
      fetchUsers(pagination.page);
    } catch {
      toast.error('Failed to update customer status');
    }
  }, [pagination.page, fetchUsers]);

  const columns = useMemo(() => [
    {
      header: 'Customer',
      accessor: (row: UserNode) => (
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-800 font-bold text-xs flex-shrink-0">
            {row.name[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{row.name}</p>
            <p className="text-xs text-gray-500 font-mono">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Mobile',
      accessor: (row: UserNode) => (
        <span className="text-sm text-gray-700">{row.mobile || <span className="text-gray-300 italic text-xs">—</span>}</span>
      ),
    },
    {
      header: 'Orders',
      accessor: (row: UserNode) => (
        <div className="text-center">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-sm border border-blue-100">
            {row.totalOrders ?? 0}
          </span>
        </div>
      ),
    },
    {
      header: 'Total Spent',
      accessor: (row: UserNode) => (
        <span className="font-bold text-gray-900">{fmt(row.totalSpent ?? 0)}</span>
      ),
    },
    {
      header: 'Last Order',
      accessor: (row: UserNode) => (
        <span className="text-xs text-gray-500">{fmtDate(row.lastOrderDate)}</span>
      ),
    },
    {
      header: 'Joined',
      accessor: (row: UserNode) => (
        <span className="text-xs text-gray-500">{fmtDate(row.createdAt)}</span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: UserNode) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleBlockToggle(row._id, row.isBlocked, row.name); }}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-widest border transition-colors cursor-pointer ${
            !row.isBlocked ? 'bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200' : 'bg-red-50 text-red-700 border-red-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200'
          }`}
          title={`Click to ${row.isBlocked ? 'unblock' : 'block'}`}
        >
          {!row.isBlocked ? <CheckCircle size={10} /> : <XCircle size={10} />}
          {!row.isBlocked ? 'Active' : 'Blocked'}
        </button>
      ),
    },
    {
      header: 'Action',
      accessor: (row: UserNode) => (
        <button
          onClick={(e) => { e.stopPropagation(); setSelectedCustomerId(row._id); }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary-950 rounded-lg hover:bg-primary-800 transition-colors shadow-sm"
        >
          <Eye size={13} /> View Details
        </button>
      ),
    },
  ], [handleBlockToggle]);

  return (
    <div className="space-y-6 max-w-[100vw] overflow-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif text-gray-900 flex items-center gap-3">
            <Users className="w-6 h-6 text-primary-700" /> Customer Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View customer profiles, order history, spending patterns, and account management.
          </p>
        </div>
        <button
          onClick={() => fetchUsers(1)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Customers" value={summaryStats.total} icon={Users} color="bg-blue-50 text-blue-600" />
        <StatCard label="Active" value={summaryStats.active} icon={CheckCircle} color="bg-green-50 text-green-600" />
        <StatCard label="Blocked" value={summaryStats.blocked} icon={Shield} color="bg-red-50 text-red-600" />
        <StatCard label="New This Month" value={summaryStats.newThisMonth} icon={TrendingUp} color="bg-purple-50 text-purple-600" />
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, email or mobile..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>
        <select
          value={filterBlocked}
          onChange={e => {
            setFilterBlocked(e.target.value as '' | 'true' | 'false');
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
          className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700"
        >
          <option value="">All Status</option>
          <option value="false">Active Only</option>
          <option value="true">Blocked Only</option>
        </select>
        <button
          onClick={handleSearch}
          className="px-5 py-2.5 bg-primary-950 text-white text-sm font-semibold rounded-lg hover:bg-primary-800 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Filter size={15} /> Apply
        </button>
        {(search || filterBlocked) && (
          <button
            onClick={() => {
              setSearch('');
              setSearchInput('');
              setFilterBlocked('');
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="px-4 py-2.5 border border-gray-200 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Customer Table */}
      <DataTable
        columns={columns as any}
        data={users}
        loading={loading}
        searchable={false}
        onRowClick={(row: UserNode) => setSelectedCustomerId(row._id)}
        emptyMessage={
          search || filterBlocked
            ? 'No customers match your search criteria.'
            : 'No customer records found.'
        }
        pagination={{
          page: pagination.page,
          limit: pagination.limit,
          total: Math.max(pagination.total, users.length),
          onPageChange: (newPage) => setPagination(prev => ({ ...prev, page: newPage })),
        }}
      />

      {/* Customer Detail Drawer */}
      <AnimatePresence>
        {selectedCustomerId && (
          <CustomerDetailDrawer
            customerId={selectedCustomerId}
            onClose={() => setSelectedCustomerId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCustomersPage;
