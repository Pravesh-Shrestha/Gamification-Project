import React from 'react';

interface StudentStatsProps {
  name?: string;
  grade?: string;
  school?: string;
  totalPoints?: number;
  currentStreak?: number;
  longestStreak?: number;
  level?: number;
  loading?: boolean;
}

export const StudentStats: React.FC<StudentStatsProps> = ({
  name,
  grade,
  school,
  totalPoints = 0,
  currentStreak = 0,
  longestStreak = 0,
  level = 1,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-7 w-44 animate-pulse rounded-full bg-slate-200"></div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-[24px] border border-slate-200 bg-white"></div>
          ))}
        </div>
      </div>
    );
  }

  const statItems = [
    { label: 'Total Points', value: totalPoints, icon: '⭐', accent: 'from-amber-300/20 to-orange-400/10', ring: 'border-amber-300/25' },
    { label: 'Current Streak', value: currentStreak, icon: '🔥', accent: 'from-rose-300/20 to-orange-400/10', ring: 'border-rose-300/25' },
    { label: 'Longest Streak', value: longestStreak, icon: '📈', accent: 'from-sky-300/20 to-cyan-400/10', ring: 'border-sky-300/25' },
    { label: 'Level', value: level, icon: '🎯', accent: 'from-lime-300/20 to-emerald-400/10', ring: 'border-lime-300/25' },
  ];

  const pointsIntoLevel = totalPoints % 100;
  const pointsToNextLevel = pointsIntoLevel === 0 ? 100 : 100 - pointsIntoLevel;

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200/80 bg-white/85 p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur-xl md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="display-font text-2xl font-semibold tracking-[-0.04em] text-slate-950 md:text-3xl">
                {name || 'Student'}
              </h2>
              <span className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary-700">
                {grade ? `Grade ${grade}` : 'Explorer'}
              </span>
            </div>
            {school && <p className="text-sm text-slate-600">{school}</p>}
          </div>

          <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-left md:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">Next level</p>
            <p className="mt-1 text-lg font-bold text-emerald-700">{pointsToNextLevel} points away</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {statItems.map((item, index) => (
          <div
            key={index}
            className="rounded-[24px] border border-slate-200 bg-white p-4 transition-transform duration-200 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
                <p className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-slate-950">{item.value}</p>
              </div>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-50 text-2xl shadow-sm">
                {item.icon}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
