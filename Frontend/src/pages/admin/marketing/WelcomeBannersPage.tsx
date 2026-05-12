import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Search, Edit2, Trash2, 
  Image as ImageIcon, Monitor, Smartphone, Eye, MousePointer2,
  X, RefreshCw, Link, Flag
} from 'lucide-react';
import { marketingService, type WelcomeBanner } from '../../../api/services/marketing.service';
import { GlassCard } from '../../../components/common/GlassCard';
import { MarketingSkeleton } from '../../../components/admin/marketing/MarketingComponents';
import toast from 'react-hot-toast';
import { cn } from '../../../lib/utils';
import { ImageUploader } from '../../../components/admin/ImageUploader';

const WelcomeBannersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<WelcomeBanner>>({
    title: '', subtitle: '', buttonText: '', imageUrl: '', redirectUrl: '',
    isActive: false, targetAudience: 'all', deviceTarget: 'all', priority: 0
  });

  const { data: bannersRes, isLoading } = useQuery({
    queryKey: ['welcomeBanners'],
    queryFn: () => marketingService.getWelcomeBanners()
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      title: '', subtitle: '', buttonText: '', imageUrl: '', redirectUrl: '',
      isActive: false, targetAudience: 'all', deviceTarget: 'all', priority: 0
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (banner: WelcomeBanner) => {
    setEditingId(banner._id);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      buttonText: banner.buttonText || '',
      imageUrl: banner.imageUrl || '',
      redirectUrl: banner.redirectUrl || '',
      isActive: banner.isActive || false,
      targetAudience: banner.targetAudience || 'all',
      deviceTarget: banner.deviceTarget || 'all',
      priority: banner.priority || 0
    });
    setIsModalOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: (data: Partial<WelcomeBanner>) => marketingService.createWelcomeBanner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['welcomeBanners'] });
      toast.success('Welcome banner created');
      setIsModalOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<WelcomeBanner> }) => 
      marketingService.updateWelcomeBanner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['welcomeBanners'] });
      toast.success('Welcome banner updated');
      setIsModalOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => marketingService.deleteWelcomeBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['welcomeBanners'] });
      toast.success('Banner removed');
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string, isActive: boolean }) => 
      marketingService.updateWelcomeBanner(id, { isActive: !isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['welcomeBanners'] });
      toast.success('Banner visibility toggled');
    }
  });

  const banners = useMemo(() => {
    const list = bannersRes?.data || [];
    return list.filter((b: WelcomeBanner) => {
      const matchesSearch = b.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAudience = audienceFilter === 'all' ? true : b.targetAudience === audienceFilter;
      return matchesSearch && matchesAudience;
    });
  }, [bannersRes, searchTerm, audienceFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      toast.error('Image is required');
      return;
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) return <MarketingSkeleton />;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto transition-colors duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter flex items-center gap-3 text-[var(--admin-text-primary)]">
            <Flag className="text-pink-500" size={32} />
            Welcome Banners
          </h1>
          <p className="text-[var(--admin-text-secondary)] mt-2 font-bold uppercase text-[10px] tracking-[0.3em]">
            Targeted entry popups & announcements
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-grow lg:flex-grow-0 min-w-[200px] sm:min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--admin-text-secondary)]" size={18} />
            <input 
              type="text" 
              placeholder="Search banners..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--admin-card)] border border-[var(--admin-card-border)] text-[var(--admin-text-primary)] rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:border-pink-500/50 outline-none transition-all placeholder:text-gray-600 shadow-sm"
            />
          </div>
          <button 
            onClick={handleOpenCreate}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-pink-600/20 flex items-center justify-center gap-2 active:scale-95 w-full sm:w-auto"
          >
            <Plus size={18} /> Create Banner
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {['all', 'first_time', 'returning'].map((p) => (
          <button
            key={p}
            onClick={() => setAudienceFilter(p)}
            className={cn(
              "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
              audienceFilter === p 
                ? 'bg-pink-600 text-white border-pink-600 shadow-lg shadow-pink-600/20' 
                : 'bg-[var(--admin-card)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] border-[var(--admin-card-border)]'
            )}
          >
            {p.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {banners.map((block: WelcomeBanner, idx: number) => (
          <GlassCard key={block._id} delay={idx * 0.1} className="group/card flex flex-col !p-0 overflow-hidden">
            <div className="relative aspect-video bg-black/10 overflow-hidden border-b border-[var(--admin-card-border)]">
              {block.imageUrl ? (
                <img src={block.imageUrl} alt={block.title} className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--admin-text-secondary)]">
                  <ImageIcon size={48} />
                </div>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 text-pink-400">
                  {block.targetAudience.replace('_', ' ')}
                </span>
                <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 text-blue-400">
                  Pri: {block.priority}
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <div className={`w-3 h-3 rounded-full ${block.isActive ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-rose-500'} border-2 border-white/20`} />
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[var(--admin-text-primary)] tracking-tight">{block.title || 'Untitled Banner'}</h3>
                <p className="text-xs text-[var(--admin-text-secondary)] mt-1 line-clamp-1">{block.subtitle || 'No subtitle'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-black/5 dark:bg-[var(--admin-card)] rounded-2xl border border-[var(--admin-card-border)]">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye size={14} className="text-blue-400" />
                    <span className="text-[9px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest">Impressions</span>
                  </div>
                  <p className="text-lg font-black text-[var(--admin-text-primary)]">{(block.analytics?.impressions || 0).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-black/5 dark:bg-[var(--admin-card)] rounded-2xl border border-[var(--admin-card-border)]">
                  <div className="flex items-center gap-2 mb-2">
                    <MousePointer2 size={14} className="text-emerald-400" />
                    <span className="text-[9px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest">CTR</span>
                  </div>
                  <p className="text-lg font-black text-[var(--admin-text-primary)]">
                    {block.analytics?.impressions > 0 ? ((block.analytics.clicks / block.analytics.impressions) * 100).toFixed(1) : '0.0'}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-2">
                  <div className={cn("p-2 rounded-lg bg-[var(--admin-card)] border border-[var(--admin-card-border)]", (block.deviceTarget === 'all' || block.deviceTarget === 'desktop') ? 'text-blue-500' : 'text-gray-400')}>
                    <Monitor size={16} />
                  </div>
                  <div className={cn("p-2 rounded-lg bg-[var(--admin-card)] border border-[var(--admin-card-border)]", (block.deviceTarget === 'all' || block.deviceTarget === 'mobile') ? 'text-blue-500' : 'text-gray-400')}>
                    <Smartphone size={16} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenEdit(block)}
                    className="p-2.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl border border-blue-500/10 transition-all text-blue-500 shadow-sm"
                    title="Edit Banner"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => deleteMutation.mutate(block._id)}
                    className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl border border-rose-500/10 transition-all text-rose-500 shadow-sm"
                    title="Delete Banner"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <button 
                onClick={() => toggleStatusMutation.mutate({ id: block._id, isActive: block.isActive })}
                className={`w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${block.isActive ? 'border-rose-500/20 text-rose-500 hover:bg-rose-500/10' : 'bg-emerald-600 text-[var(--admin-text-primary)] shadow-lg shadow-emerald-600/20 hover:bg-emerald-700'}`}
              >
                {block.isActive ? 'Take Offline' : 'Publish Live'}
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--admin-card)] w-full max-w-2xl rounded-[2.5rem] border border-[var(--admin-card-border)] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[var(--admin-card-border)] flex justify-between items-center bg-black/5">
              <h2 className="text-xl font-bold text-[var(--admin-text-primary)]">
                {editingId ? 'Edit Welcome Banner' : 'Create Welcome Banner'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--admin-text-secondary)] hover:text-rose-500 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              <form id="banner-form" onSubmit={handleSubmit} className="space-y-6">
                
                <div>
                  <label className="block text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest mb-2">Banner Image</label>
                  <ImageUploader 
                    value={formData.imageUrl || ''}
                    onChange={(url) => setFormData({...formData, imageUrl: url})}
                    folder="marketing" 
                  />
                  {formData.imageUrl && (
                    <div className="mt-4 relative aspect-video rounded-2xl overflow-hidden border border-[var(--admin-card-border)]">
                      <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest mb-2">Target Audience</label>
                    <select 
                      value={formData.targetAudience}
                      onChange={e => setFormData({...formData, targetAudience: e.target.value as any})}
                      className="w-full p-4 bg-black/5 dark:bg-white/5 border border-[var(--admin-card-border)] rounded-xl text-sm font-bold text-[var(--admin-text-primary)] outline-none focus:border-pink-500"
                    >
                      <option value="all">All Users</option>
                      <option value="first_time">First-Time Visitors</option>
                      <option value="returning">Returning Customers</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest mb-2">Device Target</label>
                    <select 
                      value={formData.deviceTarget}
                      onChange={e => setFormData({...formData, deviceTarget: e.target.value as any})}
                      className="w-full p-4 bg-black/5 dark:bg-white/5 border border-[var(--admin-card-border)] rounded-xl text-sm font-bold text-[var(--admin-text-primary)] outline-none focus:border-pink-500"
                    >
                      <option value="all">All Devices</option>
                      <option value="desktop">Desktop Only</option>
                      <option value="mobile">Mobile Only</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Headline Title"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full p-4 bg-black/5 dark:bg-white/5 border border-[var(--admin-card-border)] rounded-xl text-sm font-bold text-[var(--admin-text-primary)] outline-none focus:border-pink-500"
                  />
                  <input
                    type="text"
                    placeholder="Subtitle or Description text"
                    value={formData.subtitle}
                    onChange={e => setFormData({...formData, subtitle: e.target.value})}
                    className="w-full p-4 bg-black/5 dark:bg-white/5 border border-[var(--admin-card-border)] rounded-xl text-sm font-bold text-[var(--admin-text-primary)] outline-none focus:border-pink-500"
                  />
                  <input
                    type="text"
                    placeholder="Call to Action Text (e.g. Shop Now)"
                    value={formData.buttonText}
                    onChange={e => setFormData({...formData, buttonText: e.target.value})}
                    className="w-full p-4 bg-black/5 dark:bg-white/5 border border-[var(--admin-card-border)] rounded-xl text-sm font-bold text-[var(--admin-text-primary)] outline-none focus:border-pink-500"
                  />
                  <div className="relative">
                    <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Redirect URL (e.g. /category/sarees)"
                      value={formData.redirectUrl}
                      onChange={e => setFormData({...formData, redirectUrl: e.target.value})}
                      className="w-full p-4 pl-12 bg-black/5 dark:bg-white/5 border border-[var(--admin-card-border)] rounded-xl text-sm font-bold text-[var(--admin-text-primary)] outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest mb-2">Priority</label>
                    <input
                      type="number"
                      value={formData.priority}
                      onChange={e => setFormData({...formData, priority: parseInt(e.target.value) || 0})}
                      className="w-full p-4 bg-black/5 dark:bg-white/5 border border-[var(--admin-card-border)] rounded-xl text-sm font-bold text-[var(--admin-text-primary)] outline-none focus:border-pink-500"
                    />
                    <p className="text-[10px] text-[var(--admin-text-secondary)] mt-1">Higher number shows first</p>
                  </div>
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-[var(--admin-card-border)] bg-black/5 flex justify-end gap-4">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-secondary)] hover:bg-black/5 transition-all"
              >
                Cancel
              </button>
              <button 
                form="banner-form"
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-pink-600/20"
              >
                {(createMutation.isPending || updateMutation.isPending) ? <RefreshCw size={16} className="animate-spin" /> : (editingId ? 'Update Banner' : 'Save Banner')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeBannersPage;
