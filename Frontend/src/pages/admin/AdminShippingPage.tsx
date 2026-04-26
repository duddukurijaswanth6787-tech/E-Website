import { useState, useEffect } from 'react';
import { DataTable } from '../../components/admin/DataTable';
import { shippingService } from '../../api/services/shipping.service';
import type { ShippingRule } from '../../api/services/shipping.service';
import { Truck, Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminShippingFormModal, { emptyShippingForm, type ShippingFormState } from '../../components/admin/AdminShippingFormModal';

const AdminShippingPage = () => {
  const [rules, setRules] = useState<ShippingRule[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activeRule, setActiveRule] = useState<ShippingRule | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ShippingFormState>(emptyShippingForm());

  const fetchRules = async () => {
    setLoading(true);
    try {
       const res = await shippingService.getRules();
       if (res) {
          const fetchedData = (res as any).data?.shipping || (res as any).data?.data || (res as any).data || [];
          setRules(Array.isArray(fetchedData) ? fetchedData : Object.values(fetchedData));
       }
    } catch (e: any) {
       console.warn("Shipping Setup Warn", e);
       toast.error("Backend Gap: GET /api/v1/shipping missing. Stubbing Logistics Hub.");
       setRules([
         { _id: '1', region: 'Domestic (India)', method: 'Standard Delivery', cost: 150, minOrderValue: 5000, isActive: true },
         { _id: '2', region: 'International Tier 1', method: 'Express Air', cost: 2500, isActive: true }
       ]);
    } finally {
       setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const openCreate = () => {
    setModalMode('create');
    setActiveRule(null);
    setForm(emptyShippingForm());
    setModalOpen(true);
  };

  const openEdit = (r: ShippingRule) => {
    setModalMode('edit');
    setActiveRule(r);
    setForm({
      region: r.region || '',
      method: r.method || '',
      cost: r.cost,
      minOrderValue: r.minOrderValue ?? '',
      isActive: r.isActive,
      notes: r.notes || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const handleSave = async () => {
    if (!form.region.trim()) return toast.error('Region is required');
    if (!form.method.trim()) return toast.error('Method is required');
    if (form.cost === '') return toast.error('Cost is required');
    setSaving(true);
    try {
      if (modalMode === 'create') {
        await shippingService.createRule(form);
        toast.success('Shipping tier created');
      } else if (activeRule?._id) {
        await shippingService.updateRule(activeRule._id, form);
        toast.success('Shipping tier updated');
      }
      setModalOpen(false);
      fetchRules();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save shipping rule');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, method: string) => {
     if (!window.confirm(`Warning: Deleting the Shipping Rule [${method}]. Are you sure?`)) return;
     try {
        await shippingService.deleteRule(id);
        toast.success(`Shipping method removed.`);
        fetchRules();
     } catch (e) {
        toast.error("Error mutating logistic parameters.");
     }
  };

  const columns = [
    { 
       header: 'Service Region', 
       accessor: (row: ShippingRule) => (
         <div className="flex items-center space-x-3">
           <div>
             <span className="block font-medium tracking-wide text-primary-950">{row.region}</span>
             <span className="block text-xs text-gray-500 font-mono mt-0.5">{row.method}</span>
           </div>
         </div>
       )
    },
    { 
       header: 'Base Tariff', 
       accessor: (row: ShippingRule) => (
         <span className="block font-medium text-gray-900">₹{row.cost.toLocaleString('en-IN')}</span>
       )
    },
    { 
       header: 'Free Shipping Threshold', 
       accessor: (row: ShippingRule) => (
         <span className={`inline-flex px-2 py-1 rounded text-[0.65rem] font-bold tracking-widest uppercase ${row.minOrderValue ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            {row.minOrderValue ? `OVER ₹${row.minOrderValue.toLocaleString()}` : 'NOT APPLICABLE'}
         </span>
       )
    },
    { 
       header: 'Status', 
       accessor: (row: ShippingRule) => (
         <span className={`inline-flex px-2 py-1 rounded text-[0.65rem] font-bold tracking-widest uppercase ${row.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {row.isActive ? 'OPERATIONAL' : 'DISABLED'}
         </span>
       )
    },
    {
       header: 'Actions',
       accessor: (row: ShippingRule) => (
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => openEdit(row)}
              className="p-1.5 text-gray-400 hover:text-primary-700 transition-colors" 
              title="Edit Pricing"
            >
              <Edit2 size={16} />
            </button>
            <button onClick={() => handleDelete(row._id, row.method)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Trash Node">
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
            <Truck className="w-6 h-6 mr-3 text-primary-700" /> Logistics & Shipping Integrations
          </h1>
          <p className="text-sm text-gray-500">Configure global delivery boundaries, conditional order margins, and baseline tariffs.</p>
        </div>
         <div className="mt-4 sm:mt-0">
            <button 
              onClick={openCreate}
              className="flex items-center px-4 py-2 bg-primary-950 text-white text-sm font-bold tracking-widest uppercase rounded shadow hover:bg-primary-800 transition-colors"
            >
               <Plus size={16} className="mr-2" />
               Add Delivery Tier
            </button>
         </div>
      </div>

       <DataTable 
          columns={columns as any}
          data={rules}
          loading={loading}
          emptyMessage="No active logistic shipping boundaries deployed."
       />

       <AdminShippingFormModal 
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

export default AdminShippingPage;
