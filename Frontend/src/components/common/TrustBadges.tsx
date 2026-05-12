import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Award } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

export const TrustBadges: React.FC<{ variant?: 'minimal' | 'full' }> = ({ variant = 'full' }) => {
  const isEnabled = useSettingsStore((state) => state.isFeatureEnabled('storefront', 'trustBadges'));

  if (!isEnabled) return null;

  const badges = [
    { icon: ShieldCheck, title: 'Secure Checkout', desc: 'PCI Compliant Payments' },
    { icon: Truck, title: 'Express Delivery', desc: 'Insured Logistics' },
    { icon: RotateCcw, title: 'Quality Assured', desc: 'Hand-inspected Garments' },
    { icon: Award, title: 'Heritage Certified', desc: 'Authentic Weaves Only' }
  ];

  if (variant === 'minimal') {
    return (
      <div className="flex flex-wrap gap-6 py-6 border-y border-gray-100">
        {badges.map((b, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-700">
              <b.icon size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary-950">{b.title}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {badges.map((b, i) => (
        <div key={i} className="bg-white p-6 rounded-3xl border border-primary-50 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-2xl bg-primary-950 text-white flex items-center justify-center mb-4">
            <b.icon size={20} />
          </div>
          <h4 className="text-xs font-black uppercase tracking-widest text-primary-950 mb-1">{b.title}</h4>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{b.desc}</p>
        </div>
      ))}
    </div>
  );
};
