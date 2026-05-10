import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTaskDetails, useUpdateTaskStatus, useAddTailorNote } from '../../hooks/useTailorWorkflows';
import { 
  ArrowLeft, 
  Clock, 
  AlertTriangle, 
  MessageSquare,
  Image as ImageIcon,
  Ruler
} from 'lucide-react';
import { MEASUREMENT_SCHEMA } from '../../utils/measurementSchema';

const TailorTaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { data: response, isLoading, error } = useTaskDetails(id);
  const updateStatusMutation = useUpdateTaskStatus();
  const addNoteMutation = useAddTailorNote();

  const handleStatusChange = (status: string) => {
    if (!id) return;
    setIsUpdating(true);
    updateStatusMutation.mutate({ taskId: id, status }, {
      onSettled: () => setIsUpdating(false)
    });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim() || !id) return;
    addNoteMutation.mutate({ taskId: id, note }, {
      onSuccess: () => setNote('')
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="h-10 w-1/3 bg-gray-200 rounded mb-6"></div>
        <div className="h-64 bg-gray-200 rounded-xl mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-gray-200 rounded-xl"></div>
          <div className="h-48 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !response?.data) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center bg-red-50 text-red-600 rounded-xl border border-red-200">
        Task not found or access denied.
        <button onClick={() => navigate(-1)} className="block mx-auto mt-4 underline font-semibold">Go Back</button>
      </div>
    );
  }

  const task = response.data;
  const isOverdue = new Date(task.deadline) < new Date();

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <button 
        onClick={() => navigate('/tailor/tasks')}
        className="flex items-center text-gray-500 hover:text-gray-900 mb-6 font-semibold text-sm transition-colors"
      >
        <ArrowLeft size={16} className="mr-2" /> Back to Tasks
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <span className="text-sm font-bold text-gray-400 tracking-widest">{task.taskNumber}</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{task.taskDescription}</h1>
            </div>
            <div className="mt-4 sm:mt-0">
               {/* Quick Action Large Status Dropdown */}
               <select 
                 value={task.status}
                 onChange={(e) => handleStatusChange(e.target.value)}
                 disabled={isUpdating}
                 className={`text-sm sm:text-base font-bold rounded-lg px-4 py-3 border-2 outline-none transition-all cursor-pointer ${isUpdating ? 'opacity-50' : 'hover:bg-gray-50'}
                   ${task.status === 'Completed' || task.status === 'Delivered' ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : 'border-gray-300 text-gray-800'}`}
               >
                 <option value="Assigned">Status: Assigned</option>
                 <option value="Fabric Received">Status: Fabric Received</option>
                 <option value="Cutting">Status: Cutting</option>
                 <option value="Stitching">Status: Stitching</option>
                 <option value="Embroidery">Status: Embroidery</option>
                 <option value="Trial Ready">Status: Trial Ready</option>
                 <option value="Alteration">Status: Alteration</option>
                 <option value="Ready for QC">Status: Ready for QC</option>
                 <option value="Rework">Status: Rework</option>
                 <option value="Completed">Status: Completed</option>
               </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
             <div className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold border ${isOverdue ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                <Clock size={16} className="mr-2" />
                Due: {new Date(task.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                {isOverdue && ' (OVERDUE)'}
             </div>
             
             {task.priority === 'Urgent' && (
                <div className="flex items-center px-3 py-1.5 rounded-lg text-sm font-bold bg-red-100 text-red-700 border border-red-200 uppercase tracking-wider">
                  <AlertTriangle size={16} className="mr-2" /> Urgent Priority
                </div>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Measurements Viewer */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 overflow-hidden">
          <h2 className="text-lg font-bold text-gray-900 flex items-center mb-4 border-b border-gray-100 pb-3">
            <Ruler size={20} className="mr-2 text-primary-600" /> Technical Fitting
          </h2>
          {task.measurementsSnapshot && Object.keys(task.measurementsSnapshot).length > 0 ? (
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
               {MEASUREMENT_SCHEMA.map(section => {
                 const fieldsWithData = section.fields.filter(f => task.measurementsSnapshot[f.name]);
                 if (fieldsWithData.length === 0) return null;

                 return (
                   <div key={section.id} className="space-y-2">
                     <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                       <section.icon size={12} /> {section.title}
                     </h3>
                     <div className="grid grid-cols-1 gap-2">
                        {fieldsWithData.map(field => (
                          <div key={field.name} className="flex justify-between items-center bg-stone-50 px-3 py-2 rounded-lg border border-stone-100/50">
                            <span className="text-gray-600 text-xs font-medium">{field.label}</span>
                            <span className="font-bold text-gray-900 text-sm">{task.measurementsSnapshot[field.name]} {field.unit}</span>
                          </div>
                        ))}
                     </div>
                   </div>
                 );
               })}

               {/* Any additional measurements not in schema */}
               {(() => {
                 const schemaFields = MEASUREMENT_SCHEMA.flatMap(s => s.fields.map(f => f.name));
                 const extraFields = Object.entries(task.measurementsSnapshot).filter(([key]) => !schemaFields.includes(key));
                 if (extraFields.length === 0) return null;

                 return (
                   <div className="space-y-2 pt-2 border-t border-stone-100">
                     <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Additional Specs</h3>
                     <div className="grid grid-cols-1 gap-2">
                        {extraFields.map(([key, val]) => (
                          <div key={key} className="flex justify-between items-center bg-stone-50 px-3 py-2 rounded-lg border border-stone-100/50">
                            <span className="text-gray-600 text-xs font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                            <span className="font-bold text-gray-900 text-sm">{String(val)}</span>
                          </div>
                        ))}
                     </div>
                   </div>
                 );
               })()}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic py-8 text-center bg-gray-50 rounded-lg">No technical measurements provided.</p>
          )}
        </div>

        {/* Media Gallery */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center mb-4 border-b border-gray-100 pb-3">
            <ImageIcon size={20} className="mr-2 text-gray-500" /> Reference Media
          </h2>
          {task.referenceImages && task.referenceImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {task.referenceImages.map((img: any, idx: number) => (
                <a key={idx} href={img} target="_blank" rel="noreferrer" className="block relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:ring-2 hover:ring-blue-500 transition-all">
                  <img src={img} alt="Reference" className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          ) : (
            <div className="h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400">
              <ImageIcon size={24} className="mb-2 opacity-50" />
              <span className="text-sm">No references provided</span>
            </div>
          )}
        </div>
      </div>

      {/* Notes & Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
           <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <MessageSquare size={20} className="mr-2 text-gray-500" /> Production Notes & History
           </h2>
        </div>
        
        <div className="p-6">
          {/* Notes List */}
          <div className="space-y-4 mb-6">
            {task.tailorNotes.map((noteObj: any, idx: number) => (
              <div key={idx} className="bg-blue-50 border border-blue-100 rounded-lg p-4 ml-8 relative">
                <div className="absolute -left-10 top-4 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs border border-blue-200">
                   You
                </div>
                <p className="text-gray-800 text-sm">{noteObj.note}</p>
                <p className="text-xs text-gray-500 mt-2 font-medium">{new Date(noteObj.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Add Note Form */}
          <form onSubmit={handleAddNote} className="flex gap-3 mt-6 border-t border-gray-100 pt-6">
            <input 
              type="text" 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a production note (e.g. Need more lining fabric...)"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              disabled={addNoteMutation.isPending}
            />
            <button 
              type="submit"
              disabled={!note.trim() || addNoteMutation.isPending}
              className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-black transition-colors disabled:opacity-50"
            >
              Post Note
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};

export default TailorTaskDetail;
