'use client';

import { useCallback } from 'react';
import { useToastContext } from '@/components/common/ToastProvider';

export const useToast = () => {
  const ctx = useToastContext();
  const toast = useCallback((title?: string, message?: string) => {
    ctx.push({ title, message });
  }, [ctx]);

  return { toast };
};

export default useToast;
