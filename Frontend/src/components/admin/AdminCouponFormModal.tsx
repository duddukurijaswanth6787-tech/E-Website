import React from 'react';

export type CouponFormState = {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number | '';
  minOrderValue: number | '';
  maxDiscount: number | '';
  validFrom: string;
  validUntil: string;
  usageLimit: number | '';
  isActive: boolean;
};

export const emptyCouponForm = (): CouponFormState => ({
  code: '',
  discountType: 'PERCENTAGE',
  discountValue: '',
  minOrderValue: '',
  maxDiscount: '',
  validFrom: new Date().toISOString().split('T')[0],
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  usageLimit: '',
  isActive: true,
});

interface AdminCouponFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  saving: boolean;
  form: CouponFormState;
  setForm: React.Dispatch<React.SetStateAction<CouponFormState>>;
  onClose: () => void;
  onSave: () => void;
}

const AdminCouponFormModal: React.FC<AdminCouponFormModalProps> = ({
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
              {mode === 'create' ? 'Generate Coupon' : 'Edit Coupon Logic'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Configure discount vouchers and marketing promo triggers.
            </p>
          </div>
          <button type="button" className="text-gray-400 hover:text-gray-700" onClick={onClose} disabled={saving}>
            ✕
          </button>
        </div>

        <div className="px-6 py-6 space-y-4 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Coupon Code</label>
              <input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase().replace(/\s/g, '') }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono tracking-widest focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="e.g. FESTIVE50"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Discount Type</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value as any }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Discount Value</label>
              <input
                type="number"
                value={form.discountValue}
                onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value === '' ? '' : Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder={form.discountType === 'PERCENTAGE' ? 'e.g. 10' : 'e.g. 500'}
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Min Order Value (₹)</label>
              <input
                type="number"
                value={form.minOrderValue}
                onChange={(e) => setForm((f) => ({ ...f, minOrderValue: e.target.value === '' ? '' : Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. 1000"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Max Discount (₹)</label>
              <input
                type="number"
                value={form.maxDiscount}
                onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value === '' ? '' : Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. 2000"
                disabled={form.discountType === 'FIXED'}
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Valid From</label>
              <input
                type="date"
                value={form.validFrom}
                onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Valid Until</label>
              <input
                type="date"
                value={form.validUntil}
                onChange={(e) => setForm((f) => ({ ...f, validUntil: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Usage Limit</label>
              <input
                type="number"
                value={form.usageLimit}
                onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value === '' ? '' : Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Unlimited if empty"
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
                <span className="text-sm font-bold tracking-widest uppercase text-gray-600 group-hover:text-primary-700 transition-colors">Active & Deployable</span>
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
            {saving ? 'Processing…' : mode === 'create' ? 'Generate' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCouponFormModal;
