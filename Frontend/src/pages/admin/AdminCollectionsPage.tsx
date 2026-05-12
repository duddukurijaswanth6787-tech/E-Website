import { useState, useEffect } from 'react';
import { DataTable } from '../../components/admin/DataTable';
import { categoryService } from '../../api/services/category.service';
import type { CollectionResponse } from '../../api/services/category.service';
import { Layers, Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminCollectionFormModal, { emptyCollectionForm, type CollectionFormState } from '../../components/admin/AdminCollectionFormModal';

const AdminCollectionsPage = () => {
  const [collections, setCollections] = useState<CollectionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activeCollection, setActiveCollection] = useState<CollectionResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CollectionFormState>(emptyCollectionForm());

  const fetchCollections = async () => {
    setLoading(true);
    try {
       const res = await categoryService.getAllCollections();
       if (res) {
          const fetchedData = (res as any).data || res || [];
          setCollections(Array.isArray(fetchedData) ? fetchedData : Object.values(fetchedData));
       }
    } catch (e: any) {
       console.error("Collections Fetch Failed", e);
       toast.error("Failed to load Collection matrix.");
       setCollections([]);
    } finally {
       setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const openCreate = () => {
    setModalMode('create');
    setActiveCollection(null);
    setForm(emptyCollectionForm());
    setModalOpen(true);
  };

  const openEdit = (c: CollectionResponse) => {
    setModalMode('edit');
    setActiveCollection(c);
    setForm({
      name: c.name || '',
      description: c.description || '',
      banner: c.banner || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Collection name is required');
    setSaving(true);
    try {
      if (modalMode === 'create') {
        await categoryService.createCollection(form);
        toast.success('Collection created successfully');
      } else if (activeCollection?._id) {
        await categoryService.updateCollection(activeCollection._id, form);
        toast.success('Collection updated successfully');
      }
      setModalOpen(false);
      fetchCollections();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save collection');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
     if (!window.confirm(`Warning: Deleting the Collection [${name}] removes its thematic wrapper. Are you sure you wish to proceed?`)) return;
     try {
        await categoryService.deleteCollection(id);
        toast.success(`${name} collection deleted from CRM.`);
        fetchCollections();
     } catch (e) {
        toast.error("Error mutating collection structure.");
     }
  };

  const columns = [
    { 
       header: 'Thematic Collection', 
       accessor: (row: CollectionResponse) => (
         <div className="flex items-center space-x-3">
           <div className="w-16 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
             <img src={row.banner || 'https://placehold.co/160x100?text=COLL'} alt={row.name} className="w-full h-full object-cover" />
           </div>
           <div>
             <span className="block font-medium tracking-wide text-primary-950">{row.name}</span>
             <span className="block text-xs text-[var(--admin-text-secondary)] font-mono mt-0.5">/{row.slug}</span>
           </div>
         </div>
       )
    },
    { 
       header: 'Marketing Description', 
       accessor: (row: CollectionResponse) => (
         <span className="text-xs text-gray-600 block max-w-sm truncate" title={row.description || ''}>
            {row.description || 'No thematic marketing copy attached'}
         </span>
       )
    },
    {
       header: 'Actions',
       accessor: (row: CollectionResponse) => (
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => openEdit(row)}
              className="p-1.5 text-gray-400 hover:text-primary-700 transition-colors" 
              title="Edit Theme"
            >
              <Edit2 size={16} />
            </button>
            <button onClick={() => handleDelete(row._id, row.name)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Delete Collection">
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
            <Layers className="w-6 h-6 mr-3 text-primary-700" /> Collections Dashboard
          </h1>
          <p className="text-sm text-[var(--admin-text-secondary)]">Curate seasonal themes, bridal collections, and exclusive drops.</p>
        </div>
        <div className="mt-4 sm:mt-0">
           <button 
             onClick={openCreate}
             className="flex items-center px-4 py-2 bg-primary-950 text-[var(--admin-text-primary)] text-sm font-bold tracking-widest uppercase rounded shadow hover:bg-primary-800 transition-colors"
           >
              <Plus size={16} className="mr-2" />
              Create Collection
           </button>
        </div>
      </div>

       <DataTable 
          columns={columns as any}
          data={collections}
          loading={loading}
          emptyMessage="No thematic collections are currently registered."
       />

       <AdminCollectionFormModal 
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

export default AdminCollectionsPage;


