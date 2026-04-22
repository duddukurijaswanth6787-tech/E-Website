export const Spinner = ({ 
  size = 'md', 
  color = 'primary' 
}: { 
  size?: 'sm' | 'md' | 'lg', 
  color?: 'primary' | 'white' | 'accent' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const colorClasses = {
    primary: 'border-primary-200 border-t-primary-700',
    white: 'border-white/30 border-t-white',
    accent: 'border-accent-light border-t-accent',
  };

  return (
    <div className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}`} />
  );
};
