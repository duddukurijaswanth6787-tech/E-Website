import { Ruler, Scissors, User, Sparkles } from 'lucide-react';

export const MEASUREMENT_CATEGORIES = [
  'Casual Blouse',
  'Wedding Blouse',
  'Lehenga Blouse',
  'Saree Fall & ZigZag',
  'Bridal Wear',
  'Daily Wear',
  'Party Wear',
  'Custom Gown'
];

export interface MeasurementField {
  name: string;
  label: string;
  helper: string;
  min: number;
  max: number;
  unit: string;
}

export interface MeasurementSection {
  id: string;
  title: string;
  icon: any;
  fields: MeasurementField[];
}

export const MEASUREMENT_SCHEMA: MeasurementSection[] = [
  {
    id: 'body',
    title: 'Body Measurements',
    icon: User,
    fields: [
      { name: 'bust', label: 'Bust / Chest', helper: 'Measure around the fullest part of the bust', min: 20, max: 60, unit: 'in' },
      { name: 'waist', label: 'Waist', helper: 'Measure around the natural waistline', min: 18, max: 55, unit: 'in' },
      { name: 'hip', label: 'Hip', helper: 'Measure around the fullest part of the hips', min: 20, max: 70, unit: 'in' },
      { name: 'shoulder', label: 'Shoulder Width', helper: 'Measure from one shoulder point to the other', min: 10, max: 25, unit: 'in' },
    ]
  },
  {
    id: 'sleeve',
    title: 'Sleeve Details',
    icon: Scissors,
    fields: [
      { name: 'sleeve_length', label: 'Sleeve Length', helper: 'From shoulder point to desired length', min: 2, max: 30, unit: 'in' },
      { name: 'arm_round', label: 'Arm Round', helper: 'Measure around the fullest part of the upper arm', min: 5, max: 25, unit: 'in' },
      { name: 'elbow_round', label: 'Elbow Round', helper: 'Measure around the elbow joint', min: 5, max: 20, unit: 'in' },
    ]
  },
  {
    id: 'neck',
    title: 'Neck Specifications',
    icon: Ruler,
    fields: [
      { name: 'front_neck', label: 'Front Neck Depth', helper: 'From shoulder to desired front depth', min: 3, max: 12, unit: 'in' },
      { name: 'back_neck', label: 'Back Neck Depth', helper: 'From shoulder to desired back depth', min: 1, max: 15, unit: 'in' },
      { name: 'neck_width', label: 'Neck Width', helper: 'Width across the neckline', min: 4, max: 12, unit: 'in' },
    ]
  },
  {
    id: 'style',
    title: 'Style & Fitting',
    icon: Sparkles,
    fields: [
      { name: 'blouse_length', label: 'Blouse Length', helper: 'From shoulder to desired bottom edge', min: 10, max: 25, unit: 'in' },
      { name: 'point_length', label: 'Point Length', helper: 'From shoulder to bust point', min: 7, max: 15, unit: 'in' },
    ]
  }
];

export const STYLE_OPTIONS = {
  padding: ['Yes', 'No', 'Removable'],
  lining: ['Cotton', 'Silk', 'Synthetic', 'None'],
  neck_style: ['U-Neck', 'V-Neck', 'Square', 'Boat Neck', 'Sweetheart', 'High Neck', 'Collar'],
  back_opening: ['Hooks', 'Zipper', 'Strings (Dori)', 'None'],
};

export interface MeasurementProfile {
  _id?: string;
  name: string;
  category: string;
  measurements: Record<string, number | string>;
  isDefault: boolean;
  notes: string;
  updatedAt?: string;
}
