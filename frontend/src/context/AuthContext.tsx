// ============================================================
// academia.io — Auth Context
// ============================================================
// Provides authentication state across the entire app.
// Handles login, logout, token persistence, and auto-restore.
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { auth as authApi, setToken, getToken, onAuthChange } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // On mount — try to restore session from stored token
  useEffect(() => {
    const token = getToken();
    if (token) {
      authApi
        .me()
        .then((u) => setUser(u))
        .catch(() => {
          // Token expired or invalid — clear it
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Listen for external auth changes (e.g., from API 401s)
  useEffect(() => {
    const unsub = onAuthChange(() => {
      if (!getToken()) {
        setUser(null);
      }
    });
    return unsub;
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const result = await authApi.login(email, password);
      setToken(result.token);
      setUser(result.user);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
