import React from 'react';

interface ProgressOverviewProps {
  stats?: {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    totalPointsEarned: number;
    averageCompletion: number;
  };
  loading?: boolean;
}

export const ProgressOverview: React.FC<ProgressOverviewProps> = ({
  stats = {
    total: 0,
    completed: 0,
    inProgress: 0,
    notStarted: 0,
    totalPointsEarned: 0,
    averageCompletion: 0,
  },
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
        <div className="h-6 w-40 animate-pulse rounded bg-slate-200"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-2xl bg-slate-100"></div>
          ))}
        </div>
      </div>
    );
  }

  const progressItems = [
    {
      label: 'Completed',
      value: stats.completed,
      total: stats.total,
      icon: '✅',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      total: stats.total,
      icon: '⏳',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
    },
    {
      label: 'Not Started',
      value: stats.notStarted,
      total: stats.total,
      icon: '📋',
      color: 'text-neutral-500',
      bgColor: 'bg-neutral-50',
      borderColor: 'border-neutral-100',
    },
  ];

  const completionPercentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  return (
    <div className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
      <div className="space-y-1">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">Quest progress</p>
        <h3 className="display-font text-xl font-semibold tracking-[-0.03em] text-slate-950">How the journey is going</h3>
      </div>

      {/* Overall progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500">Overall completion</span>
          <span className="text-sm font-bold text-primary-600">{Math.round(completionPercentage)}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-500 via-accent-blue to-accent-pink transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Individual stats */}
      <div className="space-y-3">
        {progressItems.map((item, index) => (
          <div key={index} className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-sm text-slate-600">{item.label}</p>
                  <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                </div>
              </div>
              {item.total > 0 && (
                <span className="text-sm text-slate-500">{Math.round((item.value / item.total) * 100)}% of total</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Points earned */}
      <div className="rounded-[22px] border border-primary-100 bg-primary-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💎</span>
            <p className="text-slate-600">Points earned from quests</p>
          </div>
          <p className="text-2xl font-bold text-primary-600">{stats.totalPointsEarned}</p>
        </div>
      </div>
    </div>
  );
};
