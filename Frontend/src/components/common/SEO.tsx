import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'product' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
  schemaData?: object;
}

const SEO = ({
  title,
  description = "Experience premium ethnic wear at Vasanthi Creations. Exquisite sarees, bridal wear, and festive collections designed for the modern woman.",
  canonical,
  ogTitle,
  ogDescription,
  ogImage = "https://vasanthicreations.com/og-image.jpg", // Replace with real OG image
  ogType = 'website',
  twitterCard = 'summary_large_image',
  schemaData
}: SEOProps) => {
  const siteTitle = "Vasanthi Creations | Premium Ethnic Boutique";
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={ogDescription || description} />
      <link rel="canonical" href={canonical || currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical || currentUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={ogTitle || fullTitle} />
      <meta name="twitter:description" content={ogDescription || description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Structured Data */}
      {schemaData && (
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
