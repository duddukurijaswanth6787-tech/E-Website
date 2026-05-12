import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard, type ProductCardProps } from '../common/ProductCard';
import { ProductCardSkeleton } from '../common/Skeleton';
import { productService } from '../../api/services/product.service';
import { IMAGES } from '../../constants/assets';

const TrendingProducts = () => {
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchTrending = async () => {
      try {
        const res = await productService.getTrendingProducts();
        if (abortController.signal.aborted) return;

        const list = Array.isArray(res.data) ? res.data : [];

        const mappedProducts = list.map((p: any) => ({
          id: p._id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          originalPrice: p.comparePrice ?? p.originalPrice,
          image: p.images && p.images.length > 0 ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0]?.url) : IMAGES.placeholder,
          category: p.category?.name || 'Trending',
          tag: p.tags && p.tags.length > 0 ? p.tags[0] : (p.isNewArrival ? 'New' : (p.isBestSeller ? 'Bestseller' : undefined)),
          rating: p.ratings?.average,
          ratingCount: p.ratings?.count,
          rewardPoints: p.rewardPoints,
          isTrending: p.isTrending
        }));
        setProducts(mappedProducts);
      } catch (error: any) {
        if (error.name === 'AbortError') return;
        if (import.meta.env.DEV) {
          console.warn("[Trending] API unavailable:", error.message);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };
    fetchTrending();

    return () => abortController.abort();
  }, []);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif text-primary-950 mb-3">Trending Now</h2>
            <div className="h-0.5 w-12 bg-accent"></div>
          </div>
          <Link to="/shop?sort=trending" className="hidden md:inline-flex items-center text-sm font-semibold tracking-widest uppercase text-gray-500 hover:text-primary-700 transition-colors">
            View All Trending &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
            {[...Array(4)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">Products are currently being curated.</div>
        )}

        <div className="mt-12 text-center md:hidden">
          <Link to="/shop?sort=trending" className="inline-flex items-center text-sm font-semibold tracking-widest uppercase text-primary-700 border-b border-primary-700 pb-1 hover:text-accent hover:border-accent transition-colors">
            View All Trending
          </Link>
        </div>

      </div>
    </section>
  );
};

export default TrendingProducts;
