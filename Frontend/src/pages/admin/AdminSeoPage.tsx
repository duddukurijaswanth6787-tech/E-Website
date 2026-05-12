import { useState, useEffect } from 'react';
import { 
  Globe, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  RefreshCw,
  BarChart3,
  MapPin,
  Image as ImageIcon,
  Code,
  ArrowRight,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DashboardSkeleton } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';

const SEOStatCard = ({ label, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-md transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color.replace('text-', 'bg-').replace('600', '50')} transition-colors`}>
        <Icon className={color} size={24} />
      </div>
      {trend && (
        <span className={`text-[10px] font-black px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">{label}</p>
    <h3 className="text-2xl font-bold text-stone-900 tracking-tight">{value}</h3>
  </div>
);

const AdminSeoPage = () => {
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const handleSyncSitemap = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.success('Search engine index signal sent successfully');
    }, 2000);
  };

  if (loading) return <div className="p-8"><DashboardSkeleton /></div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
            <Globe size={12} /> Search Engine Optimization
          </div>
          <h1 className="text-4xl font-black text-stone-900 tracking-tighter">SEO Intelligence</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSyncSitemap}
            disabled={isSyncing}
            className="px-6 py-3 bg-stone-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-800 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Rebuilding Index...' : 'Ping Google Bot'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SEOStatCard label="Indexed Pages" value="1,284" icon={Search} color="text-blue-600" trend={12} />
        <SEOStatCard label="SEO Health Score" value="94/100" icon={CheckCircle2} color="text-emerald-600" trend={3} />
        <SEOStatCard label="Sitemap Status" value="Healthy" icon={RefreshCw} color="text-purple-600" />
        <SEOStatCard label="Missing Meta" value="14" icon={AlertTriangle} color="text-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-stone-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <BarChart3 size={20} className="text-blue-500" /> Indexing Overview
              </h2>
              <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View Search Console</button>
            </div>
            <div className="p-8 space-y-6">
               <div className="space-y-4">
                  {[
                    { label: 'Product Pages', count: 840, status: 'Indexed' },
                    { label: 'Category Pages', count: 42, status: 'Indexed' },
                    { label: 'Blog Articles', count: 126, status: 'Indexed' },
                    { label: 'Static Landing Pages', count: 12, status: 'Indexed' },
                    { label: 'Dynamic Collections', count: 24, status: 'Warning', note: 'Duplicate Tags' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-stone-400 border border-stone-100">
                             {item.label[0]}
                          </div>
                          <div>
                             <p className="text-[11px] font-bold text-stone-900">{item.label}</p>
                             <p className="text-[10px] text-stone-400">{item.count} URLs submitted</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${item.status === 'Indexed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                             {item.status}
                          </span>
                          <ExternalLink size={14} className="text-stone-300 cursor-pointer hover:text-blue-500" />
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          <div className="bg-stone-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                <Code size={200} />
             </div>
             <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Schema.org Validation</h3>
                <p className="text-stone-400 text-sm mb-6 max-w-md">Our enterprise SEO engine automatically injects high-fidelity JSON-LD schemas for Products, Organizations, and Local Businesses.</p>
                <div className="flex flex-wrap gap-3">
                   {['Product', 'Organization', 'LocalBusiness', 'BreadcrumbList', 'FAQ', 'Review'].map(s => (
                     <span key={s} className="px-3 py-1.5 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-colors cursor-default">
                        {s} Schema Active
                     </span>
                   ))}
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-sm p-8 space-y-6">
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                 <MapPin size={20} className="text-rose-500" /> Local SEO Cluster
              </h2>
              <div className="space-y-4">
                 <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100">
                    <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1">Target Region</p>
                    <p className="text-sm font-bold text-stone-900">Hyderabad, Telangana</p>
                 </div>
                 <div className="space-y-3">
                    {[
                      { keyword: 'Tailors in Hyderabad', rank: 3 },
                      { keyword: 'Boutique Jubilee Hills', rank: 1 },
                      { keyword: 'Bridal Blouse Stitching', rank: 5 },
                      { keyword: 'Designer Sarees India', rank: 12 },
                    ].map((kw, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px]">
                         <span className="text-stone-500 font-medium">{kw.keyword}</span>
                         <span className="font-black text-stone-900">Pos #{kw.rank}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-sm p-8 space-y-6">
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                 <ImageIcon size={20} className="text-emerald-500" /> Image Optimization
              </h2>
              <div className="space-y-4">
                 <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-500 font-medium">Alt Tags Coverage</span>
                    <span className="font-black text-emerald-600">98%</span>
                 </div>
                 <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[98%]" />
                 </div>
                 <p className="text-[10px] text-stone-400 leading-relaxed italic">
                    Enterprise AI automatically generates descriptive alt tags based on product categories and fabric types.
                 </p>
              </div>
           </div>

           <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                 <Search size={18} /> GSC Signal
              </h3>
              <p className="text-blue-100 text-xs mb-4">Crawler last seen: 42 minutes ago.</p>
              <div className="h-20 flex items-end gap-1">
                 {[40, 70, 45, 90, 65, 80, 50, 95, 100, 85].map((h, i) => (
                   <motion.div 
                     key={i}
                     initial={{ height: 0 }}
                     animate={{ height: `${h}%` }}
                     className="flex-1 bg-white/20 rounded-t-sm"
                   />
                 ))}
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-stone-100 flex items-center justify-between bg-amber-50/30">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-500" /> Missing Metadata Alerts
            </h2>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[9px] font-black uppercase rounded-full">Action Required</span>
          </div>
          <div className="p-8 space-y-4">
            {[
              { type: 'Product', name: 'Banarasi Silk Saree - Ruby Red', missing: 'SEO Description', link: '/admin/products' },
              { type: 'Category', name: 'Designer Blouses', missing: 'SEO Keywords', link: '/admin/categories' },
              { type: 'Blog', name: 'Saree Styling 101', missing: 'OG Image', link: '/admin/marketing/blogs' },
              { type: 'Product', name: 'Kanchipuram Pattu Saree', missing: 'SEO Title', link: '/admin/products' },
            ].map((alert, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100 hover:border-amber-200 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg uppercase">{alert.type}</div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">{alert.name}</p>
                    <p className="text-[10px] text-stone-400">Missing: <span className="text-rose-500 font-medium">{alert.missing}</span></p>
                  </div>
                </div>
                <Link to={alert.link} className="p-2 hover:bg-stone-100 rounded-xl transition-colors">
                  <ArrowRight size={16} className="text-stone-400" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-stone-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Zap size={120} />
          </div>
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Zap size={20} className="text-amber-400" /> AI Keyword Opportunity Engine
          </h2>
          <div className="space-y-6">
            <p className="text-stone-400 text-sm leading-relaxed">
              Our AI has detected high-volume search trends in <span className="text-white font-bold">Hyderabad</span> that your catalog is currently under-representing.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { keyword: 'Maggam Work Kukatpally', difficulty: 'Low', volume: '1.2k/mo' },
                { keyword: 'Pattu Blouse Designs 2024', difficulty: 'Medium', volume: '8.5k/mo' },
                { keyword: 'Bridal Boutique Banjara Hills', difficulty: 'Low', volume: '950/mo' },
                { keyword: 'Handloom Saree Store Near Me', difficulty: 'Medium', volume: '12k/mo' },
              ].map((kw, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <p className="text-xs font-bold mb-1">{kw.keyword}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black uppercase text-amber-400">Diff: {kw.difficulty}</span>
                    <span className="text-[9px] font-black uppercase text-stone-500">Vol: {kw.volume}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full py-4 bg-white text-stone-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-100 transition-all">
              Generate Optimized Landing Pages
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSeoPage;
