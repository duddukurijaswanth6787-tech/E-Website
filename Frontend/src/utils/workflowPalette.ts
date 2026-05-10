import { 
  Circle, 
  CheckCircle2, 
  Clock, 
  Scissors, 
  Settings, 
  Star, 
  Truck, 
  AlertCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const WorkflowStage = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  MEASURING: 'Measuring',
  CUTTING: 'Cutting',
  STITCHING: 'Stitching',
  QUALITY_CHECK: 'Quality Check',
  READY: 'Ready',
  DELIVERED: 'Delivered'
} as const;

export type WorkflowStage = typeof WorkflowStage[keyof typeof WorkflowStage];

export interface StageConfig {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: LucideIcon;
  description: string;
}

export const WORKFLOW_STAGES: Record<string, StageConfig> = {
  'Assigned': {
    id: 'Assigned',
    label: 'Assigned',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: Circle,
    description: 'Task assigned to tailor'
  },
  'Fabric Received': {
    id: 'Fabric Received',
    label: 'Fabric Received',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    icon: CheckCircle2,
    description: 'Raw materials ready'
  },
  'Cutting': {
    id: 'Cutting',
    label: 'Cutting',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: Scissors,
    description: 'Fabric cutting in progress'
  },
  'Stitching': {
    id: 'Stitching',
    label: 'Stitching',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: Settings,
    description: 'Main production phase'
  },
  'Embroidery': {
    id: 'Embroidery',
    label: 'Embroidery',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: Star,
    description: 'Design enhancements'
  },
  'Trial Ready': {
    id: 'Trial Ready',
    label: 'Trial Ready',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    icon: Clock,
    description: 'Ready for customer trial'
  },
  'Alteration': {
    id: 'Alteration',
    label: 'Alteration',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    icon: AlertCircle,
    description: 'Fitting adjustments'
  },
  'QC': {
    id: 'QC',
    label: 'Quality Check',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    icon: CheckCircle2,
    description: 'Final quality inspection'
  },
  'Rework': {
    id: 'Rework',
    label: 'Rework',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: AlertCircle,
    description: 'Rejected by QC'
  },
  'Completed': {
    id: 'Completed',
    label: 'Ready for Pickup',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: CheckCircle2,
    description: 'Finished and packed'
  },
  'Delivered': {
    id: 'Delivered',
    label: 'Delivered',
    color: 'text-stone-600',
    bgColor: 'bg-stone-50',
    borderColor: 'border-stone-200',
    icon: Truck,
    description: 'Handed over to customer'
  }
};

export const PRIORITY_CONFIG = {
  'Urgent': {
    label: 'Urgent',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]'
  },
  'High': {
    label: 'High',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    glow: ''
  },
  'Medium': {
    label: 'Medium',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    glow: ''
  },
  'Low': {
    label: 'Low',
    color: 'text-stone-600',
    bgColor: 'bg-stone-50',
    borderColor: 'border-stone-200',
    glow: ''
  }
};
