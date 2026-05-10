import React, { type ButtonHTMLAttributes } from 'react';
import { Spinner } from './Spinner';
import { cn } from '../../utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  children,
  ...props
}, ref) => {
  
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none rounded-md";
  
  const variants = {
    primary: "text-white bg-primary-700 hover:bg-primary-800 shadow-premium transform hover:-translate-y-0.5 active:scale-95 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500",
    secondary: "text-primary-700 bg-white border border-primary-200 hover:bg-primary-50 transform hover:-translate-y-0.5 active:scale-95 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500",
    accent: "text-white bg-accent hover:bg-accent-dark shadow-soft transform hover:-translate-y-0.5 active:scale-95",
    outline: "border-2 border-gray-300 text-gray-700 hover:border-primary-700 hover:text-primary-700 focus:ring-2 focus:ring-primary-500",
    ghost: "text-gray-700 hover:bg-gray-100 hover:text-primary-700 focus:ring-2 focus:ring-primary-500",
    danger: "text-white bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-soft transform hover:-translate-y-0.5 active:scale-95"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    icon: "p-2",
  };

  return (
    <button
      ref={ref}
      disabled={isLoading || disabled}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Spinner size="sm" color={variant === 'primary' || variant === 'accent' || variant === 'danger' ? 'white' : 'primary'} />
      ) : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';
