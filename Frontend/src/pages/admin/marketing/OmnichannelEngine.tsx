import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Send, Mail, MessageSquare, Bell, 
  Plus, Calendar, BarChart2, Clock, 
  CheckCircle2, Play, Filter
} from 'lucide-react';
import { marketingService } from '../../../api/services/marketing.service';
import { GlassCard } from '../../../components/common/GlassCard';
import { StatWidget, MarketingSkeleton } from '../../../components/admin/marketing/MarketingComponents';
import toast from 'react-hot-toast';

const OmnichannelEngine: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeChannel, setActiveChannel] = useState('all');

  const { data: campaignsRes, isLoading } = useQuery({
    queryKey: ['notificationCampaigns'],
    queryFn: () => marketingService.getNotificationCampaigns()
  });

  const sendMutation = useMutation({
    mutationFn: (id: string) => marketingService.sendNotificationCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationCampaigns'] });
      toast.success('Campaign delivery started');
    }
  });

  const campaigns = campaignsRes?.data || [];

  if (isLoading) return <MarketingSkeleton />;

  return (
    <div className=" space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter flex items-center gap-3">
            <Send className="text-blue-500" size={32} />
            Delivery Hub
          </h1>
          <p className="text-[var(--admin-text-secondary)] mt-2 font-bold uppercase text-[10px] tracking-[0.3em]">
            Enterprise Omnichannel Campaign Orchestration
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="flex bg-[var(--admin-card)] p-1 rounded-2xl border border-[var(--admin-card-border)] overflow-x-auto scrollbar-hide">
            {['all', 'email', 'whatsapp', 'sms', 'push'].map((c) => (
              <button
                key={c}
                onClick={() => setActiveChannel(c)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeChannel === c ? 'bg-blue-600 text-[var(--admin-text-primary)] shadow-lg shadow-blue-600/20' : 'text-[var(--admin-text-secondary)] hover:text-gray-300'}`}
              >
                {c}
              </button>
            ))}
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-[var(--admin-text-primary)] px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95 w-full sm:w-auto">
            <Plus size={18} /> New Campaign
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWidget label="Total Sent" value="1.2M" icon={Send} iconColor="text-blue-400" delay={0.1} />
        <StatWidget label="Avg. Open Rate" value="42.8%" icon={Bell} iconColor="text-amber-400" delay={0.2} />
        <StatWidget label="Active Scheds" value="12" icon={Clock} iconColor="text-purple-400" delay={0.3} />
        <StatWidget label="Conversions" value="4.2k" icon={CheckCircle2} iconColor="text-emerald-400" delay={0.4} />
      </div>

      {/* Campaigns List */}
      <div className="space-y-6">
        {campaigns.map((campaign: any, idx: number) => (
          <GlassCard key={campaign._id} delay={idx * 0.1} className="group/card">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              {/* Campaign Info */}
              <div className="flex-grow min-w-0 space-y-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-[var(--admin-card)] ${campaign.template?.channel === 'email' ? 'text-blue-400' : 'text-emerald-400'}`}>
                    {campaign.template?.channel === 'email' ? <Mail size={18} /> : <MessageSquare size={18} />}
                  </div>
                  <h3 className="text-xl font-bold text-[var(--admin-text-primary)] truncate tracking-tight">{campaign.name}</h3>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest pl-11">
                  <span className="flex items-center gap-1"><Filter size={12} /> {campaign.targetSegments?.join(', ')}</span>
                  <span className="w-1.5 h-1.5 bg-gray-800 rounded-full" />
                  <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(campaign.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Status & Analytics */}
              <div className="flex flex-wrap items-center gap-12">
                <div className="flex gap-8">
                  <div className="text-center">
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Delivered</p>
                    <p className="text-sm font-black text-[var(--admin-text-primary)]">{(campaign.analytics?.delivered || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">CTR</p>
                    <p className="text-sm font-black text-emerald-400">
                      {campaign.analytics?.delivered > 0 ? ((campaign.analytics.clicked / campaign.analytics.delivered) * 100).toFixed(1) : '0.0'}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${campaign.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : campaign.status === 'sending' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-[var(--admin-card)] border-[var(--admin-card-border)] text-[var(--admin-text-secondary)]'}`}>
                    {campaign.status}
                  </span>
                  {campaign.status === 'draft' && (
                    <button 
                      onClick={() => sendMutation.mutate(campaign._id)}
                      className="p-3 bg-blue-600 hover:bg-blue-700 text-[var(--admin-text-primary)] rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                    >
                      <Play size={18} fill="currentColor" />
                    </button>
                  )}
                  <button className="p-3 bg-[var(--admin-card)] hover:bg-[var(--admin-card)]/10 rounded-xl border border-[var(--admin-card-border)] transition-all text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]">
                    <BarChart2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {campaigns.length === 0 && (
        <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-4 bg-[var(--admin-card)]/[0.02] rounded-[2rem] border border-[var(--admin-card-border)]">
          <div className="p-6 bg-[var(--admin-card)] rounded-full text-gray-700">
            <Send size={48} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-400">No Campaigns Found</h3>
            <p className="text-sm text-gray-600 max-w-xs mt-1">Start reaching your customers across WhatsApp, Email, and Push.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OmnichannelEngine;


