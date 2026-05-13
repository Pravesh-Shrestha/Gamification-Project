'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { brandName, brandTagline, loadingMessages } from '../copy';
import { ArrowRight, LayoutDashboard, ShieldCheck, Sparkles } from 'lucide-react';

export function LoadingScreen() {
  const router = useRouter();
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const messageTimer = window.setInterval(() => {
      setMessageIndex((currentIndex) => (currentIndex + 1) % loadingMessages.length);
    }, 850);

    const readyTimer = window.setTimeout(() => {
      // Navigate to login when splash completes
      router.push('/login');
    }, 2600);

    return () => {
      window.clearInterval(messageTimer);
      window.clearTimeout(readyTimer);
    };
  }, [router]);

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 py-8" aria-label={`Loading ${brandName}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,82,204,0.16),transparent_24%),radial-gradient(circle_at_80%_20%,rgba(255,77,148,0.12),transparent_26%),radial-gradient(circle_at_50%_90%,rgba(0,102,255,0.12),transparent_30%)]" />
      <div className="absolute left-[-8rem] top-[12%] h-72 w-72 rounded-full bg-primary-400/15 blur-3xl" />
      <div className="absolute right-[-6rem] top-[38%] h-80 w-80 rounded-full bg-accent-pink/10 blur-3xl" />

      <section className="relative w-full max-w-6xl overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/85 px-6 py-8 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.45)] backdrop-blur-2xl sm:px-8 md:px-10 md:py-10">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-accent-blue to-accent-pink" />

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">
              <Sparkles className="h-3.5 w-3.5" />
              {brandName}
            </span>

            <div className="space-y-4">
              <h1 className="display-font max-w-xl text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl">
                {brandTagline}
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                A smoother place for students, teachers, and administrators to open, explore, and move.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: ShieldCheck, title: 'Secure access', text: 'Role-aware sign in and clean permissions.' },
                { icon: LayoutDashboard, title: 'Live workspace', text: 'Dashboards open directly into the right context.' },
                { icon: ArrowRight, title: 'Fast flow', text: 'A focused start before the learning journey begins.' },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="rounded-[24px] border border-slate-200/80 bg-white/80 p-4 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)] backdrop-blur-xl">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-sm font-semibold text-slate-900">{item.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.45)] backdrop-blur-2xl sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">Preparing your space</p>
                <p className="text-sm text-slate-600">Loading the next screen with a calmer, more polished visual rhythm.</p>
              </div>
              <div className="grid h-14 w-14 place-items-center rounded-[22px] bg-gradient-to-br from-primary-500 via-primary-500 to-accent-blue text-white shadow-[0_20px_35px_rgba(0,82,204,0.25)]">
                <span className="display-font text-2xl font-semibold leading-none">A</span>
              </div>
            </div>

            <div className="relative mx-auto my-10 flex h-40 w-40 items-center justify-center" aria-hidden="true">
              <span className="absolute inset-0 animate-[spin_2.1s_linear_infinite] rounded-full border border-primary-100 border-t-primary-500" />
              <span className="absolute inset-4 animate-[spin_2.8s_linear_infinite_reverse] rounded-full border border-sky-100 border-t-accent-blue" />
              <span className="absolute inset-10 animate-[spin_3.4s_linear_infinite] rounded-full border border-pink-100 border-t-accent-pink" />
              <span className="absolute inset-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-blue shadow-[0_24px_60px_rgba(0,82,204,0.25)]" />
            </div>

            <p className="min-h-6 text-center text-base font-medium text-slate-700">{loadingMessages[messageIndex]}</p>

            <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <span className="block h-full w-1/2 animate-[load_1.6s_ease-in-out_infinite_alternate] rounded-full bg-gradient-to-r from-primary-500 via-accent-blue to-accent-pink shadow-[0_0_18px_rgba(0,82,204,0.24)]" />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {['Instant context', 'Smooth motion', 'No clutter'].map((chip) => (
                <span key={chip} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}