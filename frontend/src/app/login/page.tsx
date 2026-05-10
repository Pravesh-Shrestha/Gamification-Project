import LoginForm from '../../features/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <main className="page-shell">
      <section className="glass-panel p-8 md:p-12">
        <p className="eyebrow">Sign in to Academia.io</p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-5xl">Welcome back</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
          Use your school account to continue. This demo signs in locally; replace with real auth when ready.
        </p>

        <div className="mt-8">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
