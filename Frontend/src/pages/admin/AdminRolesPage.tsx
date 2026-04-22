import { useState, useEffect } from 'react';
import { roleService } from '../../api/services/role.service';
import type { RoleMatrix } from '../../api/services/role.service';
import { Lock, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminRolesPage = () => {
  const [data, setData] = useState<RoleMatrix | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const [roleRes, permRes] = await Promise.all([
        roleService.getRoles(),
        roleService.getPermissionsList()
      ]);
      if (roleRes && roleRes.data) setData((roleRes as any).data.data || roleRes.data);
      if (permRes && permRes.data) setPermissions((permRes as any).data.data || permRes.data);
    } catch (e) {
      console.error("Role Fetch Error", e);
      toast.error('Failed to load logical Security Matrix.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <div className="space-y-6 max-w-[100vw] overflow-hidden">
      <div>
        <h1 className="text-2xl font-serif text-gray-900 mb-1 flex items-center gap-3">
          <Lock className="w-6 h-6 text-primary-700" /> Roles & Security Matrix
        </h1>
        <p className="text-sm text-gray-500">Configure global access boundaries, map system operations, and audit administrative inheritance.</p>
      </div>

      <div className="bg-blue-50 border border-blue-100 text-blue-800 px-4 py-3 rounded-lg text-sm flex items-start shadow-sm shadow-blue-900/5 mb-6">
        <div className="mr-3 mt-0.5 opacity-70">
          <Lock size={18} />
        </div>
        <div>
          <span className="font-bold block tracking-wide">Static Role Hardcoding Exposed</span>
          The system currently derives operation logic from predefined constants in the backend. Direct editing is deferred for total schema isolation, but matrix visibility is now live.
        </div>
      </div>

      {loading ? (
           <div className="py-16 flex justify-center items-center">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-800 rounded-full animate-spin"></div>
           </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm bg-gradient-to-b from-white to-gray-50/30">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400 w-64">Permission String</th>
                {data?.roles.map(role => (
                   <th key={role} className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-700 text-center border-l border-gray-100">
                      {role.replace('_', ' ')}
                   </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map(perm => (
                <tr key={perm} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium text-gray-800 tracking-tight group-hover:text-primary-800">
                    {perm.split('_').join(' ')}
                    <span className="block text-[0.6rem] font-mono text-gray-400 group-hover:text-primary-400 mt-0.5 uppercase tracking-tighter">{perm}</span>
                  </td>
                  {data?.roles.map(role => {
                    const hasAccess = data.rolePermissions[role]?.includes(perm);
                    return (
                      <td key={`${role}-${perm}`} className="px-6 py-4 text-center border-l border-gray-100">
                        {hasAccess ? (
                           <div className="flex justify-center">
                             <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center text-green-600 border border-green-200/50 shadow-sm">
                               <Check size={14} strokeWidth={4} />
                             </div>
                           </div>
                        ) : (
                           <div className="flex justify-center opacity-10 font-black text-gray-900">—</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminRolesPage;
