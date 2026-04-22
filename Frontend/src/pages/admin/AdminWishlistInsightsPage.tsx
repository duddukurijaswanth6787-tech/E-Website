import { useState, useEffect } from 'react';
import { DataTable } from '../../components/admin/DataTable';
import { wishlistService } from '../../api/services/wishlist.service';
import type { WishlistInsightNode } from '../../api/services/wishlist.service';
import { Heart, ShoppingBag, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminWishlistInsightsPage = () => {
  const [insights, setInsights] = useState<WishlistInsightNode[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await wishlistService.getInsights();
      if (res && res.data) {
        const fetchedData = (res as any).data.data || res.data || [];
        setInsights(Array.isArray(fetchedData) ? fetchedData : Object.values(fetchedData));
      }
    } catch (e: any) {
      console.error("Wishlist Fetch Error", e);
      toast.error('Failed to load global wishlist aggregation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const columns = [
    { 
       header: 'Product Target', 
       accessor: (row: WishlistInsightNode) => (
         <div className="flex items-center space-x-3">
           <div className="w-10 h-10 rounded border border-gray-100 overflow-hidden bg-gray-50 flex-shrink-0">
             <img src={(row as any).product?.images?.[0] || 'https://placehold.co/400x400/png'} alt="" className="w-full h-full object-cover" />
           </div>
           <div>
             <span className="block font-medium tracking-wide text-gray-900 text-sm">{(row as any).product?.name || 'N/A'}</span>
             <span className="block text-[0.6rem] text-primary-600 font-mono tracking-tighter uppercase lowercase">/product/{(row as any).product?.slug}</span>
           </div>
         </div>
       )
    },
    { 
       header: 'Aggregate Wishlist Counts', 
       accessor: (row: WishlistInsightNode) => (
         <div className="flex items-center space-x-2">
           <Heart size={14} className="text-red-500 fill-red-500" />
           <span className="text-sm font-black text-gray-900">{(row as any).count || 0}</span>
         </div>
       )
    },
    { 
       header: 'Conversion Intensity', 
       accessor: (row: WishlistInsightNode) => {
         const cnt = (row as any).count || 0;
         const pct = Math.min((cnt / 100) * 100, 100);
         return (
           <div className="w-full max-w-[100px]">
             <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: `${pct}%` }}></div>
             </div>
           </div>
         );
       }
    },
    {
       header: 'System Action',
       accessor: (_row: WishlistInsightNode) => (
         <div className="flex items-center space-x-2">
           <button className="p-1.5 text-gray-400 hover:text-primary-700 transition-colors" title="View Related Order Volume">
             <ShoppingBag size={16} />
           </button>
           <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="Launch Promotion Campaign">
             <ArrowUpRight size={16} />
           </button>
         </div>
       )
    }
  ];

  return (
    <div className="space-y-6 max-w-[100vw] overflow-hidden">
      <div>
        <h1 className="text-2xl font-serif text-gray-900 mb-1 flex items-center gap-3">
          <Heart className="w-6 h-6 text-primary-700" /> Wishlist Desirability Matrix
        </h1>
        <p className="text-sm text-gray-500">Isolate high-conversion intent products by evaluating global customer saving behaviors.</p>
      </div>

      <DataTable 
         columns={columns as any}
         data={insights}
         loading={loading}
         emptyMessage="No statistical wishlist insight aggregations identified."
      />
    </div>
  );
};

export default AdminWishlistInsightsPage;
