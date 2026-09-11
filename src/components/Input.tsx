import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  suffix?: string | React.ReactNode;
  prefixIcon?: React.ReactNode;
  inputSize?: 'md' | 'lg' | 'xl';
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  suffix,
  prefixIcon,
  inputSize = 'lg',
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  const sizeClasses = {
    md: 'py-2.5 px-4 text-base rounded-xl',
    lg: 'py-3.5 px-5 text-lg font-semibold rounded-2xl',
    xl: 'py-4 px-6 text-3xl font-extrabold text-center rounded-2xl tracking-wide'
  };

  return (
    <div className="w-full text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="block mb-2 text-sm font-bold text-slate-700 tracking-wide"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefixIcon && (
          <div className="absolute left-4 flex items-center pointer-events-none text-slate-400">
            {prefixIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-white text-slate-900 border-2 ${
            error ? 'border-rose-500 focus:border-rose-600 focus:ring-rose-200' : 'border-slate-300/90 focus:border-[#0F3D2E] focus:ring-[#0F3D2E]/20'
          } shadow-inner focus:outline-none focus:ring-4 transition-all ${prefixIcon ? 'pl-11' : ''} ${
            suffix ? 'pr-14' : ''
          } ${sizeClasses[inputSize]} ${className}`}
          {...props}
        />
        {suffix && (
          <div className="absolute right-4 flex items-center pointer-events-none text-slate-500 font-bold text-lg">
            {suffix}
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-sm font-semibold text-rose-600">{error}</p>}
      {!error && helperText && <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};
