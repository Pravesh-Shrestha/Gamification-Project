'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/authApi';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useError } from '@/hooks/errors/useError';

export default function LoginForm() {
  const router = useRouter();
  const { addError } = useError();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    // Validation
    if (!email) {
      setFieldErrors({ email: 'Email is required' });
      return;
    }
    if (!password) {
      setFieldErrors({ password: 'Password is required' });
      return;
    }

    setIsLoading(true);
    const normalizedEmail = normalizeEmailForAuth(email);

    authApi
      .login({ email: normalizedEmail, password })
      .then((result) => {
        localStorage.setItem('user', JSON.stringify(result.user));
        router.push('/dashboard');
      })
      .catch((err) => {
        const errorMessage = err instanceof Error ? err.message : 'Unable to sign in right now. Please try again.';
        addError(errorMessage, 'error');
      })
      .finally(() => setIsLoading(false));
  }

  function normalizeEmailForAuth(raw: string) {
    try {
      const parts = raw.split('@');
      if (parts.length < 2) return raw;
      const local = parts[0];
      const domain = parts.slice(1).join('@');
      const adminTagIndex = local.indexOf('+admin');
      if (adminTagIndex !== -1) {
        const newLocal = local.slice(0, adminTagIndex);
        return `${newLocal}@${domain}`;
      }
      return raw;
    } catch (e) {
      return raw;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <Input
        type="email"
        label="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="student@example.com"
        error={fieldErrors.email}
        helperText="Add +admin before @ to sign in as admin (e.g. alice+admin@example.com)"
      />

      <Input
        type="password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
        error={fieldErrors.password}
      />

      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full"
        >
          Sign in
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={() => router.push('/')}
          className="w-full"
        >
          Back
        </Button>
      </div>
    </form>
  );
}

