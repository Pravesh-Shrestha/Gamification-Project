'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please provide both email and password');
      return;
    }

    // Demo behaviour: accept any credentials and navigate to a placeholder page.
    // For the thesis, record failed auth attempts as research evidence as needed.
    router.push('/dashboard');
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md">
      <label className="block mb-3">
        <span className="text-sm text-slate-300">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white placeholder:text-slate-400"
          placeholder="student@example.com"
        />
      </label>

      <label className="block mb-4">
        <span className="text-sm text-slate-300">Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white placeholder:text-slate-400"
          placeholder="Enter your password"
        />
      </label>

      {error && <p className="mb-3 text-sm text-rose-400">{error}</p>}

      <div className="flex items-center gap-3">
        <button className="rounded-md bg-sky-400 px-4 py-2 font-semibold text-slate-900" type="submit">
          Sign in
        </button>
        <button
          type="button"
          className="text-sm text-slate-300 underline"
          onClick={() => router.push('/')}
        >
          Back
        </button>
      </div>
    </form>
  );
}
