import React from 'react';
import { Input } from '../common/Input';
import { ImageUploader } from './ImageUploader';

export type BlogFormState = {
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  status: 'DRAFT' | 'PUBLISHED';
  tagsCsv: string;
};

export const emptyBlogForm = (): BlogFormState => ({
  title: '',
  excerpt: '',
  content: '',
  coverImage: '',
  status: 'DRAFT',
  tagsCsv: '',
});

interface AdminBlogFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  saving: boolean;
  form: BlogFormState;
  setForm: React.Dispatch<React.SetStateAction<BlogFormState>>;
  onClose: () => void;
  onSave: () => void;
}

const AdminBlogFormModal: React.FC<AdminBlogFormModalProps> = ({
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
        className="w-[95vw] sm:w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0 bg-white">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {mode === 'create' ? 'Write New Editorial' : 'Edit Blog Post'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Curate content to drive SEO and brand story narratives.
            </p>
          </div>
          <button type="button" className="text-gray-400 hover:text-gray-700" onClick={onClose} disabled={saving}>
            ✕
          </button>
        </div>

        <div className="px-6 py-6 space-y-4 overflow-y-auto max-h-[75vh] sidebar-scrollbar">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Input
                label="Article Title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="The Art of Draping Kanjivaram…"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                  <ImageUploader
                    label="Cover Image"
                    value={form.coverImage}
                    onChange={url => setForm(f => ({ ...f, coverImage: url }))}
                    folder="blogs"
                  />
               </div>
               <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
               </div>
            </div>

            {/* ... image preview */}

            <div>
              <Input
                label="Excerpt / Summary"
                multiline
                rows={3}
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                placeholder="A short summary for the blog listing page…"
                showCharCount
                maxLength={200}
              />
            </div>

            <div>
              <Input
                label="Full Article Content (Markdown/HTML Support)"
                multiline
                rows={12}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                className="font-mono"
                placeholder="Write your story here…"
              />
            </div>

            <div>
              <Input
                label="Tags (Comma separated)"
                value={form.tagsCsv}
                onChange={(e) => setForm((f) => ({ ...f, tagsCsv: e.target.value }))}
                placeholder="silk, styling, wedding, kanjivaram"
              />
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
            {saving ? 'Publishing…' : mode === 'create' ? 'Publish Story' : 'Update Editorial'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminBlogFormModal;
