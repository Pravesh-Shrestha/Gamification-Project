'use client';

import { ErrorProvider } from '@/hooks/errors/useError';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { ReactNode } from 'react';

export function ErrorProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <ErrorProvider>
      <ErrorAlert />
      {children}
    </ErrorProvider>
  );
}
