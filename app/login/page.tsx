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
        <div className="flex items-center gap-3.5 mb-2">
          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shadow-xs shrink-0">
            <img src="/logo.jpeg" alt="SportLK" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">SportLK</h1>
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Admin Console</p>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Sign in to your account</h2>
          <p className="mt-1 text-sm text-slate-500">Enter your credentials to access the administration dashboard.</p>
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
