import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Share2, ChevronDown, Check, Minus, Plus, MessageCircle, Star, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { ProductCard } from '../../components/common/ProductCard';
import { ImageWithSkeleton } from '../../components/common/Skeleton';
import { useCartStore } from '../../store/cartStore';
import SEO from '../../components/common/SEO';

import { productService } from '../../api/services/product.service';
import { extractPaginatedList } from '../../utils/extractPaginatedList';

// Accordion Component
const Accordion = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-5 text-left focus:outline-none"
      >
        <span className="font-serif text-lg text-primary-950 font-medium tracking-wide">{title}</span>
        <ChevronDown size={20} className={`transition-transform duration-300 text-gray-500 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-gray-600 font-light leading-relaxed whitespace-pre-line text-[0.95rem]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();

  const handleBuyNow = () => {
    if (!product || !inStock) return;
    addItem({
      id: product._id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: productImages[0],
      quantity: quantity,
      fabric: product.fabric
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

        const categoryId =
          p?.category && typeof p.category === 'object' ? (p.category as { _id?: string })._id : p?.category;

        try {
          const relatedRes = await productService.getRelatedProducts(p._id, categoryId);
          if (relatedRes.data && relatedRes.data.length > 0) {
            setRelatedProducts(relatedRes.data.map((rp: any) => ({
              id: rp._id,
              name: rp.name,
              slug: rp.slug,
              price: rp.price,
              originalPrice: rp.comparePrice ?? rp.originalPrice,
              image: typeof rp.images?.[0] === 'string' ? rp.images?.[0] : rp.images?.[0]?.url || '',
              category: rp.category?.name || 'Vasanthi',
            })));
          } else {
             // Fallback to frontpage trending if none mapped structurally
             const trend = await productService.getProducts({ limit: 4 });
             const list = extractPaginatedList(trend);
             setRelatedProducts(list.map((p: any) => ({ id: p._id, name: p.name, slug: p.slug, price: p.price, image: typeof p.images?.[0] === 'string' ? p.images?.[0] : p.images?.[0]?.url || '', category: p.category?.name || 'Vasanthi'})));
          }
        } catch (e) {
          console.warn("Related products unfetchable");
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-cream">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-cream text-center">
        <h2 className="text-3xl font-serif text-primary-950 mb-4">Product Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">The item you are looking for does not exist or has been removed from our catalog.</p>
        <Link to="/shop" className="bg-primary-950 text-white px-8 py-3 rounded tracking-widest font-bold uppercase hover:bg-primary-800">Return to Shop</Link>
      </div>
    );
  }

  // Fallback defaults for missing backend values
  const productImages = product.images?.length > 0 
    ? product.images.map((img: any) => typeof img === 'string' ? img : img?.url || '')
    : ['https://placehold.co/600x800/f3f4f6/A51648?text=No+Image'];
  const categoryName = product.category?.name || 'Catalog';
  const categorySlug = product.category?.slug || 'all';
  const reviewsCount = 0; // To be dynamic later
  const reviewsAverage = 5.0; // To be dynamic later
  const inStock = product.stock > 0;
  
  // Discount Calculation
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const attrs = product.attributes || {};
  const keyDetailsRows: Array<{ label: string; value: string }> = [
    { label: 'Fabric', value: product.fabric || '—' },
    { label: 'Colour', value: product.color || '—' },
    { label: 'Weaving Technique', value: product.weavingTechnique || '—' },
    { label: 'Pallu', value: product.pallu || '—' },
    { label: 'Blouse', value: product.blouseDetails || '—' },
    { label: 'Speciality', value: product.speciality || '—' },
    { label: 'Handloom Craftsmanship', value: product.handloomCraftsmanship || '—' },
    { label: 'Design Highlight', value: product.designHighlight || '—' },
    {
      label: 'Saree',
      value:
        attrs.sareeLength || attrs.sareeWidth
          ? `Length: ${attrs.sareeLength || '—'}  Width: ${attrs.sareeWidth || '—'}`
          : '—',
    },
    {
      label: 'Blouse (piece)',
      value:
        attrs.blouseLength || attrs.blouseWidth
          ? `Length: ${attrs.blouseLength || '—'}  Width: ${attrs.blouseWidth || '—'}`
          : '—',
    },
    { label: 'Weight', value: attrs.weight || '—' },
    {
      label: 'Occasion',
      value:
        Array.isArray(product.occasions) && product.occasions.length
          ? product.occasions.join(', ')
          : product.occasion || '—',
    },
    { label: 'Care', value: product.careInstructions || 'Dry clean only. Store in a breathable cotton/muslin bag.' },
    { label: 'Returns', value: product.returnable === false ? 'Not returnable' : `${product.returnWindowDays ?? 7}-day return/exchange` },
    { label: 'SKU', value: product.sku || '—' },
  ];

  const productReviews = [
    {
      "@type": "Review",
      "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
      "author": { "@type": "Person", "name": "Ananya R." }
    }
  ];

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": productImages,
    "description": product.description || `Exquisite ${product.fabric || ''} saree from Vasanthi Creations.`,
    "sku": product.sku || product._id,
    "brand": { "@type": "Brand", "name": "Vasanthi Creations" },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "INR",
      "price": product.price,
      "priceValidUntil": "2027-01-01",
      "availability": inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "reviewCount": "12"
    },
    "review": productReviews
  };

  return (
    <div className="min-h-screen bg-neutral-cream flex flex-col">
      <SEO 
        title={product.name}
        description={product.description || `Shop ${product.name} at Vasanthi Creations. Premium quality ${product.fabric || 'ethnic wear'}.`}
        ogImage={productImages[0]}
        ogType="product"
        schemaData={productSchema}
      />
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="text-[0.65rem] sm:text-xs font-semibold tracking-widest uppercase text-gray-400 flex items-center space-x-2">
            <Link to="/" className="hover:text-primary-800 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-primary-800 transition-colors">Shop</Link>
            <span>/</span>
            <Link to={`/category/${categorySlug}`} className="hover:text-primary-800 transition-colors">{categoryName}</Link>
            <span>/</span>
            <span className="text-primary-900 truncate max-w-[150px] sm:max-w-xs">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 w-full flex-grow">
        
        {/* Main Product Layout Container */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          
          {/* Left: Image Gallery (Desktop Sticky, Mobile Normal) */}
          <div className="w-full lg:w-[55%] flex-shrink-0">
            <div className="lg:sticky lg:top-28 flex flex-col-reverse md:flex-row gap-4">
              
              {/* Thumbnails */}
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[700px] flex-shrink-0 custom-scrollbar pb-2 md:pb-0 snap-x snap-mandatory hide-scroll">
                {productImages.map((img: string, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-20 md:w-24 aspect-[3/4] flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-300 snap-center ${activeImage === idx ? 'border-primary-700 opacity-100' : 'border-transparent opacity-60 hover:opacity-100 bg-gray-100'}`}
                  >
                    <ImageWithSkeleton src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" containerClassName="w-full h-full" />
                  </button>
                ))}
              </div>

              {/* Main Image */}
              <div className="relative flex-1 aspect-[3/4] md:aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden group cursor-crosshair">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full"
                  >
                    <ImageWithSkeleton 
                      src={productImages[activeImage]} 
                      alt={product.name}
                      className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
                      containerClassName="w-full h-full"
                      loading="eager"
                    />
                  </motion.div>
                </AnimatePresence>
                
                {/* Badges overlay on Main Image */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {(product.tags && product.tags.length > 0) && (
                    <span className="bg-white/90 backdrop-blur-sm text-primary-950 text-[0.65rem] font-bold uppercase tracking-widest px-3 py-1.5 rounded shadow-sm">
                      {product.tags[0]}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="bg-accent/90 backdrop-blur-sm text-primary-950 text-[0.65rem] font-bold uppercase tracking-widest px-3 py-1.5 rounded shadow-sm">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Right: Product Info & Actions */}
          <div className="w-full lg:w-[45%] flex flex-col pt-2 lg:pt-0">
            
            {/* Header / Basic Info */}
            <h1 className="text-3xl sm:text-4xl lg:text-[2.5rem] font-serif text-primary-950 leading-tight mb-3">
              {product.name}
            </h1>
            
            {/* Reviews Summary */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center text-accent">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill={i < Math.floor(reviewsAverage) ? 'currentColor' : 'none'} className={i < Math.floor(reviewsAverage) ? '' : 'text-gray-300'} />
                ))}
                <span className="ml-2 text-sm text-gray-600 font-medium">{reviewsCount} Reviews</span>
              </div>
              <span className="text-gray-300">|</span>
              <span className={`text-sm flex items-center tracking-wide font-medium ${inStock ? 'text-green-600' : 'text-red-500'}`}>
                <Check size={14} className="mr-1" />
                {inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            {/* Pricing Details */}
            <div className="flex items-end space-x-3 mb-6">
              <span className="text-3xl font-semibold text-primary-800">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-lg text-gray-400 line-through mb-1 font-medium">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              <span className="text-xs text-gray-400 mb-1.5 ml-2">Inclusive of all taxes</span>
            </div>

            {/* Short Description */}
            <p className="text-gray-600 font-light leading-relaxed mb-10 text-[1.05rem]">
              {product.description || 'A timeless elegant piece from Vasanthi Creations.'}
            </p>

            {/* Form Section */}
            <div className="pb-8 sm:pb-10 border-b border-gray-200 mb-8 sm:mb-10">
              
              <div className="flex flex-wrap sm:flex-nowrap items-end justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
                {/* Quantity Control */}
                <div className="flex-shrink-0 w-full sm:w-auto flex items-center justify-between sm:block border sm:border-0 border-gray-200 rounded p-1 sm:p-0 mb-2 sm:mb-0">
                  <label className="block text-[0.65rem] sm:text-xs font-semibold uppercase tracking-widest text-gray-500 mb-0 sm:mb-2 ml-2 sm:ml-0">Quantity</label>
                  <div className="flex items-center sm:border sm:border-gray-300 rounded-md bg-white">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 sm:px-4 py-2 sm:py-3 text-gray-500 hover:text-primary-700 hover:bg-gray-50 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus size={14} className="sm:w-4 sm:h-4" />
                    </button>
                    <span className="w-6 sm:w-8 text-center text-sm font-medium text-gray-900">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 sm:px-4 py-2 sm:py-3 text-gray-500 hover:text-primary-700 hover:bg-gray-50 transition-colors"
                    >
                      <Plus size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-1 gap-2 sm:gap-4">
                  {/* Primary Add to Cart */}
                  <button 
                    disabled={!inStock}
                    onClick={() => addItem({
                      id: product._id,
                      name: product.name,
                      slug: product.slug,
                      price: product.price,
                      image: productImages[0],
                      quantity: quantity,
                      fabric: product.fabric
                    })}
                    className={`flex-1 text-white rounded-md py-3 sm:py-4 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all shadow-premium hover:-translate-y-0.5 active:scale-95 flex items-center justify-center ${inStock ? 'bg-primary-950 hover:bg-primary-800' : 'bg-gray-400 cursor-not-allowed opacity-70 shadow-none hover:translate-y-0'}`}
                  >
                    {inStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>

                  {/* Wishlist Toggle */}
                  <button className="flex-shrink-0 w-12 sm:w-14 w-12 sm:h-14 border border-gray-300 text-gray-600 hover:border-primary-700 hover:text-primary-700 rounded-md flex items-center justify-center transition-all bg-white hover:bg-primary-50">
                    <Heart size={18} className="sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              {/* Buy Now & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  disabled={!inStock}
                  onClick={handleBuyNow}
                  className={`w-full text-primary-950 rounded-md py-3.5 text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center shadow-soft ${inStock ? 'bg-accent hover:bg-accent-light' : 'bg-gray-200 cursor-not-allowed opacity-70 shadow-none'}`}
                >
                  {inStock ? 'Buy it Now' : 'Currently Unavailable'}
                </button>
                <a 
                  href={`https://wa.me/919876543210?text=I'm interested in ${product.name}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full border border-green-600 text-green-700 rounded-md py-3.5 text-sm font-bold uppercase tracking-widest hover:bg-green-50 transition-all flex items-center justify-center"
                >
                  <MessageCircle size={18} className="mr-2" />
                  Ask on WhatsApp
                </a>
              </div>

            </div>

            {/* Accordions (Product Details) */}
            <div className="space-y-1 mb-10">
              {/* Always-visible Key Details mini-table */}
              <div className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl shadow-soft mb-6 overflow-hidden">
                <div className="px-5 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-serif text-xl text-primary-950 tracking-tight">Key Details</h3>
                  <span className="text-[0.65rem] uppercase tracking-widest text-gray-500 font-semibold">At a glance</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {keyDetailsRows.map((row) => (
                    <div key={row.label} className="flex flex-col sm:grid sm:grid-cols-6 border-b border-gray-100 last:border-0">
                      <div className="w-full sm:col-span-2 bg-primary-50/60 px-5 sm:px-6 py-2.5 sm:py-3 text-[0.65rem] sm:text-sm font-semibold tracking-wide text-primary-950 uppercase sm:normal-case">
                        {row.label}
                      </div>
                      <div className="w-full sm:col-span-4 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-700 leading-relaxed bg-white sm:bg-transparent">
                        {row.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Accordion title="The Details" defaultOpen={true}>
                {product.description || 'Details coming soon.'}
              </Accordion>
              
              <Accordion title="Fabric & Care">
                <h4 className="font-semibold text-primary-950 mb-1">Fabric</h4>
                <p className="mb-4">{product.fabric || 'Premium Handloom Fabric'}</p>
                <h4 className="font-semibold text-primary-950 mb-1">Care Instructions</h4>
                <p>{product.careInstructions || 'Strictly dry clean only. Store in a breathable cotton or muslin bag. Air occasionally in mild sunlight.'}</p>
              </Accordion>
              
              <Accordion title="Shipping & Returns">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Truck size={20} className="text-gray-400 flex-shrink-0" />
                    <p>Ships in 2-3 business days. Free shipping across India.</p>
                  </div>
                  <div className="flex gap-3">
                    <RotateCcw size={20} className="text-gray-400 flex-shrink-0" />
                    <p>
                      {product.returnable === false
                        ? 'This product is not eligible for returns/exchanges.'
                        : `${product.returnWindowDays ?? 7}-day hassle-free return/exchange policy for unstitched garments.`}
                    </p>
                  </div>
                </div>
              </Accordion>
              
              <Accordion title="Styling Notes">
                <p>
                  Pair this masterpiece with traditional antique gold temple jewelry and a contrasting intricate hand-embroidered blouse. Enhance the look with a classic low bun adorned with fresh Gajra (jasmine flowers) for a truly majestic bridal portrait.
                </p>
              </Accordion>
            </div>

            {/* Social Share & Trust Verification */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6 border-t border-b border-gray-100 bg-white px-2 mt-4">
              <div className="flex items-center space-x-2 text-primary-800 text-sm font-medium tracking-wide mb-4 sm:mb-0">
                <ShieldCheck size={20} />
                <span>100% Authentic Handloom Guarantee</span>
              </div>
              <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-primary-700 transition-colors uppercase tracking-widest font-semibold">
                <Share2 size={16} />
                <span>Share Details</span>
              </button>
            </div>
            
          </div>
        </div>
      </div>

      {/* Reviews Summary Section */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif text-primary-950 mb-4">Customer Reviews</h2>
            <div className="flex items-center justify-center text-accent mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={24} fill={i < Math.floor(reviewsAverage) ? 'currentColor' : 'none'} className={i < Math.floor(reviewsAverage) ? '' : 'text-gray-300'} />
              ))}
            </div>
            <p className="text-gray-600">Based on {reviewsCount} reviews • {reviewsAverage} out of 5</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Mock Review Card */}
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-neutral-cream p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center text-accent mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <h4 className="font-medium text-primary-950 mb-2">Absolutely stunning craftsmanship!</h4>
                <p className="text-sm text-gray-600 font-light mb-6">
                  "The saree arrived beautifully packaged and the actual fabric feels divine. The zari work is much more intricate than the pictures convey. Highly recommend for weddings."
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="font-medium text-gray-600">Ananya R.</span>
                  <span>Verified Buyer</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <button className="text-primary-700 font-semibold tracking-widest uppercase text-sm border-b border-primary-700 pb-1 hover:text-primary-900 hover:border-primary-900 transition-colors">
              Read All Reviews
            </button>
          </div>
        </div>
      </section>

      {/* Related / "You May Also Like" Section */}
      <section className="bg-neutral-cream py-20 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-serif text-primary-950">You May Also Like</h2>
            <div className="h-[1px] flex-grow bg-gray-300 mx-6 hidden sm:block"></div>
            <Link to={`/category/${categorySlug}`} className="text-xs font-semibold tracking-widest uppercase text-gray-500 hover:text-primary-700 transition-colors whitespace-nowrap">
              View Collection &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default ProductDetailPage;
