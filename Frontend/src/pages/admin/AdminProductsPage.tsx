import { useState, useEffect, useMemo, useCallback } from 'react';
import { DataTable } from '../../components/admin/DataTable';
import AdminProductFormModal, {
  emptyProductForm,
  type ProductFormState,
} from '../../components/admin/AdminProductFormModal';
import { productService } from '../../api/services/product.service';
import type { Product } from '../../api/services/product.service';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { categoryService, type Category } from '../../api/services/category.service';
import { ImageWithSkeleton } from '../../components/common/Skeleton';

function getParentId(c: Category): string | undefined {
  const p = c.parent;
  if (!p) return undefined;
  if (typeof p === 'object' && p && '_id' in p) return String((p as { _id: string })._id);
  return String(p);
}

function productToForm(p: Product, categories: Category[]): ProductFormState {
  const base = emptyProductForm();
  const cat = (p as any).category;
  const catId =
    cat && typeof cat === 'object' && cat._id ? String(cat._id) : cat ? String(cat) : '';

  let mainCategoryId = '';
  let subCategoryId = '';

  if (catId) {
    const cDoc = categories.find((c) => c._id === catId);
    if (cDoc) {
      const pid = getParentId(cDoc);
      if (pid) {
        mainCategoryId = pid;
        subCategoryId = cDoc._id;
      } else {
        mainCategoryId = cDoc._id;
      }
    } else if (cat && typeof cat === 'object') {
      const parent = (cat as any).parent;
      if (parent) {
        mainCategoryId = typeof parent === 'object' ? String(parent._id) : String(parent);
        subCategoryId = String((cat as any)._id);
      } else {
        mainCategoryId = String((cat as any)._id);
      }
    }
  }

  const imgs = Array.isArray(p.images) ? p.images : [];
  const mainImageUrl = imgs[0] ?? '';
  const galleryImagesCsv = imgs.slice(1).join(', ');

  const occasions = (p as any).occasions;
  const occasionsCsv = Array.isArray(occasions) ? occasions.join(', ') : '';

  const tags = p.tags;
  const tagsCsv = Array.isArray(tags) ? tags.join(', ') : '';

  return {
    ...base,
    name: p.name ?? '',
    shortDescription: (p as any).shortDescription ?? '',
    mainCategoryId,
    subCategoryId,
    color: (p as any).color ?? '',
    occasionsCsv,
    description: (p as any).description ?? '',
    careInstructions: (p as any).careInstructions ?? '',
    blouseDetails: (p as any).blouseDetails ?? '',
    weavingTechnique: (p as any).weavingTechnique ?? '',
    pallu: (p as any).pallu ?? '',
    speciality: (p as any).speciality ?? '',
    handloomCraftsmanship: (p as any).handloomCraftsmanship ?? '',
    designHighlight: (p as any).designHighlight ?? '',
    stylingTips: (p as any).stylingTips ?? '',
    comparePrice:
      (p as any).comparePrice !== undefined && (p as any).comparePrice !== null
        ? Number((p as any).comparePrice)
        : '',
    price: Number(p.price ?? 0),
    discountType: ((p as any).discountType as ProductFormState['discountType']) || 'percentage',
    discountValue:
      (p as any).discountValue !== undefined && (p as any).discountValue !== null
        ? Number((p as any).discountValue)
        : '',
    taxPercent:
      (p as any).taxPercent !== undefined && (p as any).taxPercent !== null
        ? Number((p as any).taxPercent)
        : '',
    codAvailable: (p as any).codAvailable !== false,
    stock: Number((p as any).stock ?? 0),
    stockStatus: ((p as any).stockStatus as ProductFormState['stockStatus']) || 'in_stock',
    lowStockThreshold: Number((p as any).lowStockThreshold ?? 5),
    mainImageUrl,
    galleryImagesCsv,
    galleryLabelsCsv: '',
    fabric: (p as any).fabric ?? '',
    sareeLength: (p as any).attributes?.sareeLength ?? '',
    sareeWidth: (p as any).attributes?.sareeWidth ?? '',
    blouseLength: (p as any).attributes?.blouseLength ?? '',
    blouseWidth: (p as any).attributes?.blouseWidth ?? '',
    weight: (p as any).attributes?.weight ?? '',
    status: ((p as any).status as ProductFormState['status']) || 'draft',
    isFeatured: !!(p as any).isFeatured,
    isNewArrival: !!(p as any).isNewArrival,
    isBestSeller: !!(p as any).isBestSeller,
    isTrending: !!(p as any).isTrending,
    showOnHomepage: !!(p as any).showOnHomepage,
    sortOrder:
      (p as any).sortOrder !== undefined && (p as any).sortOrder !== null
        ? Number((p as any).sortOrder)
        : '',
    returnable: (p as any).returnable !== false,
    returnWindowDays: Number((p as any).returnWindowDays ?? 7),
    exchangeAvailable: (p as any).exchangeAvailable !== false,
    cancellationAllowed: (p as any).cancellationAllowed !== false,
    tagsCsv,
  };
}

function buildPayload(form: ProductFormState): Record<string, unknown> | FormData {
  const leafCategoryId = form.subCategoryId.trim() || form.mainCategoryId.trim();

  const gallery = form.galleryImagesCsv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const images = [form.mainImageUrl.trim(), ...gallery].filter(Boolean);

  const occasions = form.occasionsCsv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const tags = form.tagsCsv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const attributes = {
    sareeLength: form.sareeLength.trim() || undefined,
    sareeWidth: form.sareeWidth.trim() || undefined,
    blouseLength: form.blouseLength.trim() || undefined,
    blouseWidth: form.blouseWidth.trim() || undefined,
    weight: form.weight.trim() || undefined,
  };

  const base: Record<string, any> = {
    name: form.name.trim(),
    shortDescription: form.shortDescription.trim() || undefined,
    description: form.description,
    category: leafCategoryId,
    color: form.color.trim() || undefined,
    price: Number(form.price),
    comparePrice: form.comparePrice === '' ? undefined : Number(form.comparePrice),
    discountType: form.discountType,
    discountValue: form.discountValue === '' ? undefined : Number(form.discountValue),
    taxPercent: form.taxPercent === '' ? undefined : Number(form.taxPercent),
    codAvailable: form.codAvailable,
    stock: Number(form.stock),
    stockStatus: form.stockStatus,
    lowStockThreshold: Number(form.lowStockThreshold),
    fabric: form.fabric.trim() || undefined,
    status: form.status,
    isFeatured: form.isFeatured,
    isTrending: form.isTrending,
    isNewArrival: form.isNewArrival,
    isBestSeller: form.isBestSeller,
    showOnHomepage: form.showOnHomepage,
    sortOrder: form.sortOrder === '' ? undefined : Number(form.sortOrder),
    returnable: form.returnable,
    returnWindowDays: Number(form.returnWindowDays),
    exchangeAvailable: form.exchangeAvailable,
    cancellationAllowed: form.cancellationAllowed,
    careInstructions: form.careInstructions.trim() || undefined,
    blouseDetails: form.blouseDetails.trim() || undefined,
    weavingTechnique: form.weavingTechnique.trim() || undefined,
    pallu: form.pallu.trim() || undefined,
    speciality: form.speciality.trim() || undefined,
    handloomCraftsmanship: form.handloomCraftsmanship.trim() || undefined,
    designHighlight: form.designHighlight.trim() || undefined,
    stylingTips: form.stylingTips.trim() || undefined,
  };

  // If uploading files, we use FormData
  if (form.uploadedFiles.length > 0) {
    const fd = new FormData();
    Object.keys(base).forEach(key => {
      if (base[key] !== undefined) fd.append(key, String(base[key]));
    });
    
    // Complex fields must be stringified for Multer to receive them as strings to parse
    fd.append('attributes', JSON.stringify(attributes));
    fd.append('occasions', JSON.stringify(occasions));
    fd.append('tags', JSON.stringify(tags));
    fd.append('images', JSON.stringify(images));
    
    form.uploadedFiles.forEach(file => {
      fd.append('images', file); // Multer maps this to req.files
    });
    
    return fd;
  }

  // Otherwise, return standard object
  return {
    ...base,
    images,
    occasions,
    tags,
    attributes
  };
}

const AdminProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [categories, setCategories] = useState<Category[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [existingSku, setExistingSku] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProductFormState>(emptyProductForm());

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const res = await productService.getAdminProducts({ page, limit: pagination.limit });
      const list = Array.isArray((res as any)?.data) ? (res as any).data : [];
      setProducts(list);

      const meta = (res as any)?.pagination;
      if (meta) {
        setPagination({
          page: meta.currentPage ?? page,
          limit: meta.itemsPerPage ?? pagination.limit,
          total: meta.totalItems ?? list.length,
        });
      } else {
        setPagination((prev) => ({ ...prev, page, total: list.length }));
      }
    } catch (e) {
      console.error('Failed to load products', e);
      toast.error('Failed to fetch product catalog');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(pagination.page);
  }, [pagination.page]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryService.getAdminAllCategories();
        setCategories(Array.isArray((res as any)?.data) ? (res as any).data : []);
      } catch {
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  const openCreate = () => {
    setModalMode('create');
    setActiveProduct(null);
    setExistingSku(undefined);
    setForm(emptyProductForm());
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setModalMode('edit');
    setActiveProduct(p);
    setExistingSku((p as any).sku ?? undefined);
    setForm(productToForm(p, categories));
    setModalOpen(true);
  };

  useEffect(() => {
    if (!modalOpen || modalMode !== 'edit' || !activeProduct?._id) return;
    setForm(productToForm(activeProduct, categories));
  }, [categories, modalOpen, modalMode, activeProduct]);

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Product name is required');
    if (!form.description.trim()) return toast.error('Description is required');
    if (!form.mainCategoryId.trim()) return toast.error('Category is required');

    setSaving(true);
    try {
      const payload = buildPayload(form);

      if (modalMode === 'create') {
        await productService.createProduct(payload);
        toast.success('Product created');
      } else if (activeProduct?._id) {
        await productService.updateProduct(activeProduct._id, payload);
        toast.success('Product updated');
      }

      setModalOpen(false);
      setForm(f => ({ ...f, uploadedFiles: [] }));
      fetchProducts(pagination.page);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = useCallback(async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;
    try {
      await productService.deleteProduct(id);
      toast.success(`${name} deleted successfully!`);
      fetchProducts(pagination.page);
    } catch {
      toast.error('Error deleting product');
    }
  }, [fetchProducts, pagination.page]);

  const columns = useMemo(() => [
    {
      header: 'Product',
      accessor: (row: Product) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
            <ImageWithSkeleton
              src={row.images?.[0] || 'https://placehold.co/100?text=IMG'}
              alt={row.name}
              className="w-full h-full object-cover"
              containerClassName="w-full h-full"
            />
          </div>
          <div>
            <span className="block font-medium text-gray-900">{row.name}</span>
            <span className="block text-xs text-gray-500 font-mono mt-0.5">{row.slug}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Price',
      accessor: (row: Product) => (
        <span className="font-medium text-gray-900">₹{row.price?.toLocaleString('en-IN') || 0}</span>
      ),
    },
    {
      header: 'Stock',
      accessor: (row: Product) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-widest uppercase ${
            row.stock > 10 ? 'bg-green-50 text-green-700' : row.stock > 0 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {row.stock > 0 ? `${row.stock} UNITS` : 'OUT OF STOCK'}
        </span>
      ),
    },
    {
      header: 'Store',
      accessor: (row: Product) => {
        const st = (row as any).status || 'draft';
        const onShop = st === 'published';
        return (
          <span
            className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
              onShop ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-900'
            }`}
            title={onShop ? 'Visible on the public shop' : 'Hidden on the shop — set to Published to show'}
          >
            {st}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      accessor: (row: Product) => (
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openEdit(row);
            }}
            className="p-1.5 text-gray-400 hover:text-primary-700 transition-colors"
            title="Edit Product"
          >
            <Edit2 size={16} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row._id, row.name);
            }}
            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete Product"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ], [categories, openEdit, handleDelete]);

  return (
    <div className="space-y-6 max-w-[100vw] overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-serif text-gray-900 mb-1">Product Catalog</h1>
          <p className="text-sm text-gray-500">Manage your inventory, pricing, and active listings.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center px-4 py-2 bg-primary-950 text-white text-sm font-bold tracking-widest uppercase rounded shadow hover:bg-primary-800 transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Add Product
          </button>
        </div>
      </div>

      <DataTable
        columns={columns as any}
        data={products}
        loading={loading}
        emptyMessage="No products found in the database. Add a new product to begin."
        pagination={{
          page: pagination.page,
          limit: pagination.limit,
          total: Math.max(pagination.total, products.length),
          onPageChange: (newPage) => setPagination({ ...pagination, page: newPage }),
        }}
      />

      <AdminProductFormModal
        open={modalOpen}
        mode={modalMode}
        saving={saving}
        categories={categories}
        existingSku={existingSku}
        form={form}
        setForm={setForm}
        onClose={closeModal}
        onSave={handleSave}
      />
    </div>
  );
};

export default AdminProductsPage;
