import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
}

export const Card = ({ 
  children, 
  className, 
  padding = 'md',
  hover = false 
}: CardProps) => {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  return (
    <div className={cn(
      "bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-300",
      paddings[padding],
      hover && "hover:shadow-md hover:border-primary-100",
      className
    )}>
      {children}
    </div>
  );
};
