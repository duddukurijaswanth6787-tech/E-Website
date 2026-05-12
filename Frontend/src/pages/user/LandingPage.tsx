import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, Shield, Ruler, 
  ChevronRight, ArrowRight, MessageSquare, Star,
  MapPin, Clock, ShieldCheck, Zap 
} from 'lucide-react';
import { useSEO } from '../../context/SEOContext';
import { GlassCard } from '../../components/common/GlassCard';
import { ImageWithSkeleton } from '../../components/common/Skeleton';
import { WhatsAppCTA } from '../../components/common/WhatsAppCTA';
import api from '../../api/client';

const LandingPage = () => {
  const { slug } = useParams();
  const { setMetadata } = useSEO();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchLandingPage = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/seo/public/${slug}`);
        const pageData = res.data.data;
        setData(pageData);
        
        // Dynamic SEO Update
        setMetadata({
          title: pageData.seo?.title || pageData.title,
          description: pageData.seo?.metaDescription || pageData.description,
          ogImage: pageData.seo?.ogImage,
          schemaData: [{
            "@context": "https://schema.org",
            "@type": pageData.seo?.schemaType || "Service",
            "name": pageData.title,
            "description": pageData.description,
            "provider": {
              "@type": "LocalBusiness",
              "name": "Vasanthi Creations"
            }
          }]
        });
      } catch (error) {
        console.error('Landing page fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchLandingPage();
  }, [slug, setMetadata]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-cream flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6">
        <h1 className="text-2xl font-black text-gray-900 uppercase">Collection Not Found</h1>
        <p className="text-gray-500 mt-2 font-medium">The requested luxury collection is currently being curated.</p>
        <Link to="/shop" className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase">
          Explore Store
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-cream text-primary-950 font-sans selection:bg-primary-200">
      <WhatsAppCTA />
      
      {data.content.map((section: any, idx: number) => {
        switch (section.sectionType) {
          case 'hero':
            return (
              <section key={idx} className="relative h-[80vh] min-h-[600px] flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                  {section.images?.[0] && (
                    <ImageWithSkeleton 
                      src={section.images[0]} 
                      alt={section.title || 'Section Image'}
                      className="w-full h-full object-cover brightness-50"
                      containerClassName="w-full h-full"
                    />
                  )}
                </div>
                <div className="container mx-auto px-6 relative z-10 text-white">
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-3xl"
                  >
                    {section.subtitle && (
                      <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-[0.3em] mb-6">
                        {section.subtitle}
                      </span>
                    )}
                    <h1 className="text-5xl md:text-7xl font-serif leading-[1.1] mb-8 tracking-tight italic">
                      {section.title || data.h1}
                    </h1>
                    <p className="text-xl text-white/80 leading-relaxed mb-10 font-light">
                      {section.body || data.description}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <a 
                        href={section.ctaLink || "#inquiry"} 
                        className="px-8 py-4 bg-white text-primary-950 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-primary-50 transition-all flex items-center gap-2 group"
                      >
                        {section.ctaLabel || 'Enquire Now'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </motion.div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-neutral-cream to-transparent"></div>
              </section>
            );

          case 'features':
            return (
              <section key={idx} className="py-24 container mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                  <h2 className="text-3xl md:text-4xl font-serif mb-4 italic text-primary-800">{section.title}</h2>
                  <div className="h-1 w-12 bg-primary-600 mx-auto rounded-full"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {section.items?.map((item: any, i: number) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      viewport={{ once: true }}
                      className="p-8 rounded-3xl bg-white border border-primary-50 hover:shadow-xl transition-all group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-6 group-hover:scale-110 transition-transform">
                        {item.icon === 'Zap' && <Zap size={24} />}
                        {item.icon === 'Shield' && <Shield size={24} />}
                        {item.icon === 'Clock' && <Clock size={24} />}
                        {item.icon === 'Star' && <Star size={24} />}
                        {item.icon === 'Ruler' && <Ruler size={24} />}
                        {!item.icon && <Sparkles size={24} />}
                      </div>
                      <h3 className="text-lg font-bold mb-3">{item.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                    </motion.div>
                  ))}
                </div>
              </section>
            );

          case 'text_image':
            return (
              <section key={idx} className="py-24 bg-primary-950 text-white overflow-hidden">
                <div className="container mx-auto px-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1">
                      <h2 className="text-4xl md:text-5xl font-serif mb-8 leading-tight tracking-tight italic">
                        {section.title}
                      </h2>
                      <p className="text-lg text-white/70 mb-10 leading-relaxed font-light">
                        {section.body}
                      </p>
                      {section.ctaLabel && (
                        <a 
                          href={section.ctaLink || "#"}
                          className="inline-flex px-10 py-5 bg-white text-primary-950 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-primary-50 transition-all items-center gap-3"
                        >
                          {section.ctaLabel} <ChevronRight size={18} />
                        </a>
                      )}
                    </div>
                    <div className="order-1 lg:order-2 relative">
                      <div className="aspect-[4/5] rounded-[3rem] overflow-hidden rotate-2 shadow-2xl relative z-10">
                        {section.images?.[0] && <img src={section.images[0]} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="absolute -inset-4 border-2 border-white/10 rounded-[3.5rem] -rotate-2"></div>
                    </div>
                  </div>
                </div>
              </section>
            );

          case 'testimonials':
            return (
              <section key={idx} className="py-24 container mx-auto px-6">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-serif text-primary-900">{section.title}</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-600 mt-2">Verified Customer Experiences</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                  {section.items?.map((t: any, i: number) => (
                    <GlassCard key={i} className="p-10 border-primary-100 flex flex-col justify-between">
                      <div>
                        <div className="flex gap-1 mb-6">
                          {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-primary-600 text-primary-600" />)}
                        </div>
                        <p className="text-lg italic text-primary-900 leading-relaxed mb-8">"{t.description}"</p>
                      </div>
                      <div className="flex items-center gap-4">
                        {t.image && <img src={t.image} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-100" />}
                        <div>
                          <p className="font-bold text-sm">{t.title}</p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Verified Boutique Bride</p>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </section>
            );

          case 'faqs':
            return (
              <section key={idx} className="py-24 bg-white">
                <div className="container mx-auto px-6 max-w-4xl">
                  <div className="text-center mb-16">
                    <h2 className="text-3xl font-serif italic mb-4">{section.title}</h2>
                    <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">Expert Consultations for Your Peace of Mind</p>
                  </div>
                  <div className="space-y-4">
                    {section.items?.map((faq: any, i: number) => (
                      <details key={i} className="group border border-gray-100 rounded-3xl bg-gray-50/50 open:bg-primary-50/30 transition-all">
                        <summary className="list-none px-8 py-6 cursor-pointer flex items-center justify-between">
                          <h3 className="text-base font-bold text-primary-900">{faq.title}</h3>
                          <ChevronRight size={18} className="text-gray-400 group-open:rotate-90 transition-transform" />
                        </summary>
                        <div className="px-8 pb-8 text-sm text-gray-600 leading-relaxed">
                          {faq.description}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              </section>
            );

          default:
            return null;
        }
      })}

      {/* Trust Bar Fallback */}
      {data.content.length > 0 && (
        <div className="container mx-auto px-6 -mt-16 relative z-20">
          <GlassCard className="p-8 border-primary-100/50 shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-primary-100/30">
              {[
                { label: 'Happy Brides', value: '5000+', icon: Star },
                { label: 'Master Tailors', value: '12', icon: Zap },
                { label: 'Years of Legacy', value: '15+', icon: ShieldCheck },
                { label: 'Boutique Locations', value: '3', icon: MapPin }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center text-center pl-8 first:pl-0 border-none md:border-solid">
                  <stat.icon className="text-primary-600 mb-2" size={24} />
                  <p className="text-2xl font-black tracking-tighter">{stat.value}</p>
                  <p className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Inquiry Footer CTA */}
      <section id="inquiry" className="py-24 relative overflow-hidden bg-primary-600 text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <MessageSquare size={48} className="mx-auto mb-8 opacity-50" />
            <h2 className="text-4xl md:text-5xl font-serif mb-8 leading-tight italic">
              Ready to Design Your Dream Outfit?
            </h2>
            <p className="text-lg text-white/80 mb-12 max-w-xl mx-auto font-light leading-relaxed">
              Book a virtual or in-person consultation with our design experts today. Discover the magic of custom-fit luxury.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="px-12 py-5 bg-white text-primary-950 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all w-full sm:w-auto text-center">
                WhatsApp Inquiry
              </a>
              <button className="px-12 py-5 bg-primary-950 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all w-full sm:w-auto">
                Call +91 98765 43210
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-neutral-cream border-t border-primary-100">
        <div className="container mx-auto px-6 text-center">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-lg font-serif font-bold tracking-tighter uppercase italic">Vasanthi Creations</span>
            </div>
            <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-4">
              &copy; 2024 Vasanthi Creations. Crafting Excellence Since 2009.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
