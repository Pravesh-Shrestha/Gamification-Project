'use client';

import React from 'react';

export function BadgeCard({ name, desc }: { name: string; desc?: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border p-4 shadow-sm bg-white">
      <div className="h-16 w-16 shrink-0 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 p-3 text-white" />
      <div>
        <div className="text-lg font-semibold">{name}</div>
        {desc && <div className="text-sm text-slate-600">{desc}</div>}
      </div>
    </div>
  );
}

export default BadgeCard;
