const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://vasanthicreations.com';

export const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Vasanthi Creations",
  "url": SITE_URL,
  "logo": `${SITE_URL}/logo.png`,
  "sameAs": [
    "https://facebook.com/vasanthicreations",
    "https://instagram.com/vasanthicreations"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-XXXXXXXXXX",
    "contactType": "customer service",
    "areaServed": "IN",
    "availableLanguage": "English"
  }
});

export const getLocalBusinessSchema = () => ({
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  "name": "Vasanthi Creations Boutique",
  "image": "https://vasanthicreations.com/store-front.jpg",
  "@id": "https://vasanthicreations.com",
  "url": "https://vasanthicreations.com",
  "telephone": "+91-XXXXXXXXXX",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Boutique Lane, Jubilee Hills",
    "addressLocality": "Hyderabad",
    "postalCode": "500033",
    "addressRegion": "Telangana",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 17.4326,
    "longitude": 78.4071
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ],
    "opens": "10:00",
    "closes": "20:00"
  }
});

export const getProductSchema = (product: any) => ({
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": product.name,
  "image": product.images.map((img: any) => img.url),
  "description": product.shortDescription || product.description,
  "sku": product.sku,
  "brand": {
    "@type": "Brand",
    "name": "Vasanthi Creations"
  },
  "offers": {
    "@type": "Offer",
    "url": `https://vasanthicreations.com/product/${product.slug}`,
    "priceCurrency": "INR",
    "price": product.price,
    "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    "itemCondition": "https://schema.org/NewCondition"
  },
  "aggregateRating": product.ratings?.count > 0 ? {
    "@type": "AggregateRating",
    "ratingValue": product.ratings.average,
    "reviewCount": product.ratings.count
  } : undefined
});

export const getBreadcrumbSchema = (items: { name: string, item: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": `https://vasanthicreations.com${item.item}`
  }))
});
