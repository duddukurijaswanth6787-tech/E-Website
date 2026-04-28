import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customRequestService } from '../../api/services/custom-request.service';
import { 
  ChevronLeft, Save, User, MapPin, 
  Clock, Scissors, DollarSign, FileText,
  Image as ImageIcon, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'price_assigned', label: 'Price Assigned' },
  { value: 'approved', label: 'Approved' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' }
];

const AdminCustomRequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // Edit fields
  const [status, setStatus] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        const res = await customRequestService.getRequestById(id);
        const data = res.data?.data || res.data;
        setRequest(data);
        setStatus(data.status || 'submitted');
        setPrice(data.assignedPrice || '');
        setNotes(data.adminNotes || '');
      } catch (e: any) {
        toast.error("Could not load request details");
        navigate('/admin/custom-requests');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);

  const handleSaveStatus = async () => {
    if (!id) return;
    setSaving('status');
    try {
      await customRequestService.updateRequestStatus(id, status);
      toast.success("Status updated successfully");
    } catch (e: any) {
      toast.error(e?.message || "Failed to update status");
    } finally {
      setSaving(null);
    }
  };

  const handleSavePrice = async () => {
    if (!id) return;
    setSaving('price');
    try {
      const numPrice = Number(price);
      if (isNaN(numPrice)) throw new Error("Invalid price value");
      await customRequestService.updateRequestPrice(id, numPrice);
      toast.success("Price assigned successfully");
    } catch (e: any) {
      toast.error(e?.message || "Failed to update price");
    } finally {
      setSaving(null);
    }
  };

  const handleSaveNotes = async () => {
    if (!id) return;
    setSaving('notes');
    try {
      await customRequestService.updateRequestNotes(id, notes);
      toast.success("Admin notes updated");
    } catch (e: any) {
      toast.error(e?.message || "Failed to update notes");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!request) return null;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/admin/custom-requests')}
            className="p-2 mr-4 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-primary-700 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-serif text-gray-900 mb-1">CRM Ticket #{id?.substring(0, 10)}</h1>
            <p className="text-sm text-gray-500">Design Specification & Fulfill Management</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
           <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${
             status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' : 
             status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
             'bg-blue-50 text-blue-700 border-blue-200'
           }`}>
             Current: {status.replace('_', ' ')}
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Customer & Design Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Customer Context Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-700 mr-4">
                <User size={20} />
              </div>
              <h2 className="text-lg font-serif text-gray-900">Customer Identity</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div>
                 <span className="block text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-1">Full Name</span>
                 <span className="text-gray-900 font-medium">{request.user?.name || request.customerName || 'Anonymous'}</span>
               </div>
               <div>
                 <span className="block text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-1">Email / Account</span>
                 <span className="text-gray-900 font-medium">{request.user?.email || 'Guest Request'}</span>
               </div>
               <div>
                 <span className="block text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-1">Mobile Contact</span>
                 <span className="text-gray-900 font-medium">{request.mobile || request.user?.mobile || 'N/A'}</span>
               </div>
               <div>
                 <span className="block text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-1">Submitted Date</span>
                 <span className="text-gray-900 font-medium flex items-center">
                    <Clock size={14} className="mr-2 text-gray-400" />
                    {new Date(request.createdAt).toLocaleString()}
                 </span>
               </div>
            </div>
          </div>

          {/* Style & Measurements Matrix */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center text-accent-dark mr-4">
                <Scissors size={20} />
              </div>
              <h2 className="text-lg font-serif text-gray-900">Bespoke Style Matrix</h2>
            </div>

            <div className="space-y-8">
               {/* Style Preferences */}
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {Object.entries(request.stylePreferences || {}).map(([key, value]: [string, any]) => (
                    <div key={key}>
                       <span className="block text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-1">{key.replace(/([A-Z])/g, ' $1')}</span>
                       <span className="text-gray-900 font-medium capitalize">{String(value)}</span>
                    </div>
                  ))}
               </div>

               {/* Measurements */}
               <div className="pt-6 border-t border-gray-50">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center">
                     <ImageIcon size={14} className="mr-2 text-primary-600" /> Measurement Data (cm/in)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-y-6 gap-x-4">
                     {Object.entries(request.measurements || {}).map(([key, value]: [string, any]) => (
                       <div key={key} className="bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                          <span className="block text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest mb-1 truncate" title={key}>{key}</span>
                          <span className="text-primary-950 font-bold">{String(value)}</span>
                       </div>
                     ))}
                  </div>
               </div>

               {/* Fabric & Notes */}
               <div className="pt-6 border-t border-gray-50">
                  <span className="block text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-2">Fabric Specifications</span>
                  <div className="bg-primary-50/30 p-4 rounded-xl text-primary-950 text-sm leading-relaxed italic">
                     {request.fabricDetails || 'No specific fabric details provided.'}
                  </div>
               </div>
            </div>
          </div>

          {/* Visual Reference Images */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 mr-4">
                <ImageIcon size={20} />
              </div>
              <h2 className="text-lg font-serif text-gray-900">High-Resolution References</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
               {request.referenceImages && request.referenceImages.length > 0 ? (
                 request.referenceImages.map((img: string, idx: number) => (
                   <a 
                    key={idx} 
                    href={img} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group relative aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden border border-gray-200 hover:border-primary-300 transition-all shadow-sm hover:shadow-md"
                   >
                     <img src={img} alt={`ref-${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="text-white text-[0.6rem] font-bold uppercase tracking-widest py-1 px-2 border border-white/40 rounded backdrop-blur-sm">Enlarge View</span>
                     </div>
                   </a>
                 ))
               ) : (
                 <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                    <ImageIcon size={32} className="text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">No reference images uploaded by customer.</p>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Right Column: Fulfillment Management */}
        <div className="space-y-8">
           
           {/* Pipeline Management Card */}
           <div className="bg-white rounded-2xl shadow-lg border border-primary-100 p-6 sticky top-28 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-600 via-primary-950 to-primary-600"></div>
              
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-primary-950 rounded-lg flex items-center justify-center text-accent mr-4">
                  <Activity size={20} />
                </div>
                <h2 className="text-lg font-serif text-gray-900">CRM Fulfillment</h2>
              </div>

              <div className="space-y-6">
                 {/* Status Selector */}
                 <div>
                    <label className="block text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-2">Phase Transition</label>
                    <select 
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <button 
                      onClick={handleSaveStatus}
                      disabled={saving === 'status'}
                      className="mt-3 w-full bg-primary-950 text-white text-xs font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-primary-900 transition-all flex items-center justify-center disabled:opacity-50"
                    >
                      {saving === 'status' ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <><Save size={14} className="mr-2" /> Commit Phase Status</>
                      )}
                    </button>
                 </div>

                 {/* Price Assignment */}
                 <div className="pt-6 border-t border-gray-100">
                    <label className="block text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-2">Assigned Quote (₹)</label>
                    <div className="relative">
                       <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <DollarSign size={16} className="text-gray-400" />
                       </div>
                       <input 
                         type="number" 
                         value={price}
                         onChange={(e) => setPrice(e.target.value)}
                         placeholder="0.00"
                         className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-primary-950 focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder:text-gray-200"
                       />
                    </div>
                    <button 
                      onClick={handleSavePrice}
                      disabled={saving === 'price'}
                      className="mt-3 w-full bg-accent text-primary-950 text-xs font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-accent-dark transition-all flex items-center justify-center disabled:opacity-50"
                    >
                      {saving === 'price' ? (
                        <div className="w-4 h-4 border-2 border-primary-950/30 border-t-primary-950 rounded-full animate-spin"></div>
                      ) : (
                        <><Save size={14} className="mr-2" /> Assign Final Cost</>
                      )}
                    </button>
                 </div>

                 {/* Admin Notes */}
                 <div className="pt-6 border-t border-gray-100">
                    <label className="block text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-2">Internal Admin Notes</label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      placeholder="Enter internal status updates, tailor instructions, or fulfillment notes..."
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
                    />
                    <button 
                      onClick={handleSaveNotes}
                      disabled={saving === 'notes'}
                      className="mt-3 w-full border border-gray-300 text-gray-700 text-xs font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center disabled:opacity-50"
                    >
                      {saving === 'notes' ? (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                      ) : (
                        <><FileText size={14} className="mr-2" /> Save Notes Snapshot</>
                      )}
                    </button>
                 </div>

                 {/* Tailor Assignment Placeholder */}
                 <div className="pt-6 border-t border-gray-100">
                    <label className="block text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-1">Execution Unit</label>
                    <div className="flex items-center p-3 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                       <span className="text-[0.7rem] text-gray-400 font-medium">Assigned Tailor: </span>
                       <span className="ml-2 text-[0.7rem] font-bold text-primary-800 uppercase tracking-widest">Not Assigned</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Quick Actions Card */}
           <div className="bg-gray-900 rounded-2xl p-6 text-white overflow-hidden relative shadow-lg">
               <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl"></div>
               <h3 className="text-sm font-serif mb-4 flex items-center">
                  <MapPin size={16} className="text-accent mr-2" /> Logistics Check
               </h3>
               <div className="space-y-4">
                  <div>
                    <span className="block text-[0.6rem] font-bold text-gray-500 uppercase tracking-widest mb-1">Target Delivery</span>
                    <span className="text-sm font-medium">{request.deliveryDate ? new Date(request.deliveryDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[0.6rem] font-bold text-gray-500 uppercase tracking-widest mb-1">Occasion / Event</span>
                    <span className="text-sm font-medium text-accent">{request.occasion || 'General'}</span>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                     <button 
                       onClick={() => navigate('/admin/custom-requests')}
                       className="w-full py-3 text-[0.65rem] font-bold uppercase tracking-widest text-white/70 hover:text-white border border-white/20 hover:border-white/40 rounded-xl transition-all"
                     >
                        Back to Bespoke Pipeline
                     </button>
                  </div>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomRequestDetailPage;
