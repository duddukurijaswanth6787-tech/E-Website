import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssignedTasks } from '../../hooks/useTailorWorkflows';
import TaskCard from '../../components/tailor/TaskCard';
import { Filter } from 'lucide-react';

const TailorTasksList = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const { data: response, isLoading } = useAssignedTasks();

  const tasks = response?.data || [];

  const filteredTasks = tasks.filter((t: any) => {
    if (filterStatus === 'All') return true;
    if (filterStatus === 'Active') return !['Completed', 'Delivered'].includes(t.status);
    if (filterStatus === 'Completed') return ['Completed', 'Delivered'].includes(t.status);
    return t.status === filterStatus;
  });

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your production queue.</p>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          <Filter size={16} className="text-gray-400 ml-2 mr-1" />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-transparent border-none text-sm font-semibold text-gray-700 focus:ring-0 outline-none pr-8 py-1.5"
          >
            <option value="All">All Tasks</option>
            <option value="Active">Active Only</option>
            <option value="Assigned">Assigned</option>
            <option value="Cutting">Cutting</option>
            <option value="Stitching">Stitching</option>
            <option value="Embroidery">Embroidery</option>
            <option value="Ready for QC">Ready for QC</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-40 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white border border-gray-200 rounded-xl">
           <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
             <Filter size={24} className="text-gray-400" />
           </div>
           <p className="text-gray-500 font-semibold">No tasks found for the selected filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-8">
          {filteredTasks.map((task: any) => (
            <TaskCard 
              key={task._id} 
              task={task} 
              onClick={(id) => navigate(`/tailor/tasks/${id}`)} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TailorTasksList;
