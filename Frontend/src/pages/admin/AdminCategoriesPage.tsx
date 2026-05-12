import { useState, useEffect } from 'react';
import { DataTable } from '../../components/admin/DataTable';
import { Input } from '../../components/common/Input';
import { categoryService } from '../../api/services/category.service';
import type { Category } from '../../api/services/category.service';
import { Network, Plus, Edit2, Trash2, HelpCircle, Globe } from 'lucide-react';
import { ImageUploader } from '../../components/admin/ImageUploader';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const OCCASION_OPTIONS = [
  'Wedding',
  'Festive',
  'Party',
  'Casual',
  'Office',
  'Traditional',
  'Reception',
  'Engagement',
  'Pooja',
  'Bridal',
] as const;

type CategoryFormState = {
  name: string;
  description: string;
  banner: string;
  type: 'category' | 'subcategory';
  parent?: string;
  order?: number;
  isActive: boolean;
  fabric: string;
  origin: string;
  weaveType: '' | 'handloom' | 'powerloom' | 'mixed' | 'other';
  occasions: string[];
  customOccasion: string;
  seoTitle?: string;
  seoDescription?: string;
};

const emptyForm = (): CategoryFormState => ({
  name: '',
  description: '',
  banner: '',
  type: 'category',
  parent: '',
  order: 1,
  isActive: true,
  fabric: '',
  origin: '',
  weaveType: '',
  occasions: [],
  customOccasion: '',
  seoTitle: '',
  seoDescription: '',
});

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CategoryFormState>(emptyForm());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
       const res = await categoryService.getAllCategories();
       if (res) {
          const fetchedData = (res as any).data || res || [];
          setCategories(Array.isArray(fetchedData) ? fetchedData : Object.values(fetchedData));
       }
    } catch (e: any) {
       console.error("Categories Fetch Failed", e);
       toast.error("Failed to load Category tree.");
       setCategories([]);
    } finally {
       setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreate = () => {
    setModalMode('create');
    setActiveCategory(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openCreateSubcategory = () => {
    setModalMode('create');
    setActiveCategory(null);
    setForm({ ...emptyForm(), type: 'subcategory' });
    setModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setModalMode('edit');
    setActiveCategory(c);
    const parentId = (c as any).parent?._id ?? (c as any).parent ?? '';
    setForm({
      name: c.name ?? '',
      description: c.description ?? '',
      banner: c.banner ?? '',
      type: parentId ? 'subcategory' : 'category',
      parent: parentId,
      order: (c as any).order ?? 1,
      isActive: (c as any).isActive ?? true,
      fabric: (c as any).metadata?.fabric ?? '',
      origin: (c as any).metadata?.origin ?? '',
      weaveType: (c as any).metadata?.weaveType ?? '',
      occasions: Array.isArray((c as any).metadata?.occasions) ? (c as any).metadata.occasions : [],
      customOccasion: '',
      seoTitle: (c as any).seo?.title || '',
      seoDescription: (c as any).seo?.description || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Category name is required');
    if (form.type === 'subcategory' && !form.parent) return toast.error('Please select a parent category');

    setSaving(true);
    try {
      const occasions = Array.from(new Set((form.occasions || []).map((o) => o.trim()).filter(Boolean)));

      const payload: any = {
        name: form.name.trim(),
        description: form.description || undefined,
        banner: form.banner || undefined,
        parent: form.type === 'subcategory' ? (form.parent || undefined) : undefined,
        order: Number(form.order ?? 1),
        isActive: Boolean(form.isActive),
        metadata: {
          fabric: form.fabric || undefined,
          origin: form.origin || undefined,
          weaveType: form.weaveType || undefined,
          occasions: occasions.length ? occasions : undefined,
        },
        seo: {
          title: form.seoTitle || undefined,
          description: form.seoDescription || undefined,
        },
      };

      if (modalMode === 'create') {
        await categoryService.createCategory(payload);
        toast.success('Category created');
      } else if (activeCategory?._id) {
        await categoryService.updateCategory(activeCategory._id, payload);
        toast.success('Category updated');
      }

      setModalOpen(false);
      fetchCategories();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (id: string, name: string) => {
    if (deletingIds.has(id)) return;
    setDeleteConfirm({ id, name });
  };

  const performDelete = async () => {
    if (!deleteConfirm) return;
    const { id, name } = deleteConfirm;

    const toastId = toast.loading('Deleting category…');
    try {
      setDeletingIds((prev) => new Set(prev).add(id));
      const res = await categoryService.deleteCategory(id);
      console.log('[AdminCategories] delete response', res);
      setCategories((prev) => prev.filter((c) => c._id !== id));
      toast.success(`${name} deleted`, { id: toastId });
      setDeleteConfirm(null);
      // Best-effort refresh to sync any other changes (e.g., parent/subcategory counts)
      fetchCategories();
    } catch (e: any) {
      console.error('Category delete failed', e);
      toast.error(e?.message || e?.error || 'Delete failed', { id: toastId });
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const columns = [
    { 
       header: 'Category Node', 
       accessor: (row: Category) => (
         <div className="flex items-center space-x-3">
           <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
             <img src={row.banner || 'https://placehold.co/100?text=CAT'} alt={row.name} className="w-full h-full object-cover" />
           </div>
           <div className="min-w-0">
             <div className="flex items-center gap-2 min-w-0">
               {((row as any).parent?._id || (row as any).parent) && (
                 <span className="inline-flex px-2 py-0.5 rounded-full text-[0.6rem] font-black uppercase tracking-widest bg-primary-50 text-primary-800 border border-primary-100 flex-shrink-0">
                   Sub
                 </span>
               )}
               <span className="block font-medium tracking-wide text-primary-950 truncate">{row.name}</span>
             </div>
             <span className="block text-xs text-[var(--admin-text-secondary)] font-mono mt-0.5">/{row.slug}</span>
           </div>
         </div>
       )
    },
    {
      header: 'Parent',
      accessor: (row: Category) => {
        const parent = (row as any).parent;
        const parentName = typeof parent === 'object' ? parent?.name : '';
        return (
          <span className="text-xs text-gray-600">
            {parentName || '—'}
          </span>
        );
      }
    },
    { 
       header: 'Subcategories', 
       accessor: (row: Category) => {
         const subs = (categories as any[]).filter((c) => (c as any).parent?._id === row._id || (c as any).parent === row._id);
         return (
           <span className="text-xs text-gray-600 block max-w-xs truncate" title={subs.map((s) => s.name).join(', ')}>
             {subs.length ? subs.map((s) => s.name).slice(0, 3).join(', ') + (subs.length > 3 ? ` +${subs.length - 3}` : '') : '—'}
           </span>
         );
       }
    },
    { 
       header: 'Description Metadata', 
       accessor: (row: Category) => (
         <span className="text-xs text-gray-600 block max-w-xs truncate" title={row.description || ''}>
            {row.description || 'No taxonomic description tied to this node'}
         </span>
       )
    },
    {
      header: 'Metadata',
      accessor: (row: Category) => {
        const m = (row as any).metadata;
        const bits = [
          m?.fabric ? `fabric:${m.fabric}` : null,
          m?.origin ? `origin:${m.origin}` : null,
          m?.weaveType ? `weave:${m.weaveType}` : null,
          Array.isArray(m?.occasions) && m.occasions.length ? `occasion:${m.occasions.join('/')}` : null,
        ].filter(Boolean);
        return (
          <span className="text-xs text-gray-600 block max-w-xs truncate" title={bits.join(' • ')}>
            {bits.length ? bits.join(' • ') : '—'}
          </span>
        );
      }
    },
    { 
       header: 'Total Items Assigned', 
       accessor: (row: Category) => (
         <span className="inline-flex px-2.5 py-1 rounded-full text-[0.65rem] font-bold tracking-widest uppercase bg-gray-100 text-gray-800">
            {row.count || 0} PRODUCTS
         </span>
       )
    },
    {
       header: 'Actions',
       accessor: (row: Category) => (
         <div className="flex items-center space-x-2">
           <button
             type="button"
             onClick={(e) => { e.stopPropagation(); setModalMode('create'); setActiveCategory(null); setForm({ ...emptyForm(), type: 'subcategory', parent: row._id }); setModalOpen(true); }}
             className="p-1.5 text-gray-400 hover:text-primary-700 transition-colors"
             title="Add Subcategory"
           >
             <Plus size={16} />
           </button>
           <button
             type="button"
             onClick={(e) => { e.stopPropagation(); openEdit(row); }}
             className="p-1.5 text-gray-400 hover:text-primary-700 transition-colors"
             title="Edit Taxonomy"
           >
             <Edit2 size={16} />
           </button>
           <button
             type="button"
             onClick={(e) => { e.stopPropagation(); requestDelete(row._id, row.name); }}
             className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
             title="Detach Node"
           >
             <Trash2 size={16} />
           </button>
         </div>
       )
    }
  ];

  const toggleOccasion = (label: string) => {
    setForm((f) => {
      const exists = f.occasions.includes(label);
      return { ...f, occasions: exists ? f.occasions.filter((o) => o !== label) : [...f.occasions, label] };
    });
  };

  const addCustomOccasion = () => {
    const val = form.customOccasion.trim();
    if (!val) return;
    setForm((f) => ({
      ...f,
      occasions: f.occasions.includes(val) ? f.occasions : [...f.occasions, val],
      customOccasion: '',
    }));
  };

  return (
    <div className="space-y-6 max-w-[100vw] overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-serif text-gray-900 mb-1 flex items-center">
            <Network className="w-6 h-6 mr-3 text-primary-700" /> Category Taxonomy Hub
          </h1>
          <p className="text-sm text-[var(--admin-text-secondary)]">Configure global shop filter logic by organizing core inventory nodes.</p>
          <div className="mt-3">
            <Link
              to="/admin/categories/subcategory-support"
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary-800 hover:text-primary-950"
            >
              <HelpCircle size={14} />
              Need help adding subcategories?
            </Link>
          </div>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={openCreate}
              className="flex items-center justify-center px-4 py-2 bg-primary-950 text-[var(--admin-text-primary)] text-sm font-bold tracking-widest uppercase rounded shadow hover:bg-primary-800 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Add Category
            </button>
            <button
              type="button"
              onClick={openCreateSubcategory}
              className="flex items-center justify-center px-4 py-2 bg-[var(--admin-card)] border border-primary-950 text-primary-950 text-sm font-bold tracking-widest uppercase rounded shadow-sm hover:bg-primary-50 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Add Subcategory
            </button>
          </div>
        </div>
      </div>

      <DataTable 
         columns={columns as any}
         data={categories}
         loading={loading}
         emptyMessage="No core categories found assigned to the store logic."
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={closeModal}>
          <div
            className="w-full max-w-2xl max-h-[85vh] rounded-2xl bg-[var(--admin-card)] shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0 bg-[var(--admin-card)]">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {modalMode === 'create' ? 'Add Category' : 'Edit Category'}
                </h2>
                <p className="text-xs text-[var(--admin-text-secondary)] mt-1">
                  Categories power shop filters and product grouping.
                </p>
              </div>
              <button type="button" className="text-gray-400 hover:text-gray-700" onClick={closeModal} disabled={saving}>
                ✕
              </button>
            </div>

            <div className="px-6 py-6 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto">
              {modalMode === 'create' && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-[var(--admin-text-secondary)] mb-2">Type</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, type: 'category', parent: '' }))}
                      className={`px-4 py-2 rounded-lg border text-xs font-black uppercase tracking-widest transition-colors ${
                        form.type === 'category'
                          ? 'bg-primary-950 text-[var(--admin-text-primary)] border-primary-950'
                          : 'bg-[var(--admin-card)] text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Main Category
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, type: 'subcategory' }))}
                      className={`px-4 py-2 rounded-lg border text-xs font-black uppercase tracking-widest transition-colors ${
                        form.type === 'subcategory'
                          ? 'bg-primary-950 text-[var(--admin-text-primary)] border-primary-950'
                          : 'bg-[var(--admin-card)] text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Subcategory
                    </button>
                  </div>
                </div>
              )}

              <div className="sm:col-span-2">
                <Input
                  label="Name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Sarees"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <Input
                  label="Description (optional)"
                  multiline
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Short description for admins/SEO…"
                />
              </div>

              <div className="sm:col-span-2">
                <ImageUploader
                  label="Category Banner"
                  value={form.banner}
                  onChange={url => setForm(f => ({ ...f, banner: url }))}
                  folder="categories"
                />
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs font-black uppercase tracking-widest text-[var(--admin-text-secondary)]">Metadata (optional)</p>
                <p className="text-xs text-gray-400 mt-1">Example: fabric=silk, origin=TN, weaveType=handloom, occasions=wedding, festive</p>
              </div>

              <div>
                <Input
                  label="Fabric"
                  value={form.fabric}
                  onChange={(e) => setForm((f) => ({ ...f, fabric: e.target.value }))}
                  placeholder="silk"
                />
              </div>

              <div>
                <Input
                  label="Origin"
                  value={form.origin}
                  onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value }))}
                  placeholder="TN / UP / Gujarat"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-[var(--admin-text-secondary)] mb-1">Weave Type</label>
                <select
                  value={form.weaveType}
                  onChange={(e) => setForm((f) => ({ ...f, weaveType: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-[var(--admin-card)]"
                >
                  <option value="">Select…</option>
                  <option value="handloom">handloom</option>
                  <option value="powerloom">powerloom</option>
                  <option value="mixed">mixed</option>
                  <option value="other">other</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-black uppercase tracking-widest text-[var(--admin-text-secondary)] mb-2">Occasions</label>
                <div className="flex flex-wrap gap-2">
                  {OCCASION_OPTIONS.map((o) => {
                    const selected = form.occasions.includes(o);
                    return (
                      <button
                        key={o}
                        type="button"
                        onClick={() => toggleOccasion(o)}
                        className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border transition-colors ${
                          selected
                            ? 'bg-primary-950 text-[var(--admin-text-primary)] border-primary-950'
                            : 'bg-[var(--admin-card)] text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {o}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 flex gap-2">
                  <Input
                    value={form.customOccasion}
                    onChange={(e) => setForm((f) => ({ ...f, customOccasion: e.target.value }))}
                    placeholder="Add custom occasion…"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomOccasion(); } }}
                  />
                  <button
                    type="button"
                    onClick={addCustomOccasion}
                    className="px-6 py-3.5 rounded-2xl bg-primary-950 text-[var(--admin-text-primary)] text-[10px] font-black uppercase tracking-widest hover:bg-primary-800 shadow-lg shadow-primary-900/20 active:scale-95 transition-all"
                  >
                    Add
                  </button>
                </div>

                {form.occasions.length > 0 && (
                  <div className="mt-3 text-xs text-[var(--admin-text-secondary)]">
                    Selected: <span className="font-medium text-gray-700">{form.occasions.join(', ')}</span>
                  </div>
                )}
              </div>

              <div className={`${form.type === 'subcategory' ? '' : 'sm:col-span-2'}`}>
                <label className="block text-xs font-black uppercase tracking-widest text-[var(--admin-text-secondary)] mb-1">Parent (optional)</label>
                <select
                  value={form.parent || ''}
                  onChange={(e) => setForm((f) => ({ ...f, parent: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-[var(--admin-card)]"
                  disabled={form.type !== 'subcategory'}
                >
                  <option value="">{form.type === 'subcategory' ? 'Select parent…' : 'No parent'}</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Input
                  label="Order"
                  type="number"
                  value={form.order ?? 1}
                  onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
                  min={1}
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-3">
                <input
                  id="cat-active"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                />
                <label htmlFor="cat-active" className="text-sm text-gray-700">
                  Active (visible in shop filters)
                </label>
              </div>

              <div className="sm:col-span-2 pt-4 border-t border-gray-100">
                <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2">
                  <Globe size={14} /> Search Engine Optimization
                </p>
                <div className="space-y-4">
                  <div>
                    <Input
                      label="SEO Title"
                      value={form.seoTitle}
                      onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))}
                      placeholder="Custom SEO Title (defaults to Category Name)"
                      showCharCount
                      maxLength={60}
                    />
                  </div>
                  <div>
                    <Input
                      label="SEO Meta Description"
                      multiline
                      rows={3}
                      value={form.seoDescription}
                      onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))}
                      placeholder="Brief summary for search engine results…"
                      showCharCount
                      maxLength={160}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0 bg-[var(--admin-card)]">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-bold tracking-widest uppercase text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-primary-950 text-[var(--admin-text-primary)] text-sm font-bold tracking-widest uppercase hover:bg-primary-800 disabled:opacity-60"
              >
                {saving ? 'Saving…' : modalMode === 'create' ? 'Create' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-[var(--admin-card)] shadow-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Delete category?</h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                This will delete <span className="font-semibold text-gray-900">{deleteConfirm.name}</span>. Products mapped to it may become uncategorized.
              </p>
            </div>
            <div className="px-6 py-5 flex items-center justify-end gap-3 bg-[var(--admin-card)]">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-bold tracking-widest uppercase text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={performDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-[var(--admin-text-primary)] text-sm font-bold tracking-widest uppercase hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;


