import Hero from '../../components/home/Hero';
import FeaturedCategories from '../../components/home/FeaturedCategories';
import TrendingProducts from '../../components/home/TrendingProducts';
import BridalSpotlight from '../../components/home/BridalSpotlight';
import { TrustBadges } from '../../components/common/TrustBadges';

import { getOrganizationSchema, getLocalBusinessSchema } from '../../utils/seoSchemas';
import { useSEO } from '../../context/SEOContext';
import { useSettingsStore } from '../../store/settingsStore';
import { useEffect } from 'react';

const HomePage = () => {
  const { setMetadata } = useSEO();
  const showBadges = useSettingsStore(state => state.isFeatureEnabled('storefront', 'trustBadges'));

  useEffect(() => {
    setMetadata({
      title: "Vasanthi Creations - Premium Ethnic Boutique in Hyderabad",
      description: "Discover the finest collection of bridal sarees, designer blouses, and festive ethnic wear at Vasanthi Creations. Expert tailoring and premium fabrics in the heart of Hyderabad.",
      schemaData: [getOrganizationSchema(), getLocalBusinessSchema()]
    });
  }, [setMetadata]);

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <Hero />
      {showBadges && (
        <div className="container mx-auto px-6 pt-12">
          <TrustBadges />
        </div>
      )}
      <FeaturedCategories />
      <TrendingProducts />
      <BridalSpotlight />
    </div>
  );
};

export default HomePage;
