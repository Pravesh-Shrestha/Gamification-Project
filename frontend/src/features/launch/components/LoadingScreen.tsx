'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { brandName, brandTagline, loadingMessages } from '../copy';

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
    <main className="page-shell" aria-label={`Loading ${brandName}`}>
      <section className="glass-panel p-8 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.24),transparent_24%),radial-gradient(circle_at_80%_30%,rgba(34,197,94,0.16),transparent_28%),radial-gradient(circle_at_50%_90%,rgba(251,191,36,0.12),transparent_26%)]" />

        <div className="relative flex items-center gap-4 md:gap-5">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-sky-300 to-lime-400 text-xl font-extrabold text-slate-950 shadow-[0_12px_28px_rgba(103,232,249,0.28)] md:h-16 md:w-16">
            A
          </div>
          <div>
            <p className="eyebrow mb-2">{brandName}</p>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
              {brandTagline}
            </h1>
          </div>
        </div>

        <div className="relative mx-auto my-10 h-28 w-28 md:h-36 md:w-36" aria-hidden="true">
          <span className="absolute inset-0 animate-[spin_1.8s_linear_infinite] rounded-full border border-sky-300/25 border-t-sky-300" />
          <span className="absolute inset-4 animate-[spin_2.3s_linear_infinite_reverse] rounded-full border border-sky-300/20 border-t-sky-300/90" />
          <span className="absolute inset-8 animate-[spin_2.9s_linear_infinite] rounded-full border border-lime-400/20 border-t-lime-300" />
        </div>

        <p className="relative text-center text-base text-slate-200 min-h-6">{loadingMessages[messageIndex]}</p>

        <div className="relative mx-auto mt-6 h-2.5 w-full max-w-[420px] overflow-hidden rounded-full bg-white/10">
          <span className="block h-full w-1/2 animate-[load_1.5s_ease-in-out_infinite_alternate] rounded-full bg-gradient-to-r from-sky-300 to-lime-400 shadow-[0_0_18px_rgba(103,232,249,0.4)]" />
        </div>

        <p className="relative mt-4 text-center text-sm text-slate-400">
          Designed for a clean start before the learning interaction appears.
        </p>
      </section>
    </main>
  );
}