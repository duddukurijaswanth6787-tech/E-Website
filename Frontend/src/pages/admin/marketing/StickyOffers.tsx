import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Plus, Edit2, 
  Type, Clock, Ticket,
  MousePointer2, Eye,
  ExternalLink
} from 'lucide-react';
import { marketingService } from '../../../api/services/marketing.service';
import { GlassCard } from '../../../components/common/GlassCard';
import { MarketingSkeleton } from '../../../components/admin/marketing/MarketingComponents';

const StickyOffers: React.FC = () => {

  const { data: offersRes, isLoading } = useQuery({
    queryKey: ['stickyOffers'],
    queryFn: () => marketingService.getStickyOffers()
  });

  const offers = offersRes?.data || [];

  if (isLoading) return <MarketingSkeleton />;

  return (
    <div className="min-h-screen bg-neutral-950 p-4 sm:p-8 text-white space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter flex items-center gap-3">
            <Type className="text-emerald-500" size={32} />
            Sticky Engine
          </h1>
          <p className="text-gray-500 mt-2 font-bold uppercase text-[10px] tracking-[0.3em]">
            Manage top-bar announcements & countdowns
          </p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-95 w-full sm:w-auto">
          <Plus size={18} /> New Offer Bar
        </button>
      </div>

      {/* Offers List */}
      <div className="space-y-6">
        {offers.map((offer: any, idx: number) => (
          <GlassCard key={offer._id} delay={idx * 0.1} className="relative overflow-hidden group/card">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              {/* Preview Section */}
              <div className="w-full lg:w-1/2 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Live Preview</span>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${offer.isActive ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-rose-500/20 border-rose-500/50 text-rose-400'}`}>
                    {offer.isActive ? 'Active' : 'Draft'}
                  </div>
                </div>
                
                <div 
                  className="w-full py-3 px-6 rounded-xl flex items-center justify-between shadow-2xl border border-white/10"
                  style={{ backgroundColor: offer.theme?.background || '#000', color: offer.theme?.text || '#fff' }}
                >
                  <div className="flex items-center gap-4">
                    {offer.type === 'countdown' && <Clock size={16} className="text-emerald-400" />}
                    {offer.type === 'coupon' && <Ticket size={16} className="text-blue-400" />}
                    <span className="text-sm font-bold tracking-tight">{offer.text}</span>
                  </div>
                  {offer.ctaText && (
                    <button className="px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest bg-white/20 hover:bg-white/30 transition-all border border-white/10">
                      {offer.ctaText}
                    </button>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <div className="flex-grow p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Views</p>
                      <p className="text-xl font-black text-white">{(offer.analytics?.views || 0).toLocaleString()}</p>
                    </div>
                    <Eye size={20} className="text-gray-700" />
                  </div>
                  <div className="flex-grow p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Clicks</p>
                      <p className="text-xl font-black text-white">{(offer.analytics?.clicks || 0).toLocaleString()}</p>
                    </div>
                    <MousePointer2 size={20} className="text-gray-700" />
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="w-full lg:w-1/2 flex flex-col justify-between h-full space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Bar Type</label>
                    <div className="text-sm font-bold text-white uppercase tracking-tighter bg-white/5 p-3 rounded-xl border border-white/5">
                      {offer.type}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Theme Accent</label>
                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: offer.theme?.accent }} />
                      <span className="text-xs font-bold text-gray-300 uppercase">{offer.theme?.accent}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button className="flex-grow bg-white/5 hover:bg-white/10 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 flex items-center justify-center gap-2">
                    <Edit2 size={16} /> Edit Configuration
                  </button>
                  <button className="bg-white/5 hover:bg-white/10 text-white p-3 rounded-2xl border border-white/10 transition-all">
                    <ExternalLink size={18} />
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {offers.length === 0 && (
        <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-4 bg-white/[0.02] rounded-[2rem] border border-white/5">
          <div className="p-6 bg-white/5 rounded-full text-gray-700">
            <Type size={48} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-400">No Sticky Bars Active</h3>
            <p className="text-sm text-gray-600 max-w-xs mt-1">Deploy a top-bar announcement to capture visitor attention immediately.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StickyOffers;
