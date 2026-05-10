import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronDown } from 'lucide-react';
import SEO from '../../components/common/SEO';
import { ProductCard, type ProductCardProps } from '../../components/common/ProductCard';
import { ProductCardSkeleton } from '../../components/common/Skeleton';
import { productService } from '../../api/services/product.service';
import { categoryService } from '../../api/services/category.service';
import type { Category } from '../../api/services/category.service';
import { extractPaginatedList } from '../../utils/extractPaginatedList';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

const FilterSection = ({ 
  title, 
  options, 
  selected, 
  onChange 
}: { 
  title: string, 
  options: string[], 
  selected: string[], 
  onChange: (val: string) => void 
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b border-gray-100 py-6">
      <button 
        className="flex items-center justify-between w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-serif text-lg text-primary-950 font-medium tracking-wide">{title}</span>
        <ChevronDown size={18} className={`transition-transform duration-300 text-gray-500 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-3">
              {options.map((opt) => {
                const isSelected = selected.includes(opt);
                return (
                  <label key={opt} className="flex items-center space-x-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors
                      ${isSelected ? 'bg-primary-700 border-primary-700' : 'border-gray-300 group-hover:border-primary-400 bg-white'}
                    `}>
                      {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                    <span 
                      className={`text-sm tracking-wide ${isSelected ? 'text-primary-950 font-medium' : 'text-gray-600 group-hover:text-primary-800'}`}
                    >
                      {opt}
                    </span>
                    <input type="checkbox" className="hidden" checked={isSelected} onChange={() => onChange(opt)} />
                  </label>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ShopPage = () => {
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeOccasions, setActiveOccasions] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('recommended');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const toggleFilter = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
    if (list.includes(val)) {
      setList(list.filter(item => item !== val));
    } else {
      setList([...list, val]);
    }
  };

  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryService.getAllCategories();
        setCategories(Array.isArray((res as any)?.data) ? (res as any).data : []);
      } catch (err) {
        console.error("Failed to fetch categories", err);
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const queryParams: any = {};
        if (activeCategories.length > 0) queryParams.category = activeCategories.join(',');
        if (activeOccasions.length > 0) queryParams.occasion = activeOccasions.join(',');
        if (sortBy === 'price-asc') queryParams.sort = 'price';
        if (sortBy === 'price-desc') queryParams.sort = '-price';
        if (sortBy === 'newest') queryParams.sort = '-createdAt';

        const res = await productService.getProducts(queryParams);
        const productsArray = extractPaginatedList(res);
        const mappedProducts = productsArray.map((p: any) => ({
          id: p._id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          originalPrice: p.comparePrice,
          image: p.images && p.images.length > 0 ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0]?.url) : 'https://placehold.co/600x800/f3f4f6/A51648?text=No+Image',
          category: p.category?.name || 'Uncategorized',
          tag: p.isFeatured ? 'Featured' : p.isNewArrival ? 'New Arrival' : p.isBestSeller ? 'Bestseller' : undefined,
          isTrending: p.isTrending,
          rating: p.ratings?.average,
          ratingCount: p.ratings?.count,
          rewardPoints: p.rewardPoints
        }));
        
        setProducts(mappedProducts);
        setError(false);
      } catch (error) {
        console.error("Failed to fetch products", error);
        setProducts([]);
        setError(true);
        toast.error('Could not load products.');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [activeCategories, activeOccasions, sortBy]);

  const filteredProducts = products;

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between lg:hidden mb-6">
        <h3 className="font-serif text-2xl text-primary-950">Filters</h3>
        <button onClick={() => setShowMobileFilters(false)} className="text-gray-500 hover:text-primary-700 p-2">
          <X size={24} />
        </button>
      </div>

      <div className="hidden lg:flex items-center justify-between pb-4 border-b border-gray-200">
        <h3 className="font-serif text-xl tracking-tight text-primary-950">Filter Catalog</h3>
        {(activeCategories.length > 0 || activeOccasions.length > 0) && (
          <button 
            onClick={() => { setActiveCategories([]); setActiveOccasions([]); }}
            className="text-xs text-primary-600 uppercase tracking-widest hover:text-primary-800 font-semibold"
          >
            Clear All
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto lg:overflow-visible pr-2">
        <FilterSection 
          title="Categories" 
          options={categories.map(c => c.name)} 
          selected={categories.filter(c => activeCategories.includes(c._id)).map(c => c.name)}
          onChange={(name) => {
            const cat = categories.find(c => c.name === name);
            if (cat) toggleFilter(activeCategories, setActiveCategories, cat._id);
          }}
        />
        <FilterSection 
          title="Occasion" 
          options={['Wedding', 'Haldi', 'Reception', 'Casual', 'Party']} 
          selected={activeOccasions}
          onChange={(val) => toggleFilter(activeOccasions, setActiveOccasions, val)}
        />
      </div>
    </>
  );

  const { slug } = useParams();
  const [pageTitle, setPageTitle] = useState("Boutique Collection");

  useEffect(() => {
    if (slug) {
      setPageTitle(`${slug.charAt(0).toUpperCase() + slug.slice(1)} Collection`);
    } else {
      setPageTitle("Boutique Collection");
    }
  }, [slug]);

  return (
    <div className="min-h-screen bg-neutral-cream flex flex-col">
      <SEO title={pageTitle} description="Browse the complete catalog of Vasanthi Creations." />
      
      <div className="bg-primary-50 py-10 md:py-12 text-center border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="text-[0.7rem] font-semibold tracking-widest uppercase text-primary-600 mb-4 flex items-center justify-center space-x-2">
            <Link to="/" className="hover:text-primary-900 transition-colors">Home</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-800">Shop All</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-serif text-primary-950 mb-3 tracking-tight">The Heritage Collection</h1>
        </div>
      </div>

      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-start gap-10 flex-grow">
        <aside className="hidden lg:block w-1/4 max-w-[280px] flex-shrink-0 sticky top-28 h-[calc(100vh-120px)] overflow-y-auto pr-6 custom-scrollbar">
          <SidebarContent />
        </aside>

        <div className="flex-1 min-w-0 flex flex-col">
          {/* Mobile Filter Toggle & Sort */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
            <div className="text-sm text-gray-500 font-medium">
              Showing <span className="text-primary-950 font-bold">{filteredProducts.length}</span> results
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 text-xs font-bold text-primary-950 uppercase tracking-widest bg-white border border-gray-200 px-4 py-2 rounded-lg"
              >
                Filters {(activeCategories.length + activeOccasions.length) > 0 && `(${activeCategories.length + activeOccasions.length})`}
              </button>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-sm font-bold text-primary-950 uppercase tracking-widest focus:ring-0 cursor-pointer"
              >
                <option value="recommended">Recommended</option>
                <option value="newest">New Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
             <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 lg:gap-x-8">
               {[...Array(8)].map((_, i) => (
                 <ProductCardSkeleton key={i} />
               ))}
             </div>
          ) : error ? (
            <div className="py-20 flex justify-center">
              <ErrorState onRetry={() => window.location.reload()} />
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 lg:gap-x-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-20 flex justify-center">
              <EmptyState 
                icon={Search} 
                title="No Products Found" 
                description="We couldn't find any products matching your current filters. Try adjusting your categories or sorting options." 
                actionLabel="Clear All Filters"
                onAction={() => { setActiveCategories([]); setActiveOccasions([]); }}
              />
            </div>
          )}
        </div>
      </div>
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[80vw] max-w-[300px] bg-white z-[101] shadow-2xl p-6 flex flex-col lg:hidden overflow-y-auto"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShopPage;
