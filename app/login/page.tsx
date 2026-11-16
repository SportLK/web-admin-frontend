'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { clearAdminSession, storeAdminSession } from '@/lib/admin-auth';

type Session = {
  accessToken: string;
  refreshToken: string;
  user: { roles: string[] };
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    clearAdminSession();
    try {
      const session = await apiRequest<Session>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }, '');
      if (!session.user?.roles?.includes('admin')) {
        throw new Error('This account does not have admin access.');
      }
      storeAdminSession(session.accessToken, session.refreshToken);
      router.replace('/tournaments');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5">
      <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow-sm">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-700">SportLK</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Admin sign in</h1>
          <p className="mt-1 text-sm text-slate-500">Use an account with the admin role.</p>
        </div>
        <label className="block text-sm font-medium text-slate-700">Email
          <input required type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label className="block text-sm font-medium text-slate-700">Password
          <input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={busy} className="admin-login-submit">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
