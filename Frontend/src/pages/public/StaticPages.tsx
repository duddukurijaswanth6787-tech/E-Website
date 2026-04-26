import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';
import SEO from '../../components/common/SEO';

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-neutral-cream py-20">
      <SEO title="Our Legacy - Handloom Heritage" description="Discover the journey of Vasanthi Creations and our commitment to preserving Indian weaving traditions." />
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl md:text-5xl font-serif text-primary-950 mb-6">Our Legacy</h1>
          <div className="h-0.5 w-16 bg-accent mx-auto mb-8"></div>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Vasanthi Creations was born out of a desire to preserve the rich, intricate weaving heritage of India. Read our full story in the upcoming update.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <SEO title="Contact Us - Visit our Boutique" description="Get in touch with Vasanthi Creations for custom blouse stitching, bridal consultations, and styling queries." />
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
            <p className="text-sm text-gray-500">123 Silk Street, Chennai</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BlogsPage = () => {
  return (
    <div className="min-h-screen bg-neutral-cream py-20">
      <SEO title="The Journal - Style & Weaving Stories" description="Read our latest stories on Indian textiles, saree styling guides, and bridal fashion trends." />
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl md:text-5xl font-serif text-primary-950 mb-6">The Journal</h1>
          <div className="h-0.5 w-16 bg-accent mx-auto mb-8"></div>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Style guides, weaving documentaries, and bridal stories. Coming soon.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
