import { useState, useEffect } from 'react';
import { DataTable } from '../../components/admin/DataTable';
import { reviewService } from '../../api/services/review.service';
import type { Review } from '../../api/services/review.service';
import { MessageSquare, ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const fetchReviews = async (page = 1) => {
    setLoading(true);
    try {
       const res = await reviewService.getAdminReviews({ page, limit: pagination.limit });
       if (res) {
          const fetchedData = (res as any).data?.reviews || (res as any).data?.data || (res as any).data || [];
          const arr = Array.isArray(fetchedData) ? fetchedData : Object.values(fetchedData);
          setReviews(arr);
          
          if ((res as any).data?.pagination) {
             setPagination({
                page: (res as any).data.pagination.page,
                limit: (res as any).data.pagination.limit,
                total: (res as any).data.pagination.total
             });
          } else {
             setPagination(prev => ({ ...prev, total: arr.length || 0 }));
          }
       }
    } catch (e: any) {
       console.warn("Reviews Endpoint Error", e);
       if (e?.response?.status === 404) {
          toast.error("Backend Gap: GET /api/v1/reviews/admin missing. UI gracefully stubbed.");
       } else {
          toast.error("Failed to load global sentiment reviews log.");
       }
       setReviews([]);
    } finally {
       setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(pagination.page);
  }, [pagination.page]);

  const updateStatus = async (id: string, data: any) => {
     try {
        await reviewService.updateReview(id, data);
        toast.success(`Review updated`);
        fetchReviews(pagination.page);
     } catch (e) {
        toast.error("Error mutating explicit review moderation state.");
     }
  };

  const columns = [
    { 
       header: 'Product Match', 
       accessor: (row: Review) => (
         <div className="max-w-[150px] truncate">
           <span className="block font-medium tracking-wide text-primary-950 text-sm">{row.product?.name || 'Unknown Product'}</span>
           <span className="block text-xs text-gray-500 font-mono mt-0.5">#{row.product?._id?.substring(0,8) || 'N/A'}</span>
         </div>
       )
    },
    { 
       header: 'Customer Sentiment', 
       accessor: (row: Review) => (
         <div className="max-w-xs">
           <div className="flex items-center text-yellow-500 text-xs mb-1">
             {"★".repeat(row.rating)}{"☆".repeat(5-row.rating)}
           </div>
            <span className="block font-medium text-gray-800 text-sm truncate">{row.title || 'No Subject'}</span>
            <span className="block text-xs text-gray-500 line-clamp-2 mt-0.5" title={row.body}>{row.body}</span>
         </div>
       )
    },
    { 
       header: 'Author Node', 
       accessor: (row: Review) => (
         <div>
           <span className="block text-sm text-gray-800">{row.user?.name || 'Anonymous User'}</span>
           <span className="block text-xs text-gray-500 tracking-wide">{row.user?.email || 'N/A'}</span>
         </div>
       )
    },
    { 
       header: 'Moderation Trigger', 
       accessor: (row: Review) => {
          const isApproved = row.status === 'approved';
          const isRejected = row.status === 'rejected';
         const colorClass = isApproved ? 'bg-green-50 text-green-700 border-green-200' : isRejected ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200';
         return (
           <span className={`inline-flex px-2 py-1 rounded text-[0.65rem] font-bold tracking-widest uppercase border ${colorClass}`}>
              {row.status || 'PENDING'}
           </span>
         );
       }
    },
    {
       header: 'Actions',
       accessor: (row: Review) => (
         <div className="flex items-center space-x-2">
            <button onClick={() => updateStatus(row._id, { status: 'approved' })} className="p-1.5 text-gray-400 hover:text-green-600 transition-colors" title="Approve & Publish to Shop">
              <ThumbsUp size={16} />
            </button>
            <button onClick={() => updateStatus(row._id, { status: 'rejected' })} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Reject / Suppress">
              <ThumbsDown size={16} />
            </button>
            <button onClick={() => updateStatus(row._id, { status: 'deleted' })} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Hard Delete Data">
              <Trash2 size={16} />
            </button>
         </div>
       )
    }
  ];

  return (
    <div className="space-y-6 max-w-[100vw] overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-serif text-gray-900 mb-1 flex items-center">
            <MessageSquare className="w-6 h-6 mr-3 text-primary-700" /> Review & QA Engine
          </h1>
          <p className="text-sm text-gray-500">Monitor post-purchase quality assurance ratings and sanitize explicit material.</p>
        </div>
      </div>

      <DataTable 
         columns={columns as any}
         data={reviews}
         loading={loading}
         emptyMessage="No customer verified reviews pending moderation."
         pagination={{
           page: pagination.page,
           limit: pagination.limit,
           total: Math.max(pagination.total, reviews.length),
           onPageChange: (newPage) => setPagination({...pagination, page: newPage})
         }}
      />
    </div>
  );
};

export default AdminReviewsPage;
