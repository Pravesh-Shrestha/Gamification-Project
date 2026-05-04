'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';
import Toast from './Toast';

type ToastItem = { id: string; title?: string; message?: string };

const ToastContext = createContext<{ push: (t: Omit<ToastItem, 'id'>) => void } | undefined>(undefined);

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastContext must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = (t: Omit<ToastItem, 'id'>) => {
    const id = String(Date.now()) + Math.random().toString(36).slice(2, 7);
    setToasts((s) => [...s, { id, ...t }]);
    // auto remove
    setTimeout(() => {
      setToasts((s) => s.filter((x) => x.id !== id));
    }, 5000);
  };

  const value = useMemo(() => ({ push }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-6 top-6 z-50 flex flex-col gap-3">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast title={t.title} message={t.message} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
