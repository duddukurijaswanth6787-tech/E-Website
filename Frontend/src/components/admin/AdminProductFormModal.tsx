import type { Dispatch, SetStateAction } from 'react';
import type { Category } from '../../api/services/category.service';
import { previewSemanticSku } from '../../utils/productSkuPreview';
import { X, UploadCloud } from 'lucide-react';

export type ProductFormState = {
  name: string;
  shortDescription: string;
  mainCategoryId: string;
  subCategoryId: string;
  color: string;
  occasionsCsv: string;
  description: string;
  careInstructions: string;
  blouseDetails: string;
  weavingTechnique: string;
  pallu: string;
  speciality: string;
  handloomCraftsmanship: string;
  designHighlight: string;
  stylingTips: string;
  comparePrice: number | '';
  price: number;
  discountType: 'percentage' | 'flat';
  discountValue: number | '';
  taxPercent: number | '';
  codAvailable: boolean;
  stock: number;
  stockStatus: 'in_stock' | 'out_of_stock' | 'preorder';
  lowStockThreshold: number;
  mainImageUrl: string;
  galleryImagesCsv: string;
  galleryLabelsCsv: string;
  fabric: string;
  sareeLength: string;
  sareeWidth: string;
  blouseLength: string;
  blouseWidth: string;
  weight: string;
  status: 'draft' | 'published' | 'archived';
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  showOnHomepage: boolean;
  sortOrder: number | '';
  returnable: boolean;
  returnWindowDays: number;
  exchangeAvailable: boolean;
  cancellationAllowed: boolean;
  tagsCsv: string;
  uploadedFiles: File[];
  rewardPoints: number;
  averageRating: number | '';
  ratingCount: number | '';
};

export const emptyProductForm = (): ProductFormState => ({
  name: '',
  shortDescription: '',
  mainCategoryId: '',
  subCategoryId: '',
  color: '',
  occasionsCsv: '',
  description: '',
  careInstructions: '',
  blouseDetails: '',
  weavingTechnique: '',
  pallu: '',
  speciality: '',
  handloomCraftsmanship: '',
  designHighlight: '',
  stylingTips: '',
  comparePrice: '',
  price: 0,
  discountType: 'percentage',
  discountValue: '',
  taxPercent: '',
  codAvailable: true,
  stock: 0,
  stockStatus: 'in_stock',
  lowStockThreshold: 5,
  mainImageUrl: '',
  galleryImagesCsv: '',
  galleryLabelsCsv: '',
  fabric: '',
  sareeLength: '',
  sareeWidth: '',
  blouseLength: '',
  blouseWidth: '',
  weight: '',
  status: 'published',
  isFeatured: false,
  isNewArrival: false,
  isBestSeller: false,
  isTrending: false,
  showOnHomepage: false,
  sortOrder: '',
  returnable: true,
  returnWindowDays: 7,
  exchangeAvailable: true,
  cancellationAllowed: true,
  tagsCsv: '',
  uploadedFiles: [],
  rewardPoints: 0,
  averageRating: '',
  ratingCount: '',
});

type Props = {
  open: boolean;
  mode: 'create' | 'edit';
  saving: boolean;
  categories: Category[];
  existingSku?: string;
  form: ProductFormState;
  setForm: Dispatch<SetStateAction<ProductFormState>>;
  onClose: () => void;
  onSave: () => void;
};

function getParentId(c: Category): string | undefined {
  const p = c.parent;
  if (!p) return undefined;
  if (typeof p === 'object' && p && '_id' in p) return String((p as { _id: string })._id);
  return String(p);
}

const labelCls = 'block text-xs font-black uppercase tracking-widest text-gray-500 mb-1';
const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm';
const sectionTitle = 'text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4';

const AdminProductFormModal = ({
  open,
  mode,
  saving,
  categories,
  existingSku,
  form,
  setForm,
  onClose,
  onSave,
}: Props) => {
  if (!open) return null;

  const roots = categories.filter((c) => !getParentId(c));
  const subs = form.mainCategoryId
    ? categories.filter((c) => getParentId(c) === form.mainCategoryId)
    : [];

  const mainCat = categories.find((c) => c._id === form.mainCategoryId);

  const previewCode =
    mode === 'edit' && existingSku
      ? existingSku
      : previewSemanticSku(mainCat?.name ?? 'Category', form.color);

  const galleryUrls = form.galleryImagesCsv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const galleryLabels = form.galleryLabelsCsv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const occasions = form.occasionsCsv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const mrp = form.comparePrice === '' ? null : Number(form.comparePrice);
  const sell = Number(form.price) || 0;
  let discountDisplay = '';
  if (mrp != null && mrp > sell && mrp > 0) {
    const dv = form.discountValue === '' ? 0 : Number(form.discountValue);
    if (form.discountType === 'percentage' && dv > 0) {
      discountDisplay = `${dv}% off`;
    } else if (form.discountType === 'flat' && dv > 0) {
      discountDisplay = `₹${dv} off`;
    } else {
      discountDisplay = `${Math.round(((mrp - sell) / mrp) * 100)}% off`;
    }
  }

  const previewImages = [
    ...form.uploadedFiles.map(file => ({ url: URL.createObjectURL(file), role: 'New Upload', isLocal: true, file })),
    ...(form.mainImageUrl ? [{ url: form.mainImageUrl, role: 'Main Image', isLocal: false }] : []),
    ...galleryUrls.map((url, i) => ({ url, role: galleryLabels[i] || `Gallery ${i+1}`, isLocal: false }))
  ];

  const removeRemoteImage = (urlToRemove: string) => {
    if (form.mainImageUrl === urlToRemove) {
      setForm(f => ({ ...f, mainImageUrl: '' }));
    } else {
      const remaining = galleryUrls.filter(u => u !== urlToRemove);
      setForm(f => ({ ...f, galleryImagesCsv: remaining.join(', ') }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={onClose}>
      <div
        className="w-[95vw] sm:w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-gray-100"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {mode === 'create' ? 'Add Product' : 'Edit Product'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {mode === 'create'
                ? 'Create a new product in your catalog.'
                : 'Update product details.'}
            </p>
          </div>
          <button type="button" className="text-gray-400 hover:text-gray-700" onClick={onClose} disabled={saving}>
            ✕
          </button>
        </div>

        <div className="px-6 py-6 overflow-y-auto flex-1 space-y-8">
          <section>
            <h3 className={sectionTitle}>1. Basic product info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls}>Product name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputCls}
                  placeholder="Banarasi Silk Saree with Zari Border"
                />
              </div>
              <div>
                <label className={labelCls}>Category</label>
                <select
                  value={form.mainCategoryId}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      mainCategoryId: e.target.value,
                      subCategoryId: '',
                    }))
                  }
                  className={`${inputCls} bg-white`}
                >
                  <option value="">Select category…</option>
                  {roots.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Sub category</label>
                <select
                  value={form.subCategoryId}
                  onChange={(e) => setForm((f) => ({ ...f, subCategoryId: e.target.value }))}
                  className={`${inputCls} bg-white`}
                  disabled={!form.mainCategoryId || subs.length === 0}
                >
                  <option value="">{subs.length ? 'Optional — select sub…' : 'No subcategories'}</option>
                  {subs.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Short title</label>
                <input
                  value={form.shortDescription}
                  onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
                  className={inputCls}
                  placeholder="Red Banarasi Silk Saree"
                />
              </div>
              <div>
                <label className={labelCls}>Color</label>
                <input
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  className={inputCls}
                  placeholder="light green"
                />
              </div>
              <div>
                <label className={labelCls}>Occasions (comma-separated)</label>
                <input
                  value={form.occasionsCsv}
                  onChange={(e) => setForm((f) => ({ ...f, occasionsCsv: e.target.value }))}
                  className={inputCls}
                  placeholder="Wedding, Festive"
                />
              </div>
              <div className="sm:col-span-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-950">
                <span className="font-bold uppercase tracking-wider">Unique code (preview)</span>
                <p className="mt-1 font-mono">
                  {previewCode}
                  {mode === 'create' && (
                    <span className="text-amber-800/80 ml-2">
                      — server assigns the next number (001, 002, …) after save.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className={sectionTitle}>2. Description details</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className={`${inputCls} min-h-[100px]`}
                  placeholder="Elegant Banarasi silk saree with rich zari woven border…"
                />
              </div>
              <div>
                <label className={labelCls}>Blouse details</label>
                <input
                  value={form.blouseDetails}
                  onChange={(e) => setForm((f) => ({ ...f, blouseDetails: e.target.value }))}
                  className={inputCls}
                  placeholder="Plain deep maroon with matching border…"
                />
              </div>
              <div>
                <label className={labelCls}>Care instructions</label>
                <input
                  value={form.careInstructions}
                  onChange={(e) => setForm((f) => ({ ...f, careInstructions: e.target.value }))}
                  className={inputCls}
                  placeholder="Dry clean only"
                />
              </div>
              <div>
                <label className={labelCls}>Weaving technique</label>
                <input
                  value={form.weavingTechnique}
                  onChange={(e) => setForm((f) => ({ ...f, weavingTechnique: e.target.value }))}
                  className={inputCls}
                  placeholder="Handwoven Khaddi"
                />
              </div>
              <div>
                <label className={labelCls}>Pallu</label>
                <input
                  value={form.pallu}
                  onChange={(e) => setForm((f) => ({ ...f, pallu: e.target.value }))}
                  className={inputCls}
                  placeholder="Resham jaal matching pallu…"
                />
              </div>
              <div>
                <label className={labelCls}>Speciality</label>
                <input
                  value={form.speciality}
                  onChange={(e) => setForm((f) => ({ ...f, speciality: e.target.value }))}
                  className={inputCls}
                  placeholder="Lightweight, airy, drapes beautifully…"
                />
              </div>
              <div>
                <label className={labelCls}>Handloom craftsmanship</label>
                <input
                  value={form.handloomCraftsmanship}
                  onChange={(e) => setForm((f) => ({ ...f, handloomCraftsmanship: e.target.value }))}
                  className={inputCls}
                  placeholder="Hours of skilled artisan work…"
                />
              </div>
              <div>
                <label className={labelCls}>Design highlight</label>
                <textarea
                  value={form.designHighlight}
                  onChange={(e) => setForm((f) => ({ ...f, designHighlight: e.target.value }))}
                  className={`${inputCls} min-h-[70px]`}
                  placeholder="Intricate resha zari floral butis…"
                />
              </div>
              <div>
                <label className={labelCls}>Style note</label>
                <input
                  value={form.stylingTips}
                  onChange={(e) => setForm((f) => ({ ...f, stylingTips: e.target.value }))}
                  className={inputCls}
                  placeholder="Pair with statement gold jewelry…"
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className={sectionTitle}>3. Pricing</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>MRP / Original price (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={form.comparePrice === '' ? '' : form.comparePrice}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      comparePrice: e.target.value === '' ? '' : Number(e.target.value),
                    }))
                  }
                  className={inputCls}
                  placeholder="5999"
                />
              </div>
              <div>
                <label className={labelCls}>Selling price (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                  className={inputCls}
                  placeholder="4499"
                />
              </div>
              <div>
                <label className={labelCls}>Discount type</label>
                <select
                  value={form.discountType}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, discountType: e.target.value as 'percentage' | 'flat' }))
                  }
                  className={`${inputCls} bg-white`}
                >
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat (₹)</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Discount value</label>
                <input
                  type="number"
                  min={0}
                  value={form.discountValue === '' ? '' : form.discountValue}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      discountValue: e.target.value === '' ? '' : Number(e.target.value),
                    }))
                  }
                  className={inputCls}
                  placeholder="25"
                />
              </div>
              <div>
                <label className={labelCls}>Tax / GST % (optional)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.taxPercent === '' ? '' : form.taxPercent}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      taxPercent: e.target.value === '' ? '' : Number(e.target.value),
                    }))
                  }
                  className={inputCls}
                  placeholder="5"
                />
              </div>
              <div>
                <label className={labelCls}>COD available</label>
                <select
                  value={form.codAvailable ? 'yes' : 'no'}
                  onChange={(e) => setForm((f) => ({ ...f, codAvailable: e.target.value === 'yes' }))}
                  className={`${inputCls} bg-white`}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          </section>

          <section>
            <h3 className={sectionTitle}>4. Inventory</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Stock quantity</label>
                <input
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Stock status</label>
                <select
                  value={form.stockStatus}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      stockStatus: e.target.value as ProductFormState['stockStatus'],
                    }))
                  }
                  className={`${inputCls} bg-white`}
                >
                  <option value="in_stock">In stock</option>
                  <option value="out_of_stock">Out of stock</option>
                  <option value="preorder">Preorder</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Low stock threshold</label>
                <input
                  type="number"
                  min={0}
                  value={form.lowStockThreshold}
                  onChange={(e) => setForm((f) => ({ ...f, lowStockThreshold: Number(e.target.value) }))}
                  className={inputCls}
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className={sectionTitle}>5. Product images</h3>
            <p className="text-xs text-gray-500 mb-3">
              Main image is the listing thumbnail; add 4–8 gallery URLs (comma-separated). Optional labels align with
              gallery order (e.g. front, side drape, pallu, border, blouse, texture, model, folded).
            </p>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={labelCls}>Direct Image Upload (Multiple)</label>
                <div className="mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-primary-200 border-dashed rounded-xl bg-primary-50/10 hover:bg-primary-50/20 transition-all cursor-pointer relative group">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0) {
                        setForm(f => ({ ...f, uploadedFiles: [...f.uploadedFiles, ...files] }));
                      }
                    }}
                  />
                  <div className="flex flex-col items-center pointer-events-none group-hover:scale-105 transition-transform">
                    <UploadCloud className="mx-auto h-12 w-12 text-primary-400" strokeWidth={1.5} />
                    <p className="mt-1 text-sm font-bold text-primary-950 uppercase tracking-widest text-center">Click to upload or drag and drop</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mt-1">PNG, JPG, WebP up to 10MB each</p>
                  </div>
                </div>

                {previewImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                    {previewImages.map((img, idx) => (
                      <div key={idx} className="relative group/thumb aspect-[3/4] rounded-xl overflow-hidden border border-white shadow-soft bg-white">
                         <img 
                           src={img.url} 
                           className="w-full h-full object-cover" 
                           onLoad={(e) => img.isLocal && URL.revokeObjectURL((e.target as any).src)}
                           alt=""
                         />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-2">
                           <button 
                             type="button"
                             onClick={() => {
                               if (img.isLocal && 'file' in img) {
                                 setForm(f => ({ ...f, uploadedFiles: f.uploadedFiles.filter(file => file !== img.file) }));
                               } else {
                                 removeRemoteImage(img.url);
                               }
                             }}
                             className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                             title="Remove Image"
                           >
                             <X size={14} className="w-4 h-4" />
                           </button>
                         </div>
                         <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${img.isLocal ? 'bg-primary-600 text-white' : 'bg-white text-gray-900 border border-gray-200'}`}>
                            {img.role}
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="relative py-4">
                 <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                 <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black"><span className="px-3 bg-white text-gray-400 font-serif italic capitalize">Advanced Source Management</span></div>
              </div>

              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-4">
                <div>
                  <label className={labelCls}>Main Remote URL (Legacy)</label>
                  <input
                    value={form.mainImageUrl}
                    onChange={(e) => setForm((f) => ({ ...f, mainImageUrl: e.target.value }))}
                    className={inputCls}
                    placeholder="https://…"
                  />
                </div>
                <div>
                  <label className={labelCls}>Additional Gallery URLs (Comma separated)</label>
                  <textarea
                    value={form.galleryImagesCsv}
                    onChange={(e) => setForm((f) => ({ ...f, galleryImagesCsv: e.target.value }))}
                    className={`${inputCls} min-h-[60px]`}
                    placeholder="https://…/1.jpg, https://…/2.jpg"
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className={sectionTitle}>6. Product attributes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Fabric</label>
                <input
                  value={form.fabric}
                  onChange={(e) => setForm((f) => ({ ...f, fabric: e.target.value }))}
                  className={inputCls}
                  placeholder="Silk, Cotton, Banarasi…"
                />
              </div>
              <div>
                <label className={labelCls}>Saree length</label>
                <input
                  value={form.sareeLength}
                  onChange={(e) => setForm((f) => ({ ...f, sareeLength: e.target.value }))}
                  className={inputCls}
                  placeholder="5.5 m"
                />
              </div>
              <div>
                <label className={labelCls}>Saree width</label>
                <input
                  value={form.sareeWidth}
                  onChange={(e) => setForm((f) => ({ ...f, sareeWidth: e.target.value }))}
                  className={inputCls}
                  placeholder="1.15 m"
                />
              </div>
              <div>
                <label className={labelCls}>Blouse length</label>
                <input
                  value={form.blouseLength}
                  onChange={(e) => setForm((f) => ({ ...f, blouseLength: e.target.value }))}
                  className={inputCls}
                  placeholder="0.8 m"
                />
              </div>
              <div>
                <label className={labelCls}>Blouse width</label>
                <input
                  value={form.blouseWidth}
                  onChange={(e) => setForm((f) => ({ ...f, blouseWidth: e.target.value }))}
                  className={inputCls}
                  placeholder="1.15 m"
                />
              </div>
              <div>
                <label className={labelCls}>Weight</label>
                <input
                  value={form.weight}
                  onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                  className={inputCls}
                  placeholder="700 g"
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className={sectionTitle}>7. Visibility / publishing</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Status</label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value as ProductFormState['status'] }))
                  }
                  className={`${inputCls} bg-white`}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Sort order (optional)</label>
                <input
                  type="number"
                  value={form.sortOrder === '' ? '' : form.sortOrder}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sortOrder: e.target.value === '' ? '' : Number(e.target.value),
                    }))
                  }
                  className={inputCls}
                  placeholder="0"
                />
              </div>
              {(
                [
                  ['isFeatured', 'Featured product'],
                  ['isNewArrival', 'New arrival'],
                  ['isBestSeller', 'Best seller'],
                  ['isTrending', 'Trending'],
                  ['showOnHomepage', 'Show on homepage'],
                ] as const
              ).map(([key, lab]) => (
                <div key={key}>
                  <label className={labelCls}>{lab}</label>
                  <select
                    value={form[key] ? 'yes' : 'no'}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value === 'yes' }))}
                    className={`${inputCls} bg-white`}
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              ))}
            </div>

            <div className="mt-8 relative py-4">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
               <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black"><span className="px-3 bg-white text-primary-700 font-serif italic capitalize">Star Ratings & Rewards Editor</span></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Manual star rating (0-5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={form.averageRating === '' ? '' : form.averageRating}
                  onChange={(e) => setForm((f) => ({ ...f, averageRating: e.target.value === '' ? '' : Number(e.target.value) }))}
                  className={inputCls}
                  placeholder="4.5"
                />
              </div>
              <div>
                <label className={labelCls}>Rating review count</label>
                <input
                  type="number"
                  min="0"
                  value={form.ratingCount === '' ? '' : form.ratingCount}
                  onChange={(e) => setForm((f) => ({ ...f, ratingCount: e.target.value === '' ? '' : Number(e.target.value) }))}
                  className={inputCls}
                  placeholder="120"
                />
              </div>
              <div>
                <label className={labelCls}>Reward points / Bonus</label>
                <input
                  type="number"
                  min="0"
                  value={form.rewardPoints}
                  onChange={(e) => setForm((f) => ({ ...f, rewardPoints: Number(e.target.value) }))}
                  className={inputCls}
                  placeholder="100"
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className={sectionTitle}>8. Tags & return policy</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls}>Tags (comma-separated)</label>
                <input
                  value={form.tagsCsv}
                  onChange={(e) => setForm((f) => ({ ...f, tagsCsv: e.target.value }))}
                  className={inputCls}
                  placeholder="Bridal, Handloom"
                />
              </div>
              <div>
                <label className={labelCls}>Returnable</label>
                <select
                  value={form.returnable ? 'yes' : 'no'}
                  onChange={(e) => setForm((f) => ({ ...f, returnable: e.target.value === 'yes' }))}
                  className={`${inputCls} bg-white`}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Return window (days)</label>
                <input
                  type="number"
                  min={0}
                  value={form.returnWindowDays}
                  onChange={(e) => setForm((f) => ({ ...f, returnWindowDays: Number(e.target.value) }))}
                  className={inputCls}
                  placeholder="7"
                />
              </div>
              <div>
                <label className={labelCls}>Exchange available</label>
                <select
                  value={form.exchangeAvailable ? 'yes' : 'no'}
                  onChange={(e) => setForm((f) => ({ ...f, exchangeAvailable: e.target.value === 'yes' }))}
                  className={`${inputCls} bg-white`}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Cancellation allowed</label>
                <select
                  value={form.cancellationAllowed ? 'yes' : 'no'}
                  onChange={(e) => setForm((f) => ({ ...f, cancellationAllowed: e.target.value === 'yes' }))}
                  className={`${inputCls} bg-white`}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          </section>

          {/* Admin-only output preview */}
          <section className="rounded-xl border-2 border-dashed border-primary-200 bg-gradient-to-br from-gray-50 to-amber-50/30 p-5">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Admin preview — customer view</h3>
              <span className="text-[10px] font-black uppercase tracking-widest bg-primary-950 text-white px-2 py-1 rounded">
                Not saved
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="aspect-[3/4] rounded-lg bg-gray-200 overflow-hidden border border-gray-200">
                  {previewImages[0]?.url ? (
                    <img src={previewImages[0].url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">Main image</div>
                  )}
                </div>
                {previewImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {previewImages.slice(1, 6).map((im, i) => (
                      <div key={i} className="w-14 h-14 flex-shrink-0 rounded border border-gray-200 overflow-hidden bg-gray-100">
                        <img src={im.url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-xs font-mono text-gray-500">{previewCode}</p>
                <h4 className="text-lg font-serif text-gray-900 leading-snug">
                  {form.name || 'Product name'}
                </h4>
                {form.shortDescription && (
                  <p className="text-primary-800 font-medium">{form.shortDescription}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {form.color && (
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Color: {form.color}</span>
                  )}
                  {occasions.map((o) => (
                    <span key={o} className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                      {o}
                    </span>
                  ))}
                </div>
                <div className="flex items-baseline gap-2 pt-2">
                  <span className="text-xl font-bold text-gray-900">₹{sell.toLocaleString('en-IN')}</span>
                  {mrp != null && mrp > sell && (
                    <span className="text-sm text-gray-400 line-through">₹{mrp.toLocaleString('en-IN')}</span>
                  )}
                  {discountDisplay && (
                    <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                      {discountDisplay}
                    </span>
                  )}
                </div>
                {form.taxPercent !== '' && (
                  <p className="text-xs text-gray-500">GST: {form.taxPercent}%</p>
                )}
                <p className="text-xs text-gray-600">
                  COD: {form.codAvailable ? 'Yes' : 'No'} · Stock: {form.stock} ({form.stockStatus.replace(/_/g, ' ')})
                </p>
                {form.description && (
                  <p className="text-gray-700 text-sm pt-2 border-t border-gray-200">{form.description}</p>
                )}
                {(form.fabric || form.sareeLength || form.blouseLength || form.weight) && (
                  <ul className="text-xs text-gray-600 space-y-1 pt-2">
                    {form.fabric && <li>Fabric: {form.fabric}</li>}
                    {form.sareeLength && <li>Saree length: {form.sareeLength}</li>}
                    {form.blouseLength && <li>Blouse length: {form.blouseLength}</li>}
                    {form.weight && <li>Weight: {form.weight}</li>}
                  </ul>
                )}
                {(form.careInstructions || form.stylingTips) && (
                  <div className="text-xs text-gray-600 space-y-1 pt-2 border-t border-gray-200">
                    {form.careInstructions && <p>Care: {form.careInstructions}</p>}
                    {form.stylingTips && <p>Style: {form.stylingTips}</p>}
                  </div>
                )}
                <div className="text-[11px] text-gray-500 pt-2 border-t border-gray-200">
                  Returns: {form.returnable ? `${form.returnWindowDays} days` : 'No'} · Exchange:{' '}
                  {form.exchangeAvailable ? 'Yes' : 'No'} · Cancel: {form.cancellationAllowed ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="px-6 py-5 border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-bold tracking-widest uppercase text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-primary-950 text-white text-sm font-bold tracking-widest uppercase hover:bg-primary-800 disabled:opacity-60"
          >
            {saving ? 'Saving…' : mode === 'create' ? 'Create' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProductFormModal;
