'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

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

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-zinc-900 font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          breadcrumbs={breadcrumbs}
          actionButton={actionButton}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};

