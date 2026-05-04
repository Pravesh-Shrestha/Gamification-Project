import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, className, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

    const variants = {
      primary: 'bg-gradient-to-r from-primary-500 via-primary-500 to-accent-blue text-white shadow-[0_14px_30px_rgba(0,82,204,0.22)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,82,204,0.28)] focus:ring-primary-500',
      secondary: 'border border-slate-200 bg-white/85 text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-primary-200 hover:bg-primary-50/90 focus:ring-primary-500',
      ghost: 'text-slate-600 hover:bg-slate-100/80 focus:ring-primary-500',
      danger: 'bg-gradient-to-r from-accent-red to-rose-500 text-white shadow-[0_14px_30px_rgba(255,107,107,0.24)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(255,107,107,0.28)] focus:ring-accent-red',
    };

    const sizes = {
      sm: 'h-9 px-3.5 text-sm',
      md: 'h-11 px-4.5 text-sm',
      lg: 'h-12 px-6 text-base',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {props.children}
      </button>
    );
  }
);

Button.displayName = 'Button';
