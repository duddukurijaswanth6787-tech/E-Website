import { useState, useEffect, useRef } from 'react';
import { mediaService } from '../../api/services/media.service';
import type { MediaAsset } from '../../api/services/media.service';
import { ImageIcon, Upload, Trash, Link, Search, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminMediaPage = () => {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await mediaService.getMediaLibrary();
      if (res && res.data) {
        const fetchedData = (res as any).data.data || res.data || [];
        setMedia(Array.isArray(fetchedData) ? fetchedData : Object.values(fetchedData));
      }
    } catch (e: any) {
      console.error("Media Fetch Error", e);
      toast.error('Failed to load static assets from CDN.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      await mediaService.uploadSingle(file);
      toast.success('Asset pushed to CDN successfully!');
      fetchMedia();
    } catch (e: any) {
      toast.error('Local Upload Gateway Failure. Is the uploads directory writable?');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Asset URL Copied to Clipboard!');
  };

  const filtered = media.filter(m => m.filename.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 max-w-[100vw] overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-serif text-gray-900 mb-1 flex items-center gap-3">
            <ImageIcon className="w-6 h-6 text-primary-700" /> Storage Cloud Node
          </h1>
          <p className="text-sm text-[var(--admin-text-secondary)]">Inject static media payloads directly into the AWS/Cloudinary Buckets mapping CDN pathways.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
           <div className="relative">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <input 
               type="text" 
               placeholder="Search assets..."
               className="pl-9 pr-4 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 outline-none w-48 sm:w-64 transition-all"
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
             />
           </div>
           <button onClick={() => fetchMedia()} className="p-2 text-[var(--admin-text-secondary)] hover:text-primary-700 hover:bg-[var(--admin-card)] rounded border border-gray-200 shadow-sm transition-all" title="Synchronize Bucket">
             <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
           </button>
           <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} accept="image/*" />
           <button onClick={() => fileInputRef.current?.click()} disabled={loading} className="flex items-center px-4 py-2 bg-primary-950 text-[var(--admin-text-primary)] text-sm font-bold tracking-widest uppercase rounded shadow hover:bg-primary-800 transition-colors disabled:opacity-50">
              {loading ? (
                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
              ) : <Upload size={16} className="mr-2" />}
              Push Asset
           </button>
        </div>
      </div>

      {loading && media.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center">
             <RefreshCw size={40} className="text-gray-200 animate-spin mb-4" />
             <p className="text-gray-400 font-medium">Synchronizing with CDN Bucket...</p>
          </div>
      ) : filtered.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-gray-200 rounded-xl bg-[var(--admin-card)]">
             <ImageIcon size={48} className="text-gray-200 mx-auto mb-4" />
             <p className="text-[var(--admin-text-secondary)] font-serif text-lg">No assets matched your search protocol.</p>
             <button onClick={() => setSearchQuery('')} className="mt-2 text-primary-700 font-bold uppercase text-xs tracking-widest underline underline-offset-4">Clear Filters</button>
          </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-6">
          {filtered.map((asset, i) => (
            <div key={i} className="bg-[var(--admin-card)] border border-gray-200 rounded-xl overflow-hidden group hover:shadow-xl hover:shadow-primary-950/5 transition-all duration-300 flex flex-col hover:-translate-y-1">
              <div className="h-44 bg-gray-50 relative overflow-hidden flex items-center justify-center p-3">
                <img 
                  src={asset.url} 
                  alt={asset.filename} 
                  className="max-w-full max-h-full object-contain filter drop-shadow-md transition-transform group-hover:scale-110 duration-500" 
                  onError={(e) => { (e.target as any).src = 'https://placehold.co/400x400/png?text=Link+Expired'; }}
                />
                <div className="absolute inset-0 bg-primary-950/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                   <button onClick={() => copyLink(asset.url)} className="p-2.5 bg-[var(--admin-card)] text-primary-950 hover:bg-blue-50 rounded-full transition-all shadow-lg hover:scale-110" title="Copy Public URL">
                     <Link size={18} />
                   </button>
                   <button onClick={() => toast.error('Object Deletion restricted by environment IAM.')} className="p-2.5 bg-red-600 text-[var(--admin-text-primary)] hover:bg-red-700 rounded-full transition-all shadow-lg hover:scale-110" title="Trash Node">
                     <Trash size={18} />
                   </button>
                </div>
              </div>
              <div className="p-3 border-t border-gray-100 flex-grow flex flex-col justify-between bg-[var(--admin-card)] relative">
                <span className="block text-[0.7rem] font-bold text-gray-900 truncate mb-1 pr-1">{asset.filename}</span>
                <div className="flex justify-between items-center text-[0.6rem] text-gray-400 font-mono tracking-tighter uppercase">
                   <span className="bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">{asset.filename.split('.').pop()}</span>
                   <span>{asset.date || 'N/A'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMediaPage;


