'use client';

import React from 'react';

export function DashboardHero({ level, xp }: { level: number; xp: number }) {
  return (
    <div className="flex w-full items-center justify-between gap-6 rounded-2xl bg-white/80 p-6 shadow-lg">
      <div className="flex items-center gap-4">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-rose-500 text-white shadow-lg">
          <div className="text-center">
            <div className="text-xs opacity-90">LEVEL</div>
            <div className="text-3xl font-bold">{level}</div>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold">Welcome back</h3>
          <p className="text-sm text-slate-600">You have {xp} XP — keep going to level up!</p>
        </div>
      </div>

      <div className="hidden shrink-0 space-y-2 text-right md:block">
        <div className="text-sm text-slate-500">Progress</div>
        <div className="w-64">
          <div className="h-3 w-full rounded-full bg-slate-100">
            <div className="h-3 rounded-full bg-primary-600" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHero;
