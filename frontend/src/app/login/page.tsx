import LoginForm from '../../features/auth/components/LoginForm';
import { ArrowRight, BookOpen, LayoutDashboard, ShieldCheck, Sparkles } from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="relative min-h-[calc(100dvh-80px)] overflow-hidden px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,82,204,0.12),transparent_24%),radial-gradient(circle_at_80%_10%,rgba(255,77,148,0.08),transparent_22%),radial-gradient(circle_at_50%_90%,rgba(0,102,255,0.08),transparent_28%)]" />

      <section className="relative mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <div className="relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.45)] backdrop-blur-2xl sm:p-8 lg:p-10">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-accent-blue to-accent-pink" />
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">
            <Sparkles className="h-3.5 w-3.5" />
            Welcome to Academia.io
          </div>

          <div className="mt-6 space-y-4">
            <h1 className="display-font max-w-xl text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl">
              Sign in to a calmer, more focused learning experience.
            </h1>
            <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Access your learning dashboard, manage your school work, and continue from the exact point you left off.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, title: 'Secure access', text: 'Role-aware sign-in with friendly error handling.' },
              { icon: LayoutDashboard, title: 'Clear dashboard', text: 'Everything arranged into calm, readable sections.' },
              { icon: BookOpen, title: 'Learning flow', text: 'A focused workspace for students and administrators.' },
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

          <div className="mt-8 rounded-[28px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.38)] backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">Fast start</p>
                <p className="text-sm text-slate-600">Launch the right workspace without clutter or technical noise.</p>
              </div>
              <a href="/dashboard" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-600">
                Continue to dashboard
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="flex h-full flex-col justify-between rounded-[32px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.45)] backdrop-blur-2xl sm:p-8 lg:p-10">
          <div>
            <div className="mb-8 text-center lg:text-left">
              <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">Secure sign in</p>
              <h2 className="display-font text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                Enter your workspace
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                Use your school account to access the dashboard, admin tools, and learning progress.
              </p>
            </div>

            <LoginForm />
          </div>

          <div className="mt-8 rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">Demo credentials</p>
              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary-700">Preview</span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">Student</p>
                <p className="mt-2 text-sm font-medium text-slate-900">seed@example.com</p>
                <p className="text-sm text-slate-500">seedpassword</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-blue">Admin</p>
                <p className="mt-2 text-sm font-medium text-slate-900">admin@demo.edu</p>
                <p className="text-sm text-slate-500">adminpass</p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              Having trouble? Contact your school administrator for support.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
