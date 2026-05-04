'use client';

import React from 'react';
import { Dialog } from './Dialog';

export function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={open} title={title} onClose={onCancel}>
      <div className="space-y-4">
        {message && <p className="text-sm text-slate-700">{message}</p>}
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-md border px-4 py-2 text-sm">Cancel</button>
          <button onClick={onConfirm} className="rounded-md bg-primary-600 px-4 py-2 text-sm text-white">Confirm</button>
        </div>
      </div>
    </Dialog>
  );
}

export default ConfirmDialog;
