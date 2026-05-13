'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StudentStats } from '@/features/dashboard/components/StudentStats';
import { ProgressOverview } from '@/features/dashboard/components/ProgressOverview';
import { TasksList } from '@/features/dashboard/components/TasksList';
import { 
  ProgressTrendsChart, 
  TaskCompletionChart, 
  Leaderboard,
  StatsGrid 
} from '@/features/analytics/components/VisualizationComponents';
import { useAuth } from '@/hooks/useAuth';
import { studentApi, StudentDashboardResponse } from '@/lib/studentApi';
import { analyticsApi } from '@/lib/analyticsApi';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [dashboard, setDashboard] = useState<StudentDashboardResponse | null>(null);
  const [topPerformers, setTopPerformers] = useState<any[]>([]);
  const [progressTrends, setProgressTrends] = useState<any[]>([]);
  const [taskStats, setTaskStats] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication and load data
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (authLoading) return;

    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load student dashboard
        const dashboardData = await studentApi.getDashboard();
        setDashboard(dashboardData);

        // Load analytics data
        if (user?.id) {
          try {
            const trends = await analyticsApi.getProgressTrends(user.id, 30);
            setProgressTrends(trends);
          } catch (err) {
            console.warn('Failed to load progress trends:', err);
          }

          try {
            const topStudents = await analyticsApi.getTopPerformers(10, user.schoolId);
            setTopPerformers(topStudents);
          } catch (err) {
            console.warn('Failed to load top performers:', err);
          }
        }

        try {
          const tasks = await analyticsApi.getTaskCompletionStats(user?.schoolId);
          if (tasks && Array.isArray(tasks)) {
            setTaskStats(tasks.slice(0, 5));
          }
        } catch (err) {
          console.warn('Failed to load task stats:', err);
        }

        try {
          const stats = await analyticsApi.getDashboardStats(user?.schoolId);
          setDashboardStats(stats);
        } catch (err) {
          console.warn('Failed to load dashboard stats:', err);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [isAuthenticated, authLoading, user, router]);

  const handleSignOut = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-neutral-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading your dashboard...</p>
        </div>
      </main>
    );
  }

  // Stat cards for dashboard overview
  const statCards = [
    { label: 'Total Students', value: dashboardStats?.totalStudents || 0, icon: '👥', color: 'primary' as const },
    { label: 'Average Points', value: Math.round(dashboardStats?.averagePoints || 0), icon: '⭐', color: 'orange' as const },
    { label: 'Completion Rate', value: `${dashboardStats?.completionRate || 0}%`, icon: '✅', color: 'green' as const },
    { label: 'Active Streak', value: dashboardStats?.averageLevel || 0, icon: '🔥', color: 'pink' as const },
  ];

  return (
    <main className="min-h-[calc(100vh-80px)] bg-white">
      {/* Header Section */}
      <div className="border-b border-neutral-100 bg-white sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary-600 mb-1">Welcome back</p>
              <h1 
                className="text-3xl md:text-4xl font-bold text-neutral-900"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                {dashboard?.profile?.name || 'Learning Dashboard'}
              </h1>
              <p className="text-neutral-600 mt-1">Grade {dashboard?.profile?.grade || '-'} • {dashboard?.profile?.school || '-'}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-6 py-2.5 rounded-lg bg-neutral-100 text-neutral-700 font-semibold hover:bg-neutral-200 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Error Alert */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4">
            <p className="text-red-700 font-medium">⚠️ {error}</p>
          </div>
        )}

        {/* Quick Stats Overview */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4" style={{ fontFamily: 'var(--font-poppins)' }}>
            📊 Overview
          </h2>
          {/* Top Performers */}
          {topPerformers.length > 0 && (
            <Leaderboard students={topPerformers} title="Top Performers" limit={5} />
          )}

          {/* Task Completion */}
          {taskStats.length > 0 && (
            <div className="lg:col-span-2">
              <TaskCompletionChart data={taskStats} title="📋 Task Completion Rates" />
            </div>
          )}
          {/* Progress Trends */}
          {progressTrends.length > 0 && (
            <ProgressTrendsChart data={progressTrends} title="📈 Your Progress" />
          )}
        </section>

        {/* Student Stats Card */}
        {dashboard && (
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4" style={{ fontFamily: 'var(--font-poppins)' }}>
              ⭐ Your Stats
            </h2>
            <StudentStats
              name={dashboard.profile.name}
              grade={dashboard.profile.grade}
              school={dashboard.profile.school}
              totalPoints={dashboard.profile.totalPoints}
              currentStreak={dashboard.profile.currentStreak}
              longestStreak={dashboard.profile.longestStreak}
              level={dashboard.profile.level}
              loading={isLoading}
            />
          </section>
        )}

        {/* Progress Overview */}
        {dashboard && (
          <section>
            <ProgressOverview stats={dashboard.stats} loading={isLoading} />
          </section>
        )}

        {/* Tasks List */}
        {dashboard && (
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4" style={{ fontFamily: 'var(--font-poppins)' }}>
              ✍️ Your Quests
            </h2>
            <TasksList tasks={dashboard.progress} loading={isLoading} />
          </section>
        )}
      </div>
    </main>
  );
}
