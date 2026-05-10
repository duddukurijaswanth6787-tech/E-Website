import MeasurementProfileManager from '../../../components/user/MeasurementProfileManager';
import SEO from '../../../components/common/SEO';

const UserMeasurements = () => {
  return (
    <div className="bg-white rounded-3xl shadow-premium border border-stone-100 p-8 md:p-12">
      <SEO title="Fitting Room | Vasanthi Creations" />
      <MeasurementProfileManager />
    </div>
  );
};

export default UserMeasurements;
