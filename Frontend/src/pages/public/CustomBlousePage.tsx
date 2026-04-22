import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scissors, CheckCircle, Upload } from 'lucide-react';
import { customRequestService } from '../../api/services/custom-request.service';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

const CustomBlousePage = () => {
  const { isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState({
    neckline: 'Boat Neck',
    sleeves: 'Short',
    backDesign: 'Deep U',
    fabricDetails: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
       toast.error("Please login to submit a bespoke request.");
       return;
    }

    if (!formData.notes.trim()) {
       toast.error("Please provide some design notes or fabric details.");
       setIsSubmitting(false);
       return;
    }

    try {
       const payload = {
         measurements: { instructions: 'Pending Upload / Manual entry' },
         stylePreferences: {
           neckline: formData.neckline,
           sleeves: formData.sleeves,
           backDesign: formData.backDesign
         },
         fabricDetails: formData.fabricDetails || 'Customer Provided',
         notes: formData.notes
       };
       
       await customRequestService.submitRequest(payload);
       setIsSuccess(true);
    } catch (error: any) {
       const msg = error.response?.data?.message || "Request failed. Please try again.";
       toast.error(msg);
    } finally {
       setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-neutral-cream py-20 flex flex-col items-center">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white p-12 md:p-20 rounded-2xl shadow-soft border border-gray-100"
        >
          <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-8 text-primary-800">
            <Scissors size={32} />
          </div>
          
          {!isSuccess ? (
            <>
              <h1 className="text-4xl md:text-5xl font-serif text-primary-950 mb-6">Bespoke Custom Blouses</h1>
              <div className="h-0.5 w-16 bg-accent mx-auto mb-8"></div>
              
              <p className="text-lg text-gray-600 leading-relaxed mb-10 max-w-2xl mx-auto">
                Experience the luxury of tailored heritage. Submit your styling preferences and our master tailors will contact you to finalize the delicate Aari work embroideries matching your saree.
              </p>

              <form onSubmit={handleSubmit} className="text-left max-w-2xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[0.65rem] font-bold uppercase tracking-widest text-gray-500 mb-2">Neckline Preference</label>
                    <select 
                      value={formData.neckline} onChange={e => setFormData({...formData, neckline: e.target.value})}
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-gray-700 bg-white"
                    >
                      <option>Boat Neck</option><option>Sweetheart</option><option>Round</option><option>V-Neck</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[0.65rem] font-bold uppercase tracking-widest text-gray-500 mb-2">Sleeve Style</label>
                    <select 
                      value={formData.sleeves} onChange={e => setFormData({...formData, sleeves: e.target.value})}
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-gray-700 bg-white"
                    >
                      <option>Short Sleeves</option><option>Elbow Length</option><option>Sleeveless</option><option>Full Length</option>
                    </select>
                  </div>
                </div>

                <div>
                   <label className="block text-[0.65rem] font-bold uppercase tracking-widest text-gray-500 mb-2">Additional Design Notes / Fabric Details</label>
                   <textarea 
                     rows={4}
                     placeholder="Describe any specific Aari work patterns, or let us know if you are shipping matching fabric..."
                     value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                     className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none text-gray-700"
                   ></textarea>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg border border-dashed border-gray-300 text-center">
                   <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                   <p className="text-sm font-medium text-gray-700">Measurement Upload Required Later</p>
                   <p className="text-xs text-gray-500 mt-1">Our boutique specialists will reach out to collect your exact physical measurements manually.</p>
                </div>

                <div className="pt-6">
                  <button 
                    disabled={isSubmitting}
                    className="w-full bg-primary-950 text-white px-8 py-4 rounded font-bold uppercase tracking-widest hover:bg-primary-800 transition-colors shadow-premium flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Submit Bespoke Request'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-10">
               <CheckCircle className="w-20 h-20 text-accent mx-auto mb-6" />
               <h2 className="text-3xl font-serif text-primary-950 mb-4">Request Received</h2>
               <p className="text-lg text-gray-600 max-w-md mx-auto mb-8">
                 Your bespoke styling consultation has been registered. Our master tailors will review your preferences and contact you via WhatsApp shortly.
               </p>
               <div className="flex gap-4 justify-center">
                 <Link to="/my" className="bg-primary-950 text-white px-6 py-3 rounded font-bold uppercase tracking-widest text-sm hover:bg-primary-800">Go to Dashboard</Link>
                 <Link to="/shop" className="text-primary-700 border border-primary-700 px-6 py-3 rounded font-bold uppercase tracking-widest text-sm hover:bg-primary-50">Continue Shopping</Link>
               </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CustomBlousePage;
