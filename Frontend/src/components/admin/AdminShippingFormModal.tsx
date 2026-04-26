import React from 'react';

export type ShippingFormState = {
  region: string;
  method: string;
  cost: number | '';
  minOrderValue: number | '';
  isActive: boolean;
  notes: string;
};

export const emptyShippingForm = (): ShippingFormState => ({
  region: '',
  method: '',
  cost: '',
  minOrderValue: '',
  isActive: true,
  notes: '',
});

interface AdminShippingFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  saving: boolean;
  form: ShippingFormState;
  setForm: React.Dispatch<React.SetStateAction<ShippingFormState>>;
  onClose: () => void;
  onSave: () => void;
}

const AdminShippingFormModal: React.FC<AdminShippingFormModalProps> = ({
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
        className="w-[95vw] sm:w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0 bg-white">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {mode === 'create' ? 'Add Delivery Tier' : 'Edit Logistic Parameters'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Configure global shipping boundaries and baseline tariffs.
            </p>
          </div>
          <button type="button" className="text-gray-400 hover:text-gray-700" onClick={onClose} disabled={saving}>
            ✕
          </button>
        </div>

        <div className="px-6 py-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Service Region</label>
            <input
              value={form.region}
              onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="e.g. Domestic (India) or International Tier 1"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Shipping Method Name</label>
            <input
              value={form.method}
              onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="e.g. Standard Delivery or Express Air"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Base Tariff (₹)</label>
              <input
                type="number"
                value={form.cost}
                onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value === '' ? '' : Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. 150"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Free Shipping Threshold (₹)</label>
              <input
                type="number"
                value={form.minOrderValue}
                onChange={(e) => setForm((f) => ({ ...f, minOrderValue: e.target.value === '' ? '' : Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Unlimited if empty"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Internal Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm min-h-[60px]"
              placeholder="Delivery partner details, timeline estimates…"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-bold tracking-widest uppercase text-gray-600 group-hover:text-primary-700 transition-colors">Operational & Active</span>
            </label>
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
            {saving ? 'Syncing…' : mode === 'create' ? 'Add Tier' : 'Update Tier'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminShippingFormModal;
