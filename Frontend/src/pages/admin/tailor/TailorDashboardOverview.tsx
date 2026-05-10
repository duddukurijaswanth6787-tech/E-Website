import { useNavigate } from 'react-router-dom';
import { useAssignedTasks } from '../../../hooks/useTailorWorkflows';
import TaskCard from '../../../components/tailor/TaskCard';
import { useAuthStore } from '../../../store/authStore';
import { CheckCircle, Clock, AlertTriangle, Briefcase } from 'lucide-react';
import { Loader } from '../../../components/common/Loader';
import { ErrorState } from '../../../components/common/ErrorState';

const TailorDashboardOverview = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: response, isLoading, error } = useAssignedTasks();

  const tasks = response?.data || [];

  const activeTasks = tasks.filter((t: any) => !['Completed', 'Delivered'].includes(t.status));
  const urgentTasks = activeTasks.filter((t: any) => t.escalationFlags.includes('Urgent') || t.priority === 'Urgent');
  
  const dueSoonTasks = activeTasks.filter((t: any) => {
    const timeDiff = new Date(t.deadline).getTime() - new Date().getTime();
    return timeDiff < 24 * 60 * 60 * 1000;
  }).sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  if (isLoading) return <Loader fullPage message="Aggregating production metrics..." />;
  
  if (error) return (
    <div className="py-20">
      <ErrorState 
        message="Unable to fetch production metrics at this time." 
        onRetry={() => window.location.reload()} 
      />
    </div>
  );
  

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-gray-500 mt-1">Here is your production overview for today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="bg-blue-50 p-3 rounded-lg text-blue-600 mr-4">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Active Tasks</p>
            <p className="text-2xl font-bold text-gray-900">{activeTasks.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="bg-amber-50 p-3 rounded-lg text-amber-600 mr-4">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Due Today</p>
            <p className="text-2xl font-bold text-gray-900">{dueSoonTasks.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-red-200 shadow-sm flex items-center ring-1 ring-red-50">
          <div className="bg-red-50 p-3 rounded-lg text-red-600 mr-4">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 text-red-600">Urgent</p>
            <p className="text-2xl font-bold text-red-700">{urgentTasks.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="bg-emerald-50 p-3 rounded-lg text-emerald-600 mr-4">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Completed (Today)</p>
            <p className="text-2xl font-bold text-gray-900">
               {tasks.filter((t: any) => t.status === 'Completed' && new Date(t.updatedAt) > new Date(new Date().setHours(0,0,0,0))).length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-lg font-bold text-gray-900 flex items-center">
               <AlertTriangle size={18} className="mr-2 text-amber-500" />
               Deadlines Approaching
             </h2>
             <button onClick={() => navigate('/tailor/tasks')} className="text-sm font-semibold text-blue-600 hover:text-blue-800">
               View All
             </button>
          </div>

          {dueSoonTasks.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500">
              <CheckCircle size={40} className="mx-auto mb-3 text-emerald-300" />
              <p>No urgent deadlines approaching. You're caught up!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dueSoonTasks.slice(0, 4).map((task: any) => (
                <TaskCard 
                  key={task._id} 
                  task={task} 
                  onClick={(id) => navigate(`/tailor/tasks/${id}`)} 
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
            <button 
              onClick={() => navigate('/tailor/tasks')}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg font-semibold text-gray-700 transition-colors"
            >
              Start Next Task
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg font-semibold text-gray-700 transition-colors">
              Report Machine Issue
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg font-semibold text-gray-700 transition-colors">
              Request Fabric/Thread
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailorDashboardOverview;
