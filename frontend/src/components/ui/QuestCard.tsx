'use client';

import React from 'react';

export function QuestCard({ title, xp, progress }: { title: string; xp: number; progress: number }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">{title}</div>
          <div className="text-sm text-slate-600">{xp} XP</div>
        </div>
        <div className="w-48">
          <div className="h-2 w-full rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-primary-600" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-1 text-sm text-slate-500">{progress}%</div>
        </div>
      </div>
    </div>
  );
}

export default QuestCard;
