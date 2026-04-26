import React from 'react';

export type CollectionFormState = {
  name: string;
  description: string;
  banner: string;
};

export const emptyCollectionForm = (): CollectionFormState => ({
  name: '',
  description: '',
  banner: '',
});

interface AdminCollectionFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  saving: boolean;
  form: CollectionFormState;
  setForm: React.Dispatch<React.SetStateAction<CollectionFormState>>;
  onClose: () => void;
  onSave: () => void;
}

const AdminCollectionFormModal: React.FC<AdminCollectionFormModalProps> = ({
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
              {mode === 'create' ? 'Create Collection' : 'Edit Collection'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Collections group products under thematic narratives.
            </p>
          </div>
          <button type="button" className="text-gray-400 hover:text-gray-700" onClick={onClose} disabled={saving}>
            ✕
          </button>
        </div>

        <div className="px-6 py-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Collection Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-shadow"
              placeholder="e.g. Bridal Splendour 2024"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Marketing Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm min-h-[100px] focus:ring-2 focus:ring-primary-500 outline-none transition-shadow"
              placeholder="Thematic copy for the collection page…"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Banner Visual URL</label>
            <input
              value={form.banner}
              onChange={(e) => setForm((f) => ({ ...f, banner: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-shadow"
              placeholder="https://images.unsplash.com/..."
            />
            {form.banner && (
              <div className="mt-3 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                <img src={form.banner} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
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
            {saving ? 'Saving…' : mode === 'create' ? 'Create' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCollectionFormModal;
