import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { categoryService } from '../../api/services/category.service';
import { settingsService } from '../../api/services/settings.service';
import type { Category } from '../../api/services/category.service';

function extractCategories(res: unknown): Category[] {
  const r = res as Record<string, unknown> | Category[] | null | undefined;
  if (Array.isArray(r)) return r as Category[];
  if (!r || typeof r !== 'object') return [];
  const inner = (r as { data?: unknown }).data;
  if (Array.isArray(inner)) return inner as Category[];
  if (inner && typeof inner === 'object' && Array.isArray((inner as { data?: unknown }).data)) {
    return (inner as { data: Category[] }).data;
  }
  return [];
}

function isMainCategory(c: Category): boolean {
  const p = (c as { parent?: unknown }).parent;
  const parentId = typeof p === 'object' && p !== null ? (p as { _id?: string })._id : p;
  return !parentId;
}

const FALLBACK_CATEGORIES = [
  { name: 'Bridal Sarees', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2000&auto=format&fit=crop', path: '/shop', featured: true },
  { name: 'Kanchipuram Silk', image: 'https://images.unsplash.com/photo-1610030469614-118bd245781a?q=80&w=2000&auto=format&fit=crop', path: '/shop', featured: false },
  { name: 'Cotton Silk', image: 'https://images.unsplash.com/photo-1583391733958-d15f3a53d10e?q=80&w=2000&auto=format&fit=crop', path: '/shop', featured: false },
  { name: 'Designer Concept', image: 'https://images.unsplash.com/photo-1605701389814-11003f56ce73?q=80&w=2000&auto=format&fit=crop', path: '/shop', featured: false },
  { name: 'Festive Wear', image: 'https://images.unsplash.com/photo-1550420790-264627bbcbdf?q=80&w=2000&auto=format&fit=crop', path: '/shop', featured: false },
];

const FeaturedCategories = () => {
  const [categories, setCategories] = useState<{name: string, image: string, path: string, featured: boolean}[]>([]);
  const [header, setHeader] = useState({ title: 'Curated For You', subtitle: 'Explore our signature collections tailored to bring out your inner elegance.' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const settingsRes = await settingsService.getPublicSettings();
        const settingsData = settingsRes.data?.data || settingsRes.data;
        if (settingsData && settingsData.homepage_featured_categories) {
           const custom = settingsData.homepage_featured_categories;
           setHeader({ title: custom.title || 'Curated For You', subtitle: custom.subtitle || '' });
           if (custom.items && custom.items.length > 0) {
              setCategories(custom.items);
              setLoading(false);
              return;
           }
        }

        const res = await categoryService.getAllCategories();
        let list = extractCategories(res).filter((c) => c?.slug && c?.name);

        const mains = list.filter(isMainCategory);
        if (mains.length > 0) list = mains;

        const mapped = list.slice(0, 5).map((cat: Category, index: number) => ({
          name: cat.name,
          image: cat.banner || 'https://images.unsplash.com/photo-1583391733958-d15f3a53d10e?q=80&w=2000&auto=format&fit=crop',
          path: `/category/${cat.slug}`,
          featured: index === 0,
        }));

        if (mapped.length > 0) {
          setCategories(mapped);
        } else {
          setCategories(FALLBACK_CATEGORIES);
        }
      } catch (err) {
        console.warn('Featured categories: using fallback (API unavailable or empty)', err);
        setCategories(FALLBACK_CATEGORIES);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  return (
    <section className="py-20 bg-premium-ivory/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif text-primary-950 mb-4 tracking-tight">
            {header.title}
          </h2>
          <div className="h-1 w-16 bg-accent mx-auto rounded-full mb-4"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {header.subtitle}
          </p>
        </div>

        {/* Categories Grid or Swipeable List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-800 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 md:auto-rows-[250px] snap-x snap-mandatory pb-6 -mx-4 px-4 md:mx-0 md:px-0 hide-scroll">
            {categories.map((cat, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                key={cat.name}
                className={`relative overflow-hidden rounded-xl group cursor-pointer shadow-soft snap-center shrink-0 w-[85vw] h-[350px] md:w-auto md:h-auto
                  ${cat.featured ? 'md:col-span-2 md:row-span-2' : ''}
                `}
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url('${cat.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 via-primary-950/20 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
                
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 flex items-end">
                  <div className="w-full">
                    <h3 className={`font-serif text-white mb-1.5 sm:mb-2 tracking-wide leading-tight
                      ${cat.featured ? 'text-2xl sm:text-3xl md:text-4xl' : 'text-xl md:text-2xl'}
                    `}>
                      {cat.name}
                    </h3>
                    <Link 
                      to={cat.path}
                      className="inline-flex items-center text-accent text-xs sm:text-sm uppercase tracking-wider font-semibold md:opacity-0 transform md:translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
                    >
                      <span>Explore Collection</span>
                      <span className="ml-1 sm:ml-2 font-black">&rarr;</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
      </div>
    </section>
  );
};

export default FeaturedCategories;
