import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full rounded-2xl border bg-white/90 px-4 py-3 text-slate-900 shadow-[0_1px_0_rgba(15,23,42,0.02)] transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-slate-100 ${error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500'} ${className}`}
          {...props}
        />
        {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
        {helperText && !error && <p className="mt-2 text-sm text-slate-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
