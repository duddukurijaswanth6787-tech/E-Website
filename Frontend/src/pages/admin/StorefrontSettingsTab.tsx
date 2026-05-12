import React, { useState, useEffect } from 'react';
import { settingsService } from '../../api/services/settings.service';
import { Input } from '../../components/common/Input';
import { ImageUploader } from '../../components/admin/ImageUploader';
import type { Setting } from '../../api/services/settings.service';
import toast from 'react-hot-toast';
import { IMAGES } from '../../constants/assets';
const DEFAULT_STOREFRONT = {
  title: 'Curated For You',
  subtitle: 'Explore our signature collections tailored to bring out your inner elegance.',
  items: [
    { name: 'Bridal Sarees', image: IMAGES.categories.bridal, path: '/shop', featured: true },
    { name: 'Kanchipuram Silk', image: IMAGES.categories.kanchipuram, path: '/shop', featured: false },
    { name: 'Cotton Silk', image: IMAGES.categories.cotton, path: '/shop', featured: false },
    { name: 'Designer Concept', image: IMAGES.categories.designer, path: '/shop', featured: false },
    { name: 'Festive Wear', image: IMAGES.categories.festive, path: '/shop', featured: false },
  ]
};

const DEFAULT_BRIDAL_SPOTLIGHT = {
  title: 'The Bridal Edit',
  subtitle: 'Legacy of Opulence & Grace.',
  description: 'Your special day deserves the finest craftsmanship. Explore our exclusive bridal catalog featuring handcrafted zari work, heirloom quality silks, and custom-tailored designer blouses.',
  image: IMAGES.bridal,
  ctaText: 'Explore Bridal Wear',
  ctaPath: '/category/bridal'
};

export const StorefrontSettingsTab = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [form, setForm] = useState(DEFAULT_STOREFRONT);
  const [bridalForm, setBridalForm] = useState(DEFAULT_BRIDAL_SPOTLIGHT);
  const [featureFlags, setFeatureFlags] = useState<any>({
    storefront: {
      trustBadges: false
    }
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await settingsService.getAdminSettings('general');
        const settingsList = res.data || [];
        
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

        const flagsSetting = Array.isArray(settingsList)
          ? settingsList.find((s: Setting) => s.key === 'feature_flags')
          : undefined;
        
        if (flagsSetting && flagsSetting.value) {
          setFeatureFlags({
            ...featureFlags,
            ...flagsSetting.value
          });
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
        },
        {
          key: 'feature_flags',
          value: featureFlags,
          isPublic: true,
          group: 'general',
          label: 'System Feature Flags'
        }
      ]);
      
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
        <h2 className="text-lg font-serif text-gray-900">Storefront Features</h2>
        <p className="text-sm text-[var(--admin-text-secondary)]">Toggle high-level visibility of specific marketing components.</p>
      </div>

      <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-amber-900">Enable Trust Badge Section</h4>
          <p className="text-[10px] text-amber-700 uppercase font-black tracking-widest mt-1">Shows "Secure Checkout", "Express Delivery", etc.</p>
        </div>
        <button
          type="button"
          onClick={() => setFeatureFlags({
            ...featureFlags,
            storefront: { ...featureFlags.storefront, trustBadges: !featureFlags.storefront.trustBadges }
          })}
          className={`w-12 h-6 rounded-full transition-colors relative ${featureFlags.storefront.trustBadges ? 'bg-primary-700' : 'bg-gray-300'}`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${featureFlags.storefront.trustBadges ? 'left-7' : 'left-1'}`} />
        </button>
      </div>

      <div className="border-b pb-4 pt-10">
        <h2 className="text-lg font-serif text-gray-900">Curated Section Layout</h2>
        <p className="text-sm text-[var(--admin-text-secondary)]">Modify the text and imagery on the Homepage featured categories grid.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input
            label="Section Title"
            value={form.title}
            onChange={e => setForm({...form, title: e.target.value})}
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            label="Section Subtitle"
            value={form.subtitle}
            onChange={e => setForm({...form, subtitle: e.target.value})}
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
                  <ImageUploader
                    value={item.image}
                    onChange={url => handleItemChange(index, 'image', url)}
                    folder="homepage"
                  />
               </div>
               <div className="w-full sm:w-2/3 space-y-3">
                  <div>
                    <Input
                      label="Display Name"
                      value={item.name}
                      onChange={e => handleItemChange(index, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      label="Navigation Path"
                      value={item.path}
                      onChange={e => handleItemChange(index, 'path', e.target.value)}
                      className="font-mono"
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
            <p className="text-sm text-[var(--admin-text-secondary)]">Customize the high-end bridal highlight section on your homepage.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Headline"
                value={bridalForm.title}
                onChange={e => setBridalForm({...bridalForm, title: e.target.value})}
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label="Sub-headline (Italics)"
                value={bridalForm.subtitle}
                onChange={e => setBridalForm({...bridalForm, subtitle: e.target.value})}
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label="Body Text"
                multiline
                rows={3}
                value={bridalForm.description}
                onChange={e => setBridalForm({...bridalForm, description: e.target.value})}
              />
            </div>
            <div>
              <ImageUploader
                label="Featured Image"
                value={bridalForm.image}
                onChange={url => setBridalForm({...bridalForm, image: url})}
                folder="homepage"
              />
            </div>
            <div>
              <Input
                label="Button Text"
                value={bridalForm.ctaText}
                onChange={e => setBridalForm({...bridalForm, ctaText: e.target.value})}
              />
            </div>
          </div>
       </div>

       <div className="pt-8 border-t">
          <button 
            type="submit"
            disabled={loading}
            className="flex items-center px-8 py-3 bg-primary-950 text-[var(--admin-text-primary)] text-sm font-bold tracking-widest uppercase rounded shadow-premium hover:bg-primary-800 transition-all disabled:opacity-50"
          >
            {loading ? 'Publishing Matrix...' : 'Publish Storefront Layout'}
          </button>
       </div>
    </form>
  );
};


