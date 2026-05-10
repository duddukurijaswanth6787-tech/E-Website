import { useEffect, useState } from 'react';
import { 
  Ruler, 
  Plus, 
  ChevronRight,
  Info
} from 'lucide-react';
import { useMeasurementStore } from '../../store/measurementStore';
import PremiumMeasurementModal from './PremiumMeasurementModal';
import PremiumMeasurementCard from './PremiumMeasurementCard';
import { Loader } from '../common/Loader';
import toast from 'react-hot-toast';

const MeasurementProfileManager = () => {
  const { profiles, isLoading, fetchProfiles, removeProfile, duplicateProfile, setDefaultProfile } = useMeasurementStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this fitting profile?')) {
      try {
        await removeProfile(id);
        toast.success('Profile deleted');
      } catch (err) {
        toast.error('Failed to delete profile');
      }
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateProfile(id);
      toast.success('Profile duplicated');
    } catch (err) {
      toast.error('Failed to duplicate profile');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultProfile(id);
      toast.success('Set as default profile');
    } catch (err) {
      toast.error('Failed to set default');
    }
  };

  if (isLoading && profiles.length === 0) return <Loader message="Accessing Fitting Room..." />;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-serif font-bold text-stone-900 mb-2 tracking-tight">Your Fitting Room</h2>
          <p className="text-stone-500 text-sm font-medium">Manage your premium tailoring profiles for a perfect fit every time.</p>
        </div>
        <button 
          onClick={() => {
            setEditingProfile(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-8 py-4 bg-stone-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary-900 transition-all shadow-xl hover:-translate-y-1 active:translate-y-0"
        >
          <Plus size={14} /> Create New Profile
        </button>
      </div>

      {profiles.length === 0 ? (
        <div className="bg-white rounded-[3rem] border border-stone-200 p-20 text-center shadow-sm">
          <div className="w-24 h-24 rounded-[2rem] bg-stone-50 flex items-center justify-center mx-auto mb-8 text-stone-300 border border-stone-100">
            <Ruler size={40} />
          </div>
          <h3 className="text-2xl font-serif font-bold text-stone-800 mb-3">Your fitting room is empty</h3>
          <p className="text-stone-500 text-sm mb-10 max-w-sm mx-auto leading-relaxed">Create your first fitting profile to enjoy seamless tailoring for your bridal and casual wear.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 bg-primary-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 mx-auto hover:shadow-2xl transition-all"
          >
            Start Your First Profile <ChevronRight size={14} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {profiles.map(profile => (
            <PremiumMeasurementCard 
              key={profile._id}
              profile={profile}
              onEdit={(p) => {
                setEditingProfile(p);
                setIsModalOpen(true);
              }}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onSetDefault={handleSetDefault}
            />
          ))}
        </div>
      )}

      {/* Info Card */}
      <div className="bg-primary-950 rounded-[3rem] p-10 text-white flex flex-col md:flex-row items-center gap-8">
         <div className="w-20 h-20 rounded-[2rem] bg-white/10 flex items-center justify-center flex-shrink-0 text-primary-400">
            <Info size={40} />
         </div>
         <div className="flex-1">
            <h3 className="text-xl font-serif font-bold mb-2">Why Fitting Profiles?</h3>
            <p className="text-sm text-stone-400 leading-relaxed max-w-2xl">
              Vasanthi Creations maintains a "Digital Fitting Room" for every client. Your profiles are used by our Master Tailors to ensure consistency across different garment types. We recommend having separate profiles for bridal wear (requires tighter fit) and daily wear.
            </p>
         </div>
      </div>

      <PremiumMeasurementModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingProfile}
        onSave={() => {
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default MeasurementProfileManager;
