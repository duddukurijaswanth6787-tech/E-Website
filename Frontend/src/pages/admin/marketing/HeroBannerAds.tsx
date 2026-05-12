import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Search, Edit2, Trash2, 
  Eye, MousePointer2, 
  Layout, Image as ImageIcon,
  Clock, AlertCircle, Monitor, Smartphone, Activity
} from 'lucide-react';
import { bannerService } from '../../../api/services/banner.service';
import type { Banner } from '../../../api/services/banner.service';
import { GlassCard } from '../../../components/common/GlassCard';
import { MarketingSkeleton } from '../../../components/admin/marketing/MarketingComponents';

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
import toast from 'react-hot-toast';

const HeroBannerAds: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const { data: bannersRes, isLoading } = useQuery({
    queryKey: ['adminBanners'],
    queryFn: () => bannerService.getBanners()
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => bannerService.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBanners'] });
      toast.success('Asset removed from inventory');
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string, isActive: boolean }) => 
      bannerService.updateBanner(id, { isActive: !isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBanners'] });
      toast.success('Visibility updated');
    }
  });

  const banners = useMemo(() => {
    const list = bannersRes?.data || [];
    return list.filter((b: any) => {
      const matchesSearch = b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.section?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'all' ? true : (filter === 'active' ? b.isActive : !b.isActive);
      return matchesSearch && matchesFilter;
    });
  }, [bannersRes, searchTerm, filter]);

  const stats = useMemo(() => {
    const totalImpressions = banners.reduce((acc: number, curr: Banner) => acc + (curr.impressions || 0), 0);
    const totalClicks = banners.reduce((acc: number, curr: Banner) => acc + (curr.clicks || 0), 0);
    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : '0.00';
    return { totalImpressions, totalClicks, avgCTR };
  }, [banners]);

  if (isLoading) return <MarketingSkeleton />;

  return (
    <div className=" space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter flex items-center gap-3">
            <Layout className="text-blue-500" size={32} />
            Asset Engine
          </h1>
          <p className="text-[var(--admin-text-secondary)] mt-2 font-bold uppercase text-[10px] tracking-[0.3em]">
            Visual brand management & placement control
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-grow lg:flex-grow-0 min-w-[200px] sm:min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--admin-text-secondary)]" size={18} />
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--admin-card)] border border-[var(--admin-card-border)] rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-600"
            />
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-[var(--admin-text-primary)] px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95 w-full sm:w-auto">
            <Plus size={18} /> New Asset
          </button>
        </div>
      </div>

      {/* Analytics Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatWidget 
          label="Total Impressions" 
          value={stats.totalImpressions.toLocaleString()}
          icon={Eye}
          iconColor="text-blue-400"
          delay={0.1}
        />
        <StatWidget 
          label="Total Clicks" 
          value={stats.totalClicks.toLocaleString()}
          icon={MousePointer2}
          iconColor="text-emerald-400"
          delay={0.2}
        />
        <StatWidget 
          label="Avg. CTR" 
          value={`${stats.avgCTR}%`}
          icon={Activity}
          iconColor="text-purple-400"
          delay={0.3}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 border-b border-[var(--admin-card-border)] pb-4">
        {['all', 'active', 'inactive'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-[var(--admin-card)]/10 text-[var(--admin-text-primary)] border border-[var(--admin-card-border)]' : 'text-[var(--admin-text-secondary)] hover:text-gray-300'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Banner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {banners.map((banner: any, idx: number) => (
          <GlassCard 
            key={banner._id} 
            delay={0.1 * (idx % 6)} 
            className="group/card flex flex-col !p-0 overflow-hidden"
          >
            <div className="relative aspect-video overflow-hidden bg-neutral-900 border-b border-[var(--admin-card-border)]">
              {banner.image ? (
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-700">
                  <ImageIcon size={48} />
                </div>
              )}
              <div className="absolute top-4 right-4 flex gap-2">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${banner.isActive ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-rose-500/20 border-rose-500/50 text-rose-400'} backdrop-blur-md`}>
                  {banner.isActive ? 'Active' : 'Offline'}
                </span>
              </div>
            </div>
            
            <div className="p-6 space-y-6 flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-[var(--admin-text-primary)] truncate max-w-[200px]">{banner.title || 'Untitled Asset'}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {banner.section === 'hero' ? <Monitor size={12} className="text-[var(--admin-text-secondary)]" /> : <Smartphone size={12} className="text-[var(--admin-text-secondary)]" />}
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{banner.section}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-[var(--admin-card)] hover:bg-[var(--admin-card)]/10 rounded-xl border border-[var(--admin-card-border)] transition-all">
                    <Edit2 size={14} className="text-gray-400" />
                  </button>
                  <button 
                    onClick={() => deleteMutation.mutate(banner._id)}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl border border-rose-500/10 transition-all"
                  >
                    <Trash2 size={14} className="text-rose-500" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-y border-[var(--admin-card-border)] py-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Impressions</p>
                  <p className="text-sm font-black text-[var(--admin-text-primary)]">{banner.impressions?.toLocaleString() || 0}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">CTR</p>
                  <p className="text-sm font-black text-emerald-400">
                    {banner.impressions > 0 ? (banner.clicks / banner.impressions * 100).toFixed(2) : '0.00'}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2 text-[9px] font-black text-gray-600 uppercase tracking-widest">
                  <Clock size={12} />
                  {new Date(banner.createdAt).toLocaleDateString()}
                </div>
                <button 
                  onClick={() => toggleStatusMutation.mutate({ id: banner._id, isActive: banner.isActive })}
                  className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border transition-all ${banner.isActive ? 'border-rose-500/20 text-rose-500 hover:bg-rose-500/10' : 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10'}`}
                >
                  {banner.isActive ? 'Take Offline' : 'Publish Live'}
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {banners.length === 0 && (
        <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-4 bg-[var(--admin-card)]/[0.02] rounded-[2rem] border border-[var(--admin-card-border)]">
          <div className="p-6 bg-[var(--admin-card)] rounded-full text-gray-700">
            <AlertCircle size={48} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-400">No Assets Found</h3>
            <p className="text-sm text-gray-600 max-w-xs mt-1">Adjust your filters or deploy a new creative asset to get started.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroBannerAds;


