import React, { createContext, useContext, useMemo } from 'react';
import SEO from '../components/common/SEO';

interface SEOContextValue {
  setMetadata: (meta: Partial<SEOMetadata>) => void;
  resetMetadata: () => void;
}

interface SEOMetadata {
  title: string;
  description: string;
  ogImage?: string;
  ogType?: 'website' | 'product' | 'article';
  schemaData?: any;
  canonical?: string;
}

const SEOContext = createContext<SEOContextValue | null>(null);

export const SEOProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [metadata, setMetadataState] = React.useState<SEOMetadata>({
    title: '',
    description: '',
    ogType: 'website'
  });

  const value = useMemo(() => ({
    setMetadata: (meta: Partial<SEOMetadata>) => {
      setMetadataState(prev => ({ ...prev, ...meta }));
    },
    resetMetadata: () => {
      setMetadataState({
        title: '',
        description: '',
        ogType: 'website'
      });
    }
  }), []);

  return (
    <SEOContext.Provider value={value}>
      <SEO 
        title={metadata.title}
        description={metadata.description}
        ogImage={metadata.ogImage}
        ogType={metadata.ogType}
        schemaData={metadata.schemaData}
        canonical={metadata.canonical}
      />
      {children}
    </SEOContext.Provider>
  );
};

export const useSEO = () => {
  const ctx = useContext(SEOContext);
  if (!ctx) throw new Error('useSEO must be used within SEOProvider');
  return ctx;
};
