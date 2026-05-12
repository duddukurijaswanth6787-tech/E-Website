import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Search, Edit2, Trash2, 
  Layout, Image as ImageIcon,
  Monitor, Smartphone, Eye, MousePointer2,
} from 'lucide-react';
import { marketingService } from '../../../api/services/marketing.service';
import { GlassCard } from '../../../components/common/GlassCard';
import { MarketingSkeleton } from '../../../components/admin/marketing/MarketingComponents';
import toast from 'react-hot-toast';

const PromoBlocks: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [placementFilter, setPlacementFilter] = useState('all');

  const { data: blocksRes, isLoading } = useQuery({
    queryKey: ['promoBlocks'],
    queryFn: () => marketingService.getPromoBlocks()
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => marketingService.deletePromoBlock(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promoBlocks'] });
      toast.success('Promo block removed');
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string, isActive: boolean }) => 
      marketingService.updatePromoBlock(id, { isActive: !isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promoBlocks'] });
      toast.success('Visibility toggled');
    }
  });

  const blocks = useMemo(() => {
    const list = blocksRes?.data || [];
    return list.filter((b: any) => {
      const matchesSearch = b.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlacement = placementFilter === 'all' ? true : b.placement === placementFilter;
      return matchesSearch && matchesPlacement;
    });
  }, [blocksRes, searchTerm, placementFilter]);

  if (isLoading) return <MarketingSkeleton />;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto transition-colors duration-500">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter flex items-center gap-3 text-[var(--admin-text-primary)]">
            <Layout className="text-blue-500" size={32} />
            Promo Engine
          </h1>
          <p className="text-[var(--admin-text-secondary)] mt-2 font-bold uppercase text-[10px] tracking-[0.3em]">
            Manage in-store advertisements & placements
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-grow lg:flex-grow-0 min-w-[200px] sm:min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--admin-text-secondary)]" size={18} />
            <input 
              type="text" 
              placeholder="Search promos..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--admin-card)] border border-[var(--admin-card-border)] text-[var(--admin-text-primary)] rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-600 shadow-sm"
            />
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-[var(--admin-text-primary)] px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95 w-full sm:w-auto">
            <Plus size={18} /> Create Promo
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {['all', 'homepage', 'sidebar', 'product_page', 'category_page', 'checkout'].map((p) => (
          <button
            key={p}
            onClick={() => setPlacementFilter(p)}
            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${placementFilter === p ? 'bg-blue-600 text-[var(--admin-text-primary)] shadow-lg shadow-blue-600/20' : 'bg-[var(--admin-card)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] border border-[var(--admin-card-border)]'}`}
          >
            {p.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Promo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {blocks.map((block: any, idx: number) => (
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
                <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest border border-[var(--admin-card-border)] text-blue-400">
                  {block.placement.replace('_', ' ')}
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <div className={`w-3 h-3 rounded-full ${block.isActive ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-rose-500'} border-2 border-white/20`} />
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[var(--admin-text-primary)] tracking-tight">{block.title}</h3>
                <p className="text-xs text-[var(--admin-text-secondary)] mt-1 line-clamp-2">{block.description || 'No description provided.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-black/5 dark:bg-[var(--admin-card)] rounded-2xl border border-[var(--admin-card-border)]">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye size={14} className="text-blue-400" />
                    <span className="text-[9px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest">Views</span>
                  </div>
                  <p className="text-lg font-black text-[var(--admin-text-primary)]">{(block.analytics?.impressions || 0).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-black/5 dark:bg-[var(--admin-card)] rounded-2xl border border-[var(--admin-card-border)]">
                  <div className="flex items-center gap-2 mb-2">
                    <MousePointer2 size={14} className="text-emerald-400" />
                    <span className="text-[9px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest">CTR</span>
                  </div>
                  <p className="text-lg font-black text-[var(--admin-text-primary)]">
                    {block.analytics?.impressions > 0 ? (block.analytics.clicks / block.analytics.impressions * 100).toFixed(1) : '0.0'}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-2">
                  <div className={`p-2 rounded-lg bg-[var(--admin-card)] border border-[var(--admin-card-border)] ${block.visibility?.desktop ? 'text-blue-500' : 'text-gray-400'}`}>
                    <Monitor size={16} />
                  </div>
                  <div className={`p-2 rounded-lg bg-[var(--admin-card)] border border-[var(--admin-card-border)] ${block.visibility?.mobile ? 'text-blue-500' : 'text-gray-400'}`}>
                    <Smartphone size={16} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2.5 bg-[var(--admin-card)] hover:bg-blue-500/10 rounded-xl border border-[var(--admin-card-border)] transition-all text-[var(--admin-text-secondary)] hover:text-blue-500 shadow-sm">
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => deleteMutation.mutate(block._id)}
                    className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl border border-rose-500/10 transition-all text-rose-500 shadow-sm"
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
    </div>

  );
};

export default PromoBlocks;


