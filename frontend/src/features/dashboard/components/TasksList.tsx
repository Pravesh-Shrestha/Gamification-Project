import React, { useState, useEffect } from 'react';

interface TaskItem {
  _id: string;
  taskId?: {
    _id: string;
    title: string;
    subject: string;
    difficulty: string;
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

interface TasksListProps {
  tasks?: TaskItem[];
  loading?: boolean;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'medium':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'hard':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return '✅';
    case 'in_progress':
      return '⏳';
    default:
      return '📋';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-emerald-600';
    case 'in_progress':
      return 'text-amber-600';
    default:
      return 'text-slate-500';
  }
};

export const TasksList: React.FC<TasksListProps> = ({ tasks = [], loading = false }) => {
  if (loading) {
    return (
      <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
        <div className="h-7 w-48 animate-pulse rounded-full bg-slate-200"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-[24px] border border-slate-200 bg-slate-100"></div>
          ))}
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
        <h3 className="display-font mb-2 text-xl font-semibold tracking-[-0.03em] text-slate-950">Tasks & Quests</h3>
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
          <p className="text-slate-600">No quests are assigned yet.</p>
          <p className="mt-2 text-sm text-slate-500">New adventures will appear here when teachers publish them.</p>
        </div>
      </div>
    );
  }
  const [likes, setLikes] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem('task_likes');
      if (raw) setLikes(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('task_likes', JSON.stringify(likes));
    } catch (e) {}
  }, [likes]);

  const handleLike = (taskId: string) => {
    setLikes((s) => ({ ...s, [taskId]: (s[taskId] || 0) + 1 }));
  };

  return (
    <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
      <div className="space-y-1">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">Active quests</p>
        <h3 className="display-font text-xl font-semibold tracking-[-0.03em] text-slate-950">Tasks & Quests</h3>
      </div>

      <div className="max-h-none space-y-3 overflow-y-auto pr-1 md:max-h-[26rem]">
        {tasks.map((task) => (
          <div
            key={task._id}
            className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-slate-50"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-lg ${getStatusColor(task.status)}`}>{getStatusIcon(task.status)}</span>
                    <h4 className="text-base font-semibold text-slate-950 md:text-lg">{task.taskId?.title || 'Untitled Task'}</h4>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{task.taskId?.subject}</p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getDifficultyColor(task.taskId?.difficulty || '')}`}
                >
                  {task.taskId?.difficulty || 'unknown'}
                </span>
              </div>

              {task.status !== 'not_started' && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Progress</span>
                    <span className="text-xs text-primary-600">{task.completionPercentage}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary-500 via-accent-blue to-accent-pink transition-all duration-300"
                      style={{ width: `${task.completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex flex-wrap gap-4">
                  <span>🎯 Attempts: {task.attempts}</span>
                  <span>⭐ Points: {task.pointsEarned}/{task.taskId?.pointsReward || 0}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleLike(task._id)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
                  >
                    👍 Like {likes[task._id] ? `(${likes[task._id]})` : ''}
                  </button>
                </div>
                {task.taskId?.dueDate && (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700">
                    📅 Due {new Date(task.taskId.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200 pt-4 text-sm text-slate-500">
        <p>Showing {tasks.length} task(s)</p>
      </div>
    </div>
  );
};
