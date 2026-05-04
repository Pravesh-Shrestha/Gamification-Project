/**
 * Centralized API client for all backend requests
 * Handles authentication, error handling, and request/response formatting
 */

// Use environment override when provided; default to backend dev port 5001
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

function mapApiErrorMessage(message?: string, status?: number): string {
  const normalized = (message || '').toLowerCase();

  if (status === 401 || normalized.includes('invalid credentials') || normalized.includes('unauthorized')) {
    return 'Sign in failed. Check your email and password, then try again.';
  }

  if (
    normalized.includes('forbidden') ||
    normalized.includes('required roles') ||
    normalized.includes('access denied')
  ) {
    return 'You do not have access to this area.';
  }

  if (normalized.includes('not found')) {
    return 'We could not find a matching record.';
  }

  if (
    normalized.includes('validation') ||
    normalized.includes('duplicate') ||
    normalized.includes('already exists')
  ) {
    return 'Please review the form and try again.';
  }

  if (normalized.includes('network') || normalized.includes('failed to fetch')) {
    return 'The server could not be reached. Please try again.';
  }

  return 'Something went wrong. Please try again in a moment.';
}

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get stored JWT token from localStorage
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  /**
   * Build headers with authentication token
   */
  private buildHeaders(options?: RequestOptions): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    };

    const token = this.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Make API request with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.buildHeaders(options);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized - clear token and redirect to login
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(mapApiErrorMessage(data.message, response.status));
      }

      return data;
    } catch (error) {
      console.error(`API Request Error [${options.method || 'GET'} ${endpoint}]:`, error);
      throw new Error(mapApiErrorMessage(error instanceof Error ? error.message : undefined));
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Set auth token (after login)
   */
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  /**
   * Clear auth token (logout)
   */
  clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;
