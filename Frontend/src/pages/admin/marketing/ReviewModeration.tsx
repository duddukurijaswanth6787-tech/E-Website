import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Star, CheckCircle2, XCircle, Trash2, 
  MessageSquare, 
  ShieldCheck, 
  AlertCircle
} from 'lucide-react';
import { reviewService } from '../../../api/services/review.service';
import { GlassCard } from '../../../components/common/GlassCard';
import { MarketingSkeleton } from '../../../components/admin/marketing/MarketingComponents';
import toast from 'react-hot-toast';

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

const ReviewModeration: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('pending');

  const { data: reviewsRes, isLoading } = useQuery({
    queryKey: ['adminReviews', statusFilter],
    queryFn: () => reviewService.getAdminReviews({ status: statusFilter })
  });

  const { data: statsRes } = useQuery({
    queryKey: ['reviewStats'],
    queryFn: () => reviewService.getReviewStats()
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => reviewService.updateReview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviewStats'] });
      toast.success('Review status updated');
    }
  });

  const reviews = reviewsRes?.data || [];

  const summaryStats = useMemo(() => {
    const s = statsRes?.data || [];
    const pending = s.find((x: any) => x._id === 'pending')?.count || 0;
    const approved = s.find((x: any) => x._id === 'approved')?.count || 0;
    const avgRating = s.reduce((acc: number, curr: any) => acc + (curr.avgRating || 0), 0) / (s.length || 1);
    return { pending, approved, avgRating };
  }, [statsRes]);

  if (isLoading) return <MarketingSkeleton />;

  return (
    <div className=" space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter flex items-center gap-3">
            <MessageSquare className="text-blue-500" size={32} />
            Social Pulse
          </h1>
          <p className="text-[var(--admin-text-secondary)] mt-2 font-bold uppercase text-[10px] tracking-[0.3em]">
            Moderate customer feedback & social proof
          </p>
        </div>
        <div className="flex bg-[var(--admin-card)] p-1 rounded-2xl border border-[var(--admin-card-border)] w-full lg:w-auto">
          {['pending', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`flex-grow lg:flex-grow-0 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-blue-600 text-[var(--admin-text-primary)] shadow-lg shadow-blue-600/20' : 'text-[var(--admin-text-secondary)] hover:text-gray-300'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatWidget 
          label="Pending Moderation" 
          value={summaryStats.pending}
          icon={AlertCircle}
          iconColor="text-amber-400"
          delay={0.1}
        />
        <StatWidget 
          label="Avg. Store Rating" 
          value={summaryStats.avgRating.toFixed(1)}
          icon={Star}
          iconColor="text-blue-400"
          delay={0.2}
        />
        <StatWidget 
          label="Approved Reviews" 
          value={summaryStats.approved}
          icon={CheckCircle2}
          iconColor="text-emerald-400"
          delay={0.3}
        />
      </div>

      {/* Review List */}
      <div className="space-y-6">
        {reviews.map((review: any, idx: number) => (
          <GlassCard key={review._id} delay={idx * 0.05} className="group/card">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Product & User Info */}
              <div className="w-full lg:w-72 flex-shrink-0 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-900 overflow-hidden border border-[var(--admin-card-border)]">
                    <img src={review.product?.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest mb-0.5">Product</p>
                    <p className="text-sm font-bold text-[var(--admin-text-primary)] truncate">{review.product?.name}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--admin-card)] border border-[var(--admin-card-border)] space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-black">
                      {review.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--admin-text-primary)] truncate max-w-[150px]">{review.user?.name}</p>
                      <p className="text-[9px] text-[var(--admin-text-secondary)] truncate max-w-[150px]">{review.user?.email}</p>
                    </div>
                  </div>
                  {review.isVerifiedPurchase && (
                    <div className="flex items-center gap-2 text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-2 py-1 rounded-lg border border-emerald-400/20">
                      <ShieldCheck size={12} />
                      Verified Purchase
                    </div>
                  )}
                </div>
              </div>

              {/* Review Content */}
              <div className="flex-grow space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className={i < review.rating ? "text-blue-500 fill-blue-500" : "text-gray-700"} />
                    ))}
                  </div>
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-[var(--admin-text-primary)] mb-2">{review.title}</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">{review.body}</p>
                </div>

                {review.images?.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {review.images.map((img: string, i: number) => (
                      <div key={i} className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border border-[var(--admin-card-border)]">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[var(--admin-card-border)]">
                  {review.status !== 'approved' && (
                    <button 
                      onClick={() => updateMutation.mutate({ id: review._id, data: { status: 'approved' } })}
                      className="flex-grow sm:flex-grow-0 bg-emerald-600 hover:bg-emerald-700 text-[var(--admin-text-primary)] px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={16} /> Approve
                    </button>
                  )}
                  {review.status !== 'rejected' && (
                    <button 
                      onClick={() => updateMutation.mutate({ id: review._id, data: { status: 'rejected' } })}
                      className="flex-grow sm:flex-grow-0 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-rose-500/10 flex items-center justify-center gap-2"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  )}
                  <button className="flex-grow sm:flex-grow-0 bg-[var(--admin-card)] hover:bg-[var(--admin-card)]/10 text-[var(--admin-text-primary)] px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-[var(--admin-card-border)] flex items-center justify-center gap-2">
                    <Trash2 size={16} className="text-[var(--admin-text-secondary)]" /> Remove
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-4 bg-[var(--admin-card)]/[0.02] rounded-[2rem] border border-[var(--admin-card-border)]">
          <div className="p-6 bg-[var(--admin-card)] rounded-full text-gray-700">
            <MessageSquare size={48} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-400">Moderation Queue Empty</h3>
            <p className="text-sm text-gray-600 max-w-xs mt-1">Great job! All customer feedback has been addressed.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewModeration;


