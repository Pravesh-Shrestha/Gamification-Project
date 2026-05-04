'use client';

import { Dialog } from '@/components/common';
import { LayoutDashboard, ShieldCheck, Badge, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const groups = useMemo(
    () => [
      {
        title: 'Dashboards',
        items: [
          { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { label: 'Admin', href: '/admin', icon: ShieldCheck },
        ] as NavItem[],
      },
      {
        title: 'Views',
        items: [
          { label: 'Quests', href: '/examples/quests', icon: Badge },
          { label: 'Badges', href: '/examples/badges', icon: Badge },
        ] as NavItem[],
      },
    ],
    []
  );

  const navLinkClass = (href: string) =>
    `flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-all ${
      pathname === href
        ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-100'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
    }`;

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur-md md:hidden"
      >
        <Menu className="h-4 w-4" />
        Menu
      </button>

      <aside className="hidden w-72 shrink-0 space-y-6 rounded-[28px] border border-slate-200/80 bg-white/85 p-4 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur-xl md:block">
        <div className="mb-2 flex items-center gap-3 rounded-2xl bg-slate-50/80 p-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-blue text-white shadow-sm">A</div>
          <div>
            <div className="text-sm font-semibold text-slate-950">Academia</div>
            <div className="text-xs text-slate-500">Learn like a game</div>
          </div>
        </div>

        {groups.map((group) => (
          <div key={group.title} className="space-y-2">
            <p className="px-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{group.title}</p>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} className={navLinkClass(item.href)}>
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </aside>

      <Dialog open={mobileOpen} onClose={() => setMobileOpen(false)} title="Navigation">
        <div className="space-y-5">
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-slate-950">Academia</div>
              <div className="text-xs text-slate-500">Quick access</div>
            </div>
            <button type="button" onClick={() => setMobileOpen(false)} className="rounded-full border border-slate-200 bg-white p-2 text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          {groups.map((group) => (
            <div key={group.title} className="space-y-2">
              <p className="px-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{group.title}</p>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={navLinkClass(item.href)}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </Dialog>
    </>
  );
}

export default Sidebar;
