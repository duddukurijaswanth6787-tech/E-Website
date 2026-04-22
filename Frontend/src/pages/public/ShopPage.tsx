import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown, Check, SlidersHorizontal, Search } from 'lucide-react';
import { ProductCard, type ProductCardProps } from '../../components/common/ProductCard';
import { productService } from '../../api/services/product.service';
import { categoryService } from '../../api/services/category.service';
import type { Category } from '../../api/services/category.service';
import { extractPaginatedList } from '../../utils/extractPaginatedList';
import toast from 'react-hot-toast';

// Removed INITIAL_PRODUCTS mock data - Now fetching cleanly from the live Database via productService

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
                    {/* Hidden actual checkbox to make it accessible and use onChange */}
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
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeOccasions, setActiveOccasions] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('recommended');

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

  // Fetch initial Categories and Collections for Sidebar
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

  // Fetch real data from backend
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const queryParams: any = {};
        if (activeCategories.length > 0) queryParams.category = activeCategories.join(',');
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
          image: p.images && p.images.length > 0 ? p.images[0] : 'https://placehold.co/600x800/f3f4f6/A51648?text=No+Image',
          category: p.category?.name || 'Uncategorized',
          tag: p.isFeatured ? 'Featured' : p.isTrending ? 'Trending' : p.isNewArrival ? 'New Arrival' : undefined
        }));
        
        setProducts(mappedProducts);
      } catch (error) {
        console.error("Failed to fetch products", error);
        setProducts([]);
        toast.error('Could not load products. Check that the API is running and VITE_API_URL is correct.');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [activeCategories, sortBy]);

  const filteredProducts = products; // Sorting and filtering is now handled server-side

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between lg:hidden mb-6">
        <h3 className="font-serif text-2xl text-primary-950">Filters</h3>
        <button onClick={() => setIsMobileFilterOpen(false)} className="text-gray-500 hover:text-primary-700 p-2">
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
        <FilterSection 
          title="Price Range" 
          options={['Under ₹10,000', '₹10,000 - ₹25,000', '₹25,000 - ₹50,000', 'Above ₹50,000']} 
          selected={[]}
          onChange={() => {}}
        />
      </div>

      <div className="mt-8 lg:hidden pb-safe border-t border-gray-100 pt-6">
        <button 
          onClick={() => setIsMobileFilterOpen(false)}
          className="w-full bg-primary-950 text-white font-medium uppercase tracking-widest py-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-900"
        >
          View {filteredProducts.length} Results
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-neutral-cream flex flex-col">
      {/* Premium Header Space */}
      <div className="bg-primary-50 py-10 md:py-12 text-center border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4">
          {/* Breadcrumbs */}
          <nav className="text-[0.7rem] font-semibold tracking-widest uppercase text-primary-600 mb-4 flex items-center justify-center space-x-2">
            <a href="/" className="hover:text-primary-900 transition-colors">Home</a>
            <span className="text-gray-400">/</span>
            <span className="text-gray-800">Shop All</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-serif text-primary-950 mb-3 tracking-tight">The Heritage Collection</h1>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover our complete repertoire of handcrafted ethnic luxury. Filter by occasion, fabric, or price to find your perfect statement piece.
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-start gap-10 flex-grow">
        
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-1/4 max-w-[280px] flex-shrink-0 sticky top-28 h-[calc(100vh-120px)] overflow-y-auto pr-6 custom-scrollbar">
          <SidebarContent />
        </aside>

        {/* Mobile Filter Drawer Overlay */}
        <AnimatePresence>
          {isMobileFilterOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-neutral-black/50 z-50 lg:hidden backdrop-blur-sm"
                onClick={() => setIsMobileFilterOpen(false)}
              />
              <motion.div
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-[60] shadow-2xl p-6 lg:hidden flex flex-col"
              >
                <SidebarContent />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Product Grid Area */}
        <div className="flex-1 min-w-0 flex flex-col">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-4 sm:mb-0">
              Showing {filteredProducts.length} Product{filteredProducts.length !== 1 && 's'}
            </span>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center space-x-2 text-sm font-semibold tracking-widest uppercase text-primary-950 bg-white border border-gray-300 px-4 py-2.5 rounded hover:bg-gray-50 transition-colors"
              >
                <Filter size={16} />
                <span>Filters</span>
                {(activeCategories.length > 0 || activeOccasions.length > 0) && (
                  <span className="bg-primary-700 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs">
                    {activeCategories.length + activeOccasions.length}
                  </span>
                )}
              </button>

              <div className="relative flex-1 sm:flex-none">
                <select 
                  className="w-full sm:w-auto appearance-none bg-white border border-gray-300 text-sm font-medium text-gray-700 px-4 py-2.5 pr-10 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="recommended">Sort by: Recommended</option>
                  <option value="newest">Sort by: Newest Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <SlidersHorizontal size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
             <div className="flex justify-center items-center py-32">
               <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-800 rounded-full animate-spin"></div>
             </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 lg:gap-x-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-6">
                <Search size={32} strokeWidth={1} className="text-primary-300" />
              </div>
              <h3 className="font-serif text-2xl text-primary-950 mb-2">No products found</h3>
              <p className="text-gray-500 max-w-md mb-4">
                {activeCategories.length > 0 || activeOccasions.length > 0
                  ? "We couldn't find any items matching your current filters. Try clearing filters or pick another category."
                  : 'The shop only shows products whose status is Published. In Admin → Products, open each item and set Status to Published, or add new products with Published selected.'}
              </p>
              <button 
                onClick={() => { setActiveCategories([]); setActiveOccasions([]); }}
                className="bg-accent text-primary-950 px-8 py-3 rounded uppercase tracking-wider font-semibold hover:bg-accent-light transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination / Load More */}
          {filteredProducts.length > 0 && (
            <div className="mt-16 flex justify-center border-t border-gray-200 pt-10">
              <button className="border border-primary-950 text-primary-950 hover:bg-primary-50 px-10 py-3 uppercase tracking-widest text-sm font-semibold rounded transition-colors duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-900">
                Load More
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ShopPage;
