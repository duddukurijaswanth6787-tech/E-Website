import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Clock, ArrowRight, Search, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSEO } from '../../context/SEOContext';
import { SafeImage } from '../../components/common/SafeImage';

import { IMAGES } from '../../constants/assets';

const BLOGS = [
  {
    id: 1,
    title: 'The Art of Saree Draping: 5 Styles for Every Occasion',
    excerpt: 'Master the timeless elegance of saree draping with our comprehensive guide to traditional and modern styles...',
    image: IMAGES.categories.designer,
    category: 'Style Guide',
    author: 'Vasanthi',
    date: 'May 10, 2024',
    readTime: '6 min read'
  },
  {
    id: 2,
    title: 'Bridal Trends 2024: The Resurgence of Handloom Silks',
    excerpt: 'Explore why modern brides are returning to their roots with authentic handloom Kanchipuram and Banarasi weaves...',
    image: IMAGES.categories.kanchipuram,
    category: 'Trends',
    author: 'Admin',
    date: 'May 05, 2024',
    readTime: '8 min read'
  },
  {
    id: 3,
    title: 'How to Choose the Perfect Blouse Neckline for Your Body Type',
    excerpt: 'Unlock the secret to a flawless silhouette by selecting the right neckline that complements your unique proportions...',
    image: IMAGES.categories.cotton,
    category: 'Tailoring',
    author: 'Master Tailor',
    date: 'Apr 28, 2024',
    readTime: '5 min read'
  }
];

const BlogsPage = () => {
  const { setMetadata } = useSEO();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setMetadata({
      title: 'The Journal - Boutique Fashion & Tailoring Guides | Vasanthi Creations',
      description: 'Explore the Vasanthi Creations Journal for the latest bridal trends, saree styling tips, and artisanal tailoring guides. Your destination for premium fashion insights.'
    });
  }, [setMetadata]);

  return (
    <div className="min-h-screen bg-neutral-cream">
      {/* Editorial Header */}
      <section className="bg-primary-950 py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-20"></div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-400 mb-6 inline-block">Boutique Intelligence</span>
            <h1 className="text-5xl md:text-7xl font-serif text-white mb-8 italic">The Journal</h1>
            <p className="text-lg text-white/60 font-light leading-relaxed mb-12">
              A curated collection of stories, styling guides, and artisanal insights from the heart of our atelier.
            </p>
            
            <div className="relative max-w-xl mx-auto">
              <input 
                type="text" 
                placeholder="Search articles, trends, or guides..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white placeholder:text-white/30 focus:bg-white/10 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="container mx-auto px-6 -mt-12 relative z-20">
        <Link to={`/blogs/${BLOGS[0].id}`}>
          <div className="group relative bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row hover:shadow-primary-900/10 transition-all border border-primary-50">
            <div className="lg:w-1/2 aspect-video lg:aspect-auto overflow-hidden">
              <SafeImage 
                src={BLOGS[0].image} 
                alt={BLOGS[0].title}
                className="w-full h-full transition-transform duration-1000 group-hover:scale-105" 
                aspectRatio="auto"
              />
            </div>
            <div className="lg:w-1/2 p-12 lg:p-16 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-primary-50 text-primary-700 text-[10px] font-black uppercase tracking-widest rounded-lg">
                  Featured Article
                </span>
                <span className="text-stone-300">•</span>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{BLOGS[0].readTime}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif text-primary-950 mb-6 group-hover:text-primary-700 transition-colors">
                {BLOGS[0].title}
              </h2>
              <p className="text-stone-500 font-light leading-relaxed mb-10 text-lg">
                {BLOGS[0].excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-primary-900 font-serif font-bold italic">
                    V
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">{BLOGS[0].author}</p>
                    <p className="text-[9px] text-stone-400 uppercase font-black tracking-widest">{BLOGS[0].date}</p>
                  </div>
                </div>
                <ArrowRight className="text-primary-950 group-hover:translate-x-2 transition-transform" size={24} />
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* Article Grid */}
      <section className="py-24 container mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <h3 className="text-2xl font-serif italic text-primary-900">Latest Insights</h3>
          <div className="flex gap-2">
            {['All', 'Style Guide', 'Trends', 'Tailoring'].map(cat => (
              <button key={cat} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary-100 hover:bg-primary-950 hover:text-white transition-all">
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {BLOGS.slice(1).map((blog, i) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Link to={`/blogs/${blog.id}`} className="group block">
                <div className="bg-white rounded-[2.5rem] overflow-hidden border border-primary-50 shadow-sm hover:shadow-xl transition-all h-full flex flex-col">
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <SafeImage 
                      src={blog.image} 
                      alt={blog.title} 
                      className="w-full h-full transition-transform duration-700 group-hover:scale-105" 
                      aspectRatio="landscape"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-primary-950 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                        {blog.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-4 text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                        <Calendar size={12} /> {blog.date}
                        <span className="mx-1">•</span>
                        <Clock size={12} /> {blog.readTime}
                      </div>
                      <h4 className="text-xl font-serif text-primary-950 mb-4 group-hover:text-primary-700 transition-colors leading-snug">
                        {blog.title}
                      </h4>
                      <p className="text-sm text-stone-500 font-light leading-relaxed mb-6 line-clamp-3">
                        {blog.excerpt}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 pt-6 border-t border-stone-50">
                      <User size={14} className="text-stone-300" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">{blog.author}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="py-24 bg-primary-50">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <div className="bg-white rounded-[3rem] p-12 md:p-20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-primary-50">
              <Tag size={120} />
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-serif mb-6 text-primary-900">Join Our Atelier Circle</h3>
              <p className="text-stone-500 font-light mb-10 max-w-xl mx-auto">
                Receive exclusive styling guides, early access to new collections, and behind-the-scenes stories from our Hyderabad boutique.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="Your premium email address"
                  className="flex-1 px-6 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-primary-600 transition-all outline-none text-sm"
                />
                <button className="px-8 py-4 bg-primary-950 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-800 transition-all">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogsPage;
