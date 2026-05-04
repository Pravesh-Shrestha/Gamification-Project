'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StudentStats } from '@/features/dashboard/components/StudentStats';
import { ProgressOverview } from '@/features/dashboard/components/ProgressOverview';
import { TasksList } from '@/features/dashboard/components/TasksList';
import { ProgressTrendsChart, TaskCompletionChart, Leaderboard, StatsGrid } from '@/features/analytics/components/VisualizationComponents';
import { useAuth } from '@/hooks/useAuth';
import { studentApi, StudentDashboardResponse } from '@/lib/studentApi';
import { analyticsApi } from '@/lib/analyticsApi';
import { Button } from '@/components/common/Button';
import { useError } from '@/hooks/errors/useError';
import { ActivitySquare, BarChart3, LogOut, Sparkles, UsersRound } from 'lucide-react';
import { Sidebar } from '@/components/ui/Sidebar';

export default function DashboardPage() {
  const router = useRouter();
  const { addError } = useError();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [dashboard, setDashboard] = useState<StudentDashboardResponse | null>(null);
  const [topPerformers, setTopPerformers] = useState<any[]>([]);
  const [progressTrends, setProgressTrends] = useState<any[]>([]);
  const [taskStats, setTaskStats] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!authLoading && user && user.role !== 'student') {
      router.push('/admin');
      return;
    }

    if (authLoading) return;

    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const dashboardData = await studentApi.getDashboard();
        setDashboard(dashboardData);

        if (user?.id) {
          try {
            const trends = await analyticsApi.getProgressTrends(user.id, 30);
            setProgressTrends(trends);
          } catch {
            console.warn('Failed to load progress trends');
          }

          try {
            const topStudents = await analyticsApi.getTopPerformers(10, user.schoolId);
            setTopPerformers(topStudents);
          } catch {
            console.warn('Failed to load top performers');
          }
        }

        try {
          const tasks = await analyticsApi.getTaskCompletionStats(user?.schoolId);
          setTaskStats(tasks.tasks?.slice(0, 5) || []);
        } catch {
          console.warn('Failed to load task stats');
        }

        try {
          const stats = await analyticsApi.getDashboardStats(user?.schoolId);
          setDashboardStats(stats);
        } catch {
          console.warn('Failed to load dashboard stats');
        }
      } catch {
        addError('Failed to load dashboard — please refresh the page or contact support', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [isAuthenticated, authLoading, user, router, addError]);

  const handleSignOut = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (authLoading || isLoading) {
    return (
      <main className="min-h-[calc(100vh-80px)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl gap-6">
          <Sidebar />
          <div className="flex min-h-[calc(100vh-80px)] flex-1 items-center justify-center rounded-[28px] border border-slate-200/80 bg-white/80 p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.4)] backdrop-blur-xl">
            <div className="max-w-md text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[22px] bg-primary-50 text-primary-600 shadow-sm">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-200 border-t-primary-500" />
              </div>
              <h1 className="display-font text-2xl font-semibold tracking-[-0.04em] text-slate-950">Loading your dashboard</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">We are arranging your learning data, progress, and quests.</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const statCards = [
    { label: 'Total Students', value: dashboardStats?.totalStudents || 0, icon: UsersRound, color: 'primary' as const },
    { label: 'Average Points', value: Math.round(dashboardStats?.averagePoints || 0), icon: Sparkles, color: 'blue' as const },
    { label: 'Completion Rate', value: `${dashboardStats?.completionRate || 0}%`, icon: ActivitySquare, color: 'green' as const },
    { label: 'Average Level', value: Math.round(dashboardStats?.averageLevel || 0), icon: BarChart3, color: 'pink' as const },
  ];

  return (
    <main className="relative min-h-[calc(100vh-80px)] overflow-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_5%,rgba(0,82,204,0.1),transparent_22%),radial-gradient(circle_at_85%_10%,rgba(255,77,148,0.08),transparent_24%),radial-gradient(circle_at_50%_95%,rgba(0,102,255,0.08),transparent_28%)]" />

      <div className="relative mx-auto flex max-w-7xl gap-6">
        <Sidebar />

        <div className="min-w-0 flex-1 space-y-6">
          <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.4)] backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Welcome back
                </span>
                <div className="space-y-2">
                  <h1 className="display-font text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">
                    {dashboard?.profile?.name || 'Learning Dashboard'}
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                    Grade {dashboard?.profile?.grade || '-'} • {dashboard?.profile?.school || '-'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-[24px] border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Current level</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-950">Lv {dashboard?.profile?.level || 1}</p>
                </div>
                <Button onClick={handleSignOut} variant="secondary" size="md" className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </section>

          <section>
            <StatsGrid stats={statCards} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {progressTrends.length > 0 && <ProgressTrendsChart data={progressTrends} title="Your progress" />}
                {topPerformers.length > 0 && <Leaderboard students={topPerformers} title="Top performers" limit={5} />}
              </div>

              {taskStats.length > 0 && <TaskCompletionChart data={taskStats} title="Task completion rates" />}
            </div>

            <div className="space-y-6">
              {dashboard && (
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
              )}

              {dashboard && <ProgressOverview stats={dashboard.stats} loading={isLoading} />}
              {dashboard && <TasksList tasks={dashboard.progress} loading={isLoading} />}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
