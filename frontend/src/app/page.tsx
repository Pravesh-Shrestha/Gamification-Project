import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
} from 'lucide-react';

const audiences = [
  {
    icon: BookOpen,
    title: 'Students',
    text: 'See tasks, quests, streaks, and progress in one place so schoolwork feels clear instead of scattered.',
  },
  {
    icon: LayoutDashboard,
    title: 'Teachers',
    text: 'Track completion, spot bottlenecks, and guide students with a dashboard that reads fast.',
  },
  {
    icon: ShieldCheck,
    title: 'Administrators',
    text: 'Keep access, roles, and school-wide visibility under control without adding friction.',
  },
];

const steps = [
  {
    title: 'Sign in by role',
    text: 'Students, teachers, and admins land in the right workspace immediately.',
  },
  {
    title: 'Work through quests',
    text: 'Assignments feel like progress: goals, streaks, badges, and visible milestones.',
  },
  {
    title: 'Use the data',
    text: 'Reports and analytics show who is moving, who is stuck, and what needs attention next.',
  },
];

const stats = [
  { label: 'Role-aware access', value: '4 roles' },
  { label: 'Live progress tracking', value: 'Real time' },
  { label: 'Focus on outcomes', value: 'Quests + analytics' },
];

const activityItems = [
  { label: 'Today completion', value: '78%', tone: 'bg-primary-50 text-primary-700' },
  { label: 'Current streak', value: '12 days', tone: 'bg-emerald-50 text-emerald-700' },
  { label: 'Open tasks', value: '14', tone: 'bg-amber-50 text-amber-700' },
];

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_18%,rgba(0,82,204,0.12),transparent_26%),radial-gradient(circle_at_86%_8%,rgba(255,77,148,0.10),transparent_24%),radial-gradient(circle_at_50%_88%,rgba(0,102,255,0.08),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[42rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.6)_36%,rgba(255,255,255,0)_100%)]" />

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary-700 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.4)] backdrop-blur-xl">
              <Sparkles className="h-3.5 w-3.5" />
              Built for schools that need structure, not noise
            </div>

            <div className="space-y-5">
              <h1 className="display-font max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-6xl lg:text-7xl">
                Learning that feels organized, visible, and worth returning to.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                Academia.io turns school work into a clear progression system for students, teachers, and administrators. Tasks, progress, and permissions stay understandable from the first login.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-accent-blue px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(0,82,204,0.24)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(0,82,204,0.3)]">
                Enter the platform
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/80 px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.32)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-700">
                View the dashboard
                <BarChart3 className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-[24px] border border-white/70 bg-white/80 p-4 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.4)] backdrop-blur-xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-10 h-24 w-24 rounded-full bg-primary-500/10 blur-2xl" />
            <div className="absolute -right-4 bottom-6 h-28 w-28 rounded-full bg-accent-pink/10 blur-2xl" />

            <div className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/88 p-5 shadow-[0_32px_90px_-40px_rgba(15,23,42,0.5)] backdrop-blur-2xl sm:p-6">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 pb-5">
                <div>
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary-700">
                    <Target className="h-3.5 w-3.5" />
                    School overview
                  </p>
                  <h2 className="display-font mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-4xl">
                    A dashboard that shows what matters now.
                  </h2>
                </div>
                <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-right sm:block">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Live</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">12 schools active</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {activityItems.map((item) => (
                  <div key={item.label} className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                    <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.tone}`}>
                      {item.label}
                    </div>
                    <p className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-950">{item.value}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">Updated from the latest student and class activity.</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.4)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Weekly momentum</p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">Progress stays visible without being loud.</p>
                  </div>
                  <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 sm:inline-flex">
                    <CheckCircle2 className="h-4 w-4" />
                    On track
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {[
                    { label: 'Quests completed', value: 78, color: 'from-primary-500 to-accent-blue' },
                    { label: 'Students engaged', value: 64, color: 'from-accent-pink to-rose-500' },
                    { label: 'Teacher actions', value: 89, color: 'from-emerald-500 to-green-400' },
                  ].map((bar) => (
                    <div key={bar.label}>
                      <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                        <span>{bar.label}</span>
                        <span className="font-semibold text-slate-900">{bar.value}%</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full bg-gradient-to-r ${bar.color}`} style={{ width: `${bar.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 rounded-[30px] border border-white/80 bg-white/75 p-4 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:grid-cols-3 sm:p-5">
          {[
            { icon: UsersRound, label: 'One platform for every role', text: 'Students, teachers, and admins each get a view that matches their responsibilities.' },
            { icon: ShieldCheck, label: 'Permissions stay clean', text: 'Role-based access keeps the right tools in the right hands.' },
            { icon: Clock3, label: 'Less friction, more flow', text: 'No cluttered dashboards or hidden workflows to fight through.' },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label} className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="display-font mt-4 text-xl font-semibold tracking-[-0.04em] text-slate-950">{item.label}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {audiences.map((audience) => {
            const Icon = audience.icon;

            return (
              <article key={audience.title} className="rounded-[28px] border border-slate-200/80 bg-white/84 p-6 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.42)] backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Audience</p>
                    <h2 className="display-font text-2xl font-semibold tracking-[-0.04em] text-slate-950">{audience.title}</h2>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">{audience.text}</p>

                <div className="mt-5 space-y-3 rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4">
                  {audience.title === 'Students' && [
                    'Clear tasks and quest goals',
                    'Visible streaks and rewards',
                    'Simple progress milestones',
                  ].map((point) => (
                    <div key={point} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-accent-green" />
                      <span>{point}</span>
                    </div>
                  ))}
                  {audience.title === 'Teachers' && [
                    'Completion rates at a glance',
                    'Student activity trends',
                    'Quick interventions when needed',
                  ].map((point) => (
                    <div key={point} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-accent-blue" />
                      <span>{point}</span>
                    </div>
                  ))}
                  {audience.title === 'Administrators' && [
                    'Clean role-based access',
                    'School-wide oversight',
                    'Control without complexity',
                  ].map((point) => (
                    <div key={point} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-primary-600" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>

        <div className="grid gap-4 rounded-[32px] border border-slate-200/80 bg-white/82 p-6 shadow-[0_28px_80px_-44px_rgba(15,23,42,0.42)] backdrop-blur-2xl lg:grid-cols-[0.88fr_1.12fr] lg:p-8">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary-700">
              <Sparkles className="h-3.5 w-3.5" />
              How it works
            </p>
            <h2 className="display-font text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-4xl">
              A simple flow that keeps the whole school aligned.
            </h2>
            <p className="max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
              The system is designed so the important parts are obvious: who you are, what you need to do, and what the next best action is.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-5">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-primary-700 shadow-sm">
                  0{index + 1}
                </div>
                <h3 className="display-font mt-4 text-xl font-semibold tracking-[-0.03em] text-slate-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-primary-200 bg-gradient-to-br from-primary-500 via-primary-500 to-accent-blue p-6 text-white shadow-[0_28px_90px_-44px_rgba(0,82,204,0.5)] sm:p-8 lg:p-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-2xl space-y-3">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Ready to explore
              </p>
              <h2 className="display-font text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
                Start with the landing page, then move straight into the right workspace.
              </h2>
              <p className="text-sm leading-7 text-white/82 sm:text-base">
                The homepage is built to explain the system quickly, and every next step is one click away.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
              <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-primary-700 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.5)] transition-all hover:-translate-y-0.5">
                Sign in now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/admin" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white/15">
                Open admin view
                <UsersRound className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}