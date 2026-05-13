/**
 * useAuth Hook
 * Manages authentication state and provides auth utilities
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';

export interface User {
  id: string;
  name: string;
  role: 'student' | 'teacher' | 'admin' | 'master';
  schoolId?: string;
}

interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    const storedToken = apiClient.getToken();
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      // Try to load user from localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Failed to parse stored user:', e);
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    apiClient.setToken(newToken);
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(newUser));
  }, []);

  const logout = useCallback(() => {
    apiClient.clearToken();
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  }, []);

  return {
    isAuthenticated,
    isLoading,
    user,
    token,
    login,
    logout,
  };
};
