import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Filter, Search, Clock, AlertTriangle, Activity, Calendar } from 'lucide-react';
import { adminWorkflowService } from '../../api/services/adminWorkflow.service';
import { adminTailorService } from '../../api/services/adminTailor.service';
import { useAuthStore } from '../../store/authStore';
import { useWorkflowRealtime } from '../../realtime/hooks/useWorkflowRealtime';
import toast from 'react-hot-toast';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Assigned':
    case 'Fabric Received': return 'bg-blue-100 text-blue-800';
    case 'Cutting':
    case 'Stitching':
    case 'Embroidery': return 'bg-amber-100 text-amber-800';
    case 'Trial Ready':
    case 'Alteration': return 'bg-purple-100 text-purple-800';
    case 'Rework': return 'bg-red-100 text-red-800';
    case 'Ready for QC':
    case 'Completed':
    case 'Delivered': return 'bg-emerald-100 text-emerald-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const AdminWorkflowsPage = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterTailor, setFilterTailor] = useState('All');
  
  const isReadOnly = user?.role === 'admin'; // Regular admin is read-only for reassignment

  const { data: workflowsRes, isLoading: isLoadingWorkflows } = useQuery({
    queryKey: ['adminWorkflows', filterStatus, filterTailor],
    queryFn: () => adminWorkflowService.getAllWorkflows({
      status: filterStatus !== 'All' ? filterStatus : undefined,
      tailorId: filterTailor !== 'All' ? filterTailor : undefined
    }),
    // Realtime push keeps this fresh; slow safety-net poll only.
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  // Push-based reconciliation for both manager + admin Kanban caches.
  useWorkflowRealtime({ alsoPatchAdmin: true });

  const { data: tailorsRes } = useQuery({
    queryKey: ['adminTailors'],
    queryFn: () => adminTailorService.getAllTailors(),
  });

  const reassignMutation = useMutation({
    mutationFn: ({ id, tailorId }: { id: string, tailorId: string }) => 
      adminWorkflowService.assignTailor(id, tailorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminWorkflows'] });
      queryClient.invalidateQueries({ queryKey: ['adminTailors'] }); // Refresh workload counters
      toast.success('Task reassigned successfully');
    },
    onError: () => toast.error('Failed to reassign task')
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => 
      adminWorkflowService.updateWorkflowStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminWorkflows'] });
      toast.success('Status updated');
    },
    onError: () => toast.error('Failed to update status')
  });

  const workflows = workflowsRes?.data?.tasks || [];
  const tailors = tailorsRes?.data?.tailors || [];

  const filteredWorkflows = workflows.filter(wf => 
    searchTerm === '' || 
    wf.taskNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wf.taskDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center">
          <Activity size={24} className="mr-2 text-primary-800" />
          Workflow Board
        </h1>
        <p className="text-sm text-gray-500 mt-1">Global production view and bottleneck management.</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by Task ID or Description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 outline-none text-sm font-medium"
          />
        </div>
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <div className="flex items-center border border-gray-300 rounded-lg px-2 bg-gray-50 flex-1 md:flex-none">
            <Filter size={16} className="text-gray-400 mx-1" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent border-none py-2 px-2 text-sm font-semibold text-gray-700 outline-none w-full"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Pipeline</option>
              <option value="Delayed">Delayed Only</option>
              <option value="Cutting">Cutting</option>
              <option value="Stitching">Stitching</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="flex items-center border border-gray-300 rounded-lg px-2 bg-gray-50 flex-1 md:flex-none">
            <Filter size={16} className="text-gray-400 mx-1" />
            <select 
              value={filterTailor}
              onChange={(e) => setFilterTailor(e.target.value)}
              className="bg-transparent border-none py-2 px-2 text-sm font-semibold text-gray-700 outline-none w-full"
            >
              <option value="All">All Tailors</option>
              {tailors.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest bg-gray-50">Task ID</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest bg-gray-50">Assigned Tailor</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest bg-gray-50">Status & Priority</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest bg-gray-50">Deadline</th>
                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-widest bg-gray-50">Audit</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
               {isLoadingWorkflows ? (
                  <tr><td colSpan={5} className="px-6 py-12"><Loader message="Fetching production workflows..." /></td></tr>
               ) : filteredWorkflows.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12">
                    <EmptyState 
                      icon={Activity} 
                      title="No Workflows Found" 
                      description="There are currently no production workflows matching your filters. New orders will appear here automatically." 
                    />
                  </td></tr>
               ) : (
                filteredWorkflows.map(wf => {
                  const isOverdue = new Date(wf.deadline) < new Date();
                  const assignedTailorObj = tailors.find(t => t._id === wf.tailorId);
                  
                  return (
                    <tr key={wf._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">{wf.taskNumber}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[200px] mt-1" title={wf.taskDescription}>{wf.taskDescription}</div>
                      </td>
                      <td className="px-6 py-4">
                        {isReadOnly ? (
                          <div className="text-sm font-bold text-gray-700">{assignedTailorObj?.name || 'Unassigned'}</div>
                        ) : (
                          <select 
                            value={wf.tailorId || ''}
                            onChange={(e) => {
                              if(e.target.value !== wf.tailorId) {
                                reassignMutation.mutate({ id: wf._id, tailorId: e.target.value });
                              }
                            }}
                            className="bg-gray-50 border border-gray-300 text-sm font-bold text-gray-800 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-primary-500 w-full max-w-[180px]"
                          >
                            <option value="">Unassigned</option>
                            {tailors.map(t => (
                              <option key={t._id} value={t._id}>
                                {t.name} ({t.currentAssignedCount}/{t.dailyCapacity})
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2 items-start">
                          <select 
                            value={wf.status}
                            onChange={(e) => updateStatusMutation.mutate({ id: wf._id, status: e.target.value })}
                            className={`text-xs font-bold px-2 py-1 rounded border outline-none cursor-pointer ${getStatusColor(wf.status)} border-transparent hover:border-gray-300`}
                          >
                            <option value="Assigned">Assigned</option>
                            <option value="Fabric Received">Fabric Received</option>
                            <option value="Cutting">Cutting</option>
                            <option value="Stitching">Stitching</option>
                            <option value="Embroidery">Embroidery</option>
                            <option value="Trial Ready">Trial Ready</option>
                            <option value="Ready for QC">Ready for QC</option>
                            <option value="Rework">Rework</option>
                            <option value="Completed">Completed</option>
                          </select>
                          
                          {wf.priority === 'Urgent' && (
                            <span className="inline-flex items-center text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200 uppercase">
                              <AlertTriangle size={10} className="mr-1" /> Urgent
                            </span>
                          )}
                          {wf.escalationFlags?.map((flag: string) => (
                            <span key={flag} className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 uppercase">
                              {flag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center text-sm font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                           <Calendar size={14} className="mr-2 opacity-70" />
                           {new Date(wf.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {isOverdue && <div className="text-[10px] font-black text-red-600 mt-1 uppercase tracking-wider">Overdue</div>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-xs text-gray-500">
                          <p className="font-semibold text-gray-700">Created by: {wf.assignedBy?.name || 'System'}</p>
                          <p className="mt-1 flex items-center justify-end"><Clock size={10} className="mr-1"/> Upd: {new Date(wf.updatedAt || wf.createdAt).toLocaleDateString()}</p>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminWorkflowsPage;
