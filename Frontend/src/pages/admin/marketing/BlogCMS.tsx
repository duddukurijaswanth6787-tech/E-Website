import React from 'react';
import { 
  FileText, Plus, Search, Edit2, 
  Trash2, Eye, Share2,
  Globe, Clock,
  FileEdit, BookOpen, TrendingUp
} from 'lucide-react';
import { GlassCard } from '../../../components/common/GlassCard';

const StatWidget: React.FC<{ label: string, value: string | number, icon: any, iconColor: string, delay: number }> = ({ label, value, icon: Icon, iconColor, delay }) => (
  <GlassCard delay={delay} className="p-6">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl bg-[var(--admin-card)] ${iconColor}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-bold text-[var(--admin-text-primary)]">{value}</p>
      </div>
    </div>
  </GlassCard>
);

const BlogCMS: React.FC = () => {

  // Mocking query for now
  const blogs = [
    { _id: '1', title: 'Top 10 Saree Trends for 2024', status: 'published', views: 1240, author: 'Admin', date: '2024-03-20' },
    { _id: '2', title: 'How to Choose the Perfect Bridal Blouse', status: 'draft', views: 0, author: 'Admin', date: '2024-03-22' },
    { _id: '3', title: 'The Art of Indian Embroidery', status: 'published', views: 856, author: 'Admin', date: '2024-03-15' },
  ];

  return (
    <div className=" space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter flex items-center gap-3">
            <FileEdit className="text-blue-500" size={32} />
            Content Engine
          </h1>
          <p className="text-[var(--admin-text-secondary)] mt-2 font-bold uppercase text-[10px] tracking-[0.3em]">
            Manage boutique stories, SEO articles & newsletters
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-grow lg:flex-grow-0 min-w-[200px] sm:min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--admin-text-secondary)]" size={18} />
            <input 
              type="text" 
              placeholder="Search articles..." 
              className="w-full bg-[var(--admin-card)] border border-[var(--admin-card-border)] rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-600"
            />
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-[var(--admin-text-primary)] px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95 w-full sm:w-auto">
            <Plus size={18} /> New Article
          </button>
        </div>
      </div>

      {/* Stats Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWidget 
          label="Total Articles" 
          value="48"
          icon={BookOpen}
          iconColor="text-blue-400"
          delay={0.1}
        />
        <StatWidget 
          label="Drafts" 
          value="5"
          icon={FileText}
          iconColor="text-amber-400"
          delay={0.2}
        />
        <StatWidget 
          label="Total Readership" 
          value="12.8k"
          icon={TrendingUp}
          iconColor="text-emerald-400"
          delay={0.3}
        />
        <StatWidget 
          label="Avg. SEO Score" 
          value="92%"
          icon={Globe}
          iconColor="text-purple-400"
          delay={0.4}
        />
      </div>

      {/* Blog List Table */}
      <GlassCard className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[var(--admin-card)] border-b border-[var(--admin-card-border)]">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest">Article Title</th>
                <th className="px-8 py-5 text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest">Analytics</th>
                <th className="px-8 py-5 text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {blogs.map((blog) => (
                <tr key={blog._id} className="hover:bg-[var(--admin-card)]/[0.02] transition-all group">
                  <td className="px-8 py-6">
                    <div>
                      <p className="text-sm font-bold text-[var(--admin-text-primary)] group-hover:text-blue-500 transition-colors cursor-pointer">{blog.title}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold text-gray-600 uppercase tracking-tighter">
                        <span className="flex items-center gap-1"><Clock size={12} /> {blog.date}</span>
                        <span className="w-1 h-1 bg-gray-800 rounded-full" />
                        <span>By {blog.author}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${blog.status === 'published' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-amber-500/20 border-amber-500/50 text-amber-400'}`}>
                      {blog.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Eye size={14} />
                        <span className="text-xs font-bold">{blog.views}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Share2 size={14} />
                        <span className="text-xs font-bold">42</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2.5 bg-[var(--admin-card)] hover:bg-[var(--admin-card)]/10 rounded-xl border border-[var(--admin-card-border)] transition-all text-gray-400 hover:text-[var(--admin-text-primary)]">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl border border-rose-500/10 transition-all text-rose-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default BlogCMS;


