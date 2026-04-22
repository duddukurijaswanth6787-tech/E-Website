import { useState, useEffect } from 'react';
import { cmsService } from '../../api/services/cms.service';
import type { CMSBlock } from '../../api/services/cms.service';
import { Type, Save, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminCMSPage = () => {
  const [blocks, setBlocks] = useState<CMSBlock[]>([]);
  const [loading, setLoading] = useState(true);

  // Note: We use a simplified Form layout rather than a DataTable here 
  // because CMS editing requires multi-line contextual parsing.

  const fetchBlocks = async () => {
    setLoading(true);
    try {
       const res = await cmsService.getAdminBlocks();
       if (res) {
          const fetchedData = (res as any).data?.blocks || (res as any).data?.data || (res as any).data || [];
          setBlocks(Array.isArray(fetchedData) ? fetchedData : Object.values(fetchedData));
       }
    } catch (e: any) {
       console.warn("CMS Block Error", e);
       if (e?.response?.status === 404) {
          toast.error("Backend Gap: GET /api/v1/cms/admin missing. Falling back...");
       } else {
          toast.error("Failed to load CMS static nodes.");
       }
       
       // Dev fallback structural stubs so page doesn't remain blank
       setBlocks([
          { _id: '1', page: 'HOME', sectionKey: 'HeroSubtitle', content: 'Explore our latest collection of Kanchipuram Silks.', isActive: true },
          { _id: '2', page: 'ABOUT', sectionKey: 'OurStory', content: 'Vasanthi Creations started as a small boutique...', isActive: true },
          { _id: '3', page: 'PRIVACY', sectionKey: 'PolicyBody', content: 'We value your privacy. Read our terms.', isActive: true }
       ]);
    } finally {
       setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  const handleSave = async (id: string, currentContent: string | Record<string, any>) => {
    try {
       await cmsService.updateBlock(id, currentContent);
       toast.success("Content published to the Live UI Matrix.");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
       toast.error("Failed to transmit payload. Is the CMS Mutation endpoint hot?");
    }
  };

  return (
    <div className="space-y-6 max-w-[100vw] overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-serif text-gray-900 mb-1 flex items-center">
            <Type className="w-6 h-6 mr-3 text-primary-700" /> Headless Text Layouts (CMS)
          </h1>
          <p className="text-sm text-gray-500">Inject raw JSON string patterns into the root React Static Page structures seamlessly.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
             <div className="col-span-full py-16 flex justify-center">
                 <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-800 rounded-full animate-spin"></div>
             </div>
        ) : blocks.length === 0 ? (
             <div className="col-span-full py-16 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                 <FileText className="w-16 h-16 text-gray-300 mb-4" />
                 <h2 className="text-lg font-serif text-gray-900">No Pages Bootstrapped</h2>
                 <p className="text-sm text-gray-500 mt-1 max-w-md text-center">Your Administrative database currently has no Text nodes mapped for UI rendering bindings.</p>
             </div>
        ) : (
          blocks.map(block => (
             <div key={block._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                   <div>
                     <span className="block text-xs font-bold tracking-widest text-primary-800 uppercase">{block.page} ➝ {block.sectionKey}</span>
                   </div>
                   <button 
                      onClick={() => handleSave(block._id, block.content)}
                      className="p-1.5 bg-primary-100 text-primary-800 rounded hover:bg-primary-200 transition-colors flex items-center shadow-sm"
                      title="Commit to Live Environment"
                   >
                     <Save size={14} className="mr-1.5" /> <span className="text-[0.65rem] font-bold uppercase tracking-widest leading-none">Publish</span>
                   </button>
                </div>
                <div className="p-4 flex-grow">
                   <textarea 
                     className="w-full h-full min-h-[120px] resize-none border-0 bg-transparent text-sm text-gray-700 focus:ring-0 placeholder-gray-400 font-mono leading-relaxed"
                     defaultValue={typeof block.content === 'object' ? JSON.stringify(block.content, null, 2) : block.content}
                     onChange={(e) => {
                         // Mutate the local React object reference directly without remounting the render tree
                         block.content = e.target.value;
                     }}
                   />
                </div>
             </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCMSPage;
