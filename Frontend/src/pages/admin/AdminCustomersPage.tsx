import { useState, useEffect } from 'react';
import { DataTable } from '../../components/admin/DataTable';
import { userService } from '../../api/services/user.service';
import type { UserNode } from '../../api/services/user.service';
import { Users, Shield, AlertCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminCustomersPage = () => {
  const [users, setUsers] = useState<UserNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
       const res = await userService.getAdminUsers({ page, limit: pagination.limit });
       if (res) {
          const fetchedData = (res as any).data?.users || (res as any).data?.data || (res as any).data || [];
          const arr = Array.isArray(fetchedData) ? fetchedData : Object.values(fetchedData);
          setUsers(arr);
          
          if ((res as any).data?.pagination) {
             setPagination({
                page: (res as any).data.pagination.page,
                limit: (res as any).data.pagination.limit,
                total: (res as any).data.pagination.total
             });
          } else {
             setPagination(prev => ({ ...prev, total: arr.length || 0 }));
          }
       }
    } catch (e: any) {
       console.warn("User Fetch Error", e);
       toast.error("Failed to load global User registry.");
       setUsers([]);
    } finally {
       setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(pagination.page);
  }, [pagination.page]);

  const handleBlock = async (id: string, isBlocked: boolean, name: string) => {
     try {
        await userService.blockUser(id, !isBlocked, !isBlocked ? 'Admin UI Override' : '');
        toast.success(`User [${name}] ${!isBlocked ? 'restricted' : 'restored'}.`);
        fetchUsers(pagination.page);
     } catch (e) {
        toast.error("Error mutating User access context.");
     }
  };

  const columns = [
    { 
       header: 'Identity Node', 
       accessor: (row: UserNode) => (
         <div className="max-w-xs">
           <span className="block font-medium tracking-wide text-primary-950 text-sm truncate">{row.name}</span>
           <span className="block text-[0.65rem] text-gray-500 font-mono mt-0.5 tracking-wide uppercase">{row._id.substring(0,10)}</span>
         </div>
       )
    },
    { 
       header: 'Contact Trace', 
       accessor: (row: UserNode) => (
         <div>
           <span className="block text-sm text-gray-800 font-mono">{row.email}</span>
           <span className="block text-xs text-gray-500 mt-0.5">{row.mobile || 'No Mobile Provisioned'}</span>
         </div>
       )
    },
    { 
       header: 'Access Level', 
       accessor: (row: UserNode) => {
         const isAd = row.role === 'admin' || row.role === 'super_admin';
         return (
           <span className={`inline-flex px-2 py-1 rounded text-[0.65rem] font-bold tracking-widest uppercase ${isAd ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
              {row.role}
           </span>
         );
       }
    },
    { 
       header: 'System State', 
       accessor: (row: UserNode) => {
         return (
           <span 
              onClick={(e) => { e.stopPropagation(); handleBlock(row._id, row.isBlocked || false, row.name); }}
              title="Toggle Security State"
              className={`cursor-pointer inline-flex px-2.5 py-1 rounded text-[0.65rem] font-bold tracking-widest uppercase border transition-colors hover:brightness-95 ${!row.isBlocked ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
           >
              {!row.isBlocked ? 'ACTIVE' : 'RESTRICTED'}
           </span>
         );
       }
    },
    {
       header: 'Actions',
       accessor: (row: UserNode) => (
         <div className="flex items-center space-x-2">
           <button className="p-1.5 text-gray-400 hover:text-primary-700 transition-colors" title="Investigate CRM Activity">
             <FileText size={16} />
           </button>
           <button onClick={() => handleBlock(row._id, row.isBlocked || false, row.name)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Toggle Blacklist">
             {row.isBlocked ? <Shield size={16} /> : <AlertCircle size={16} />}
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
            <Users className="w-6 h-6 mr-3 text-primary-700" /> Identity Access Management
          </h1>
          <p className="text-sm text-gray-500">Track Customer lifecycles, assign access variables, and isolate malicious nodes.</p>
        </div>
      </div>

      <DataTable 
         columns={columns as any}
         data={users}
         loading={loading}
         emptyMessage="No customer records located in the master data volume."
         pagination={{
           page: pagination.page,
           limit: pagination.limit,
           total: Math.max(pagination.total, users.length),
           onPageChange: (newPage) => setPagination({...pagination, page: newPage})
         }}
      />
    </div>
  );
};

export default AdminCustomersPage;
