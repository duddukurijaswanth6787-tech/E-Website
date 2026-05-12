import { useState, useEffect } from 'react';
import { DataTable } from '../../components/admin/DataTable';
import { blogService } from '../../api/services/blog.service';
import type { BlogPost } from '../../api/services/blog.service';
import { FileText, Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminBlogFormModal, { emptyBlogForm, type BlogFormState } from '../../components/admin/AdminBlogFormModal';

const AdminBlogsPage = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activeBlog, setActiveBlog] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<BlogFormState>(emptyBlogForm());

  const fetchBlogs = async (page = 1) => {
    setLoading(true);
    try {
       // Using the unconstrained admin endpoint
       const res = await blogService.getAdminBlogs({ page, limit: pagination.limit });
       if (res) {
          const fetchedData = (res as any).data?.blogs || (res as any).data?.data || (res as any).data || [];
          const blogArray = Array.isArray(fetchedData) ? fetchedData : Object.values(fetchedData);
          setBlogs(blogArray);
          
          if ((res as any).data?.pagination) {
             setPagination({
                page: (res as any).data.pagination.page,
                limit: (res as any).data.pagination.limit,
                total: (res as any).data.pagination.total
             });
          } else {
             setPagination(prev => ({ ...prev, total: blogArray.length || 0 }));
          }
       }
    } catch (e: any) {
       console.error("Blog Admin Fetch Failed", e);
       if (e?.response?.status === 404) {
          toast.error("Backend Gap: GET /api/v1/blogs/admin missing. Falling back to public getter.");
          fallbackFetch();
       } else {
          toast.error("Failed to load CMS nodes.");
          setBlogs([]);
       }
    } finally {
       setLoading(false);
    }
  };

  const fallbackFetch = async () => {
     try {
       const res = await blogService.getBlogs();
       if (res) {
          const arr = (res as any).data?.blogs || (res as any).data?.data || (res as any).data || [];
          setBlogs(Array.isArray(arr) ? arr : Object.values(arr));
       }
     } catch (e) {
       setBlogs([]);
     }
  };

  useEffect(() => {
    fetchBlogs(pagination.page);
  }, [pagination.page]);

  const openCreate = () => {
    setModalMode('create');
    setActiveBlog(null);
    setForm(emptyBlogForm());
    setModalOpen(true);
  };

  const openEdit = (b: BlogPost) => {
    setModalMode('edit');
    setActiveBlog(b);
    setForm({
      title: b.title || '',
      excerpt: b.excerpt || '',
      content: b.content || '',
      coverImage: b.coverImage || '',
      status: (b.status?.toUpperCase() === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT') as any,
      tagsCsv: Array.isArray(b.tags) ? b.tags.join(', ') : '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('Blog title is required');
    if (!form.content.trim()) return toast.error('Full article content is required');
    
    const tags = form.tagsCsv.split(',').map(t => t.trim()).filter(Boolean);
    const payload = { ...form, tags };

    setSaving(true);
    try {
      if (modalMode === 'create') {
        await blogService.createBlog(payload);
        toast.success('Editorial published successfully');
      } else if (activeBlog?._id) {
        await blogService.updateBlog(activeBlog._id, payload);
        toast.success('Editorial updated successfully');
      }
      setModalOpen(false);
      fetchBlogs(pagination.page);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save editorial');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
     if (!window.confirm(`Warning: Deleting the Blog [${title}] removes it globally. Proceed?`)) return;
     try {
        await blogService.deleteBlog(id);
        toast.success(`Post archived successfully.`);
        fetchBlogs(pagination.page);
     } catch (e) {
        toast.error("Error mutating post state.");
     }
  };

  const columns = [
    { 
       header: 'CMS Visual', 
       accessor: (row: BlogPost) => (
         <div className="flex items-center space-x-3">
           <div className="w-16 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
             <img src={row.coverImage || 'https://placehold.co/160x100?text=BLOG'} alt={row.title} className="w-full h-full object-cover" />
           </div>
           <div>
             <span className="block font-medium tracking-wide text-primary-950 truncate max-w-[200px]">{row.title}</span>
             <span className="block text-xs text-[var(--admin-text-secondary)] font-mono mt-0.5">/{row.slug}</span>
           </div>
         </div>
       )
    },
    { 
       header: 'Author Node', 
       accessor: (row: BlogPost) => {
         const authorName = typeof row.author === 'string' ? row.author : row.author?.name || 'Vasanthi Editor';
         return (
           <div>
             <span className="block font-medium text-gray-800 text-sm">{authorName}</span>
             <span className="block text-[0.65rem] tracking-widest uppercase text-[var(--admin-text-secondary)] mt-0.5">
               {new Date(row.createdAt || Date.now()).toLocaleDateString()}
             </span>
           </div>
         );
       }
    },
    { 
       header: 'Status', 
       accessor: (row: BlogPost) => {
         const isPub = row.status === 'PUBLISHED' || row.status === 'live';
         return (
           <span className={`inline-flex px-2 py-1 rounded text-[0.65rem] font-bold tracking-widest uppercase ${isPub ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
              {isPub ? 'PUBLISHED' : 'DRAFT'}
           </span>
         );
       }
    },
     {
        header: 'Actions',
        accessor: (row: BlogPost) => (
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => openEdit(row)}
              className="p-1.5 text-gray-400 hover:text-primary-700 transition-colors" 
              title="Edit Post"
            >
              <Edit2 size={16} />
            </button>
            <button onClick={() => handleDelete(row._id, row.title)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Trash Node">
              <Trash2 size={16} />
            </button>
          </div>
        )
     }
  ];

  return (
    <div className="space-y-6 max-w-[100vw] overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-serif text-gray-900 mb-1 flex items-center">
            <FileText className="w-6 h-6 mr-3 text-primary-700" /> Blog CMS Manager
          </h1>
          <p className="text-sm text-[var(--admin-text-secondary)]">Curate styled editorials, styling tips, and SEO content networks.</p>
        </div>
         <div className="mt-4 sm:mt-0">
            <button 
              onClick={openCreate}
              className="flex items-center px-4 py-2 bg-primary-950 text-[var(--admin-text-primary)] text-sm font-bold tracking-widest uppercase rounded shadow hover:bg-primary-800 transition-colors"
            >
               <Plus size={16} className="mr-2" />
               Write Editorial
            </button>
         </div>
      </div>

       <DataTable 
          columns={columns as any}
          data={blogs}
          loading={loading}
          emptyMessage="No editorials or knowledge-base posts are currently registered."
          pagination={{
            page: pagination.page,
            limit: pagination.limit,
            total: Math.max(pagination.total, blogs.length),
            onPageChange: (newPage) => setPagination({...pagination, page: newPage})
          }}
       />

       <AdminBlogFormModal 
         open={modalOpen}
         mode={modalMode}
         saving={saving}
         form={form}
         setForm={setForm}
         onClose={closeModal}
         onSave={handleSave}
       />
    </div>
  );
};

export default AdminBlogsPage;


