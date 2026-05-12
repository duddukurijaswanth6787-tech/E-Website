import React, { useState, useEffect } from 'react';
import { cmsService } from '../../api/services/cms.service';
import { IMAGES } from '../../constants/assets';
import { ImageUploader } from '../../components/admin/ImageUploader';
import { Save, RotateCcw, Plus, Trash2, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export interface HeroSlideData {
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  badgeText?: string;
  backgroundImage?: string;
  mobileBackgroundImage?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

export default function AdminHeroSectionPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const defaultSlide: HeroSlideData = {
    titleLine1: 'Elegance in Every',
    titleLine2: 'Thread',
    subtitle: 'Discover our curated collection of handwoven sarees, bespoke designer blouses, and bridal masterpieces.',
    badgeText: 'Luxury Indian Ethnic Wear',
    backgroundImage: '',
    mobileBackgroundImage: '',
    primaryButtonText: 'Shop Collection',
    primaryButtonLink: '/shop',
    secondaryButtonText: 'Custom Blouse',
    secondaryButtonLink: '/custom-blouse',
  };

  const [formData, setFormData] = useState({
    overlayOpacity: 0.5,
    isPublished: false,
    autoplayInterval: 5,
    slides: [defaultSlide]
  });

  useEffect(() => {
    fetchHero();
  }, []);

  const fetchHero = async () => {
    try {
      setLoading(true);
      const res = await cmsService.getAdminHeroSection();
      if (res.data) {
        const fetched = res.data;
        const slides = (fetched.slides && fetched.slides.length > 0) ? fetched.slides : [{
          titleLine1: fetched.titleLine1 || 'Elegance in Every',
          titleLine2: fetched.titleLine2 || 'Thread',
          subtitle: fetched.subtitle || 'Discover our curated collection.',
          badgeText: fetched.badgeText || 'Luxury Indian Ethnic Wear',
          backgroundImage: fetched.backgroundImage || '',
          mobileBackgroundImage: fetched.mobileBackgroundImage || '',
          primaryButtonText: fetched.primaryButtonText || 'Shop Collection',
          primaryButtonLink: fetched.primaryButtonLink || '/shop',
          secondaryButtonText: fetched.secondaryButtonText || '',
          secondaryButtonLink: fetched.secondaryButtonLink || '',
        }];
        setFormData({
          overlayOpacity: fetched.overlayOpacity ?? 0.5,
          isPublished: fetched.isPublished ?? false,
          autoplayInterval: fetched.autoplayInterval ?? 5,
          slides
        });
      }
    } catch (error) {
      toast.error('Failed to load Hero section data');
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value)
    }));
  };

  const handleSlideChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updatedSlides = [...prev.slides];
      updatedSlides[activeSlideIndex] = {
        ...updatedSlides[activeSlideIndex],
        [name]: value
      };
      return { ...prev, slides: updatedSlides };
    });
  };

  const handleSlideImageChange = (field: 'backgroundImage' | 'mobileBackgroundImage', url: string) => {
    setFormData(prev => {
      const updatedSlides = [...prev.slides];
      updatedSlides[activeSlideIndex] = {
        ...updatedSlides[activeSlideIndex],
        [field]: url
      };
      return { ...prev, slides: updatedSlides };
    });
  };

  const addNewSlide = () => {
    setFormData(prev => ({
      ...prev,
      slides: [...prev.slides, { ...defaultSlide, titleLine1: 'New Creative', titleLine2: 'Concept' }]
    }));
    setActiveSlideIndex(formData.slides.length);
    toast.success('Added new slide layout');
  };

  const removeSlide = (index: number) => {
    if (formData.slides.length <= 1) {
      toast.error('You must keep at least one live slide.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      slides: prev.slides.filter((_, idx) => idx !== index)
    }));
    setActiveSlideIndex(Math.max(0, index - 1));
    toast.success('Slide removed');
  };

  const handleSave = async () => {
    // Validate current slides
    for (let i = 0; i < formData.slides.length; i++) {
      const s = formData.slides[i];
      if (!s.titleLine1 || !s.titleLine2 || !s.subtitle) {
        toast.error(`Slide ${i + 1} is missing required headline or subtitle text.`);
        setActiveSlideIndex(i);
        return;
      }
    }

    try {
      setSaving(true);
      // To preserve root level getters safely on older server handlers, copy first slide to base props
      const payload = {
        ...formData,
        ...formData.slides[0]
      };
      await cmsService.updateHeroSection(payload);
      toast.success('Hero section layout saved & published');
      await fetchHero();
    } catch (error) {
      toast.error('Failed to update Hero section');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset to standard template layout? Unsaved entries will be erased.')) {
      setFormData({
        overlayOpacity: 0.5,
        isPublished: false,
        autoplayInterval: 5,
        slides: [defaultSlide]
      });
      setActiveSlideIndex(0);
    }
  };

  // Manual Preview controls are provided to prevent interrupting admin text/asset inputs.

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold tracking-widest uppercase">Loading Inventory Engine...</div>;

  const currentSlide = formData.slides[activeSlideIndex] || formData.slides[0];

  return (
    <div className="space-y-6 pb-20 max-w-[1600px] mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--admin-text-primary)] tracking-tight">Multi-Slide Hero Carousel Engine</h1>
          <p className="text-xs text-[var(--admin-text-secondary)] uppercase tracking-[0.2em] font-bold mt-1">Configure side-by-side automated storefront banner sets</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={handleReset} className="flex-1 sm:flex-none flex items-center justify-center px-5 py-2.5 text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 bg-[var(--admin-card)] hover:bg-black/5 rounded-xl border border-[var(--admin-card-border)] transition-all">
            <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
          </button>
          <button onClick={handleSave} disabled={saving} className="flex-1 sm:flex-none flex items-center justify-center px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95">
            <Save className="w-3.5 h-3.5 mr-2" /> {saving ? 'Saving...' : 'Save & Publish'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Carousel Flow Configurator */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Global Parameters */}
          <div className="bg-[var(--admin-card)] p-6 rounded-2xl border border-[var(--admin-card-border)] shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--admin-card-border)] pb-4">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-[var(--admin-text-primary)]">Storefront Broadcast Engine</h2>
                <p className="text-[10px] text-[var(--admin-text-secondary)] mt-0.5">Toggle live storefront visibility globally</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="isPublished" checked={formData.isPublished} onChange={handleGlobalChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-wider mb-2">
                  Overlay Shade Tint ({formData.overlayOpacity})
                </label>
                <input type="range" name="overlayOpacity" min="0" max="0.9" step="0.05" value={formData.overlayOpacity} onChange={handleGlobalChange} className="w-full accent-blue-600" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-wider mb-2">
                  <Clock size={12} className="text-blue-500" /> Autoplay Timer Interval
                </label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    name="autoplayInterval" 
                    min="2" 
                    max="20" 
                    value={formData.autoplayInterval} 
                    onChange={handleGlobalChange} 
                    className="w-20 bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-xl px-3 py-2 text-sm font-bold text-[var(--admin-text-primary)] outline-none focus:border-blue-500 text-center" 
                  />
                  <span className="text-xs text-[var(--admin-text-secondary)] font-medium">seconds / slide</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Tabs list */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--admin-card-border)]">
            {formData.slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlideIndex(idx)}
                className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex-shrink-0 ${
                  idx === activeSlideIndex 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                    : 'bg-[var(--admin-card)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] border border-[var(--admin-card-border)]'
                }`}
              >
                <span>Slide #{idx + 1}</span>
                {formData.slides.length > 1 && (
                  <Trash2 
                    size={13} 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSlide(idx);
                    }}
                    className={`transition-colors ${idx === activeSlideIndex ? 'text-white/70 hover:text-white' : 'text-gray-400 hover:text-rose-500'}`} 
                  />
                )}
              </button>
            ))}

            <button
              onClick={addNewSlide}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all flex-shrink-0"
            >
              <Plus size={14} /> Add Slide
            </button>
          </div>

          {/* Active Slide Form Attributes */}
          <div className="bg-[var(--admin-card)] p-6 rounded-2xl border border-[var(--admin-card-border)] shadow-sm space-y-5 animate-fadeIn">
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-500 border-b border-[var(--admin-card-border)] pb-3">
              Configuring Creative Target &mdash; Slide #{activeSlideIndex + 1}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-wider mb-1">Badge Micro-Banner</label>
                <input 
                  type="text" 
                  name="badgeText" 
                  value={currentSlide.badgeText || ''} 
                  onChange={handleSlideChange} 
                  placeholder="e.g., Luxury Collection Launch"
                  className="w-full bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-xl px-4 py-2.5 text-sm font-bold text-[var(--admin-text-primary)] outline-none focus:border-blue-500 transition-colors" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-wider mb-1">Headline Accent (Line 1) *</label>
                  <input 
                    type="text" 
                    name="titleLine1" 
                    value={currentSlide.titleLine1 || ''} 
                    onChange={handleSlideChange} 
                    required
                    placeholder="Elegance in Every"
                    className="w-full bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-xl px-4 py-2.5 text-sm font-bold text-[var(--admin-text-primary)] outline-none focus:border-blue-500 transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-wider mb-1">Headline Italic (Line 2) *</label>
                  <input 
                    type="text" 
                    name="titleLine2" 
                    value={currentSlide.titleLine2 || ''} 
                    onChange={handleSlideChange} 
                    required
                    placeholder="Thread"
                    className="w-full bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-xl px-4 py-2.5 text-sm font-bold text-[var(--admin-text-primary)] outline-none focus:border-blue-500 transition-colors" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-wider mb-1">Slide Subtitle Paragraph *</label>
                <textarea 
                  name="subtitle" 
                  value={currentSlide.subtitle || ''} 
                  onChange={handleSlideChange} 
                  required 
                  rows={2} 
                  className="w-full bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--admin-text-primary)] outline-none focus:border-blue-500 transition-colors resize-none" 
                />
              </div>

              {/* Actions fields */}
              <div className="border-t border-[var(--admin-card-border)] pt-4 space-y-4">
                <p className="text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest">Call-To-Action Bindings</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Primary Button Label</label>
                    <input type="text" name="primaryButtonText" value={currentSlide.primaryButtonText || ''} onChange={handleSlideChange} className="w-full bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-xl px-3 py-2 text-xs font-bold" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Primary Route Path</label>
                    <input type="text" name="primaryButtonLink" value={currentSlide.primaryButtonLink || ''} onChange={handleSlideChange} className="w-full bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-xl px-3 py-2 text-xs font-bold text-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Secondary Option Label</label>
                    <input type="text" name="secondaryButtonText" value={currentSlide.secondaryButtonText || ''} onChange={handleSlideChange} className="w-full bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-xl px-3 py-2 text-xs font-bold" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Secondary Route Path</label>
                    <input type="text" name="secondaryButtonLink" value={currentSlide.secondaryButtonLink || ''} onChange={handleSlideChange} className="w-full bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-xl px-3 py-2 text-xs font-bold text-blue-500" />
                  </div>
                </div>
              </div>

              {/* Image upload arrays */}
              <div className="border-t border-[var(--admin-card-border)] pt-4 space-y-4">
                <p className="text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest">Slide Creative Assets (S3 Storage)</p>
                <div className="space-y-4">
                  <ImageUploader 
                    label="Desktop Wide Landscape View (1920x1080)"
                    value={currentSlide.backgroundImage || ''}
                    onChange={(url) => handleSlideImageChange('backgroundImage', url)}
                    folder="hero"
                  />
                  <ImageUploader 
                    label="Mobile Vertical Story Mode (1080x1920) - Optional"
                    value={currentSlide.mobileBackgroundImage || ''}
                    onChange={(url) => handleSlideImageChange('mobileBackgroundImage', url)}
                    folder="hero"
                  />
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Live Simulator Viewport */}
        <div className="lg:col-span-6">
          <div className="sticky top-6 space-y-4">
            <div className="flex justify-between items-center bg-[var(--admin-card)] px-5 py-3 rounded-2xl border border-[var(--admin-card-border)]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <h2 className="text-xs font-black uppercase tracking-widest text-[var(--admin-text-primary)]">Emulation Canvas</h2>
                <span className="text-[10px] font-black text-gray-400">(Slide {activeSlideIndex + 1}/{formData.slides.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setActiveSlideIndex(prev => (prev - 1 + formData.slides.length) % formData.slides.length)} 
                  className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  title="Previous Slide"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={() => setActiveSlideIndex(prev => (prev + 1) % formData.slides.length)} 
                  className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  title="Next Slide"
                >
                  <ChevronRight size={16} />
                </button>
                <div className="h-4 w-[1px] bg-[var(--admin-card-border)] mx-1" />
                <div className="flex bg-[var(--admin-bg)] p-1 rounded-xl border border-[var(--admin-card-border)]">
                  <button onClick={() => setPreviewMode('desktop')} className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all ${previewMode === 'desktop' ? 'bg-[var(--admin-card)] text-[var(--admin-text-primary)] shadow-sm' : 'text-gray-400'}`}>Desktop</button>
                  <button onClick={() => setPreviewMode('mobile')} className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all ${previewMode === 'mobile' ? 'bg-[var(--admin-card)] text-[var(--admin-text-primary)] shadow-sm' : 'text-gray-400'}`}>Mobile</button>
                </div>
              </div>
            </div>

            <div className={`border-[8px] border-gray-900 rounded-[32px] overflow-hidden bg-black mx-auto transition-all duration-300 shadow-2xl relative ${previewMode === 'mobile' ? 'w-[375px] h-[667px]' : 'w-full h-[540px]'}`}>
              <div className="absolute inset-0 flex flex-col justify-center overflow-hidden bg-neutral-black">
                
                {/* Background image output layer */}
                <div className="absolute inset-0">
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-out"
                    style={{
                      backgroundImage: `url('${(previewMode === 'mobile' && currentSlide.mobileBackgroundImage) ? currentSlide.mobileBackgroundImage : (currentSlide.backgroundImage || IMAGES.hero.desktop)}')`,
                    }}
                  />
                  <div className="absolute inset-0 bg-black transition-opacity duration-300" style={{ opacity: formData.overlayOpacity }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
                </div>

                {/* Simulated foreground output layer */}
                <div className={`relative z-10 w-full mx-auto px-6 transition-all duration-500 animate-fadeIn ${previewMode === 'desktop' ? 'max-w-3xl' : ''}`}>
                  <p className="text-amber-400 font-sans text-[10px] font-black tracking-[0.3em] uppercase mb-3 drop-shadow">
                    {currentSlide.badgeText || 'Badge Announcement'}
                  </p>

                  <div className="mb-4">
                    <h1 className="font-display text-white font-medium leading-[1.05]">
                      <span className={`block tracking-tight font-bold ${previewMode === 'desktop' ? 'text-4xl' : 'text-3xl'}`}>
                        {currentSlide.titleLine1 || 'Headline Accent'}
                      </span>
                      <span className={`block italic font-medium text-amber-200/90 drop-shadow-sm ${previewMode === 'desktop' ? 'text-5xl' : 'text-4xl'}`}>
                        {currentSlide.titleLine2 || 'Italic Line'}
                      </span>
                    </h1>
                  </div>

                  <p className={`font-sans text-white/90 font-medium leading-relaxed mb-6 ${previewMode === 'desktop' ? 'text-sm max-w-md' : 'text-xs max-w-xs'}`}>
                    {currentSlide.subtitle || 'Creative descriptive content flow preview rendering block.'}
                  </p>

                  <div className={`flex gap-3 ${previewMode === 'mobile' ? 'flex-col' : 'flex-row'}`}>
                    {currentSlide.primaryButtonText && (
                      <span className="px-6 py-2.5 rounded-full text-[10px] font-black tracking-widest uppercase text-white bg-blue-600 border border-blue-500/40 text-center shadow-lg">
                        {currentSlide.primaryButtonText}
                      </span>
                    )}
                    {currentSlide.secondaryButtonText && (
                      <span className="px-6 py-2.5 rounded-full text-[10px] font-black tracking-widest uppercase text-white border border-white/60 bg-white/10 backdrop-blur-sm text-center">
                        {currentSlide.secondaryButtonText}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom interactive carousel indicator bars */}
                <div className="absolute bottom-4 inset-x-0 flex justify-center items-center gap-1.5 z-20">
                  {formData.slides.map((_, idx) => (
                    <span 
                      key={idx} 
                      className={`h-1 rounded-full transition-all duration-500 ${idx === activeSlideIndex ? 'w-6 bg-blue-500' : 'w-1.5 bg-white/30'}`} 
                    />
                  ))}
                </div>

              </div>
            </div>

            {!formData.isPublished && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-black tracking-wider uppercase rounded-xl text-center flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Offline mode: Carousel broadcast drafted locally.
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
