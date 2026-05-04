'use client';

import React from 'react';

export function Dialog({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-lg">
        {title && <h3 className="mb-4 text-lg font-semibold">{title}</h3>}
        <div>{children}</div>
      </div>
    </div>
  );
}

export default Dialog;
