/**
 * Authentication API endpoints
 */

import { apiClient } from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    role: 'student' | 'teacher' | 'admin' | 'master';
  };
}

export const authApi = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Login failed');
    }
    apiClient.setToken(response.data.token);
    return response.data;
  },

  /**
   * Logout (clear token)
   */
  logout(): void {
    apiClient.clearToken();
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return apiClient.getToken() !== null;
  },
};
