import React, { type InputHTMLAttributes } from 'react';
import { cn } from './Button';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  className,
  label,
  error,
  leftIcon,
  rightIcon,
  helperText,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-darkGray mb-1.5">
          {label} {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {leftIcon}
          </div>
        )}
        
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "block w-full rounded-md border text-sm transition-all duration-200 bg-white px-4 py-2.5",
            "focus:outline-none focus:ring-2 focus:ring-opacity-50",
            error 
              ? "border-red-500 focus:border-red-500 focus:ring-red-500 text-red-900 placeholder-red-300"
              : "border-gray-300 focus:border-primary-500 focus:ring-primary-500 text-gray-900 placeholder-gray-400",
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            props.disabled && "bg-gray-50 opacity-75 cursor-not-allowed",
            className
          )}
          {...props}
        />

        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-red-600 animate-fade-in" id={`${inputId}-error`}>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-500" id={`${inputId}-helper`}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
