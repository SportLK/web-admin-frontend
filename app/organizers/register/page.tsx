'use client';

import { FormEvent, useState } from 'react';
import { API_URL } from '@/lib/api';

export default function OrganizerRegistrationPage() {
  const [form, setForm] = useState({ displayName: '', email: '', password: '', city: '', organization: '', experience: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [accessToken, setAccessToken] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      let token = accessToken;
      if (!token) {
        const registerResponse = await fetch(`${API_URL}/auth/register`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ displayName: form.displayName, email: form.email, password: form.password, city: form.city }),
        });
        const session = await registerResponse.json().catch(() => ({}));
        if (!registerResponse.ok) throw new Error(Array.isArray(session.message) ? session.message.join(', ') : session.message || 'Could not create the account.');
        token = session.accessToken;
        setAccessToken(token);
      }

      const applicationResponse = await fetch(`${API_URL}/role-applications`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ requestedRole: 'organizer', organization: form.organization, experience: form.experience }),
      });
      const application = await applicationResponse.json().catch(() => ({}));
      if (!applicationResponse.ok) throw new Error(Array.isArray(application.message) ? application.message.join(', ') : application.message || 'Account created, but the organizer application could not be submitted. Sign in and try again.');
      setSubmitted(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Organizer registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return <main className="min-h-screen bg-slate-50 px-4 py-12 text-zinc-900">
    <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
      <span className="text-sm font-semibold text-emerald-700">SportLK</span>
      {submitted ? <div className="mt-8"><h1 className="text-2xl font-bold">Application submitted</h1><p className="mt-3 text-sm leading-6 text-slate-600">Your SportLK account is registered and your organizer application is waiting for admin review. You can sign in to the SportLK mobile app while it is reviewed.</p></div> : <>
        <h1 className="mt-6 text-2xl font-bold">Register as a tournament organizer</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Create a platform account and submit your organization details for approval.</p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="block text-sm font-medium">Full name<input required minLength={2} value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>
          <label className="block text-sm font-medium">Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>
          <label className="block text-sm font-medium">Password<input required type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>
          <label className="block text-sm font-medium">City<input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>
          <label className="block text-sm font-medium">Organization<input required minLength={2} maxLength={140} value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>
          <label className="block text-sm font-medium">Organizing experience<textarea required minLength={20} maxLength={2000} rows={5} value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>
          {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
          <button disabled={submitting} className="w-full rounded-lg bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">{submitting ? 'Submitting…' : 'Create account and apply'}</button>
        </form>
      </>}
    </div>
  </main>;
}
