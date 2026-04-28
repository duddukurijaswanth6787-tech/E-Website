import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, HelpCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { customRequestService } from '../../api/services/custom-request.service';
import { customBlouseOptionService } from '../../api/services/custom-blouse-option.service';
import type { CustomBlouseOption } from '../../api/services/custom-blouse-option.service';
import toast from 'react-hot-toast';

// ---------- Mock reference image data ----------
const REFERENCE_IMAGES: Record<string, string[]> = {
  fabricType: [
    'https://images.unsplash.com/photo-1600180758895-0c6c2e20d2c0?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1582719478250-1c5f8a0e6c5b?q=80&w=400&auto=format&fit=crop',
  ],
  computerWorkDesign: [
    'https://images.unsplash.com/photo-1582719478250-1c5f8a0e6c5b?q=80&w=400&auto=format&fit=crop',
  ],
  workPatternType: [
    'https://images.unsplash.com/photo-1600180758895-0c6c2e20d2c0?q=80&w=400&auto=format&fit=crop',
  ],
  frontNeckType: [
    'https://images.unsplash.com/photo-1600180758895-0c6c2e20d2c0?q=80&w=400&auto=format&fit=crop',
  ],
  backNeckType: [
    'https://images.unsplash.com/photo-1582719478250-1c5f8a0e6c5b?q=80&w=400&auto=format&fit=crop',
  ],
  sleeveType: [
    'https://images.unsplash.com/photo-1600180758895-0c6c2e20d2c0?q=80&w=400&auto=format&fit=crop',
  ],
  sleeveLength: [
    'https://images.unsplash.com/photo-1582719478250-1c5f8a0e6c5b?q=80&w=400&auto=format&fit=crop',
  ],
  openingType: [
    'https://images.unsplash.com/photo-1600180758895-0c6c2e20d2c0?q=80&w=400&auto=format&fit=crop',
  ],
  closureStyle: [
    'https://images.unsplash.com/photo-1582719478250-1c5f8a0e6c5b?q=80&w=400&auto=format&fit=crop',
  ],
  padding: [
    'https://images.unsplash.com/photo-1600180758895-0c6c2e20d2c0?q=80&w=400&auto=format&fit=crop',
  ],
  lining: [
    'https://images.unsplash.com/photo-1582719478250-1c5f8a0e6c5b?q=80&w=400&auto=format&fit=crop',
  ],
  // Measurements reference images (single placeholder for each)
  bust: ['https://images.unsplash.com/photo-1600180758895-0c6c2e20d2c0?q=80&w=400&auto=format&fit=crop'],
  waist: ['https://images.unsplash.com/photo-1582719478250-1c5f8a0e6c5b?q=80&w=400&auto=format&fit=crop'],
  shoulder: ['https://images.unsplash.com/photo-1600180758895-0c6c2e20d2c0?q=80&w=400&auto=format&fit=crop'],
  armhole: ['https://images.unsplash.com/photo-1582719478250-1c5f8a0e6c5b?q=80&w=400&auto=format&fit=crop'],
  sleeveRound: ['https://images.unsplash.com/photo-1600180758895-0c6c2e20d2c0?q=80&w=400&auto=format&fit=crop'],
  sleeveLengthMeas: ['https://images.unsplash.com/photo-1582719478250-1c5f8a0e6c5b?q=80&w=400&auto=format&fit=crop'],
  blouseLengthMeas: ['https://images.unsplash.com/photo-1600180758895-0c6c2e20d2c0?q=80&w=400&auto=format&fit=crop'],
  frontNeckDepth: ['https://images.unsplash.com/photo-1582719478250-1c5f8a0e6c5b?q=80&w=400&auto=format&fit=crop'],
  backNeckDepth: ['https://images.unsplash.com/photo-1600180758895-0c6c2e20d2c0?q=80&w=400&auto=format&fit=crop'],
};

// ---------- Helper components ----------
interface ModalProps {
  title: string;
  images: string[];
  onClose: () => void;
}
const ReferenceModal = ({ title, images, onClose }: ModalProps) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
    <div className="bg-white rounded-xl shadow-xl modal-mobile p-6">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-2 border-b border-gray-100">
        <h3 className="text-xl font-serif text-primary-950">{title} Reference</h3>
        <button onClick={onClose} className="p-2 -mr-2 text-gray-500 hover:text-primary-950 transition-colors"><X size={24} /></button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {images.map((src, i) => (
          <div key={i} className="space-y-2">
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden shadow-md">
               <img src={src} alt="reference" className="w-full h-full object-cover" />
            </div>
            <p className="text-[0.65rem] text-center text-gray-500 uppercase tracking-widest font-semibold">Example {i + 1}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ---------- Main component ----------
const steps = [
  'Fabric & Work',
  'Blouse Design',
  'Measurements',
  'Reference Upload',
  'Occasion & Delivery',
  'Review & Submit',
];

const CustomBlousePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState<{ field: string; open: boolean }>({ field: '', open: false });
  const [dynamicOptions, setDynamicOptions] = useState<CustomBlouseOption[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await customBlouseOptionService.getActiveOptions();
        setDynamicOptions(res.data?.data || res.data || []);
      } catch (e) {
        console.error('Failed to load dynamic options', e);
      }
    };
    fetchOptions();
  }, []);

  const getOptionsByCategory = (category: string) => {
    return dynamicOptions.filter(opt => opt.category === category);
  };

  const [form, setForm] = useState({
    // Step 1
    fabricType: '',
    clothColor: '',
    plainOrComputer: 'Plain',
    computerWorkDesign: 'No',
    workPatternType: '',
    threadWorkColor: '',
    borderWorkRequired: 'No',
    // Step 2
    frontNeckType: '',
    backNeckType: '',
    sleeveType: '',
    sleeveLength: '',
    blouseLength: '',
    openingType: '',
    closureStyle: '',
    paddingRequired: 'No',
    liningRequired: 'No',
    // Step 3
    bust: '',
    waist: '',
    shoulder: '',
    armhole: '',
    sleeveRound: '',
    sleeveLengthMeas: '',
    blouseLengthMeas: '',
    frontNeckDepth: '',
    backNeckDepth: '',
    knowMeasurements: false,
    needTailorSupport: false,
    // Step 4
    referenceBlouseImage: null as File | null,
    sareeImage: null as File | null,
    measurementImage: null as File | null,
    // Step 5
    occasion: '',
    deliveryDate: '',
    budgetRange: '',
    specialInstructions: '',
  });

  const handleNext = () => {
    if (validateStep(activeStep)) setActiveStep((s) => s + 1);
  };
  const handleBack = () => setActiveStep((s) => s - 1);

  const validateStep = (step: number) => {
    const errors: string[] = [];
    if (step === 0) {
      if (!form.fabricType) errors.push('Fabric type required');
      if (!form.clothColor) errors.push('Cloth color required');
    } else if (step === 1) {
      if (!form.frontNeckType) errors.push('Front neck type required');
      if (!form.backNeckType) errors.push('Back neck type required');
      if (!form.sleeveType) errors.push('Sleeve type required');
    } else if (step === 2) {
      if (!form.knowMeasurements && !form.needTailorSupport) {
        errors.push('Select measurement option');
      }
      if (form.knowMeasurements) {
        const requiredMeas = ['bust', 'waist', 'shoulder', 'armhole', 'sleeveRound', 'sleeveLengthMeas', 'blouseLengthMeas', 'frontNeckDepth', 'backNeckDepth'];
        requiredMeas.forEach((field) => {
          if (!form[field as keyof typeof form]) errors.push(`${field} required`);
        });
      }
    } else if (step === 4) {
      if (!form.occasion) errors.push('Occasion required');
      if (!form.deliveryDate) errors.push('Delivery date required');
      if (!form.budgetRange) errors.push('Budget range required');
    }
    if (errors.length) {
      toast.error(errors[0]);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to submit your request');
      navigate('/login');
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // Basic fields
      formData.append('fabricType', form.fabricType);
      formData.append('clothColor', form.clothColor);
      formData.append('plainOrComputer', form.plainOrComputer);
      formData.append('computerWorkDesign', form.computerWorkDesign);
      formData.append('workPatternType', form.workPatternType);
      formData.append('threadWorkColor', form.threadWorkColor);
      formData.append('borderWorkRequired', form.borderWorkRequired);
      
      formData.append('frontNeckType', form.frontNeckType);
      formData.append('backNeckType', form.backNeckType);
      formData.append('sleeveType', form.sleeveType);
      formData.append('sleeveLength', form.sleeveLength);
      formData.append('blouseLength', form.blouseLength);
      formData.append('openingType', form.openingType);
      formData.append('closureStyle', form.closureStyle);
      formData.append('paddingRequired', form.paddingRequired);
      formData.append('liningRequired', form.liningRequired);
      
      // Measurements
      const measurements: Record<string, string> = {
        bust: form.bust,
        waist: form.waist,
        shoulder: form.shoulder,
        armhole: form.armhole,
        sleeveRound: form.sleeveRound,
        sleeveLengthMeas: form.sleeveLengthMeas,
        blouseLengthMeas: form.blouseLengthMeas,
        frontNeckDepth: form.frontNeckDepth,
        backNeckDepth: form.backNeckDepth,
      };
      formData.append('measurements', JSON.stringify(measurements));
      formData.append('knowMeasurements', String(form.knowMeasurements));
      formData.append('needTailorSupport', String(form.needTailorSupport));
      
      // Images
      if (form.referenceBlouseImage) formData.append('referenceImages', form.referenceBlouseImage);
      if (form.sareeImage) formData.append('referenceImages', form.sareeImage);
      if (form.measurementImage) formData.append('referenceImages', form.measurementImage);
      
      // Additional info
      formData.append('occasion', form.occasion);
      formData.append('deliveryDate', form.deliveryDate);
      formData.append('budgetRange', form.budgetRange);
      formData.append('specialInstructions', form.specialInstructions);

      await customRequestService.submitRequest(formData);
      toast.success('Custom blouse request submitted');
      navigate('/my/custom-requests');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderReferenceButton = (fieldKey: string) => (
    <button
      type="button"
      onClick={() => setShowModal({ field: fieldKey, open: true })}
      className="mt-1 text-[0.7rem] font-bold uppercase tracking-wider text-primary-600 hover:text-primary-950 flex items-center gap-1 transition-colors"
    >
      <HelpCircle size={12} /> View Reference Guide
    </button>
  );

  const renderInlinePreview = (category: string, value: string) => {
    if (!value) return null;
    const option = dynamicOptions.find(o => o.category === category && o.value === value);
    if (!option || !option.image) return null;

    return (
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 p-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3 w-fit"
      >
        <div className="w-12 h-12 rounded-lg overflow-hidden border border-white shadow-sm flex-shrink-0">
           <img 
             src={option.image} 
             alt={value} 
             className="w-full h-full object-cover" 
           />
        </div>
        <div className="pr-2">
          <p className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest leading-none">Style Selected</p>
          <p className="text-sm font-serif text-gray-900">{value}</p>
        </div>
      </motion.div>
    );
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fabric Type</label>
                <select
                  value={form.fabricType}
                  onChange={(e) => setForm({ ...form, fabricType: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Fabric</option>
                  {getOptionsByCategory('fabricType').map(opt => (
                    <option key={opt._id} value={opt.value}>{opt.value}</option>
                  ))}
                  <option value="Other">Other (Specify in notes)</option>
                </select>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  {renderReferenceButton('fabricType')}
                  {renderInlinePreview('fabricType', form.fabricType)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cloth Color</label>
                <input
                  type="text"
                  placeholder="e.g., Maroon, Ivory"
                  value={form.clothColor}
                  onChange={(e) => setForm({ ...form, clothColor: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plain or Computer Work Cloth</label>
                <select
                  value={form.plainOrComputer}
                  onChange={(e) => setForm({ ...form, plainOrComputer: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option>Plain</option>
                  <option>Computer Work</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Computer Work Design Required</label>
                <select
                  value={form.computerWorkDesign}
                  onChange={(e) => setForm({ ...form, computerWorkDesign: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option>No</option>
                  <option>Yes</option>
                </select>
                {renderReferenceButton('computerWorkDesign')}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Pattern Type</label>
                <input
                  type="text"
                  placeholder="e.g., Floral, Geometric"
                  value={form.workPatternType}
                  onChange={(e) => setForm({ ...form, workPatternType: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {renderReferenceButton('workPatternType')}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thread / Work Color</label>
                <input
                  type="text"
                  placeholder="e.g., Gold, Silver"
                  value={form.threadWorkColor}
                  onChange={(e) => setForm({ ...form, threadWorkColor: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Border Work Required</label>
                <select
                  value={form.borderWorkRequired}
                  onChange={(e) => setForm({ ...form, borderWorkRequired: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option>No</option>
                  <option>Yes</option>
                </select>
                {renderReferenceButton('borderWorkRequired')}
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Front Neck Type</label>
                <select
                  value={form.frontNeckType}
                  onChange={(e) => setForm({ ...form, frontNeckType: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select</option>
                  {getOptionsByCategory('frontNeckType').map(opt => (
                    <option key={opt._id} value={opt.value}>{opt.value}</option>
                  ))}
                </select>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  {renderReferenceButton('frontNeckType')}
                  {renderInlinePreview('frontNeckType', form.frontNeckType)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Back Neck Type</label>
                <select
                  value={form.backNeckType}
                  onChange={(e) => setForm({ ...form, backNeckType: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select</option>
                  {getOptionsByCategory('backNeckType').map(opt => (
                    <option key={opt._id} value={opt.value}>{opt.value}</option>
                  ))}
                </select>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  {renderReferenceButton('backNeckType')}
                  {renderInlinePreview('backNeckType', form.backNeckType)}
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sleeve Type</label>
                <select
                  value={form.sleeveType}
                  onChange={(e) => setForm({ ...form, sleeveType: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select</option>
                  {getOptionsByCategory('sleeveType').map(opt => (
                    <option key={opt._id} value={opt.value}>{opt.value}</option>
                  ))}
                </select>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  {renderReferenceButton('sleeveType')}
                  {renderInlinePreview('sleeveType', form.sleeveType)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sleeve Length</label>
                <select
                  value={form.sleeveLength}
                  onChange={(e) => setForm({ ...form, sleeveLength: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select</option>
                  {getOptionsByCategory('sleeveLength').map(opt => (
                    <option key={opt._id} value={opt.value}>{opt.value}</option>
                  ))}
                </select>
                {renderReferenceButton('sleeveLength')}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blouse Length</label>
                <select
                  value={form.blouseLength}
                  onChange={(e) => setForm({ ...form, blouseLength: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select</option>
                  {getOptionsByCategory('blouseLength').map(opt => (
                    <option key={opt._id} value={opt.value}>{opt.value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opening Type</label>
                <select
                  value={form.openingType}
                  onChange={(e) => setForm({ ...form, openingType: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select</option>
                  {getOptionsByCategory('openingType').map(opt => (
                    <option key={opt._id} value={opt.value}>{opt.value}</option>
                  ))}
                </select>
                {renderReferenceButton('openingType')}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Closure Style</label>
                <select
                  value={form.closureStyle}
                  onChange={(e) => setForm({ ...form, closureStyle: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select</option>
                  {getOptionsByCategory('closureStyle').map(opt => (
                    <option key={opt._id} value={opt.value}>{opt.value}</option>
                  ))}
                </select>
                {renderReferenceButton('closureStyle')}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Padding Required</label>
                <select
                  value={form.paddingRequired}
                  onChange={(e) => setForm({ ...form, paddingRequired: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option>No</option>
                  <option>Yes</option>
                </select>
                {renderReferenceButton('padding')}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lining Required</label>
                <select
                  value={form.liningRequired}
                  onChange={(e) => setForm({ ...form, liningRequired: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option>No</option>
                  <option>Yes</option>
                </select>
                {renderReferenceButton('lining')}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={form.knowMeasurements}
                onChange={(e) => setForm({ ...form, knowMeasurements: e.target.checked })}
                className="mr-2 h-4 w-4 text-primary-600 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">I know my measurements</label>
            </div>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={form.needTailorSupport}
                onChange={(e) => setForm({ ...form, needTailorSupport: e.target.checked })}
                className="mr-2 h-4 w-4 text-primary-600 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">I need tailor measurement support</label>
            </div>
            {form.needTailorSupport && (
              <p className="text-sm text-gray-500 italic">Our team will contact you for measurement assistance.</p>
            )}
            {form.knowMeasurements && (
              <div className="grid md:grid-cols-2 gap-4">
                {['bust', 'waist', 'shoulder', 'armhole', 'sleeveRound', 'sleeveLengthMeas', 'blouseLengthMeas', 'frontNeckDepth', 'backNeckDepth'].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                      {field.replace(/([A-Z])/g, ' $1')}
                    </label>
                    <input
                      type="number"
                      placeholder="cm"
                      value={form[field as keyof typeof form] as string}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {renderReferenceButton(field)}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blouse Reference Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm({ ...form, referenceBlouseImage: e.target.files?.[0] || null })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Saree Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm({ ...form, sareeImage: e.target.files?.[0] || null })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Measurement Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm({ ...form, measurementImage: e.target.files?.[0] || null })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Occasion</label>
              <input
                type="text"
                placeholder="e.g., Wedding, Party"
                value={form.occasion}
                onChange={(e) => setForm({ ...form, occasion: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Required Delivery Date</label>
                <input
                  type="date"
                  value={form.deliveryDate}
                  onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
                <select
                  value={form.budgetRange}
                  onChange={(e) => setForm({ ...form, budgetRange: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select</option>
                  <option>₹5,000 - ₹10,000</option>
                  <option>₹10,001 - ₹20,000</option>
                  <option>₹20,001 - ₹35,000</option>
                  <option>Above ₹35,000</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
              <textarea
                rows={3}
                placeholder="Any extra details..."
                value={form.specialInstructions}
                onChange={(e) => setForm({ ...form, specialInstructions: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-primary-950">Review Your Request</h3>
            <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto max-h-96">
{JSON.stringify(form, null, 2)}
            </pre>
            <div className="flex space-x-4">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-primary-950 text-white py-3 rounded font-bold uppercase hover:bg-primary-800 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
              <Link
                to="/my/custom-requests"
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded font-medium text-center hover:bg-gray-300 transition"
              >
                Cancel
              </Link>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-warm-ivory py-12 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-4 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-serif text-primary-950 mb-6 text-center">Custom Blouse Request</h2>
        
        {/* Stepper */}
        <div className="flex justify-between mb-8 overflow-x-auto hide-scroll pb-2 -mx-2 px-2">
          {steps.map((label, idx) => (
            <div key={idx} className="flex-1 min-w-[100px] sm:min-w-[120px] text-center">
              <div
                className={`mx-auto w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm ${idx <= activeStep ? 'bg-primary-950 text-white shadow-lg' : 'bg-gray-200 text-gray-600'}`}
              >
                {idx + 1}
              </div>
              <span className={`block mt-2 text-[0.6rem] sm:text-sm ${idx === activeStep ? 'text-primary-950 font-bold' : idx < activeStep ? 'text-primary-800' : 'text-gray-500'}`}>{label}</span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {activeStep > 0 && (
            <button
              onClick={handleBack}
              className="px-4 sm:px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition text-sm flex items-center"
            >
              <ChevronLeft size={16} className="mr-1" /> Back
            </button>
          )}
          {activeStep < steps.length - 1 && (
            <button
              onClick={handleNext}
              className="ml-auto px-4 sm:px-6 py-2 bg-primary-950 text-white rounded hover:bg-primary-800 transition flex items-center text-sm"
            >
              Next <ChevronRight size={16} className="ml-1" />
            </button>
          )}
        </div>
      </div>

      {/* Reference Modal */}
      {showModal.open && (
        <ReferenceModal
          title={showModal.field.replace(/([A-Z])/g, ' $1')}
          images={[
            ...(REFERENCE_IMAGES[showModal.field] || []),
            ...dynamicOptions
              .filter(opt => opt.category === showModal.field && opt.image)
              .map(opt => opt.image!)
          ]}
          onClose={() => setShowModal({ field: '', open: false })}
        />
      )}
    </div>
  );
};

export default CustomBlousePage;
