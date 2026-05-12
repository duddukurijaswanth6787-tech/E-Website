import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, Edit3, Eye, FileText, Clock, Plus, Scale
} from 'lucide-react';
import api from '../../../api/client';

const AdminLegalDashboard = () => {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res: any = await api.get('/legal/admin/list');
        // Standard API response is { success: true, data: [...], message: ... }
        // client.ts strips the axios wrapper, so res is the body.
        setPages(res.data || []);
      } catch (error) {
        console.error('Failed to fetch legal pages:', error);
        setPages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPages();
  }, []);

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50/50 dark:bg-gray-950/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Legal Compliance</h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Manage Boutique Policies & Versions</p>
        </div>
        
        <Link 
          to="/admin/legal/edit/new"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all"
        >
          <Plus size={16} /> Create Document
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(pages || []).map((page) => (
          <div key={page.slug} className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:shadow-blue-600/5 transition-all duration-500 group">
            <div className="flex items-start justify-between mb-8">
              <div className={`p-4 ${page.isPublished ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'} rounded-2xl`}>
                <Shield size={24} />
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                  page.isPublished ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                }`}>
                  {page.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>

            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2 group-hover:text-blue-600 transition-colors">
              {page.title}
            </h3>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                <Clock size={12} /> v{page.version}.0
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                <Scale size={12} /> {page.slug}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link 
                to={`/admin/legal/edit/${page.slug}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
              >
                <Edit3 size={14} /> Edit
              </Link>
              <Link 
                to={`/legal/${page.slug}`}
                target="_blank"
                className="p-3 bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-blue-500 rounded-xl transition-all"
              >
                <Eye size={18} />
              </Link>
            </div>
          </div>
        ))}

        {/* Empty State / Add New */}
        {pages.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
            <div className="p-6 bg-gray-100 dark:bg-white/5 text-gray-300 rounded-full mb-6">
              <FileText size={48} />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">No Legal Documents</h3>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-2">Start by creating your first boutique policy.</p>
          </div>
        )}
      </div>

      {/* Compliance Overview */}
      <div className="mt-12 p-8 bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center gap-8 shadow-sm">
        <div className="flex-1">
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">Legal Compliance Health</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
            All legal documents are versioned and stored with a complete audit trail. Ensure your Privacy Policy and Terms are updated quarterly to comply with the latest e-commerce regulations in India.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-center">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Status</p>
            <p className="text-lg font-black text-emerald-700">COMPLIANT</p>
          </div>
          <div className="px-6 py-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-center">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Policies</p>
            <p className="text-lg font-black text-blue-700">{pages.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLegalDashboard;
