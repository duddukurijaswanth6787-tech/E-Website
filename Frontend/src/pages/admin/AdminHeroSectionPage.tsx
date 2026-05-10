import { useState, useEffect } from 'react';
import { cmsService } from '../../api/services/cms.service';
import { uploadService } from '../../api/services/upload.service';
import { Save, Image as ImageIcon, RotateCcw, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminHeroSectionPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  
  const [formData, setFormData] = useState({
    titleLine1: 'Elegance in Every',
    titleLine2: 'Thread',
    subtitle: 'Discover our curated collection of handwoven sarees, bespoke designer blouses, and bridal masterpieces.',
    badgeText: 'Luxury Indian Ethnic Wear',
    backgroundImage: '',
    desktopImageAlt: 'Vasanthi Creations Hero Desktop',
    mobileBackgroundImage: '',
    mobileImageAlt: 'Vasanthi Creations Hero Mobile',
    primaryButtonText: 'Shop Collection',
    primaryButtonLink: '/shop',
    secondaryButtonText: 'Custom Blouse',
    secondaryButtonLink: '/custom-blouse',
    overlayOpacity: 0.5,
    isPublished: false,
  });

  useEffect(() => {
    fetchHero();
  }, []);

  const fetchHero = async () => {
    try {
      setLoading(true);
      const res = await cmsService.getAdminHeroSection();
      if (res.data) {
        setFormData(res.data);
      }
    } catch (error) {
      toast.error('Failed to load Hero section data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'backgroundImage' | 'mobileBackgroundImage') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const toastId = toast.loading('Uploading image...');
      const res = await uploadService.uploadSingle(file, 'hero');
      const url = res.data?.url || res.data?.data?.url;
      if (url) {
        setFormData(prev => ({ ...prev, [field]: url }));
        toast.success('Image uploaded', { id: toastId });
      } else {
        throw new Error('No URL returned');
      }
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const handleRemoveImage = (field: 'backgroundImage' | 'mobileBackgroundImage') => {
    setFormData(prev => ({ ...prev, [field]: '' }));
  };

  const handleSave = async () => {
    if (!formData.titleLine1 || !formData.titleLine2 || !formData.subtitle || !formData.primaryButtonText || !formData.primaryButtonLink) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      setSaving(true);
      await cmsService.updateHeroSection(formData);
      toast.success('Hero section updated successfully');
    } catch (error) {
      toast.error('Failed to update Hero section');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset to default values? Unsaved changes will be lost.')) {
      setFormData({
        titleLine1: 'Elegance in Every',
        titleLine2: 'Thread',
        subtitle: 'Discover our curated collection of handwoven sarees, bespoke designer blouses, and bridal masterpieces.',
        badgeText: 'Luxury Indian Ethnic Wear',
        backgroundImage: '',
        desktopImageAlt: 'Vasanthi Creations Hero Desktop',
        mobileBackgroundImage: '',
        mobileImageAlt: 'Vasanthi Creations Hero Mobile',
        primaryButtonText: 'Shop Collection',
        primaryButtonLink: '/shop',
        secondaryButtonText: 'Custom Blouse',
        secondaryButtonLink: '/custom-blouse',
        overlayOpacity: 0.5,
        isPublished: false,
      });
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif text-gray-900">Home Page Hero</h1>
          <p className="text-sm text-gray-500">Manage the main hero banner of the public website.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleReset} className="flex items-center px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50">
            <RotateCcw className="w-4 h-4 mr-2" /> Reset
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center px-4 py-2 text-sm text-white bg-primary-800 rounded hover:bg-primary-900">
            <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save & Publish'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Settings Form */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-800 border-b pb-2">Status & Overlay</h2>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Publish Hero Section</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="isPublished" checked={formData.isPublished} onChange={handleInputChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Overlay Opacity: {formData.overlayOpacity}</label>
              <input type="range" name="overlayOpacity" min="0" max="0.9" step="0.1" value={formData.overlayOpacity} onChange={handleInputChange} className="w-full" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-800 border-b pb-2">Text Content</h2>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Badge Text</label>
              <input type="text" name="badgeText" value={formData.badgeText} onChange={handleInputChange} className="w-full px-3 py-2 border rounded text-sm focus:ring-1 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Title Line 1 *</label>
              <input type="text" name="titleLine1" value={formData.titleLine1} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded text-sm focus:ring-1 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Title Line 2 (Italic) *</label>
              <input type="text" name="titleLine2" value={formData.titleLine2} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded text-sm focus:ring-1 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Subtitle *</label>
              <textarea name="subtitle" value={formData.subtitle} onChange={handleInputChange} required rows={3} className="w-full px-3 py-2 border rounded text-sm focus:ring-1 focus:ring-primary-500" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-800 border-b pb-2">Call to Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Primary Btn Text *</label>
                <input type="text" name="primaryButtonText" value={formData.primaryButtonText} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Primary Btn Link *</label>
                <input type="text" name="primaryButtonLink" value={formData.primaryButtonLink} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Secondary Btn Text</label>
                <input type="text" name="secondaryButtonText" value={formData.secondaryButtonText} onChange={handleInputChange} className="w-full px-3 py-2 border rounded text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Secondary Btn Link</label>
                <input type="text" name="secondaryButtonLink" value={formData.secondaryButtonLink} onChange={handleInputChange} className="w-full px-3 py-2 border rounded text-sm" />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-800 border-b pb-2">Background Images</h2>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Desktop Image (1920x1080)</label>
              {formData.backgroundImage ? (
                <div className="relative w-full h-32 rounded overflow-hidden border">
                  <img src={formData.backgroundImage} className="w-full h-full object-cover" alt="Desktop Preview" />
                  <button onClick={() => handleRemoveImage('backgroundImage')} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"><X size={14} /></button>
                </div>
              ) : (
                <div className="relative border-2 border-dashed border-gray-300 rounded p-4 text-center hover:bg-gray-50 cursor-pointer">
                  <ImageIcon className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Click to upload</span>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'backgroundImage')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Mobile Image (1080x1920) - Optional</label>
              {formData.mobileBackgroundImage ? (
                <div className="relative w-full h-32 rounded overflow-hidden border max-w-[150px] mx-auto">
                  <img src={formData.mobileBackgroundImage} className="w-full h-full object-cover" alt="Mobile Preview" />
                  <button onClick={() => handleRemoveImage('mobileBackgroundImage')} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"><X size={14} /></button>
                </div>
              ) : (
                <div className="relative border-2 border-dashed border-gray-300 rounded p-4 text-center hover:bg-gray-50 cursor-pointer max-w-[200px]">
                  <ImageIcon className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Upload Mobile Fallback</span>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'mobileBackgroundImage')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
              )}
            </div>
          </div>
          
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-7">
          <div className="sticky top-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-800">Live Preview</h2>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button onClick={() => setPreviewMode('desktop')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${previewMode === 'desktop' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Desktop</button>
                <button onClick={() => setPreviewMode('mobile')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${previewMode === 'mobile' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Mobile</button>
              </div>
            </div>

            <div className={`border-[8px] border-gray-800 rounded-3xl overflow-hidden bg-black mx-auto transition-all duration-300 shadow-2xl ${previewMode === 'mobile' ? 'w-[375px] h-[667px]' : 'w-full h-[600px]'}`}>
              <div className="relative w-full h-full flex flex-col justify-center overflow-hidden bg-neutral-black">
                
                {/* Background rendering logic */}
                <div className="absolute inset-0">
                  <div
                    className="absolute inset-0 bg-cover bg-[center_20%] bg-no-repeat transition-all duration-500"
                    style={{
                      backgroundImage: `url('${(previewMode === 'mobile' && formData.mobileBackgroundImage) ? formData.mobileBackgroundImage : (formData.backgroundImage || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2400&auto=format&fit=crop')}')`,
                    }}
                  />
                  <div className="absolute inset-0 bg-black transition-opacity duration-300" style={{ opacity: formData.overlayOpacity }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
                </div>

                <div className={`relative z-10 w-full mx-auto px-6 ${previewMode === 'desktop' ? 'max-w-4xl' : ''}`}>
                  <p className="text-accent-bright/95 font-sans text-xs font-semibold tracking-[0.35em] uppercase mb-4">
                    {formData.badgeText || 'Badge Text'}
                  </p>

                  <div className="mb-5">
                    <h1 className="font-display text-white font-medium leading-[1.05]">
                      <span className={`block tracking-tight ${previewMode === 'desktop' ? 'text-5xl' : 'text-4xl'}`}>
                        {formData.titleLine1 || 'Title Line 1'}
                      </span>
                      <span className={`block mt-1 italic font-medium text-accent-light drop-shadow-sm ${previewMode === 'desktop' ? 'text-6xl' : 'text-5xl'}`}>
                        {formData.titleLine2 || 'Title Line 2'}
                      </span>
                    </h1>
                  </div>

                  <p className={`font-sans text-white/85 font-normal leading-relaxed mb-8 ${previewMode === 'desktop' ? 'text-lg max-w-md' : 'text-sm'}`}>
                    {formData.subtitle || 'Your description goes here.'}
                  </p>

                  <div className={`flex gap-4 ${previewMode === 'mobile' ? 'flex-col' : 'flex-row'}`}>
                    {formData.primaryButtonText && (
                      <button className="px-8 py-3.5 rounded-full text-sm font-semibold tracking-[0.15em] uppercase text-white bg-primary-800 border border-primary-700/40 shadow-lift">
                        {formData.primaryButtonText}
                      </button>
                    )}
                    {formData.secondaryButtonText && (
                      <button className="px-8 py-3.5 rounded-full text-sm font-semibold tracking-[0.15em] uppercase text-white border-2 border-white/85 bg-white/10 backdrop-blur-sm">
                        {formData.secondaryButtonText}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {!formData.isPublished && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg text-center flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> This Hero section is currently drafted and not live.
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
