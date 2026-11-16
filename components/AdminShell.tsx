'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { clearAdminSession, getAdminAccessToken } from '@/lib/admin-auth';

interface AdminShellProps {
  breadcrumbs: { label: string; href?: string }[];
  actionButton?: React.ReactNode;
  children: React.ReactNode;
}

export const AdminShell: React.FC<AdminShellProps> = ({
  breadcrumbs,
  actionButton,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const redirectToLogin = () => router.replace('/login');
    if (!getAdminAccessToken()) redirectToLogin();
    else setReady(true);
    window.addEventListener('sportlk:auth-expired', redirectToLogin);
    return () => window.removeEventListener('sportlk:auth-expired', redirectToLogin);
  }, [router]);

  if (!ready) return <div className="min-h-screen bg-[#F8F9FA]" />;

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-zinc-900 font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          breadcrumbs={breadcrumbs}
          actionButton={actionButton}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />
        <div className="flex justify-end px-4 pt-3 sm:px-6 lg:px-8">
          <button className="text-sm text-slate-500 hover:text-slate-900" onClick={async () => {
            try { await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/auth/logout`, { method: 'POST', headers: { Authorization: `Bearer ${getAdminAccessToken()}` } }); } catch { /* local logout still completes */ }
            clearAdminSession();
            router.replace('/login');
          }}>Sign out</button>
        </div>
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};

