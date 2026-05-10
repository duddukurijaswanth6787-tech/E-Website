import Hero from '../../components/home/Hero';
import FeaturedCategories from '../../components/home/FeaturedCategories';
import TrendingProducts from '../../components/home/TrendingProducts';
import BridalSpotlight from '../../components/home/BridalSpotlight';
import SEO from '../../components/common/SEO';

const HomePage = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    "name": "Vasanthi Creations",
    "url": "https://vasanthicreations.com",
    "logo": "https://vasanthicreations.com/logo.png",
    "description": "Premium boutique for exquisite sarees, bridal wear, and festive ethnic collections.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "India"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://vasanthicreations.com/shop?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <SEO 
        title="Vasanthi Creations - Exquisite Sarees & Ethnic Boutique" 
        description="Vasanthi Creations offers premium sarees, bridal wear, and festive ethnic collections. Discover the art of tradition with our bespoke designs."
        schemaData={schema}
      />
      <Hero />
      <FeaturedCategories />
      <TrendingProducts />
      <BridalSpotlight />
    </div>
  );
};

export default HomePage;
