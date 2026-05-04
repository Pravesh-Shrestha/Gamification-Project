'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface ProgressDataPoint {
  date: string;
  pointsEarned: number;
  tasksCompleted: number;
}

interface ProgressTrendsChartProps {
  data: ProgressDataPoint[];
  title?: string;
}

export function ProgressTrendsChart({ data, title = 'Learning Progress' }: ProgressTrendsChartProps) {
  return (
    <div className="rounded-[28px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur-xl">
      <div className="mb-4">
        <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">Analytics</p>
        <h3 className="display-font text-lg font-semibold tracking-[-0.03em] text-slate-950">{title}</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="date" stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 12 }} />
          <YAxis stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: '0 20px 40px -28px rgba(15, 23, 42, 0.35)' }}
            formatter={(value: any) => (typeof value === 'number' ? `${value.toFixed(0)}` : String(value))}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="pointsEarned" 
            stroke="#0052CC" 
            strokeWidth={2}
            name="Points Earned"
            dot={{ fill: '#0052CC', r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="tasksCompleted" 
            stroke="#4CAF50" 
            strokeWidth={2}
            name="Tasks Completed"
            dot={{ fill: '#4CAF50', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface TaskCompletionDataPoint {
  title: string;
  completionRate: number;
  completed: number;
  total: number;
}

interface TaskCompletionChartProps {
  data: TaskCompletionDataPoint[];
  title?: string;
}

export function TaskCompletionChart({ data, title = 'Task Completion Rates' }: TaskCompletionChartProps) {
  return (
    <div className="rounded-[28px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur-xl">
      <div className="mb-4">
        <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">Analytics</p>
        <h3 className="display-font text-lg font-semibold tracking-[-0.03em] text-slate-950">{title}</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis type="number" stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 12 }} />
          <YAxis type="category" dataKey="title" width={200} stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: '0 20px 40px -28px rgba(15, 23, 42, 0.35)' }}
            formatter={(value: any) => (typeof value === 'number' ? `${value}%` : String(value))}
          />
          <Bar dataKey="completionRate" fill="#0052CC" name="Completion %" radius={[0, 12, 12, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface TopPerformer {
  name: string;
  grade: string;
  totalPoints: number;
  level: number;
}

interface LeaderboardProps {
  students: TopPerformer[];
  title?: string;
  limit?: number;
}

export function Leaderboard({ students, title = 'Top Performers', limit = 10 }: LeaderboardProps) {
  const displayedStudents = students.slice(0, limit);

  return (
    <div className="rounded-[28px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur-xl">
      <div className="mb-4">
        <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">Leaderboard</p>
        <h3 className="display-font text-lg font-semibold tracking-[-0.03em] text-slate-950">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-3 px-4 text-left font-semibold text-slate-500">Rank</th>
              <th className="py-3 px-4 text-left font-semibold text-slate-500">Name</th>
              <th className="py-3 px-4 text-left font-semibold text-slate-500">Grade</th>
              <th className="py-3 px-4 text-center font-semibold text-slate-500">Points</th>
              <th className="py-3 px-4 text-center font-semibold text-slate-500">Level</th>
            </tr>
          </thead>
          <tbody>
            {displayedStudents.map((student, index) => (
              <tr key={index} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70">
                <td className="py-3 px-4">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-700">
                    {index + 1}
                  </span>
                </td>
                <td className="py-3 px-4 font-medium text-slate-950">{student.name}</td>
                <td className="py-3 px-4 text-slate-600">Grade {student.grade}</td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-block rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                    {student.totalPoints}
                  </span>
                </td>
                <td className="py-3 px-4 text-center font-semibold text-slate-900">Lv {student.level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {displayedStudents.length === 0 && (
        <p className="py-8 text-center text-slate-500">No student data available yet.</p>
      )}
    </div>
  );
}

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: 'primary' | 'green' | 'orange' | 'blue' | 'pink';
}

interface StatsGridProps {
  stats: StatCard[];
}

const colorMap = {
  primary: 'bg-primary-50 text-primary-700',
  green: 'bg-emerald-50 text-emerald-700',
  orange: 'bg-orange-50 text-orange-700',
  blue: 'bg-sky-50 text-sky-700',
  pink: 'bg-pink-50 text-pink-700',
};

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <div key={index} className="rounded-[28px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="display-font text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                {stat.value}
              </p>
            </div>
            <span className={`rounded-2xl p-3 ${colorMap[stat.color]}`}>
              <stat.icon className="h-5 w-5" />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
