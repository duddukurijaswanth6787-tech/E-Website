import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '../../api/services/payment.service';
import type { PaymentNode } from '../../api/services/payment.service';
import { DataTable } from '../../components/admin/DataTable';
import { 
  PaymentStatusBadge, AnalyticsGlassCard, 
  generatePaymentsCSV, PaymentDetailsModal 
} from '../../components/admin/payments/PaymentComponents';
import { 
  DollarSign, Eye, RefreshCw, Download, Search, 
  Calendar, IndianRupee, Layers, CheckCircle2, 
  AlertTriangle, Clock, RotateCcw, ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPaymentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  
  // State variables for robust filtering and pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selected Payment Node for the Administration Details Modal
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  // Debounce search string changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1); // Reset page on query updates
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Reset pagination on filter parameter switches
  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>, val: string) => {
    setter(val);
    setPage(1);
  };

  // 1. Fetch Analytics Metrics via Server-Side Queries
  const { data: analyticsRes } = useQuery({
    queryKey: ['paymentAnalyticsMetrics'],
    queryFn: () => paymentService.getPaymentAnalytics(),
    refetchInterval: 60000, // Sync every minute
  });

  // 2. Fetch Server-Side Paginated Payments Matrix
  const { data: paymentsRes, isLoading: loadingPayments, isFetching } = useQuery({
    queryKey: [
      'adminPaymentsLedger', 
      page, limit, statusFilter, providerFilter, 
      orderStatusFilter, debouncedSearch, startDate, endDate
    ],
    queryFn: () => paymentService.getAdminPayments({
      page,
      limit,
      status: statusFilter || undefined,
      provider: providerFilter || undefined,
      orderStatus: orderStatusFilter || undefined,
      search: debouncedSearch || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
  });

  // 3. Lazy modal loading via single item fetch
  const { data: detailRes, isLoading: loadingDetail } = useQuery({
    queryKey: ['paymentDetailInspect', selectedPaymentId],
    queryFn: () => paymentService.getPaymentDetail(selectedPaymentId!),
    enabled: !!selectedPaymentId,
  });

  // Administrative action mutators
  const { mutate: markCODPaidMutate, isPending: pendingCOD } = useMutation({
    mutationFn: (id: string) => paymentService.markCODPaid(id),
    onSuccess: () => {
      toast.success('Escrow status updated to PAID successfully.');
      queryClient.invalidateQueries({ queryKey: ['adminPaymentsLedger'] });
      queryClient.invalidateQueries({ queryKey: ['paymentAnalyticsMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['paymentDetailInspect', selectedPaymentId] });
    },
    onError: () => toast.error('Failed to update ledger records.')
  });

  const { mutate: retrySyncMutate, isPending: pendingRetry } = useMutation({
    mutationFn: (id: string) => paymentService.retryVerification(id),
    onSuccess: () => {
      toast.success('Gateway Verification check re-queued perfectly.');
      queryClient.invalidateQueries({ queryKey: ['paymentDetailInspect', selectedPaymentId] });
    },
    onError: () => toast.error('Gateway sync failed.')
  });

  const { mutate: refundMutate, isPending: pendingRefund } = useMutation({
    mutationFn: ({ id, amount, reason }: { id: string; amount?: number; reason?: string }) => 
      paymentService.refundOrder(id, amount, reason),
    onSuccess: () => {
      toast.success('Refund transaction executed through primary banking target.');
      queryClient.invalidateQueries({ queryKey: ['adminPaymentsLedger'] });
      queryClient.invalidateQueries({ queryKey: ['paymentAnalyticsMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['paymentDetailInspect', selectedPaymentId] });
    },
    onError: () => toast.error('Refund verification dropped.')
  });

  const { mutate: notesMutate, isPending: pendingNotes } = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => paymentService.updateNotes(id, notes),
    onSuccess: () => {
      toast.success('Context logging records persisted.');
      queryClient.invalidateQueries({ queryKey: ['paymentDetailInspect', selectedPaymentId] });
    },
    onError: () => toast.error('Context modification error.')
  });

  const { mutate: invoiceMutate, isPending: pendingInvoice } = useMutation({
    mutationFn: (id: string) => paymentService.resendInvoice(id),
    onSuccess: () => {
      toast.success('Invoice transmission array re-queued.');
      queryClient.invalidateQueries({ queryKey: ['paymentDetailInspect', selectedPaymentId] });
    },
    onError: () => toast.error('Streaming sequence blocked.')
  });

  // Safe properties mapped from API packages
  const paymentsList: PaymentNode[] = useMemo(() => {
    if (!paymentsRes?.data) return [];
    const p = (paymentsRes.data as any).payments || (paymentsRes.data as any).data || paymentsRes.data;
    return Array.isArray(p) ? p : Object.values(p || {});
  }, [paymentsRes]);

  const paginationMeta = useMemo(() => {
    return (paymentsRes?.data as any)?.pagination || { page: 1, limit: 10, total: 0 };
  }, [paymentsRes]);

  const analyticsData = analyticsRes?.data;
  const cards = analyticsData?.cards;

  // Complete metrics card mapping exactly following prompt rules
  const analyticsCardsConfig = useMemo(() => [
    { title: 'Total Revenue', value: `₹${(cards?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: IndianRupee, colorTheme: 'bg-emerald-500', trend: 'up', trendValue: '+14%' },
    { title: "Today's Revenue", value: `₹${(cards?.todaysRevenue || 0).toLocaleString('en-IN')}`, icon: DollarSign, colorTheme: 'bg-emerald-400', trend: 'up', trendValue: 'Active' },
    { title: 'Paid Orders', value: cards?.paidOrders || 0, icon: CheckCircle2, colorTheme: 'bg-blue-500' },
    { title: 'Pending Payments', value: cards?.pendingPayments || 0, icon: Clock, colorTheme: 'bg-amber-500' },
    { title: 'Failed Payments', value: cards?.failedPayments || 0, icon: AlertTriangle, colorTheme: 'bg-rose-500' },
    { title: 'COD Orders', value: cards?.codOrders || 0, icon: Layers, colorTheme: 'bg-purple-500' },
    { title: 'Refund Amount', value: `₹${(cards?.refundAmount || 0).toLocaleString('en-IN')}`, icon: RotateCcw, colorTheme: 'bg-sky-500' },
    { title: 'Razorpay Revenue', value: `₹${(cards?.razorpayRevenue || 0).toLocaleString('en-IN')}`, icon: ShieldAlert, colorTheme: 'bg-indigo-500' },
  ], [cards]);

  // Data Table column definitions explicitly mapping requested fields
  const columns = useMemo(() => [
    {
      header: 'Order ID',
      accessor: (row: PaymentNode) => (
        <span className="font-bold text-xs font-mono text-primary-950 uppercase tracking-wide">
          {row.order?.orderNumber || 'ORPHAN'}
        </span>
      )
    },
    {
      header: 'Customer',
      accessor: (row: PaymentNode) => (
        <div className="max-w-[120px] truncate">
          <span className="block text-xs font-bold text-stone-900 dark:text-white truncate">
            {row.user?.name || 'Guest'}
          </span>
        </div>
      )
    },
    {
      header: 'Email',
      accessor: (row: PaymentNode) => (
        <span className="text-[11px] text-stone-500 font-mono truncate block max-w-[140px]">
          {row.user?.email || 'N/A'}
        </span>
      )
    },
    {
      header: 'Phone',
      accessor: (row: PaymentNode) => (
        <span className="text-[11px] text-stone-500 font-mono">
          {row.user?.mobile || row.order?.address?.mobile || 'N/A'}
        </span>
      )
    },
    {
      header: 'Method',
      accessor: (row: PaymentNode) => (
        <span className="text-[10px] font-black uppercase tracking-widest text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded">
          {row.provider}
        </span>
      )
    },
    {
      header: 'Payment Status',
      accessor: (row: PaymentNode) => <PaymentStatusBadge status={row.status} />
    },
    {
      header: 'Order Status',
      accessor: (row: PaymentNode) => (
        <span className="text-[10px] font-bold uppercase text-stone-400">
          {row.order?.status || 'N/A'}
        </span>
      )
    },
    {
      header: 'Amount',
      accessor: (row: PaymentNode) => (
        <span className="text-xs font-black text-stone-900 dark:text-white">
          ₹{(row.amount || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Razorpay Payment ID',
      accessor: (row: PaymentNode) => (
        <span className="text-[10px] font-mono text-stone-400 block max-w-[120px] truncate" title={row.razorpayPaymentId || row.razorpay_payment_id || 'N/A'}>
          {row.razorpayPaymentId || row.razorpay_payment_id || 'None'}
        </span>
      )
    },
    {
      header: 'Razorpay Order ID',
      accessor: (row: PaymentNode) => (
        <span className="text-[10px] font-mono text-stone-400 block max-w-[120px] truncate" title={row.razorpayOrderId || row.razorpay_order_id || 'N/A'}>
          {row.razorpayOrderId || row.razorpay_order_id || 'None'}
        </span>
      )
    },
    {
      header: 'Date',
      accessor: (row: PaymentNode) => (
        <span className="text-[10px] text-stone-400 whitespace-nowrap">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: (row: PaymentNode) => (
        <button 
          onClick={() => setSelectedPaymentId(row._id)}
          className="p-1.5 rounded-lg bg-primary-50 dark:bg-stone-800 text-primary-700 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-stone-700 transition-colors shadow-xs"
          title="Inspect Complete Ledger Modal"
        >
          <Eye size={14} />
        </button>
      )
    }
  ], []);

  const isExecutingAction = pendingCOD || pendingRetry || pendingRefund || pendingNotes || pendingInvoice;

  return (
    <div className="space-y-8 pb-12 font-sans select-none">
      
      {/* 1. Header with Export controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-stone-200/60 dark:border-stone-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest font-mono">Ledger Realtime Live Stream</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white tracking-tight flex items-center gap-3">
            Financial Management Matrix
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-xl">
            Aggregate Escrow signature blocks, retry offline COD sync hooks, trace verification failure rationales, and export audit ledgers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button 
            disabled={isFetching || loadingPayments}
            onClick={() => queryClient.invalidateQueries({ queryKey: ['adminPaymentsLedger'] })}
            className="p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-500 hover:text-stone-900 transition-colors shadow-xs"
            title="Refresh Matrix Stream"
          >
            <RefreshCw size={16} className={isFetching ? 'animate-spin text-primary-500' : ''} />
          </button>

          <button
            onClick={() => generatePaymentsCSV(paymentsList)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 text-xs font-black uppercase tracking-widest hover:border-stone-300 transition-all shadow-xs active:scale-98"
          >
            <Download size={14} className="text-primary-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Top Analytics Metrics Grid (Glassmorphism layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {analyticsCardsConfig.map((cfg, i) => (
          <AnalyticsGlassCard key={i} {...cfg} delay={i * 0.05} />
        ))}
      </div>

      {/* 3. Sticky Filters Panel */}
      <div className="bg-stone-50/80 dark:bg-stone-900/80 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          
          {/* Searching blocks */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-3 text-stone-400" size={15} />
            <input 
              type="text"
              placeholder="Search by Razorpay Order ID or Payment ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>

          {/* Filtering selectors */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
              className="flex-1 sm:w-auto px-3 py-2.5 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl text-xs font-bold text-stone-700 dark:text-stone-300 focus:outline-none"
            >
              <option value="">All Payment Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>

            <select
              value={providerFilter}
              onChange={(e) => handleFilterChange(setProviderFilter, e.target.value)}
              className="flex-1 sm:w-auto px-3 py-2.5 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl text-xs font-bold text-stone-700 dark:text-stone-300 focus:outline-none"
            >
              <option value="">All Gateways</option>
              <option value="razorpay">Razorpay</option>
              <option value="cod">Cash on Delivery</option>
            </select>

            <select
              value={orderStatusFilter}
              onChange={(e) => handleFilterChange(setOrderStatusFilter, e.target.value)}
              className="flex-1 sm:w-auto px-3 py-2.5 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl text-xs font-bold text-stone-700 dark:text-stone-300 focus:outline-none"
            >
              <option value="">All Order Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Date Ranges blocks */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200/40 dark:border-stone-800/40 text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Calendar size={14} className="text-stone-400" />
            <span className="text-stone-500 font-bold text-[10px] uppercase tracking-wider">Date Boundary Filter:</span>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => handleFilterChange(setStartDate, e.target.value)}
              className="px-2 py-1 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg text-stone-600 dark:text-stone-400"
            />
            <span className="text-stone-400">to</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => handleFilterChange(setEndDate, e.target.value)}
              className="px-2 py-1 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg text-stone-600 dark:text-stone-400"
            />
          </div>

          {(statusFilter || providerFilter || orderStatusFilter || debouncedSearch || startDate || endDate) && (
            <button
              onClick={() => {
                setStatusFilter('');
                setProviderFilter('');
                setOrderStatusFilter('');
                setSearchInput('');
                setDebouncedSearch('');
                setStartDate('');
                setEndDate('');
                setPage(1);
              }}
              className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors"
            >
              Clear Active Filters
            </button>
          )}
        </div>
      </div>

      {/* 4. Advanced Payments Data Table */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-[2.5rem] overflow-hidden shadow-sm">
        <DataTable 
          columns={columns as any}
          data={paymentsList}
          loading={loadingPayments}
          emptyMessage="Zero verification keys match the requested financial timeline/filter criteria."
          pagination={{
            page: paginationMeta.page || page,
            limit: paginationMeta.limit || limit,
            total: paginationMeta.total || paymentsList.length,
            onPageChange: (newPage) => setPage(newPage)
          }}
        />
      </div>

      {/* 5. Lazy loading Detailed Administration Modal View */}
      {selectedPaymentId && (
        <PaymentDetailsModal 
          payment={detailRes?.data || null}
          onClose={() => setSelectedPaymentId(null)}
          onMarkCODPaid={(id) => markCODPaidMutate(id)}
          onRetry={(id) => retrySyncMutate(id)}
          onRefund={(id, amt, reason) => refundMutate({ id, amount: amt, reason })}
          onUpdateNotes={(id, notes) => notesMutate({ id, notes })}
          onResendInvoice={(id) => invoiceMutate(id)}
          loadingAction={isExecutingAction || loadingDetail}
        />
      )}

    </div>
  );
};

export default AdminPaymentsPage;
