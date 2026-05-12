import React, { type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

import { CheckCircle2, AlertCircle } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
  showPasswordStrength?: boolean;
  showCharCount?: boolean;
  maxLength?: number;
  multiline?: boolean;
  rows?: number;
}

const getPasswordStrength = (password: string) => {
  if (!password) return 0;
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
  if (/\d/.test(password)) strength += 25;
  if (/[^a-zA-Z\d]/.test(password)) strength += 25;
  return strength;
};

export const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(({
  className,
  label,
  error,
  success,
  leftIcon,
  rightIcon,
  helperText,
  showPasswordStrength,
  showCharCount,
  maxLength,
  multiline,
  rows = 4,
  id,
  type,
  value,
  ...props
}, ref) => {
  const inputId = id || `input-${crypto.randomUUID().split('-')[0]}`;
  const passwordStrength = type === 'password' && showPasswordStrength ? getPasswordStrength(String(value || '')) : 0;

  const inputCls = cn(
    "block w-full rounded-2xl border text-sm transition-all duration-300 bg-white px-5 py-3.5 outline-none shadow-sm",
    error 
      ? "border-red-200 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 text-red-900 placeholder-red-300"
      : success
        ? "border-emerald-200 bg-emerald-50/30 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-emerald-900"
        : "border-stone-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-stone-900 placeholder-stone-400 hover:border-stone-300",
    leftIcon && "pl-12",
    (rightIcon || error || success) && "pr-12",
    props.disabled && "bg-stone-50 opacity-75 cursor-not-allowed border-stone-100 shadow-none",
    multiline && "resize-none",
    className
  );

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-1.5 px-1">
        {label && (
          <label htmlFor={inputId} className="block text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">
            {label} {props.required && <span className="text-red-500">*</span>}
          </label>
        )}
        {showCharCount && maxLength && (
          <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">
            {String(value || '').length} / {maxLength}
          </span>
        )}
      </div>
      
      <div className="relative group">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400 group-focus-within:text-primary-600 transition-colors">
            {leftIcon}
          </div>
        )}
        
        {multiline ? (
          <textarea
            id={inputId}
            ref={ref as any}
            value={value}
            maxLength={maxLength}
            rows={rows}
            className={inputCls}
            {...(props as any)}
          />
        ) : (
          <input
            id={inputId}
            ref={ref as any}
            type={type}
            value={value}
            maxLength={maxLength}
            className={inputCls}
            {...props}
          />
        )}

        <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2">
          {error && <AlertCircle size={18} className="text-red-500 animate-shake" />}
          {success && !error && <CheckCircle2 size={18} className="text-emerald-500 animate-in fade-in zoom-in duration-300" />}
          {rightIcon && !error && !success && <div className="text-stone-400">{rightIcon}</div>}
        </div>
      </div>

      {type === 'password' && showPasswordStrength && String(value || '').length > 0 && (
        <div className="mt-2 flex gap-1 h-1 px-1">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className={cn(
                "flex-1 rounded-full transition-all duration-500",
                passwordStrength >= i * 25 
                  ? (passwordStrength <= 25 ? "bg-red-500" : passwordStrength <= 50 ? "bg-orange-500" : passwordStrength <= 75 ? "bg-yellow-500" : "bg-emerald-500")
                  : "bg-stone-100"
              )}
            />
          ))}
        </div>
      )}

      {error && (
        <p className="mt-2 text-[10px] font-bold text-red-600 flex items-center gap-1.5 ml-1 uppercase tracking-wider animate-in slide-in-from-top-1 duration-200" id={`${inputId}-error`}>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="mt-1.5 text-[10px] font-medium text-stone-400 ml-1 uppercase tracking-widest" id={`${inputId}-helper`}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
