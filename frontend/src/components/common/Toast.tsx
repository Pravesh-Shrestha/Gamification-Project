'use client';

import React from 'react';

export function Toast({ title, message }: { title?: string; message?: string }) {
  return (
    <div className="pointer-events-auto w-80 rounded-xl bg-white/95 p-3 shadow-lg ring-1 ring-slate-900/5">
      {title && <div className="mb-1 text-sm font-semibold text-slate-900">{title}</div>}
      {message && <div className="text-sm text-slate-700">{message}</div>}
    </div>
  );
}

export default Toast;
