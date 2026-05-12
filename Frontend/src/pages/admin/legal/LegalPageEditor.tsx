import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, Globe, History, ArrowLeft, Eye, 
  Settings, Shield, Clock, RefreshCcw
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../../../api/client';
import toast from 'react-hot-toast';

const LegalPageEditor = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'history' | 'settings'>('edit');
  
  const [formData, setFormData] = useState({
    title: '',
    slug: slug === 'new' ? '' : slug,
    content: '',
    metaTitle: '',
    metaDescription: '',
    isPublished: false,
    history: [] as any[]
  });

  useEffect(() => {
    if (slug !== 'new') {
      const fetchPage = async () => {
        try {
          const res = await api.get(`/legal/admin/detail/${slug}`);
          setFormData(res.data.data);
        } catch (error) {
          toast.error('Failed to load document');
        } finally {
          setLoading(false);
        }
      };
      fetchPage();
    } else {
      setLoading(false);
    }
  }, [slug]);

  const handleSave = async (publish = false) => {
    setSaving(true);
    try {
      const res = await api.post('/legal/admin/save', formData);
      if (publish) {
        await api.post(`/legal/admin/publish/${res.data.data.slug}`);
        toast.success('Document Published!');
      } else {
        toast.success('Draft Saved');
      }
      if (slug === 'new') navigate(`/admin/legal/edit/${res.data.data.slug}`);
    } catch (error) {
      toast.error('Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const handleRollback = async (version: number) => {
    if (!window.confirm(`Are you sure you want to rollback to v${version}?`)) return;
    try {
      await api.post('/legal/admin/rollback', { slug: formData.slug, version });
      toast.success('Rolled back successfully');
      window.location.reload();
    } catch (error) {
      toast.error('Rollback failed');
    }
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/admin/legal')} className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all">
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <div>
            <h1 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">
              {slug === 'new' ? 'New Document' : formData.title}
            </h1>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${formData.isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                {formData.isPublished ? 'Live on Store' : 'Draft Mode'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl border border-gray-100 dark:border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm"
          >
            {saving ? <RefreshCcw className="animate-spin" size={14} /> : <Save size={14} />}
            Save Draft
          </button>
          <button 
            onClick={() => handleSave(true)}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all"
          >
            <Globe size={14} /> Publish Policy
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-10 flex gap-10">
        {/* Navigation Sidebar */}
        <div className="w-64 shrink-0 space-y-2">
          {[
            { id: 'edit', label: 'Editor', icon: Shield },
            { id: 'settings', label: 'SEO & Settings', icon: Settings },
            { id: 'history', label: 'Version History', icon: History },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                  : 'text-gray-500 hover:bg-white dark:hover:bg-white/5'
              }`}
            >
              <item.icon size={16} /> {item.label}
            </button>
          ))}

          {slug !== 'new' && (
            <a 
              href={`/legal/${slug}`} 
              target="_blank" 
              className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 transition-all mt-10"
            >
              <Eye size={16} /> Preview Store
            </a>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'edit' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-100 dark:border-white/5 shadow-sm">
                <input 
                  type="text"
                  placeholder="Document Title (e.g. Privacy Policy)"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-4xl font-black bg-transparent border-none focus:ring-0 placeholder:text-gray-200 dark:placeholder:text-gray-800 tracking-tighter uppercase"
                />
                <hr className="my-8 border-gray-100 dark:border-white/5" />
                <textarea 
                  placeholder="Paste your legal content here (HTML supported)..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full min-h-[600px] bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-300 font-mono text-sm leading-relaxed resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-8 bg-white dark:bg-gray-900 rounded-[32px] p-10 border border-gray-100 dark:border-white/5 shadow-sm">
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8">Metadata & SEO</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Document URL Slug</label>
                    <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                      <span className="text-sm text-gray-400 font-medium">vasanthicreations.com/legal/</span>
                      <input 
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-blue-600"
                        disabled={slug !== 'new'}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Meta Title</label>
                    <input 
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      className="w-full p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 text-sm font-medium"
                      placeholder="Policy Title for Search Engines"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Meta Description</label>
                    <textarea 
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      className="w-full p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 text-sm font-medium min-h-[120px]"
                      placeholder="Brief summary for search engine snippets..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8">Version History</h3>
              {formData.history?.slice().reverse().map((version: any) => (
                <div key={version.version} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-white/5 text-blue-600 rounded-xl">
                      <Clock size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Version {version.version}.0</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        Saved {format(new Date(version.createdAt), 'MMM d, yyyy h:mm a')} by {version.updatedBy}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRollback(version.version)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                  >
                    Restore This Version
                  </button>
                </div>
              ))}

              {(!formData.history || formData.history.length === 0) && (
                <div className="py-20 text-center">
                  <p className="text-gray-400 text-sm font-medium">No previous versions available for this document.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LegalPageEditor;
