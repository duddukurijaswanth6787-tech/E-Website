import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowLeft, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { categoryService } from '../../api/services/category.service';
import type { Category } from '../../api/services/category.service';

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

function isMainCategory(c: Category): boolean {
  const p = (c as any).parent;
  const parentId = typeof p === 'object' ? p?._id : p;
  return !parentId;
}

const AdminSubcategorySupportPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [parentId, setParentId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [banner, setBanner] = useState('');
  const [order, setOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [fabric, setFabric] = useState('');
  const [origin, setOrigin] = useState('');
  const [weaveType, setWeaveType] = useState<'' | 'handloom' | 'powerloom' | 'mixed' | 'other'>('');
  const [occasions, setOccasions] = useState<string[]>([]);
  const [customOccasion, setCustomOccasion] = useState('');

  const mainCategories = useMemo(
    () => categories.filter(isMainCategory).sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  );

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getAdminAllCategories();
      const raw = (res as any)?.data?.data ?? (res as any)?.data ?? res ?? [];
      const arr = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : Object.values(raw);
      setCategories(
        (Array.isArray(arr) ? arr : [])
          .filter((x: any) => x && typeof x === 'object' && x._id && x.name)
          .map((x: any) => x as Category)
      );
    } catch (e) {
      console.error(e);
      toast.error('Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleOccasion = (label: string) => {
    setOccasions((prev) =>
      prev.includes(label) ? prev.filter((o) => o !== label) : [...prev, label]
    );
  };

  const addCustomOccasion = () => {
    const val = customOccasion.trim();
    if (!val) return;
    setOccasions((prev) => (prev.includes(val) ? prev : [...prev, val]));
    setCustomOccasion('');
  };

  const resetForm = () => {
    setParentId('');
    setName('');
    setDescription('');
    setBanner('');
    setOrder(1);
    setIsActive(true);
    setFabric('');
    setOrigin('');
    setWeaveType('');
    setOccasions([]);
    setCustomOccasion('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentId) {
      toast.error('Select a main category');
      return;
    }
    if (!name.trim()) {
      toast.error('Subcategory name is required');
      return;
    }

    const occ = Array.from(new Set(occasions.map((o) => o.trim()).filter(Boolean)));

    setSaving(true);
    try {
      await categoryService.createCategory({
        name: name.trim(),
        description: description.trim() || undefined,
        banner: banner.trim() || undefined,
        parent: parentId,
        order: Number(order) || 1,
        isActive,
        metadata: {
          fabric: fabric.trim() || undefined,
          origin: origin.trim() || undefined,
          weaveType: weaveType || undefined,
          occasions: occ.length ? occ : undefined,
        },
      });
      toast.success('Subcategory created');
      resetForm();
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.message || err?.response?.data?.message || 'Failed to create subcategory');
    } finally {
      setSaving(false);
    }
  };

  const selectedParent = mainCategories.find((c) => c._id === parentId);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-gray-900 mb-1 flex items-center">
            <Layers className="w-6 h-6 mr-3 text-primary-700" />
            Sub Categories
          </h1>
          <p className="text-sm text-gray-500">
            Add a subcategory under a main category. Main categories are listed by name below.
          </p>
        </div>
        <Link
          to="/admin/categories"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-bold tracking-widest uppercase text-gray-700 hover:bg-gray-50 shrink-0"
        >
          <ArrowLeft size={16} />
          SEO Categories
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/80">
          <h2 className="text-base font-extrabold tracking-wide text-gray-900">Add subcategory</h2>
          <p className="text-sm text-gray-500 mt-1">
            Choose the main category, then enter the new subcategory details.
          </p>
        </div>

        <div className="px-6 py-6 space-y-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
              Main category <span className="text-red-600">*</span>
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white"
              required
            >
              <option value="">{loading ? 'Loading…' : 'Select main category…'}</option>
              {mainCategories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            {!loading && mainCategories.length === 0 && (
              <p className="text-xs text-amber-700 mt-2">
                No main categories yet. Create one under{' '}
                <Link to="/admin/categories" className="underline font-semibold">
                  SEO Categories
                </Link>
                .
              </p>
            )}
            {selectedParent && (
              <p className="text-xs text-gray-400 mt-1.5 font-mono">/{selectedParent.slug}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">
              Subcategory name <span className="text-red-600">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. Kanjivaram"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm min-h-[88px]"
              placeholder="Short description…"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">
              Banner URL (optional)
            </label>
            <input
              value={banner}
              onChange={(e) => setBanner(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="https://…"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">
                Order
              </label>
              <input
                type="number"
                min={1}
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <span className="text-sm text-gray-700">Active (visible in shop)</span>
              </label>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">
              Metadata (optional)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Fabric</label>
                <input
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="silk"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Origin</label>
                <input
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="TN"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Weave type</label>
                <select
                  value={weaveType}
                  onChange={(e) => setWeaveType(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value="">Select…</option>
                  <option value="handloom">handloom</option>
                  <option value="powerloom">powerloom</option>
                  <option value="mixed">mixed</option>
                  <option value="other">other</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs text-gray-500 mb-2">Occasions</label>
              <div className="flex flex-wrap gap-2">
                {OCCASION_OPTIONS.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => toggleOccasion(o)}
                    className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border transition-colors ${
                      occasions.includes(o)
                        ? 'bg-primary-950 text-white border-primary-950'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={customOccasion}
                  onChange={(e) => setCustomOccasion(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Custom occasion…"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomOccasion();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addCustomOccasion}
                  className="px-4 py-2 rounded-lg bg-primary-950 text-white text-sm font-bold tracking-widest uppercase hover:bg-primary-800"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 border-t border-gray-100 flex flex-wrap items-center justify-end gap-3 bg-white">
          <button
            type="button"
            onClick={resetForm}
            disabled={saving}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-bold tracking-widest uppercase text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving || loading || !mainCategories.length}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-primary-950 text-white text-sm font-bold tracking-widest uppercase hover:bg-primary-800 disabled:opacity-60"
          >
            <Plus size={16} />
            {saving ? 'Creating…' : 'Create subcategory'}
          </button>
        </div>
      </form>

      <div className="rounded-xl bg-primary-50 border border-primary-100 px-5 py-4 text-sm text-primary-950">
        <p className="font-semibold text-primary-900">Tip</p>
        <p className="mt-1 text-primary-950/90">
          You can also add subcategories from the full taxonomy table under{' '}
          <Link to="/admin/categories" className="underline font-semibold">
            SEO Categories
          </Link>{' '}
          (row <span className="font-mono">+</span> or <span className="font-semibold">Add Subcategory</span>).
        </p>
      </div>
    </div>
  );
};

export default AdminSubcategorySupportPage;
