'use client';

import Link from 'next/link';
import React from 'react';

export function NavBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 backdrop-blur-2xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-primary-500 via-primary-500 to-accent-blue text-sm font-semibold text-white shadow-[0_18px_35px_rgba(0,82,204,0.22)]">
            A
          </span>
          <span className="leading-none">
            <span className="display-font text-xl font-semibold tracking-[-0.04em] text-slate-950">academia</span>
            <span className="display-font text-xl font-semibold tracking-[-0.04em] text-slate-400">.io</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/dashboard" className="hidden rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-600 sm:inline-flex">
            Dashboard
          </Link>
          <Link href="/admin" className="hidden rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-600 sm:inline-flex">
            Admin
          </Link>
          <Link href="/login" className="rounded-full bg-gradient-to-r from-primary-500 to-accent-blue px-4.5 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(0,82,204,0.22)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,82,204,0.28)]">
            Sign in
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default NavBar;
