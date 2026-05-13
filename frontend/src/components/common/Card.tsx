import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable = false, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-[28px] border border-slate-200/70 bg-white/85 p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur-xl transition-all duration-200 ${hoverable ? 'hover:-translate-y-1 hover:shadow-[0_28px_70px_-42px_rgba(15,23,42,0.42)] hover:border-primary-200' : ''} ${className}`}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';
