import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useSEO } from '../../context/SEOContext';
import { useEffect } from 'react';
import { getLocalBusinessSchema } from '../../utils/seoSchemas';

export const AboutPage = () => {
  const { setMetadata } = useSEO();

  useEffect(() => {
    setMetadata({
      title: "Our Legacy - Handloom Heritage | Vasanthi Creations",
      description: "Discover the journey of Vasanthi Creations and our commitment to preserving Indian weaving traditions through artisanal excellence."
    });
  }, [setMetadata]);

  return (
    <div className="min-h-screen bg-neutral-cream py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl md:text-5xl font-serif text-primary-950 mb-6">Our Legacy</h1>
          <div className="h-0.5 w-16 bg-accent mx-auto mb-8"></div>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Vasanthi Creations was born out of a desire to preserve the rich, intricate weaving heritage of India. Our journey began with a single handloom and a vision to bring timeless ethnic wear to the modern woman.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export const ContactPage = () => {
  const { setMetadata } = useSEO();

  useEffect(() => {
    setMetadata({
      title: "Contact Us - Visit our Hyderabad Boutique | Vasanthi Creations",
      description: "Visit our premium boutique in Hyderabad for custom blouse stitching, bridal consultations, and styling queries. Experience luxury ethnic wear first-hand.",
      schemaData: getLocalBusinessSchema()
    });
  }, [setMetadata]);

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif text-primary-950 mb-6">Contact Us</h1>
          <div className="h-0.5 w-16 bg-accent mx-auto mb-8"></div>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <Mail className="mx-auto mb-4 text-primary-700" size={32} />
            <h3 className="font-serif text-xl mb-2">Email</h3>
            <p className="text-sm text-gray-500">hello@vasanthicreations.com</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <Phone className="mx-auto mb-4 text-primary-700" size={32} />
            <h3 className="font-serif text-xl mb-2">Phone</h3>
            <p className="text-sm text-gray-500">+91 98765 43210</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <MapPin className="mx-auto mb-4 text-primary-700" size={32} />
            <h3 className="font-serif text-xl mb-2">Boutique</h3>
            <p className="text-sm text-gray-500">Jubilee Hills, Hyderabad, Telangana</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BlogsPage = () => {
  const { setMetadata } = useSEO();

  useEffect(() => {
    setMetadata({
      title: "The Journal - Style & Weaving Stories | Vasanthi Creations",
      description: "Read our latest stories on Indian textiles, saree styling guides, and bridal fashion trends. Stay updated with the world of handlooms."
    });
  }, [setMetadata]);

  return (
    <div className="min-h-screen bg-neutral-cream py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl md:text-5xl font-serif text-primary-950 mb-6">The Journal</h1>
          <div className="h-0.5 w-16 bg-accent mx-auto mb-8"></div>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Explore style guides, weaving documentaries, and bridal stories. Our journal is a celebration of Indian craftsmanship and modern aesthetics.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
