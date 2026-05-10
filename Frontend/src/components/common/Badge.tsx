import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
  pill?: boolean;
}

export const Badge = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className,
  pill = true 
}: BadgeProps) => {
  const variants = {
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    accent: 'bg-yellow-100 text-yellow-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-orange-100 text-orange-800',
    danger: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium',
        pill ? 'rounded-full' : 'rounded-md',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};
