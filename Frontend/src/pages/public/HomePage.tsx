import Hero from '../../components/home/Hero';
import FeaturedCategories from '../../components/home/FeaturedCategories';
import TrendingProducts from '../../components/home/TrendingProducts';
import BridalSpotlight from '../../components/home/BridalSpotlight';

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      {/* Premium Hero Section */}
      <Hero />
      
      {/* Featured Curated Categories */}
      <FeaturedCategories />
      
      {/* Trending / Bestseller Products */}
      <TrendingProducts />
      
      {/* Luxury Bridal Spotlight */}
      <BridalSpotlight />
    </div>
  );
};

export default HomePage;
