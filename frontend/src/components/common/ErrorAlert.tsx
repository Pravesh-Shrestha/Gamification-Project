'use client';

import { AlertCircle, X } from 'lucide-react';
import { useError } from '@/hooks/errors/useError';
import { useEffect, useState } from 'react';

export function ErrorAlert() {
  const { errors, removeError } = useError();
  const [visibleErrors, setVisibleErrors] = useState<typeof errors>([]);

  useEffect(() => {
    setVisibleErrors(errors);
  }, [errors]);

  if (visibleErrors.length === 0) return null;

  return (
    <div className="fixed left-4 right-4 top-4 z-50 space-y-3 sm:left-auto sm:right-6 sm:top-6 sm:w-[22rem]">
      {visibleErrors.map((error) => (
        <div
          key={error.id}
          className="flex items-start gap-3 rounded-[20px] border border-rose-200/80 bg-white/95 p-4 text-slate-900 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.45)] backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-rose-100 text-rose-600">
            <AlertCircle className="h-4 w-4" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800">{error.message}</p>
          </div>
          <button
            onClick={() => removeError(error.id)}
            className="flex-shrink-0 rounded-full p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
