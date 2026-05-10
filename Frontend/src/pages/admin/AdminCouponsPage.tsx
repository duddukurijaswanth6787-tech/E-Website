import { useState, useEffect } from 'react';
import { DataTable } from '../../components/admin/DataTable';
import { couponService } from '../../api/services/coupon.service';
import type { Coupon } from '../../api/services/coupon.service';
import { Tag, Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminCouponFormModal, { emptyCouponForm, type CouponFormState } from '../../components/admin/AdminCouponFormModal';

const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CouponFormState>(emptyCouponForm());

  const fetchCoupons = async (page = 1) => {
    setLoading(true);
    try {
       const res = await couponService.getCoupons({ page, limit: pagination.limit });
       if (res) {
          const fetchedData = (res as any).data?.coupons || (res as any).data?.data || (res as any).data || [];
          const arr = Array.isArray(fetchedData) ? fetchedData : Object.values(fetchedData);
          setCoupons(arr);
          
          if ((res as any).data?.pagination) {
             setPagination({
                page: (res as any).data.pagination.page,
                limit: (res as any).data.pagination.limit,
                total: (res as any).data.pagination.total
             });
          } else {
             setPagination(prev => ({ ...prev, total: arr.length || 0 }));
          }
       }
    } catch (e: any) {
       console.warn("Coupons Endpoint Error", e);
       if (e?.response?.status === 404) {
          toast.error("Backend Gap: GET /api/v1/coupons/admin missing. Cannot poll voucher tracking matrix.");
       } else {
          toast.error("Failed to load discount parameters.");
       }
       setCoupons([]);
    } finally {
       setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons(pagination.page);
  }, [pagination.page]);

  const openCreate = () => {
    setModalMode('create');
    setActiveCoupon(null);
    setForm(emptyCouponForm());
    setModalOpen(true);
  };

  const openEdit = (c: Coupon) => {
    setModalMode('edit');
    const typeMap: Record<string, 'PERCENTAGE' | 'FIXED'> = {
      'percentage': 'PERCENTAGE',
      'flat': 'FIXED'
    };
    
    setForm({
      code: c.code,
      discountType: typeMap[c.type] || 'PERCENTAGE',
      discountValue: c.value,
      minOrderValue: c.minOrderAmount ?? '',
      maxDiscount: c.maxDiscountAmount ?? '',
      validFrom: new Date(c.validFrom).toISOString().split('T')[0],
      validUntil: new Date(c.validTo).toISOString().split('T')[0],
      usageLimit: c.maxUses ?? '',
      isActive: c.isActive,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const handleSave = async () => {
    if (!form.code.trim()) return toast.error('Coupon code is required');
    if (form.discountValue === '') return toast.error('Discount value is required');
    setSaving(true);
    try {
      if (modalMode === 'create') {
        await couponService.createCoupon(form);
        toast.success('Coupon generated successfully');
      } else if (activeCoupon?._id) {
        await couponService.updateCoupon(activeCoupon._id, form);
        toast.success('Coupon logic updated successfully');
      }
      setModalOpen(false);
      fetchCoupons(pagination.page);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
     if (!window.confirm(`Deactivating coupon [${code}]. Active carts will lose this discount. Proceed?`)) return;
     try {
        await couponService.deleteCoupon(id);
        toast.success(`Coupon ${code} trashed.`);
        fetchCoupons(pagination.page);
     } catch (e) {
        toast.error("Error mutating discount pipeline.");
     }
  };

  const columns = [
    { 
       header: 'Voucher Key', 
       accessor: (row: Coupon) => (
         <div>
           <span className="block text-sm font-mono tracking-widest text-primary-800 uppercase font-black bg-primary-50 px-2 py-1 rounded inline-block border border-primary-200">
             {row.code}
           </span>
         </div>
       )
    },
    { 
       header: 'Payload Value', 
       accessor: (row: Coupon) => (
          <span className="block font-medium text-gray-900">
            {row.type === 'percentage' ? `${row.value}% OFF` : `₹${row.value?.toLocaleString('en-IN')}`}
          </span>
       )
    },
    { 
       header: 'Usage Limits', 
       accessor: (row: Coupon) => (
          <div>
            <span className="block text-sm text-gray-800 tracking-wide">{row.usedCount || 0} / {row.maxUses || '∞'} Uses</span>
          </div>
       )
    },
    { 
       header: 'Status',        accessor: (row: Coupon) => {
          const isActive = row.isActive && new Date(row.validTo) > new Date();
         return (
           <span className={`inline-flex px-2 py-1 rounded text-[0.65rem] font-bold tracking-widest uppercase ${isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {isActive ? 'ACTIVE' : 'EXPIRED / HIDDEN'}
           </span>
         );
       }
    },
    {
       header: 'Actions',
       accessor: (row: Coupon) => (
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => openEdit(row)}
              className="p-1.5 text-gray-400 hover:text-primary-700 transition-colors" 
              title="Edit Logic"
            >
              <Edit2 size={16} />
            </button>
            <button onClick={() => handleDelete(row._id, row.code)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Delete Trigger">
              <Trash2 size={16} />
            </button>
          </div>
       )
    }
  ];

  return (
    <div className="space-y-6 max-w-[100vw] overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-serif text-gray-900 mb-1 flex items-center">
            <Tag className="w-6 h-6 mr-3 text-primary-700" /> Voucher Marketing Hub
          </h1>
          <p className="text-sm text-gray-500">Configure global discounts, seasonal promo codes, and isolated cart subsidies.</p>
        </div>
        <div className="mt-4 sm:mt-0">
           <button 
             onClick={openCreate}
             className="flex items-center px-4 py-2 bg-primary-950 text-white text-sm font-bold tracking-widest uppercase rounded shadow hover:bg-primary-800 transition-colors"
           >
              <Plus size={16} className="mr-2" />
              Generate Token
           </button>
        </div>
      </div>

      <DataTable 
         columns={columns as any}
         data={coupons}
         loading={loading}
         emptyMessage="No promotional marketing vouchers currently active."
         pagination={{
           page: pagination.page,
           limit: pagination.limit,
           total: Math.max(pagination.total, coupons.length),
           onPageChange: (newPage) => setPagination({...pagination, page: newPage})
         }}
      />

      <AdminCouponFormModal 
        open={modalOpen}
        mode={modalMode}
        saving={saving}
        form={form}
        setForm={setForm}
        onClose={closeModal}
        onSave={handleSave}
      />
    </div>
  );
};

export default AdminCouponsPage;
