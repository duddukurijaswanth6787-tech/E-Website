import React from 'react';
import { ImageUploader } from './ImageUploader';

export type BannerFormState = {
  title: string;
  subtitle: string;
  imageUrl: string;
  link: string;
  placement: string;
  isActive: boolean;
  order: number;
};

export const emptyBannerForm = (): BannerFormState => ({
  title: '',
  subtitle: '',
  imageUrl: '',
  link: '',
  placement: 'HERO_SLIDER',
  isActive: true,
  order: 1,
});

interface AdminBannerFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  saving: boolean;
  form: BannerFormState;
  setForm: React.Dispatch<React.SetStateAction<BannerFormState>>;
  onClose: () => void;
  onSave: () => void;
}

const AdminBannerFormModal: React.FC<AdminBannerFormModalProps> = ({
  open,
  mode,
  saving,
  form,
  setForm,
  onClose,
  onSave,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={onClose}>
      <div
        className="w-[95vw] sm:w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0 bg-white">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {mode === 'create' ? 'Upload Banner' : 'Edit Banner Imagery'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Marketing visuals that define the storefront aesthetic.
            </p>
          </div>
          <button type="button" className="text-gray-400 hover:text-gray-700" onClick={onClose} disabled={saving}>
            ✕
          </button>
        </div>

        <div className="px-6 py-6 space-y-4 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Banner Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="e.g. Summer Silk Collection"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Subtitle / Call to Action</label>
              <input
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="e.g. Shop the latest handloom arrivals"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Banner Image</label>
              <ImageUploader
                value={form.imageUrl}
                onChange={url => setForm((f) => ({ ...f, imageUrl: url }))}
                folder="banners"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Navigation Link</label>
              <input
                value={form.link}
                onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                placeholder="e.g. /shop/sarees"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Placement Zone</label>
              <select
                value={form.placement}
                onChange={(e) => setForm((f) => ({ ...f, placement: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="HERO_SLIDER">Hero Slider (Main)</option>
                <option value="PROMO_GRID">Promotional Grid</option>
                <option value="OFFER_BANNER">Offer / Strip Banner</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Sequence Order</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                min={1}
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-bold tracking-widest uppercase text-gray-600 group-hover:text-primary-700 transition-colors">Visible in UI</span>
              </label>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-bold tracking-widest uppercase text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-primary-950 text-white text-sm font-bold tracking-widest uppercase hover:bg-primary-800 disabled:opacity-60 transition-colors shadow-soft"
          >
            {saving ? 'Uploading…' : mode === 'create' ? 'Publish' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminBannerFormModal;
