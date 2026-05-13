'use client';

import React from 'react';

export function StatCard({ title, value, className = '' }: { title: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br from-white/60 to-white/40 border p-4 shadow-sm ${className}`}>
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

export default StatCard;
