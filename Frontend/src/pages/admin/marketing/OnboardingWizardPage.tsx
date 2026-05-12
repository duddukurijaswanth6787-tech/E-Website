import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Sparkles, Heart, Ruler, ShoppingBag, Star, Gift,
  Plus, Trash2, Save, Eye, Power, RefreshCw, ArrowUp, ArrowDown
} from 'lucide-react';
import { marketingService, type OnboardingWizardStep } from '../../../api/services/marketing.service';
import { GlassCard } from '../../../components/common/GlassCard';
import { MarketingSkeleton } from '../../../components/admin/marketing/MarketingComponents';
import toast from 'react-hot-toast';

const availableIcons = [
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Heart', icon: Heart },
  { name: 'Ruler', icon: Ruler },
  { name: 'ShoppingBag', icon: ShoppingBag },
  { name: 'Star', icon: Star },
  { name: 'Gift', icon: Gift }
];

const availableColors = [
  { name: 'blue', label: 'Sapphire Blue', bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500' },
  { name: 'rose', label: 'Ruby Rose', bg: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-500' },
  { name: 'amber', label: 'Amber Gold', bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500' },
  { name: 'emerald', label: 'Emerald Green', bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500' },
  { name: 'purple', label: 'Royal Purple', bg: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500' }
];

const OnboardingWizardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isActive, setIsActive] = useState(false);
  const [steps, setSteps] = useState<OnboardingWizardStep[]>([]);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [previewStep, setPreviewStep] = useState(0);

  const { data: wizardRes, isLoading } = useQuery({
    queryKey: ['onboardingWizard'],
    queryFn: () => marketingService.getOnboardingWizard()
  });

  useEffect(() => {
    if (wizardRes?.data) {
      setIsActive(wizardRes.data.isActive || false);
      setSteps(wizardRes.data.steps || []);
    }
  }, [wizardRes]);

  const saveMutation = useMutation({
    mutationFn: (payload: { isActive: boolean; steps: OnboardingWizardStep[] }) => 
      marketingService.saveOnboardingWizard(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['onboardingWizard'] });
      toast.success(res?.data?.isActive ? 'Wizard Published Live Successfully!' : 'Wizard Config Saved Offline');
    },
    onError: () => {
      toast.error('Failed to update wizard configuration');
    }
  });

  const handleAddStep = () => {
    setSteps([
      ...steps,
      {
        title: 'New Feature Overview',
        subtitle: 'Sleek Subtitle Message',
        content: 'Enter description text outlining premium value statements to engage visitors.',
        icon: 'Sparkles',
        color: 'blue'
      }
    ]);
    toast.success('Added new slide step');
  };

  const handleUpdateStep = (index: number, field: keyof OnboardingWizardStep, value: string) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const handleDeleteStep = (index: number) => {
    if (steps.length <= 1) {
      toast.error('At least one step is required');
      return;
    }
    const updated = steps.filter((_, idx) => idx !== index);
    setSteps(updated);
    toast.success('Removed step');
    if (previewStep >= updated.length) setPreviewStep(updated.length - 1);
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;
    
    const updated = [...steps];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setSteps(updated);
  };

  const handleSave = (publishState?: boolean) => {
    const finalActiveState = publishState !== undefined ? publishState : isActive;
    if (publishState !== undefined) {
      setIsActive(finalActiveState);
    }
    
    // Validation check
    for (const s of steps) {
      if (!s.title || !s.subtitle || !s.content) {
        toast.error('Please fill in all title, subtitle, and content fields');
        return;
      }
    }

    saveMutation.mutate({ isActive: finalActiveState, steps });
  };

  if (isLoading) return <MarketingSkeleton />;

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Header Panel */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-[var(--admin-card)] border border-[var(--admin-card-border)] p-6 sm:p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
        
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-blue-500/10 text-blue-500 rounded-2xl border border-blue-500/20">
              <Sparkles size={24} />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--admin-text-primary)] tracking-tight">
                Onboarding Welcome Wizard
              </h1>
              <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.3em] mt-1">
                Targeted Initial Visit Storefront Slider
              </p>
            </div>
          </div>
          <p className="text-xs text-[var(--admin-text-secondary)] mt-3 max-w-xl leading-relaxed">
            Configure beautiful visual micro-slides mapping custom boutique experiences. Renders dynamically as the top priority entry pop-up solely for first-time shoppers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          {/* Status Indicator */}
          <div className="flex items-center gap-3 bg-black/40 px-4 py-3 rounded-2xl border border-white/5 flex-grow lg:flex-grow-0">
            <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-emerald-500 shadow-[0_0_12px_#10b981]' : 'bg-rose-500 shadow-[0_0_12px_#f43f5e]'} transition-colors duration-300`} />
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--admin-text-secondary)]">Storefront State</p>
              <p className={`text-xs font-black uppercase tracking-wider ${isActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isActive ? 'Published Live' : 'Offline (Inactive)'}
              </p>
            </div>
          </div>

          {/* Quick Publish / Offline Toggle Action */}
          <button
            onClick={() => handleSave(!isActive)}
            disabled={saveMutation.isPending}
            className={`flex-grow lg:flex-grow-0 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl ${
              isActive 
                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 shadow-rose-500/5' 
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
            } active:scale-95`}
          >
            <Power size={16} />
            {saveMutation.isPending ? 'Syncing...' : isActive ? 'Take Offline' : 'Publish Live'}
          </button>
        </div>
      </div>

      {/* Main Configuration Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Span: Slides Array List & Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black uppercase tracking-widest text-[var(--admin-text-primary)]">Slide Layouts</h3>
              <span className="bg-blue-500/10 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-blue-500/20">
                {steps.length} Steps
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === 'editor' 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'bg-[var(--admin-card)] text-[var(--admin-text-secondary)] hover:text-white'
                }`}
              >
                Steps Editor
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  activeTab === 'preview' 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'bg-[var(--admin-card)] text-[var(--admin-text-secondary)] hover:text-white'
                }`}
              >
                <Eye size={14} /> Live Preview
              </button>
            </div>
          </div>

          {activeTab === 'editor' ? (
            <div className="space-y-6">
              {steps.map((step, idx) => {
                return (
                  <GlassCard key={idx} className="p-6 relative group border border-[var(--admin-card-border)] hover:border-blue-500/30 transition-all duration-300">
                    {/* Header Slide Controls */}
                    <div className="flex items-center justify-between gap-4 pb-4 mb-5 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-[var(--admin-card-border)] flex items-center justify-center font-black text-xs text-blue-400">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-sm text-[var(--admin-text-primary)]">Configure Step {idx + 1}</h4>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleMoveStep(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 bg-[var(--admin-card)] hover:bg-white/5 rounded-lg text-[var(--admin-text-secondary)] hover:text-white disabled:opacity-30 transition-colors"
                          title="Move Slide Up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          onClick={() => handleMoveStep(idx, 'down')}
                          disabled={idx === steps.length - 1}
                          className="p-1.5 bg-[var(--admin-card)] hover:bg-white/5 rounded-lg text-[var(--admin-text-secondary)] hover:text-white disabled:opacity-30 transition-colors"
                          title="Move Slide Down"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteStep(idx)}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg text-rose-400 transition-colors ml-2"
                          title="Delete Step"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Inputs Matrix */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-secondary)] mb-1.5">Slide Main Title</label>
                        <input 
                          type="text"
                          value={step.title}
                          onChange={(e) => handleUpdateStep(idx, 'title', e.target.value)}
                          placeholder="e.g. Welcome to Vasanthi Creations"
                          className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-secondary)] mb-1.5">Accent Subtitle</label>
                        <input 
                          type="text"
                          value={step.subtitle}
                          onChange={(e) => handleUpdateStep(idx, 'subtitle', e.target.value)}
                          placeholder="e.g. Where Tradition Meets Modern Elegance"
                          className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors font-semibold"
                        />
                      </div>
                    </div>

                    <div className="mb-5">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-secondary)] mb-1.5">Slide Paragraph Content</label>
                      <textarea 
                        rows={2}
                        value={step.content}
                        onChange={(e) => handleUpdateStep(idx, 'content', e.target.value)}
                        placeholder="Provide deep luxury descriptors guiding clients along their tailoring journey..."
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none leading-relaxed"
                      />
                    </div>

                    {/* Theming Pickers Matrix */}
                    <div className="flex flex-col sm:flex-row gap-6 pt-3 border-t border-white/5 justify-between items-start sm:items-center">
                      {/* Icon Selector */}
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-[var(--admin-text-secondary)] mb-2">Display Vector Icon</label>
                        <div className="flex flex-wrap items-center gap-2">
                          {availableIcons.map((ic) => {
                            const CurrIcon = ic.icon;
                            const isSelected = step.icon === ic.name;
                            return (
                              <button
                                type="button"
                                key={ic.name}
                                onClick={() => handleUpdateStep(idx, 'icon', ic.name)}
                                className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                                  isSelected 
                                    ? 'bg-blue-500/20 border-blue-500 text-blue-400 scale-105 shadow-md shadow-blue-500/10' 
                                    : 'bg-black/30 border-white/5 text-gray-500 hover:text-gray-300 hover:bg-black/50'
                                }`}
                                title={ic.name}
                              >
                                <CurrIcon size={16} />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Color Selector */}
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-[var(--admin-text-secondary)] mb-2 sm:text-right">Aesthetic Color Palette</label>
                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                          {availableColors.map((col) => {
                            const isSelected = step.color === col.name;
                            return (
                              <button
                                type="button"
                                key={col.name}
                                onClick={() => handleUpdateStep(idx, 'color', col.name)}
                                className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 transition-all ${
                                  isSelected 
                                    ? `${col.bg}/20 ${col.border} ${col.text} scale-105 shadow-md` 
                                    : 'bg-black/30 border-white/5 text-gray-500 hover:text-gray-300'
                                }`}
                              >
                                <span className={`w-2 h-2 rounded-full ${col.bg}`} />
                                {col.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}

              {/* Add Step & Save Action Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <button
                  onClick={handleAddStep}
                  className="w-full sm:w-auto bg-[var(--admin-card)] hover:bg-white/5 border border-dashed border-[var(--admin-card-border)] hover:border-blue-500/50 text-[var(--admin-text-primary)] px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group"
                >
                  <Plus size={16} className="text-blue-500 group-hover:scale-110 transition-transform" />
                  Append New Slide Step
                </button>

                <button
                  onClick={() => handleSave()}
                  disabled={saveMutation.isPending}
                  className="w-full sm:w-auto flex-grow bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95"
                >
                  <Save size={16} />
                  {saveMutation.isPending ? 'Saving...' : 'Save Configuration Pipeline'}
                </button>
              </div>
            </div>
          ) : (
            /* Live Storefront Preview Emulation */
            <div className="p-8 bg-neutral-950 border border-[var(--admin-card-border)] rounded-3xl flex items-center justify-center relative min-h-[500px]">
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Live Emulation Preview</span>
              </div>

              {steps.length > 0 ? (
                (() => {
                  const curr = steps[previewStep] || steps[0];
                  const TargetIcon = availableIcons.find(i => i.name === curr.icon)?.icon || Sparkles;
                  return (
                    <div className="w-full max-w-lg bg-white rounded-[32px] shadow-2xl p-10 text-center relative overflow-hidden transition-all duration-300">
                      {/* Sub-bg accents matching client app theme injection */}
                      <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full -mr-20 -mt-20 blur-2xl" />
                      
                      <div className="flex flex-col items-center relative z-10">
                        <div className={`p-5 bg-black/5 text-gray-900 rounded-3xl mb-6 shadow-sm`}>
                          <TargetIcon size={36} strokeWidth={1.5} />
                        </div>

                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-1.5">
                          {curr.title || 'Untitled Title'}
                        </h2>
                        
                        <p className="text-[9px] text-blue-600 font-black uppercase tracking-[0.25em] mb-4">
                          {curr.subtitle || 'Subtitle Header'}
                        </p>

                        <p className="text-xs text-gray-600 font-medium leading-relaxed max-w-sm mx-auto mb-8">
                          {curr.content || 'Content text will output dynamically here...'}
                        </p>

                        {/* Slider Progress simulation */}
                        <div className="flex items-center gap-1.5 mb-8">
                          {steps.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setPreviewStep(idx)}
                              className={`h-1.5 transition-all duration-300 rounded-full ${
                                idx === previewStep ? 'w-6 bg-blue-600' : 'w-2 bg-gray-200 hover:bg-gray-300'
                              }`}
                              title={`Slide ${idx + 1}`}
                            />
                          ))}
                        </div>

                        <button 
                          onClick={() => setPreviewStep((previewStep + 1) % steps.length)}
                          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/10 transition-all"
                        >
                          {previewStep === steps.length - 1 ? 'Start Exploring' : 'Continue Journey'}
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <p className="text-xs font-bold text-neutral-600 italic">No slides added to render preview.</p>
              )}
            </div>
          )}
        </div>

        {/* Right Span: Guide & Context Summary Cards */}
        <div className="space-y-6">
          <GlassCard title="Execution Strategy" subtitle="Visitor Presentation Engine">
            <div className="space-y-4 text-xs text-[var(--admin-text-secondary)] leading-relaxed mt-3">
              <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl flex gap-3">
                <span className="text-blue-400 font-bold">1.</span>
                <p>
                  <strong className="text-[var(--admin-text-primary)]">Exclusive First-Time Check:</strong> The client app reads localStorage identifier <code className="text-blue-400 font-bold bg-black/30 px-1 py-0.5 rounded">onboarding_wizard_seen</code>. If missing, this premium pipeline slides up instantly.
                </p>
              </div>

              <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex gap-3">
                <span className="text-emerald-400 font-bold">2.</span>
                <p>
                  <strong className="text-[var(--admin-text-primary)]">Priority Coexistence:</strong> Takes baseline precedence prior to targeted Welcome promotional banners to guarantee comprehensive foundational catalog introductions.
                </p>
              </div>

              <div className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl flex gap-3">
                <span className="text-purple-400 font-bold">3.</span>
                <p>
                  <strong className="text-[var(--admin-text-primary)]">Seamless Array Sorting:</strong> Use the positional indicators inside the module headers to fine-tune progression hooks cleanly.
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard title="Quick Automation Preset" subtitle="Restore default layout state">
            <p className="text-xs text-[var(--admin-text-secondary)] mt-2 leading-relaxed">
              Want to pull up standard boutique default messages for measurements and tailored items?
            </p>
            <button
              onClick={() => {
                setSteps([
                  {
                    title: 'Welcome to Vasanthi Creations',
                    subtitle: 'Where Tradition Meets Modern Elegance',
                    content: 'Experience the finest designer blouses and sarees, tailored specifically for you. Let us guide you through your luxury journey.',
                    icon: 'Sparkles',
                    color: 'blue'
                  },
                  {
                    title: 'Discover Your Style',
                    subtitle: 'Curated Collections for Every Occasion',
                    content: 'From bridal masterpieces to contemporary designer wear, our collections are crafted to make you stand out.',
                    icon: 'Heart',
                    color: 'rose'
                  },
                  {
                    title: 'Perfect Fit, Guaranteed',
                    subtitle: 'Smart Measurement & Custom Tailoring',
                    content: 'Save your measurements once and enjoy a perfect fit for all future orders. Our experts ensure precision in every stitch.',
                    icon: 'Ruler',
                    color: 'amber'
                  },
                  {
                    title: 'Let’s Get Started',
                    subtitle: 'Your Personal Boutique Experience',
                    content: 'Create your profile to save favorites, track orders, and receive exclusive styling consultations.',
                    icon: 'ShoppingBag',
                    color: 'emerald'
                  }
                ]);
                toast.success('Restored default onboarding template slides');
              }}
              className="mt-4 w-full bg-black/40 hover:bg-black/60 border border-white/5 text-gray-300 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={12} className="text-blue-400" /> Restore Starter Slides
            </button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizardPage;
