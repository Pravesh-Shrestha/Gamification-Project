import { apiClient } from './api';

export interface CreateUserRequest {
  role: 'student' | 'admin' | 'teacher';
  email: string;
  name: string;
  password?: string;
  school?: string;
  grade?: string;
}

export const adminApi = {
  async getUsers() {
    const res = await apiClient.get<any>('/admin/users');
    if (!res.success || !res.data) throw new Error(res.message || 'Failed to fetch users');
    return res.data;
  },

  async createUser(payload: CreateUserRequest) {
    const res = await apiClient.post<any>('/admin/users', payload);
    if (!res.success || !res.data) throw new Error(res.message || 'Failed to create user');
    return res.data;
  },

  async deleteUser(id: string) {
    const res = await apiClient.delete<any>(`/admin/users/${id}`);
    if (!res || res.success === false) throw new Error(res?.message || 'Failed to delete');
    return true;
  },
};

export default adminApi;
