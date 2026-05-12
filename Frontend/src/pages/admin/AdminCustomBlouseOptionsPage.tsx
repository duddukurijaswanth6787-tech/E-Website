import { useState, useEffect } from 'react';
import { customBlouseOptionService } from '../../api/services/custom-blouse-option.service';
import { uploadService } from '../../api/services/upload.service';
import type { CustomBlouseOption } from '../../api/services/custom-blouse-option.service';
import { 
  Plus, Trash2, Edit2, Save, X, 
  Settings, Layers, CheckCircle, ChevronRight,
  Upload, ImageIcon as ImageIconIcon
} from 'lucide-react';
import { ImageUploader } from '../../components/admin/ImageUploader';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { id: 'fabricType', label: 'Fabric Type' },
  { id: 'frontNeckType', label: 'Front Neck Type' },
  { id: 'backNeckType', label: 'Back Neck Type' },
  { id: 'sleeveType', label: 'Sleeve Type' },
  { id: 'sleeveLength', label: 'Sleeve Length' },
  { id: 'openingType', label: 'Opening Type' },
  { id: 'closureStyle', label: 'Closure Style' },
  { id: 'blouseLength', label: 'Blouse Length' },
];

const AdminCustomBlouseOptionsPage = () => {
  const [options, setOptions] = useState<CustomBlouseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  
  // Modal/Form states
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newOption, setNewOption] = useState({ value: '', order: 0, isActive: true, image: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const res = await customBlouseOptionService.getAllOptions();
      setOptions(res.data?.data || res.data || []);
    } catch (e) {
      toast.error('Failed to fetch options');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, isEdit: boolean = false, id?: string) => {
    setUploading(true);
    try {
      console.log('Uploading file...', file.name);
      const res = await uploadService.uploadSingle(file, 'custom-blouse-options');
      console.log('Upload response:', res);
      
      // Handle both { data: { url: ... } } and { data: { data: { url: ... } } } etc.
      const responseBody = res.data;
      const imageUrl = responseBody?.data?.url || responseBody?.url || (res as any).url;
      
      if (!imageUrl) {
        throw new Error('No URL returned from server');
      }

      if (isEdit && id) {
        await handleUpdate(id, { image: imageUrl });
      } else {
        setNewOption({ ...newOption, image: imageUrl });
      }
      toast.success('Image uploaded');
    } catch (e: any) {
      console.error('Upload error:', e);
      toast.error(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async () => {
    if (!newOption.value.trim()) return;
    try {
      await customBlouseOptionService.createOption({
        ...newOption,
        category: activeCategory,
      });
      toast.success('Option added');
      setIsAdding(false);
      setNewOption({ value: '', order: 0, isActive: true, image: '' });
      fetchOptions();
    } catch (e) {
      toast.error('Failed to add option');
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      await customBlouseOptionService.updateOption(id, data);
      toast.success('Option updated');
      setEditingId(null);
      fetchOptions();
    } catch (e) {
      toast.error('Failed to update option');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this option?')) return;
    try {
      await customBlouseOptionService.deleteOption(id);
      toast.success('Option deleted');
      fetchOptions();
    } catch (e) {
      toast.error('Failed to delete option');
    }
  };

  const filteredOptions = options.filter(o => o.category === activeCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif text-gray-900 mb-1">Custom Blouse Configurator</h1>
          <p className="text-sm text-[var(--admin-text-secondary)]">Manage dropdown values and requirements for the customization wizard</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-primary-950 text-[var(--admin-text-primary)] px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-primary-900 transition-all flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> Add New {CATEGORIES.find(c => c.id === activeCategory)?.label}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <div className="bg-[var(--admin-card)] rounded-2xl shadow-sm border border-gray-100 p-3">
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              <Layers size={14} /> Step Categories
            </div>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between group ${
                  activeCategory === cat.id 
                  ? 'bg-primary-50 text-primary-950 shadow-inner' 
                  : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat.label}
                <ChevronRight size={16} className={`transition-transform ${activeCategory === cat.id ? 'translate-x-1 opacity-100' : 'opacity-0'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Options Management */}
        <div className="lg:col-span-3">
          <div className="bg-[var(--admin-card)] rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-700 font-bold text-xs uppercase">
                  {activeCategory.substring(0, 1)}
                </div>
                <h2 className="text-lg font-serif text-gray-900">{CATEGORIES.find(c => c.id === activeCategory)?.label} Values</h2>
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {filteredOptions.length} Options Total
              </span>
            </div>

            <div className="divide-y divide-gray-50">
              {isAdding && (
                <div className="p-6 bg-primary-50/20 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Image Upload Area */}
                    <div className="w-full lg:w-48">
                      <ImageUploader
                        value={newOption.image}
                        onChange={(url) => setNewOption({ ...newOption, image: url })}
                        folder="custom-blouse-options"
                      />
                    </div>

                    <div className="flex-1 flex flex-col sm:flex-row items-end gap-4">
                      <div className="flex-1 w-full">
                        <label className="block text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-2">New Label Name</label>
                        <input 
                          type="text" 
                          value={newOption.value}
                          onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
                          placeholder="e.g., Banarasi Silk"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        />
                      </div>
                      <div className="w-full sm:w-24">
                        <label className="block text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-2">Order</label>
                        <input 
                          type="number" 
                          value={newOption.order}
                          onChange={(e) => setNewOption({ ...newOption, order: parseInt(e.target.value) || 0 })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm"
                        />
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button 
                          onClick={handleAdd}
                          disabled={uploading}
                          className="flex-1 sm:flex-none p-3 bg-primary-950 text-[var(--admin-text-primary)] rounded-xl hover:bg-primary-900 transition-all disabled:opacity-50"
                        >
                          <CheckCircle size={20} />
                        </button>
                        <button 
                          onClick={() => { setIsAdding(false); setNewOption({ ...newOption, image: '' }); }}
                          className="flex-1 sm:flex-none p-3 bg-[var(--admin-card)] border border-gray-200 text-[var(--admin-text-secondary)] rounded-xl hover:bg-gray-50 transition-all"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {filteredOptions.length === 0 && !isAdding ? (
                <div className="p-20 text-center flex flex-col items-center">
                  <Settings size={48} className="text-gray-100 mb-4" />
                  <p className="text-gray-400 font-medium">No options defined for this category yet.</p>
                  <button onClick={() => setIsAdding(true)} className="mt-4 text-primary-700 text-sm font-bold uppercase tracking-widest hover:underline">
                    Add the first one
                  </button>
                </div>
              ) : (
                filteredOptions.map((opt, idx) => (
                  <div key={opt._id} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                    <div className="flex items-center gap-4">
                      {/* Option Image Thumbnail */}
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 shadow-sm">
                        {opt.image ? (
                          <img src={opt.image} alt={opt.value} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ImageIconIcon size={20} />
                          </div>
                        )}
                        <input 
                          type="file" 
                          id={`file-${opt._id}`}
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], true, opt._id)}
                        />
                        <button 
                          onClick={() => document.getElementById(`file-${opt._id}`)?.click()}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-[var(--admin-text-primary)]"
                        >
                          <Upload size={14} />
                        </button>
                      </div>

                      <div className="w-8 h-8 flex items-center justify-center bg-gray-50 text-[0.65rem] font-bold text-gray-400 rounded-lg group-hover:bg-[var(--admin-card)] group-hover:shadow-sm transition-all">
                        {idx + 1}
                      </div>
                      {editingId === opt._id ? (
                        <div className="flex items-center gap-4">
                          <input 
                            type="text" 
                            defaultValue={opt.value}
                            id={`edit-${opt._id}`}
                            className="border border-primary-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                          />
                          <input 
                            type="number" 
                            defaultValue={opt.order}
                            id={`order-${opt._id}`}
                            className="w-16 border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                          />
                        </div>
                      ) : (
                        <div>
                          <p className={`text-md font-medium ${opt.isActive ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                            {opt.value}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest">Order: {opt.order}</span>
                            <span className={`w-1 h-1 rounded-full ${opt.isActive ? 'bg-green-400' : 'bg-gray-300'}`}></span>
                            <span className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest">{opt.isActive ? 'Active' : 'Disabled'}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-20 group-hover:opacity-100 transition-all">
                      {editingId === opt._id ? (
                        <>
                          <button 
                            onClick={() => {
                              const value = (document.getElementById(`edit-${opt._id}`) as HTMLInputElement).value;
                              const order = parseInt((document.getElementById(`order-${opt._id}`) as HTMLInputElement).value);
                              handleUpdate(opt._id, { value, order });
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          >
                            <Save size={18} />
                          </button>
                          <button 
                            onClick={() => setEditingId(null)}
                            className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg"
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => setEditingId(opt._id)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                            title="Edit label"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleUpdate(opt._id, { isActive: !opt.isActive })}
                            className={`p-2 rounded-lg ${opt.isActive ? 'text-orange-400 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'}`}
                            title={opt.isActive ? 'Disable' : 'Enable'}
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(opt._id)}
                            className="p-2 text-red-400 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomBlouseOptionsPage;


