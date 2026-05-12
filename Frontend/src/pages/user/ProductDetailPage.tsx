import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from '../../components/common/ProductCard';
import { useCartStore } from '../../store/cartStore';
import { productService } from '../../api/services/product.service';
import { extractPaginatedList } from '../../utils/extractPaginatedList';
import { Loader } from '../../components/common/Loader';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import PremiumMeasurementModal from '../../components/user/PremiumMeasurementModal';
import { 
  ChevronDown, 
  Sparkles, 
  CheckCircle2,
  Search,
  MessageCircle
} from 'lucide-react';
import { TrustBadges } from '../../components/common/TrustBadges';
import { useEventTracker } from '../../hooks/useEventTracker';
import { useSEO } from '../../context/SEOContext';
import { getProductSchema, getBreadcrumbSchema } from '../../utils/seoSchemas';

const Accordion = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full py-5 text-left focus:outline-none">
        <span className="font-serif text-lg text-primary-950 font-medium tracking-wide">{title}</span>
        <ChevronDown size={20} className={`transition-transform duration-300 text-gray-500 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="pb-6 text-gray-600 font-light leading-relaxed whitespace-pre-line text-[0.95rem]">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


const ProductDetailPage = () => {
  const { setMetadata } = useSEO();
  const { trackEvent } = useEventTracker();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity] = useState(1);
  const [stitchingRequired, setStitchingRequired] = useState(false);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [measurements, setMeasurements] = useState<any>(null);
  const { addItem } = useCartStore();

  useEffect(() => {
    if (product) {
      setMetadata({
        title: product.seo?.title || product.name,
        description: product.seo?.description || product.shortDescription || product.description.substring(0, 160),
        ogImage: product.seo?.ogImage || product.images?.[0]?.url,
        ogType: 'product',
        schemaData: getProductSchema(product)
      });
    }
  }, [product, setMetadata]);

  const handleBuyNow = () => {
    if (!product || !inStock) return;
    addItem({
      id: product._id,
      name: product.name,
      slug: product.slug,
      price: stitchingRequired ? product.price + 500 : product.price,
      image: productImages[0],
      quantity: quantity,
      fabric: product.fabric,
      customizations: {
        stitchingRequired,
        measurements
      }
    });
    navigate('/checkout');
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      setLoading(true);
      setError(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveImage(0);
      try {
        const res = await productService.getProductBySlug(slug);
        const p = res.data;
        setProduct(p);
        
        // Enhance SEO with Structured Data
        setMetadata({
          title: `${p.name} | Vasanthi Creations`,
          description: p.shortDescription || p.description.substring(0, 160),
          ogImage: p.images?.[0],
          schemaData: [
            getProductSchema(p),
            getBreadcrumbSchema([
              { name: 'Home', item: '/' },
              { name: 'Shop', item: '/shop' },
              { name: p.category?.name || 'Collection', item: `/category/${p.category?.slug || ''}` },
              { name: p.name, item: `/product/${p.slug}` }
            ])
          ]
        });

        trackEvent('product_view', { 
          metadata: { productId: p._id, name: p.name, category: p.category?.name } 
        });
        const categoryId = p?.category && typeof p.category === 'object' ? (p.category as { _id?: string })._id : p?.category;
        try {
          const relatedRes = await productService.getRelatedProducts(p._id, categoryId);
          if (relatedRes.data && relatedRes.data.length > 0) {
            setRelatedProducts(relatedRes.data.map((rp: any) => ({
              id: rp._id, name: rp.name, slug: rp.slug, price: rp.price,
              image: typeof rp.images?.[0] === 'string' ? rp.images?.[0] : rp.images?.[0]?.url || '',
              category: rp.category?.name || 'Vasanthi',
            })));
          } else {
             const trend = await productService.getProducts({ limit: 4 });
             const list = extractPaginatedList(trend);
             setRelatedProducts(list.map((p: any) => ({ id: p._id, name: p.name, slug: p.slug, price: p.price, image: typeof p.images?.[0] === 'string' ? p.images?.[0] : p.images?.[0]?.url || '', category: p.category?.name || 'Vasanthi'})));
          }
        } catch (e) { console.warn("Related products unfetchable"); }
      } catch (err) { setError(true); } finally { setLoading(false); }
    };
    fetchData();
  }, [slug]);

  if (loading) return <Loader fullPage message="Fetching product details..." />;
  if (error) return <div className="min-h-screen py-20 px-4 flex items-center justify-center"><ErrorState title="Product Not Found" message="The product you are looking for might have been moved or deleted." onRetry={() => window.location.reload()} /></div>;
  if (!product) return <div className="min-h-screen py-20 px-4 flex items-center justify-center"><EmptyState icon={Search} title="Product Missing" description="We couldn't find the specific product you requested." actionLabel="Return to Shop" onAction={() => navigate('/shop')} /></div>;

  const productImages = product.images?.length > 0 ? product.images.map((img: any) => typeof img === 'string' ? img : img?.url || '') : ['https://placehold.co/600x800'];
  const inStock = product.stock > 0;
  const discountPercent = product.originalPrice && product.originalPrice > product.price ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <div className="min-h-screen bg-neutral-cream flex flex-col">
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-16 w-full">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="w-full lg:w-[55%]">
            <div className="lg:sticky lg:top-28 flex flex-col-reverse md:flex-row gap-4">
              <div className="flex md:flex-col gap-3 overflow-x-auto hide-scroll">
                {productImages.map((img: string, idx: number) => (
                  <button key={idx} onClick={() => setActiveImage(idx)} className={`w-20 md:w-24 aspect-[3/4] rounded-lg overflow-hidden border-2 ${activeImage === idx ? 'border-primary-700' : 'border-transparent'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <div className="flex-1 aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden">
                <img src={productImages[activeImage]} alt={product.name} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
          <div className="w-full lg:w-[45%] flex flex-col">
            <h1 className="text-3xl sm:text-4xl lg:text-[2.5rem] font-serif text-primary-950 mb-3">{product.name}</h1>
            <div className="flex items-end space-x-3 mb-6">
              <span className="text-3xl font-semibold text-primary-800">₹{product.price.toLocaleString('en-IN')}</span>
              {discountPercent > 0 && <span className="text-lg text-gray-400 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>}
            </div>
            <div className="mb-8 p-4 bg-white rounded-xl border border-primary-100 shadow-sm">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={stitchingRequired} 
                  onChange={(e) => setStitchingRequired(e.target.checked)}
                  className="w-5 h-5 text-primary-700 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-primary-950 uppercase tracking-widest">Add Custom Stitching (+₹500)</span>
              </label>
              {stitchingRequired && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="pt-4 border-t border-stone-50"
                >
                  <button 
                    onClick={() => setShowMeasurementModal(true)}
                    className="w-full py-4 bg-stone-50 border-2 border-stone-200 border-dashed rounded-2xl text-[10px] font-black uppercase tracking-widest text-stone-600 hover:border-primary-900 hover:text-primary-900 transition-all flex items-center justify-center gap-3"
                  >
                    <Sparkles size={16} /> {measurements ? 'Refine Measurements' : 'Open Fitting Room'}
                  </button>
                  {measurements && (
                     <p className="text-[10px] text-emerald-600 font-bold text-center mt-3 uppercase tracking-widest flex items-center justify-center gap-1">
                       <CheckCircle2 size={12} /> Measurements Recorded
                     </p>
                  )}
                </motion.div>
              )}
            </div>

            <div className="flex gap-4 mb-8">
              <button onClick={() => {
                const hasMeasurements = measurements && Object.values(measurements).some(v => v !== '');
                if (stitchingRequired && !hasMeasurements) {
                  toast.error('Please provide your measurements for custom stitching');
                  setShowMeasurementModal(true);
                  return;
                }
                addItem({ 
                  id: product._id, 
                  name: product.name, 
                  slug: product.slug, 
                  price: stitchingRequired ? product.price + 500 : product.price, 
                  image: productImages[0], 
                  quantity, 
                  fabric: product.fabric,
                  customizations: {
                    stitchingRequired,
                    measurements
                  }
                });
                trackEvent('add_to_cart', { 
                  metadata: {
                    productId: product._id, 
                    name: product.name, 
                    price: stitchingRequired ? product.price + 500 : product.price 
                  }
                });
                toast.success('Added to your collection');
              }} className="flex-1 bg-primary-950 text-white py-4 rounded font-bold uppercase tracking-widest">Add to Cart</button>
              <button onClick={() => {
                const hasMeasurements = measurements && Object.values(measurements).some(v => v !== '');
                if (stitchingRequired && !hasMeasurements) {
                  toast.error('Please provide your measurements for custom stitching');
                  setShowMeasurementModal(true);
                  return;
                }
                handleBuyNow();
              }} className="flex-1 bg-accent text-primary-950 py-4 rounded font-bold uppercase tracking-widest">Buy Now</button>
            </div>

            <button 
              onClick={() => {
                const url = `https://wa.me/919876543210?text=${encodeURIComponent(`Hello, I'm interested in the "${product.name}". Can you help me with more details?`)}`;
                window.open(url, '_blank');
              }}
              className="w-full mb-8 py-4 bg-white border border-stone-200 rounded-xl font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:bg-stone-50 transition-all text-primary-950"
            >
              <MessageCircle size={18} className="text-emerald-500" /> WhatsApp Inquiry
            </button>
            <div className="space-y-1 mb-8">
              <Accordion title="Description" defaultOpen={true}>{product.description}</Accordion>
              <Accordion title="Details">{product.fabric && `Fabric: ${product.fabric}`}</Accordion>
            </div>
            
            <TrustBadges variant="minimal" />
          </div>
        </div>
      </div>
      <section className="bg-neutral-cream py-20 border-t">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-serif mb-10">You May Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rp) => <ProductCard key={rp.id} product={rp} />)}
          </div>
        </div>
      </section>
      <PremiumMeasurementModal 
        isOpen={showMeasurementModal}
        onClose={() => setShowMeasurementModal(false)}
        initialData={measurements}
        onSave={(data) => {
          setMeasurements(data);
          setShowMeasurementModal(false);
        }}
      />
    </div>
  );
};

export default ProductDetailPage;
