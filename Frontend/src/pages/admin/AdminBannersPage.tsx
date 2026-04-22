import { useState, useEffect } from 'react';
import { DataTable } from '../../components/admin/DataTable';
import { bannerService } from '../../api/services/banner.service';
import type { Banner } from '../../api/services/banner.service';
import { Image as ImageIcon, Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminBannersPage = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBanners = async () => {
    setLoading(true);
    try {
       const res = await bannerService.getBanners();
       if (res) {
          const fetchedData = (res as any).data || res || [];
          setBanners(Array.isArray(fetchedData) ? fetchedData : Object.values(fetchedData));
       }
    } catch (e: any) {
       console.error("Banners Fetch Failed", e);
       toast.error("Failed to load Banner payloads.");
       setBanners([]);
    } finally {
       setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDelete = async (id: string, title: string) => {
     if (!window.confirm(`Warning: Deleting the Banner [${title}] removes it from the customer viewport. Are you sure?`)) return;
     try {
        await bannerService.deleteBanner(id);
        toast.success(`Banner deleted.`);
        fetchBanners();
     } catch (e) {
        toast.error("Error mutating UI content.");
     }
  };

  const columns = [
    { 
       header: 'Hero Visual', 
       accessor: (row: Banner) => (
         <div className="flex items-center space-x-3">
           <div className="w-24 h-12 rounded overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
             <img src={row.imageUrl || 'https://placehold.co/240x120?text=HERO'} alt={row.title} className="w-full h-full object-cover" />
           </div>
           <div>
             <span className="block font-medium tracking-wide text-primary-950 truncate max-w-[150px]">{row.title}</span>
           </div>
         </div>
       )
    },
    { 
       header: 'Placement Zone', 
       accessor: (row: Banner) => (
         <span className="inline-flex px-2py-1 rounded text-[0.65rem] font-bold tracking-widest uppercase bg-blue-50 text-blue-800 border border-blue-200">
            {row.placement || 'HERO_SLIDER'}
         </span>
       )
    },
    { 
       header: 'Status', 
       accessor: (row: Banner) => (
         <span className={`inline-flex px-2 py-1 rounded text-[0.65rem] font-bold tracking-widest uppercase ${row.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
            {row.isActive ? 'LIVE IN UI' : 'HIDDEN'}
         </span>
       )
    },
    {
       header: 'Link Binding',
       accessor: (row: Banner) => (
         <span className="text-xs text-blue-600 truncate max-w-[150px] inline-block font-mono">
            {row.link || '/'}
         </span>
       )
    },
    {
       header: 'Actions',
       accessor: (row: Banner) => (
         <div className="flex items-center space-x-2">
           <button className="p-1.5 text-gray-400 hover:text-primary-700 transition-colors" title="Reposition">
             <Edit2 size={16} />
           </button>
           <button onClick={() => handleDelete(row._id, row.title)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Trash Visual">
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
            <ImageIcon className="w-6 h-6 mr-3 text-primary-700" /> Site Imagery Management
          </h1>
          <p className="text-sm text-gray-500">Inject dynamic marketing visuals across the E-Commerce frontpage.</p>
        </div>
        <div className="mt-4 sm:mt-0">
           <button className="flex items-center px-4 py-2 bg-primary-950 text-white text-sm font-bold tracking-widest uppercase rounded shadow hover:bg-primary-800 transition-colors">
              <Plus size={16} className="mr-2" />
              Upload Banner
           </button>
        </div>
      </div>

      <DataTable 
         columns={columns as any}
         data={banners}
         loading={loading}
         emptyMessage="No promotional headers are configured in the current environment stack."
      />
    </div>
  );
};

export default AdminBannersPage;
