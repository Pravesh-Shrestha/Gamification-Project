import { apiClient } from './api';

export interface ProgressTrend {
  date: string;
  pointsEarned: number;
  tasksCompleted: number;
}

export interface TaskCompletionStat {
  taskId: string;
  title: string;
  difficulty: string;
  pointsReward: number;
  completionRate: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  total: number;
}

export interface TopPerformer {
  _id: string;
  name: string;
  grade: string;
  totalPoints: number;
  level: number;
  streak: number;
  longestStreak: number;
}

export const analyticsApi = {
  /**
   * Get student progress trends
   */
  async getProgressTrends(studentId: string, days = 30) {
    try {
      const response = await apiClient.get<{ trends: ProgressTrend[] }>(`/analytics/students/${studentId}/progress-trends?days=${days}`);
      if (!response.success || !response.data) return [];
      return response.data.trends || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch progress trends');
    }
  },

  /**
   * Get task completion statistics
   */
  async getTaskCompletionStats(schoolId?: string) {
    try {
      let url = '/analytics/tasks/completion-stats';
      if (schoolId) {
        url += `?schoolId=${schoolId}`;
      }
      const response = await apiClient.get<{ tasks: TaskCompletionStat[] }>(url);
      return response.data || { tasks: [] };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch task completion stats');
    }
  },

  /**
   * Get top performing students
   */
  async getTopPerformers(limit = 10, schoolId?: string) {
    try {
      let url = `/analytics/students/top-performers?limit=${limit}`;
      if (schoolId) {
        url += `&schoolId=${schoolId}`;
      }
      const response = await apiClient.get<{ topPerformers: TopPerformer[] }>(url);
      if (!response.success || !response.data) return [];
      return response.data.topPerformers || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch top performers');
    }
  },

  /**
   * Get engagement heatmap data
   */
  async getEngagementHeatmap(studentId?: string, days = 30) {
    try {
      let url = `/analytics/engagement/heatmap?days=${days}`;
      if (studentId) {
        url += `&studentId=${studentId}`;
      }
      const response = await apiClient.get<{ heatmap: any[] }>(url);
      if (!response.success || !response.data) return [];
      return response.data.heatmap || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch engagement heatmap');
    }
  },

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(schoolId?: string) {
    try {
      let url = '/analytics/dashboard/stats';
      if (schoolId) {
        url += `?schoolId=${schoolId}`;
      }
      const response = await apiClient.get<any>(url);
      if (!response.success || !response.data) return {};
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch dashboard stats');
    }
  },

  /**
   * Get student distribution by grade
   */
  async getStudentDistribution(schoolId?: string) {
    try {
      let url = '/analytics/distribution';
      if (schoolId) {
        url += `?schoolId=${schoolId}`;
      }
      const response = await apiClient.get<{ distribution: any[] }>(url);
      if (!response.success || !response.data) return [];
      return response.data.distribution || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch student distribution');
    }
  },
};
