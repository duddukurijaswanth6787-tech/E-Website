import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ChevronRight, Scale, Clock, RefreshCcw, FileText } from 'lucide-react';
import api from '../../api/client';
import SEO from '../../components/common/SEO';

const LegalPageViewer = () => {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<any>(null);

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/legal/public/${slug}`);
        setPage(res.data.data);
      } catch (error) {
        console.error('Failed to fetch legal page:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <RefreshCcw className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-6 text-center">
        <div className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl mb-4">
          <Scale size={48} />
        </div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Document Not Found</h1>
        <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mt-2">The requested legal policy could not be retrieved.</p>
        <Link to="/" className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20">
          Return to Boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 font-sans">
      <SEO 
        title={`${page.title} | Vasanthi Creations`}
        description={page.metaDescription || `Official ${page.title} of Vasanthi Creations Boutique.`}
        canonical={window.location.href}
      />

      {/* Header */}
      <div className="relative py-24 overflow-hidden bg-gray-50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/5 blur-[120px] rounded-full -mr-24 -mt-24" />
        <div className="absolute bottom-0 left-0 w-1/4 h-full bg-purple-600/5 blur-[100px] rounded-full -ml-24 -mb-24" />

        <div className="max-w-4xl mx-auto px-6 relative">
          <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4">
            <Link to="/" className="hover:text-blue-400">Home</Link>
            <ChevronRight size={12} className="opacity-50" />
            <span className="opacity-50">Legal</span>
            <ChevronRight size={12} className="opacity-50" />
            <span>{page.title}</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter leading-none uppercase mb-6">
            {page.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <Clock size={14} className="text-blue-500" />
              Last Updated: {new Date(page.publishedAt || page.updatedAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <Shield size={14} className="text-emerald-500" />
              Boutique Verified
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <FileText size={14} className="text-purple-500" />
              Version {page.version}.0
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-lg dark:prose-invert max-w-none 
            prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-gray-900 dark:prose-headings:text-white
            prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-p:font-medium prose-p:leading-relaxed
            prose-li:text-gray-600 dark:prose-li:text-gray-400 prose-li:font-medium
            prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-black
            prose-hr:border-gray-100 dark:prose-hr:border-white/10
          "
          dangerouslySetInnerHTML={{ __html: page.content }}
        />

        <div className="mt-24 p-8 bg-gray-50 dark:bg-white/[0.02] rounded-3xl border border-gray-100 dark:border-white/5">
          <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">Legal Disclaimer</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium uppercase tracking-widest">
            These policies govern the operations of Vasanthi Creations. We reserve the right to modify these terms at any time. Continued use of our boutique services constitutes acceptance of the most recent version of these policies.
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-gray-50 dark:bg-white/[0.02] py-20 border-t border-gray-100 dark:border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-12">Other Compliance Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Privacy Policy', slug: 'privacy-policy' },
              { title: 'Terms & Conditions', slug: 'terms-and-conditions' },
              { title: 'Refund Policy', slug: 'refund-policy' },
              { title: 'Shipping Policy', slug: 'shipping-policy' }
            ].filter(p => p.slug !== slug).map(policy => (
              <Link 
                key={policy.slug}
                to={`/legal/${policy.slug}`}
                className="group flex items-center justify-between p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-blue-500 transition-all duration-300"
              >
                <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight group-hover:text-blue-500 transition-colors">
                  {policy.title}
                </span>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalPageViewer;
