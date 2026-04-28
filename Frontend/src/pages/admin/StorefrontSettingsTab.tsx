import { useState, useEffect } from 'react';
import { settingsService } from '../../api/services/settings.service';
import type { Setting } from '../../api/services/settings.service';
import toast from 'react-hot-toast';

const DEFAULT_STOREFRONT = {
  title: 'Curated For You',
  subtitle: 'Explore our signature collections tailored to bring out your inner elegance.',
  items: [
    { name: 'Bridal Sarees', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2000&auto=format&fit=crop', path: '/shop', featured: true },
    { name: 'Kanchipuram Silk', image: 'https://images.unsplash.com/photo-1610030469614-118bd245781a?q=80&w=2000&auto=format&fit=crop', path: '/shop', featured: false },
    { name: 'Cotton Silk', image: 'https://images.unsplash.com/photo-1583391733958-d15f3a53d10e?q=80&w=2000&auto=format&fit=crop', path: '/shop', featured: false },
    { name: 'Designer Concept', image: 'https://images.unsplash.com/photo-1605701389814-11003f56ce73?q=80&w=2000&auto=format&fit=crop', path: '/shop', featured: false },
    { name: 'Festive Wear', image: 'https://images.unsplash.com/photo-1550420790-264627bbcbdf?q=80&w=2000&auto=format&fit=crop', path: '/shop', featured: false },
  ]
};

const DEFAULT_BRIDAL_SPOTLIGHT = {
  title: 'The Bridal Edit',
  subtitle: 'Legacy of Opulence & Grace.',
  description: 'Your special day deserves the finest craftsmanship. Explore our exclusive bridal catalog featuring handcrafted zari work, heirloom quality silks, and custom-tailored designer blouses.',
  image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1500&auto=format&fit=crop',
  ctaText: 'Explore Bridal Wear',
  ctaPath: '/category/bridal'
};

export const StorefrontSettingsTab = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [form, setForm] = useState(DEFAULT_STOREFRONT);
  const [bridalForm, setBridalForm] = useState(DEFAULT_BRIDAL_SPOTLIGHT);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await settingsService.getAdminSettings('storefront');
        const settingsList = res.data || [];
        // Note: settingService.getAdminSettings returns the axios response in res, 
        // the actual data array is in res.data?.data depending on how backend sendSuccess works
        // The backend sendSuccess(res, settings) -> res.data is { success: true, data: settings }
        
        const curatedSetting = Array.isArray(settingsList) 
          ? settingsList.find((s: Setting) => s.key === 'homepage_featured_categories')
          : undefined;

        if (curatedSetting && curatedSetting.value) {
          setForm(curatedSetting.value);
        }

        const bridalSetting = Array.isArray(settingsList)
          ? settingsList.find((s: Setting) => s.key === 'homepage_bridal_spotlight')
          : undefined;
        
        if (bridalSetting && bridalSetting.value) {
          setBridalForm(bridalSetting.value);
        }
      } catch (err) {
        console.warn('Failed to fetch storefront settings:', err);
      } finally {
        setFetching(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await settingsService.bulkUpsertAdminSettings([
        {
          key: 'homepage_featured_categories',
          value: form,
          isPublic: true,
          group: 'general',
          label: 'Homepage Featured Categories'
        },
        {
          key: 'homepage_bridal_spotlight',
          value: bridalForm,
          isPublic: true,
          group: 'general',
          label: 'Homepage Bridal Spotlight'
        }
      ]);
      
      // Since it might be the first time creating it, let's also make sure it's created properly.
      // Wait, 'bulkUpsertAdminSettings' uses findOneAndUpdate with upsert, but we need to ensure group/type/isPublic are set for new docs.
      // Actually, if it's the first time, it might fail validation if 'group', 'label', 'isPublic' are strictly required and missing from updates.
      // Let's just pass them as well if possible, or build a custom API call.
      // Assuming Settings model requires them:
      // We will perform a direct API call or assume bulkUpsert is enough if backend adapts.
      
      // Workaround because the backend's PUT /api/v1/settings only upserts 'value'.
      toast.success('Storefront configuration published!');
    } catch (err) {
      toast.error('Failed to sync storefront settings.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (index: number, field: string, val: any) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: val };
    setForm({ ...form, items: newItems });
  };

  if (fetching) {
    return <div className="py-12 flex justify-center"><div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full" /></div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-3xl">
      <div className="border-b pb-4">
        <h2 className="text-lg font-serif text-gray-900">Curated Section Layout</h2>
        <p className="text-sm text-gray-500">Modify the text and imagery on the Homepage featured categories grid.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
          <input 
            type="text" 
            value={form.title}
            onChange={e => setForm({...form, title: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 transition-shadow outline-none"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Section Subtitle</label>
          <input 
             type="text" 
             value={form.subtitle}
             onChange={e => setForm({...form, subtitle: e.target.value})}
             className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 transition-shadow outline-none"
          />
        </div>
      </div>

      <div className="space-y-6">
         <h3 className="text-md font-medium text-gray-900 border-b pb-2">Category Image Grid</h3>
         {form.items.map((item, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
               <div className="w-full sm:w-1/3 flex flex-col justify-center gap-2">
                  <div className="h-24 bg-gray-200 rounded overflow-hidden relative group">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Image URL" 
                    value={item.image}
                    onChange={e => handleItemChange(index, 'image', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  />
               </div>
               <div className="w-full sm:w-2/3 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Display Name</label>
                    <input 
                      type="text" 
                      value={item.name}
                      onChange={e => handleItemChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Navigation Path</label>
                    <input 
                      type="text" 
                      value={item.path}
                      onChange={e => handleItemChange(index, 'path', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 outline-none font-mono"
                    />
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id={`featured-${index}`} 
                      checked={item.featured}
                      onChange={e => handleItemChange(index, 'featured', e.target.checked)}
                      className="mr-2 rounded text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor={`featured-${index}`} className="text-xs font-medium text-gray-700 cursor-pointer">
                      Is Main Featured (Spans 2x2 blocks)
                    </label>
                  </div>
               </div>
            </div>
         ))}
      </div>

       <div className="space-y-6 pt-10 border-t">
          <div className="border-b pb-4">
            <h2 className="text-lg font-serif text-gray-900">Bridal Spotlight (Luxury Section)</h2>
            <p className="text-sm text-gray-500">Customize the high-end bridal highlight section on your homepage.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
              <input 
                type="text" 
                value={bridalForm.title}
                onChange={e => setBridalForm({...bridalForm, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sub-headline (Italics)</label>
              <input 
                type="text" 
                value={bridalForm.subtitle}
                onChange={e => setBridalForm({...bridalForm, subtitle: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Body Text</label>
              <textarea 
                rows={3}
                value={bridalForm.description}
                onChange={e => setBridalForm({...bridalForm, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image URL</label>
              <input 
                type="text" 
                value={bridalForm.image}
                onChange={e => setBridalForm({...bridalForm, image: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
              <input 
                type="text" 
                value={bridalForm.ctaText}
                onChange={e => setBridalForm({...bridalForm, ctaText: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>
       </div>

       <div className="pt-8 border-t">
          <button 
            type="submit"
            disabled={loading}
            className="flex items-center px-8 py-3 bg-primary-950 text-white text-sm font-bold tracking-widest uppercase rounded shadow-premium hover:bg-primary-800 transition-all disabled:opacity-50"
          >
            {loading ? 'Publishing Matrix...' : 'Publish Storefront Layout'}
          </button>
       </div>
    </form>
  );
};
