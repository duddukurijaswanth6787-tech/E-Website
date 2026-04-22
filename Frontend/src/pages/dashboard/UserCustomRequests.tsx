import { useEffect, useState } from 'react';
import { customRequestService } from '../../api/services/custom-request.service';
import { Scissors, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserCustomRequests = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await customRequestService.getUserRequests();
        setRequests(res.data?.data || res.data || []);
      } catch (err) {
        // Fallback for Phase 3 during mock transitions
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  if (loading) {
     return (
       <div className="p-8 flex justify-center items-center min-h-[400px]">
         <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-800 rounded-full animate-spin"></div>
       </div>
     );
  }

  return (
    <div className="p-6 md:p-8 min-h-screen">
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-serif text-primary-950">Custom Blouse Requests</h1>
         <Link to="/custom-blouse" className="text-sm font-bold uppercase tracking-widest text-primary-700 bg-primary-50 px-4 py-2 rounded hover:bg-primary-100 transition-colors">
            New Consultation
         </Link>
      </div>
      
      {requests.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
          <Scissors className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-serif text-gray-900 mb-2">No Requests Found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">You haven't submitted any custom blouse styling consultations yet.</p>
          <Link to="/custom-blouse" className="bg-primary-950 text-white px-8 py-3 rounded text-sm font-bold uppercase tracking-widest hover:bg-primary-800 transition-colors">Start a Request</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <div>
                  <p className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-1">Request #{req._id.substring(0,8).toUpperCase()}</p>
                  <p className="font-medium text-gray-900 mb-2">Submitted on {new Date(req.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600">Style: {req.stylePreferences?.neckline || 'Custom'} / {req.stylePreferences?.sleeves || 'Custom'}</p>
               </div>
               
               <div className="flex items-center space-x-4 ml-auto">
                 <div className={`px-4 py-2 rounded-full inline-flex items-center text-sm font-semibold border ${req.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                    {req.status === 'COMPLETED' ? <CheckCircle className="w-4 h-4 mr-2" /> : <Clock className="w-4 h-4 mr-2" />}
                    {req.status || 'PENDING'}
                 </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserCustomRequests;
