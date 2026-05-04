/**
 * Student API endpoints
 */

import { apiClient } from './api';

export interface StudentProfile {
  _id: string;
  name: string;
  email: string;
  school: string;
  grade: string;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
}

export interface TaskProgress {
  _id: string;
  taskId: {
    _id: string;
    title: string;
    subject: string;
    difficulty: 'easy' | 'medium' | 'hard';
    pointsReward: number;
    dueDate: string;
  };
  status: 'not_started' | 'in_progress' | 'completed';
  completionPercentage: number;
  pointsEarned: number;
  attempts: number;
  startedAt: string;
  completedAt?: string;
}

export interface ProgressStats {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  totalPointsEarned: number;
  averageCompletion: number;
}

export interface ProgressResponse {
  progress: TaskProgress[];
  stats: ProgressStats;
}

export interface StudentDashboardResponse {
  profile: StudentProfile;
  progress: TaskProgress[];
  stats: ProgressStats;
  summary: {
    levelProgressPercentage: number;
    pointsToNextLevel: number;
  };
}

export const studentApi = {
  /**
   * Get the complete dashboard payload for the authenticated student
   */
  async getDashboard(): Promise<StudentDashboardResponse> {
    const response = await apiClient.get<StudentDashboardResponse>('/students/me/dashboard');
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch dashboard');
    }
    return response.data;
  },

  /**
   * Get current authenticated student's profile
   */
  async getCurrentProfile(): Promise<StudentProfile> {
    const response = await apiClient.get<StudentProfile>('/students/me/profile');
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch profile');
    }
    return response.data;
  },

  /**
   * Get current student's progress and tasks
   */
  async getProgress(): Promise<ProgressResponse> {
    const response = await apiClient.get<ProgressResponse>('/students/me/progress');
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch progress');
    }
    return response.data;
  },

  /**
   * Get specific student by ID
   */
  async getStudentById(id: string): Promise<StudentProfile> {
    const response = await apiClient.get<StudentProfile>(`/students/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch student');
    }
    return response.data;
  },
};
