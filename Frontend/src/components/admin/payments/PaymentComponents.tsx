import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, AlertCircle, Clock, 
  IndianRupee, CreditCard, ShieldCheck, FileText, 
  User, MapPin, Layers, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import type { PaymentNode } from '../../../api/services/payment.service';

// 1. Reusable Animated Status Badges
export const PaymentStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const normalized = status?.toLowerCase() || 'pending';
  
  const styles: Record<string, { bg: string; text: string; border: string; dot: string; label: string }> = {
    paid: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800/40',
      dot: 'bg-emerald-500',
      label: 'PAID'
    },
    pending: {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800/40',
      dot: 'bg-amber-500 animate-pulse',
      label: 'PENDING'
    },
    failed: {
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      text: 'text-rose-700 dark:text-rose-400',
      border: 'border-rose-200 dark:border-rose-800/40',
      dot: 'bg-rose-500',
      label: 'FAILED'
    },
    refunded: {
      bg: 'bg-sky-50 dark:bg-sky-950/30',
      text: 'text-sky-700 dark:text-sky-400',
      border: 'border-sky-200 dark:border-sky-800/40',
      dot: 'bg-sky-500',
      label: 'REFUNDED'
    },
    partially_refunded: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/30',
      text: 'text-indigo-700 dark:text-indigo-400',
      border: 'border-indigo-200 dark:border-indigo-800/40',
      dot: 'bg-indigo-500',
      label: 'PARTLY REFUNDED'
    },
    cod: {
      bg: 'bg-purple-50 dark:bg-purple-950/30',
      text: 'text-purple-700 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800/40',
      dot: 'bg-purple-500',
      label: 'COD'
    }
  };

  const config = styles[normalized] || styles.pending;

  return (
    <motion.span 
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border backdrop-blur-md shadow-xs transition-all select-none ${config.bg} ${config.text} ${config.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </motion.span>
  );
};

// 2. Premium Glassmorphism Analytics Cards
export const AnalyticsGlassCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size: number; className?: string }>;
  colorTheme: string;
  trend?: string;
  trendValue?: string;
  delay?: number;
}> = ({ title, value, icon: Icon, colorTheme, trend, trendValue, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-[2rem] border border-white/20 dark:border-white/10 bg-gradient-to-br from-white/60 to-white/30 dark:from-stone-900/60 dark:to-stone-900/30 p-6 backdrop-blur-xl shadow-lg shadow-black/[0.03] dark:shadow-black/20"
    >
      {/* Decorative gradient aura */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10 dark:opacity-20 blur-2xl ${colorTheme}`} />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-2xl bg-white dark:bg-white/5 shadow-sm border border-black/5 dark:border-white/5`}>
          <Icon size={20} className={colorTheme.includes('emerald') ? 'text-emerald-500' : colorTheme.includes('purple') ? 'text-purple-500' : colorTheme.includes('rose') ? 'text-rose-500' : colorTheme.includes('amber') ? 'text-amber-500' : 'text-blue-500'} />
        </div>
        {trend && (
          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black tracking-tighter ${
            trend === 'up' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
          }`}>
            {trend === 'up' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
            {trendValue}
          </span>
        )}
      </div>

      <div className="relative z-10">
        <p className="text-[10px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight">{value}</h3>
      </div>
    </motion.div>
  );
};

// 3. Simple CSV Generator Export function
export const generatePaymentsCSV = (payments: PaymentNode[]) => {
  const headers = [
    'Order ID',
    'Customer Name',
    'Customer Email',
    'Payment Method',
    'Payment Status',
    'Amount',
    'Razorpay Payment ID',
    'Razorpay Order ID',
    'Date'
  ];

  const rows = payments.map(p => [
    p.order?.orderNumber || 'N/A',
    `"${p.user?.name || 'Guest'}"`,
    `"${p.user?.email || 'N/A'}"`,
    p.provider?.toUpperCase() || 'N/A',
    p.status?.toUpperCase() || 'N/A',
    p.amount || 0,
    p.razorpayPaymentId || p.razorpay_payment_id || 'N/A',
    p.razorpayOrderId || p.razorpay_order_id || 'N/A',
    `"${new Date(p.createdAt).toLocaleString()}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `payments_export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 4. Detailed Timeline View
export const PaymentTimelineSection: React.FC<{ payment: PaymentNode }> = ({ payment }) => {
  const order = payment.order;
  const isPaid = payment.status === 'paid';
  const isFailed = payment.status === 'failed';
  const isRefunded = payment.status?.includes('refund');

  const events = [
    {
      label: 'Order Created',
      desc: 'System established cart ledger items.',
      done: true,
      time: payment.createdAt ? new Date(payment.createdAt).toLocaleString() : 'N/A'
    },
    {
      label: 'Payment Initiated',
      desc: `Intent payload generated for ${payment.provider?.toUpperCase() || 'Gateway'}.`,
      done: true,
      time: payment.createdAt ? new Date(new Date(payment.createdAt).getTime() + 1000).toLocaleString() : 'N/A'
    },
    {
      label: 'Payment Authorized',
      desc: isPaid ? 'Signature verification keys successfully reconciled.' : isFailed ? 'Signature handshake dropped.' : 'Awaiting confirmation hooks.',
      done: isPaid || isFailed,
      isErr: isFailed,
      time: payment.order?.paidAt ? new Date(payment.order.paidAt).toLocaleString() : isPaid ? new Date(payment.createdAt).toLocaleString() : 'Pending'
    },
    {
      label: 'Payment Captured',
      desc: isPaid ? 'Funds fully wrapped into escrow holding buffers.' : 'Awaiting downstream clearance triggers.',
      done: isPaid,
      time: payment.order?.paidAt ? new Date(payment.order.paidAt).toLocaleString() : isPaid ? 'Success' : 'Pending'
    },
    {
      label: 'Invoice Sent',
      desc: order?.paymentLogs?.some(l => l.status === 'invoice_dispatched') ? 'Tax invoice successfully queued to customer email array.' : 'Automatic delivery workflow queued.',
      done: order?.paymentLogs?.some(l => l.status === 'invoice_dispatched') || isPaid,
      time: isPaid ? 'Auto Streamed' : 'Awaiting Settle'
    },
    {
      label: isRefunded ? 'Refund Executed' : 'Delivered',
      desc: isRefunded ? `Escrow released ₹${payment.refundAmount || payment.amount} back to consumer client targets.` : 'Fulfillment mapping completed.',
      done: isRefunded || order?.status === 'delivered',
      time: isRefunded && payment.refundedAt ? new Date(payment.refundedAt).toLocaleString() : 'Pipeline tracking active'
    }
  ];

  return (
    <div className="space-y-6">
      <h4 className="text-xs font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
        <Clock size={14} className="text-primary-500" /> Chronological Secure Verification Timeline
      </h4>
      <div className="relative pl-6 space-y-8 border-l-2 border-stone-100 dark:border-stone-800 ml-2">
        {events.map((ev, i) => (
          <div key={i} className="relative group">
            <span className={`absolute -left-[31px] top-1 flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all ${
              ev.isErr ? 'bg-rose-500 border-rose-200 text-white animate-pulse' : ev.done ? 'bg-emerald-500 border-emerald-100 text-white' : 'bg-stone-200 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-transparent'
            }`}>
              {ev.isErr ? <AlertCircle size={10} /> : ev.done ? <CheckCircle size={10} /> : <Clock size={10} />}
            </span>
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-bold tracking-wide ${ev.isErr ? 'text-rose-600 dark:text-rose-400 font-black' : ev.done ? 'text-stone-900 dark:text-white' : 'text-stone-400'}`}>
                  {ev.label}
                </span>
                <span className="text-[10px] font-mono font-medium text-stone-400 bg-stone-50 dark:bg-stone-900/50 px-2 py-0.5 rounded">
                  {ev.time}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">{ev.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 5. Payment Details Modal View
export const PaymentDetailsModal: React.FC<{
  payment: PaymentNode | null;
  onClose: () => void;
  onRetry: (id: string) => void;
  onRefund: (id: string, amount?: number, reason?: string) => void;
  onMarkCODPaid: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onResendInvoice: (id: string) => void;
  loadingAction: boolean;
}> = ({
  payment, onClose, onRetry, onRefund, onMarkCODPaid, onUpdateNotes, onResendInvoice, loadingAction
}) => {
  const [notesInput, setNotesInput] = React.useState('');
  const [refundAmt, setRefundAmt] = React.useState('');
  const [refundReason, setRefundReason] = React.useState('');
  const [showRefundForm, setShowRefundForm] = React.useState(false);

  React.useEffect(() => {
    if (payment) {
      setNotesInput(payment.notes || '');
      setShowRefundForm(false);
      setRefundAmt((payment.amount || 0).toString());
    }
  }, [payment]);

  if (!payment) return null;

  const o = payment.order;
  const u = payment.user;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto custom-scrollbar">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-stone-900 w-full max-w-4xl rounded-[2.5rem] border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Sticky Header */}
        <div className="p-6 sm:px-8 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 backdrop-blur-xl flex items-center justify-between sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-white tracking-tight">
                Ledger Profile inspection
              </h2>
              <PaymentStatusBadge status={payment.status} />
            </div>
            <p className="text-[11px] font-mono text-stone-400 mt-1">
              UUID: {payment._id} | Order: <span className="text-primary-600 font-bold">{o?.orderNumber || 'Orphaned'}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-200/50 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="flex-grow overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
          
          {/* Executive Overview Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-stone-50 dark:bg-stone-950 p-6 rounded-3xl border border-stone-200/60 dark:border-stone-800">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-1.5 mb-1">
                <User size={12} /> Contact Identifiers
              </span>
              <p className="text-sm font-bold text-stone-900 dark:text-white">{u?.name || 'Guest Checkout'}</p>
              <p className="text-xs text-stone-500 font-mono mt-0.5">{u?.email || 'N/A'}</p>
              <p className="text-xs text-stone-500 font-mono">{u?.mobile || o?.address?.mobile || 'No Mobile'}</p>
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-1.5 mb-1">
                <CreditCard size={12} /> Gateway Target
              </span>
              <p className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">{payment.provider}</p>
              <p className="text-xs text-stone-500 font-mono mt-0.5 truncate" title={payment.razorpayPaymentId || payment.razorpay_payment_id || 'N/A'}>
                ID: {payment.razorpayPaymentId || payment.razorpay_payment_id || 'None'}
              </p>
              <p className="text-xs text-stone-500 font-mono truncate" title={payment.razorpayOrderId || payment.razorpay_order_id || 'N/A'}>
                Ord: {payment.razorpayOrderId || payment.razorpay_order_id || 'None'}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-1.5 mb-1">
                <IndianRupee size={12} /> Reconciled Net
              </span>
              <p className="text-2xl font-black text-stone-900 dark:text-white tracking-tight">
                ₹{(payment.amount || 0).toLocaleString('en-IN')}
              </p>
              {payment.refundAmount ? (
                <p className="text-xs text-rose-500 font-medium mt-0.5">
                  Refunded: ₹{payment.refundAmount.toLocaleString('en-IN')}
                </p>
              ) : (
                <p className="text-xs text-stone-400 mt-0.5">No refunds recorded</p>
              )}
            </div>
          </div>

          {/* Detailed Destination Info */}
          {o?.address && (
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-stone-400 flex items-center gap-2 mb-3">
                <MapPin size={14} className="text-primary-500" /> Destination Delivery Mapping
              </h4>
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 text-xs space-y-1">
                <p className="font-bold text-stone-800 dark:text-stone-200">{o.address.name}</p>
                <p className="text-stone-600 dark:text-stone-400">{o.address.line1} {o.address.line2}</p>
                <p className="text-stone-600 dark:text-stone-400">{o.address.city}, {o.address.state} — {o.address.pincode}</p>
              </div>
            </div>
          )}

          {/* Main Layout Grid: Timeline left, Logs & Control right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <PaymentTimelineSection payment={payment} />

            <div className="space-y-6">
              {/* Administration Direct Command Center */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-stone-400 flex items-center gap-2 mb-3">
                  <ShieldCheck size={14} className="text-primary-500" /> Operational Administration Panel
                </h4>
                
                <div className="space-y-2">
                  {payment.provider === 'cod' && payment.status !== 'paid' && (
                    <button
                      disabled={loadingAction}
                      onClick={() => onMarkCODPaid(payment._id)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-black uppercase tracking-widest transition-all active:scale-98"
                    >
                      <span>✔ Mark COD as Paid</span>
                      <span className="text-[9px] bg-purple-200 dark:bg-purple-800 px-2 py-0.5 rounded text-purple-800 dark:text-purple-200">Settle Escrow</span>
                    </button>
                  )}

                  <button
                    disabled={loadingAction}
                    onClick={() => onRetry(payment._id)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 dark:bg-stone-900/60 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 text-xs font-black uppercase tracking-widest transition-all active:scale-98"
                  >
                    <span>↻ Retry Gateway Signature Sync</span>
                    <span className="text-[9px] bg-stone-200 dark:bg-stone-800 px-2 py-0.5 rounded text-stone-600 dark:text-stone-400">Poll Intent</span>
                  </button>

                  <button
                    disabled={loadingAction}
                    onClick={() => onResendInvoice(payment._id)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-black uppercase tracking-widest transition-all active:scale-98"
                  >
                    <span>✉ Resend Customer Invoice stream</span>
                    <span className="text-[9px] bg-blue-200 dark:bg-blue-800 px-2 py-0.5 rounded text-blue-800 dark:text-blue-200">Mail Cluster</span>
                  </button>

                  {payment.status !== 'refunded' && (
                    <div>
                      {!showRefundForm ? (
                        <button
                          onClick={() => setShowRefundForm(true)}
                          className="w-full text-center p-2 mt-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 text-xs font-black uppercase tracking-widest transition-all"
                        >
                          Trigger Escrow Refund
                        </button>
                      ) : (
                        <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 mt-2 space-y-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-rose-800 dark:text-rose-300">Refund Command Console</p>
                          <input 
                            type="number"
                            placeholder="Refund Amount (₹)"
                            value={refundAmt}
                            onChange={(e) => setRefundAmt(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-stone-900 border border-rose-200 dark:border-rose-800 rounded-xl text-xs"
                          />
                          <input 
                            type="text"
                            placeholder="Failure/Refund Rationale"
                            value={refundReason}
                            onChange={(e) => setRefundReason(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-stone-900 border border-rose-200 dark:border-rose-800 rounded-xl text-xs"
                          />
                          <div className="flex gap-2">
                            <button
                              disabled={loadingAction}
                              onClick={() => {
                                onRefund(payment._id, parseFloat(refundAmt) || undefined, refundReason);
                                setShowRefundForm(false);
                              }}
                              className="flex-1 p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md"
                            >
                              Execute Settle
                            </button>
                            <button
                              onClick={() => setShowRefundForm(false)}
                              className="p-2 bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-xl text-xs font-bold"
                            >
                              Abort
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Administrative Notes Form Block */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-stone-400 flex items-center gap-2 mb-2">
                  <FileText size={14} className="text-primary-500" /> Administrative Ledger Context
                </h4>
                <textarea
                  rows={3}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Record internal verification tracking sequences, compliance references, or offline banking transaction indices here..."
                  className="w-full p-3 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-primary-500 custom-scrollbar"
                />
                <button
                  disabled={loadingAction || notesInput === (payment.notes || '')}
                  onClick={() => onUpdateNotes(payment._id, notesInput)}
                  className="w-full mt-2 p-2 bg-primary-950 dark:bg-white text-white dark:text-stone-900 disabled:opacity-50 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm transition-all"
                >
                  Save Context Record
                </button>
              </div>

            </div>
          </div>

          {/* Persistent Log Array Block */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-stone-400 flex items-center gap-2 mb-3">
              <Layers size={14} className="text-primary-500" /> Immutable Escrow & Polling Event Log Array
            </h4>
            
            <div className="border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden bg-stone-50/50 dark:bg-stone-950/50">
              {o?.paymentLogs && o.paymentLogs.length > 0 ? (
                <div className="divide-y divide-stone-200/60 dark:divide-stone-800">
                  {o.paymentLogs.map((log, index) => (
                    <div key={index} className="p-3 text-xs flex items-start justify-between gap-4 hover:bg-white dark:hover:bg-stone-900 transition-colors">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                            [{log.source}]
                          </span>
                          <span className="font-bold text-stone-800 dark:text-stone-200">
                            {log.message}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-500 font-mono font-black uppercase">
                          State Signature: <span className="text-primary-600">{log.status}</span>
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-stone-400 whitespace-nowrap bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-stone-400">
                  Zero transaction event logs bound to current order verification targets.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Sticky Footer */}
        <div className="p-4 sm:px-8 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex justify-end sticky bottom-0 z-20">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-black uppercase tracking-widest hover:bg-stone-300 transition-colors"
          >
            Close Viewer
          </button>
        </div>

      </motion.div>
    </div>
  );
};
