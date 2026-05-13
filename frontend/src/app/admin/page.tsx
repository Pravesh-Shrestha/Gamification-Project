"use client";

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/adminApi';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useError } from '@/hooks/errors/useError';
import { ArrowLeft, Plus, ShieldCheck, X } from 'lucide-react';
import { Sidebar } from '@/components/ui/Sidebar';

type UserItem = { _id: string; email: string; name: string; role: string };

export default function AdminPage() {
  const router = useRouter();
  const { addError } = useError();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ role: 'student', name: '', email: '', password: '', school: '', grade: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const currentUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
  const allowed = currentUser && (currentUser.role === 'admin' || currentUser.role === 'master');

  useEffect(() => {
    if (!allowed) return;
    loadUsers();
  }, [allowed]);

  const loadUsers = () => {
    setLoading(true);
    adminApi
      .getUsers()
      .then((data) => setUsers(data))
      .catch((err) => {
        addError('We could not load the user directory right now. Please refresh and try again.', 'error');
      })
      .finally(() => setLoading(false));
  };

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormErrors({});

    // Validation
    const errors: Record<string, string> = {};
    if (!form.name) errors.name = 'Name is required';
    if (!form.email) errors.email = 'Email is required';
    if (!form.password) errors.password = 'Password is required';
    if (form.role === 'student' && !form.school) errors.school = 'School is required';
    if (form.role === 'student' && !form.grade) errors.grade = 'Grade is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await adminApi.createUser(form as any);
      setShowForm(false);
      setForm({ role: 'student', name: '', email: '', password: '', school: '', grade: '' });
      loadUsers();
    } catch (err: any) {
      addError(err instanceof Error ? err.message : 'We could not create that user right now.', 'error');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete user? This cannot be undone.')) return;
    try {
      await adminApi.deleteUser(id);
      setUsers((s) => s.filter((u) => u._id !== id));
    } catch (err: any) {
      addError(err instanceof Error ? err.message : 'We could not delete that user right now.', 'error');
    }
  }

  if (!currentUser) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4">
        <div className="rounded-[28px] border border-slate-200/80 bg-white/80 p-8 text-center shadow-[0_24px_60px_-40px_rgba(15,23,42,0.4)] backdrop-blur-xl">
          <p className="text-lg text-slate-700">Not signed in. Please <a href="/login" className="font-semibold text-primary-600 hover:underline">sign in</a> first.</p>
        </div>
      </main>
    );
  }

  if (!allowed) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4">
        <div className="rounded-[28px] border border-slate-200/80 bg-white/80 p-8 text-center shadow-[0_24px_60px_-40px_rgba(15,23,42,0.4)] backdrop-blur-xl">
          <p className="text-lg text-slate-700">Access denied. This area is available to administrators only.</p>
        </div>
      </main>
    );
  }

  const roleCount = {
    total: users.length,
    admins: users.filter((user) => user.role === 'admin').length,
    teachers: users.filter((user) => user.role === 'teacher').length,
    students: users.filter((user) => user.role === 'student').length,
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'border-primary-200 bg-primary-50 text-primary-700';
      case 'teacher':
        return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      default:
        return 'border-slate-200 bg-slate-50 text-slate-700';
    }
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U';

  return (
    <main className="relative min-h-[calc(100vh-80px)] overflow-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(0,82,204,0.1),transparent_20%),radial-gradient(circle_at_90%_12%,rgba(255,77,148,0.08),transparent_22%),radial-gradient(circle_at_50%_95%,rgba(0,102,255,0.08),transparent_28%)]" />

      <div className="relative mx-auto flex max-w-7xl gap-6">
        <Sidebar />

        <div className="min-w-0 flex-1 space-y-6">
          <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.4)] backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin workspace
              </span>
              <div className="space-y-2">
                <h1 className="display-font text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">
                  Manage users with clarity
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  Create accounts, review access, and keep the experience clean and controlled for every role.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" size="md" onClick={() => router.push('/dashboard')} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
              </Button>
              <Button variant="primary" size="md" onClick={() => setShowForm((s) => !s)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {showForm ? 'Close form' : 'Create user'}
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {[
              { label: 'Total users', value: roleCount.total },
              { label: 'Admins', value: roleCount.admins },
              { label: 'Teachers', value: roleCount.teachers },
              { label: 'Students', value: roleCount.students },
            ].map((item) => (
              <div key={item.label} className="rounded-[24px] border border-slate-200/80 bg-white/80 px-4 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{item.value}</p>
              </div>
            ))}
          </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            {showForm && (
              <form onSubmit={handleCreate} className="rounded-[28px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.4)] backdrop-blur-xl sm:p-8">
              <div className="mb-6">
                <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">Create account</p>
                <h2 className="display-font text-2xl font-semibold tracking-[-0.04em] text-slate-950">New user details</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Add a new student, teacher, or admin without breaking the flow.</p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-[0_1px_0_rgba(15,23,42,0.02)] transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                    <option value="teacher">Teacher</option>
                  </select>
                </div>

                <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" error={formErrors.name} />
                <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" error={formErrors.email} />

                {form.role === 'student' && (
                  <>
                    <Input label="School" value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} placeholder="Green Valley School" error={formErrors.school} />
                    <Input label="Grade" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} placeholder="5" error={formErrors.grade} />
                  </>
                )}

                <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" error={formErrors.password} />

                <div className="sm:col-span-2 flex flex-wrap gap-3 pt-1">
                  <Button type="submit" variant="primary" size="md" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create user
                  </Button>
                  <Button type="button" variant="ghost" size="md" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
              </form>
            )}

            <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/80 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.4)] backdrop-blur-xl">
              <div className="border-b border-slate-200/80 px-6 py-5 sm:px-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">User directory</p>
                  <h2 className="display-font text-2xl font-semibold tracking-[-0.04em] text-slate-950">Users ({users.length})</h2>
                </div>
                {loading && <p className="text-sm text-slate-500">Loading…</p>}
              </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead className="border-b border-slate-200/80 bg-slate-50/80">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 sm:px-8">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 sm:px-8">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 sm:px-8">Role</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 sm:px-8">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-12 text-center text-slate-500">
                          No users found. Create your first user to get started.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u._id} className="border-t border-slate-100 transition-colors hover:bg-slate-50/70">
                          <td className="px-6 py-4 sm:px-8">
                            <div className="flex items-center gap-3">
                              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary-50 text-sm font-semibold text-primary-700">
                                {getInitials(u.name)}
                              </span>
                              <span className="font-medium text-slate-950">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 sm:px-8">{u.email}</td>
                          <td className="px-6 py-4 sm:px-8">
                            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getRoleBadge(u.role)}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right sm:px-8">
                            <button onClick={() => handleDelete(u._id)} className="ml-auto inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition-all hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-100">
                              <X className="h-4 w-4" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
