import type { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionPath?: string;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-soft mb-6 border border-gray-100">
        <Icon size={40} className="text-primary-300" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-serif font-bold text-primary-950 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm mb-8 text-sm leading-relaxed">{description}</p>
      {actionLabel && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
