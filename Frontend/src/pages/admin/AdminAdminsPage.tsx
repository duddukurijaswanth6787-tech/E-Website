import { useState, useEffect } from 'react';
import { DataTable } from '../../components/admin/DataTable';
import { adminService } from '../../api/services/admin.service';
import type { AdminNode } from '../../api/services/admin.service';
import { Shield, Plus, Trash, Key } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminAdminsPage = () => {
  const [admins, setAdmins] = useState<AdminNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const fetchAdmins = async (page = 1) => {
    setLoading(true);
    try {
       const res = await adminService.getAdmins({ page, limit: pagination.limit });
       if (res && res.data) {
          const fetchedData = (res as any).data.admins || (res as any).data.data || res.data || [];
          setAdmins(Array.isArray(fetchedData) ? fetchedData : Object.values(fetchedData));
          
          if ((res as any).data.pagination) {
             setPagination({
                page: (res as any).data.pagination.page,
                limit: (res as any).data.pagination.limit,
                total: (res as any).data.pagination.total
             });
          }
       }
    } catch (e: any) {
       console.error("Admin Fetch Error", e);
       toast.error("Failed to load Staff Directory.");
    } finally {
       setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins(pagination.page);
  }, [pagination.page]);

  const toggleStatus = async (id: string, current: boolean) => {
     try {
        await adminService.updateAdminStatus(id, !current);
        toast.success("Security state updated.");
        fetchAdmins(pagination.page);
     } catch (e) {
        toast.error("Failed to mutate Admin state.");
     }
  };

  const handleDelete = async (id: string, name: string) => {
     if (!window.confirm(`Relinquish administrative power for [${name}]? Action is irreversible.`)) return;
     try {
        await adminService.deleteAdmin(id);
        toast.success("Admin node decommissioned.");
        fetchAdmins(pagination.page);
     } catch (e) {
        toast.error("Error trashing Admin record.");
     }
  };

  const columns = [
    { 
       header: 'System Identity', 
       accessor: (row: AdminNode) => (
         <div className="flex items-center space-x-3">
           <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
             {row.name.charAt(0)}
           </div>
           <div>
             <span className="block font-medium tracking-wide text-primary-950 text-sm">{row.name}</span>
             <span className="block text-[0.65rem] text-gray-400 font-mono uppercase">{row._id.substring(0,8)}</span>
           </div>
         </div>
       )
    },
    { 
       header: 'Credentials', 
       accessor: (row: AdminNode) => (
         <span className="text-sm text-gray-600 font-mono tracking-tight">{row.email}</span>
       )
    },
    { 
       header: 'Role Matrix', 
       accessor: (row: AdminNode) => (
         <span className={`inline-flex px-2 py-0.5 rounded text-[0.65rem] font-bold tracking-widest uppercase border ${row.role === 'super_admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
            {row.role.replace('_', ' ')}
         </span>
       )
    },
    { 
       header: 'State', 
       accessor: (row: AdminNode) => (
         <button 
           onClick={() => toggleStatus(row._id, row.isActive)}
           className={`inline-flex px-2.5 py-1 rounded text-[0.65rem] font-black tracking-widest uppercase transition-colors hover:brightness-95 border ${row.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
         >
            {row.isActive ? 'AUTHORIZED' : 'LOCKED'}
         </button>
       )
    },
    {
       header: 'Actions',
       accessor: (row: AdminNode) => (
         <div className="flex items-center space-x-2">
           <button className="p-1.5 text-gray-400 hover:text-primary-700 transition-colors" title="Adjust Scopes">
             <Key size={16} />
           </button>
           <button onClick={() => handleDelete(row._id, row.name)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Decommission Node">
             <Trash size={16} />
           </button>
         </div>
       )
    }
  ];

  return (
    <div className="space-y-6 max-w-[100vw] overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-serif text-gray-900 mb-1 flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary-700" /> Administrative Directory
          </h1>
          <p className="text-sm text-gray-500">Manage internal staff authorizations, security roles, and system access boundaries.</p>
        </div>
        <button className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-primary-950 text-white text-sm font-bold tracking-widest uppercase rounded shadow hover:bg-primary-800 transition-colors">
          <Plus size={16} className="mr-2" />
          Provision Admin
        </button>
      </div>

      <DataTable 
         columns={columns as any}
         data={admins}
         loading={loading}
         emptyMessage="No administrative delegates configured in the security registry."
         pagination={{
           page: pagination.page,
           limit: pagination.limit,
           total: Math.max(pagination.total, admins.length),
           onPageChange: (newPage) => setPagination({...pagination, page: newPage})
         }}
      />
    </div>
  );
};

export default AdminAdminsPage;
