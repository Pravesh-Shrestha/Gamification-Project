'use client';

import React, { createContext, useContext, useCallback, useState } from 'react';

export interface UIError {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  duration?: number;
}

interface ErrorContextType {
  errors: UIError[];
  addError: (message: string, type?: UIError['type'], duration?: number) => string;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const [errors, setErrors] = useState<UIError[]>([]);

  const addError = useCallback(
    (message: string, type: UIError['type'] = 'error', duration = 5000) => {
      const id = `${Date.now()}-${Math.random()}`;
      const error: UIError = { id, message, type, duration };

      setErrors((prev) => [...prev, error]);

      if (duration > 0) {
        setTimeout(() => removeError(id), duration);
      }

      return id;
    },
    []
  );

  const removeError = useCallback((id: string) => {
    setErrors((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return (
    <ErrorContext.Provider value={{ errors, addError, removeError, clearErrors }}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within ErrorProvider');
  }
  return context;
}
