'use client';

import { API } from './endpoints';

type Json = any;

export const apiClient = {
  getToken(): string | null {
    try {
      return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    } catch (e) {
      return null;
    }
  },
  setToken(token: string) {
    try {
      localStorage.setItem('token', token);
    } catch (e) {
      // noop
    }
  },
  clearToken() {
    try {
      localStorage.removeItem('token');
    } catch (e) {
      // noop
    }
  },
  async fetchJson<T = Json>(input: RequestInfo, init?: RequestInit) {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(input, {
      ...init,
      headers: {
        ...headers,
        ...(init && init.headers ? (init.headers as Record<string, string>) : {}),
      },
      credentials: 'include',
    });

    if (!res.ok) {
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (_) {
        data = { message: text };
      }
      throw new Error(data?.message || res.statusText || 'Request failed');
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return res.json() as Promise<T>;
    }
    return (res.text() as unknown) as T;
  },
  // convenience wrappers using endpoints
  endpoints: API,
};

export default apiClient;
