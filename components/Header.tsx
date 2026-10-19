'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, ChevronRight } from 'lucide-react';

interface HeaderProps {
  breadcrumbs: { label: string; href?: string }[];
}

export const Header: React.FC<HeaderProps> = ({ breadcrumbs }) => {
  return (
    <header className="h-16 border-b border-gray-200/80 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-gray-500">
        <span>Workspace</span>
        {breadcrumbs.map((crumb) => (
          <React.Fragment key={crumb.label}>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-zinc-900 transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-zinc-900 font-semibold">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Right Controls: Date, Notifications, Profile */}
      <div className="flex items-center gap-4">
        {/* Date Display */}
        <span className="text-xs text-gray-400 font-medium hidden sm:inline-block">
          Wednesday, 7 October 2026
        </span>

        <div className="h-4 w-px bg-gray-200 hidden sm:block" />

        {/* Notifications */}
        <button
          type="button"
          className="relative p-2 rounded-xl text-gray-500 hover:text-zinc-900 hover:bg-gray-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-lime-500 ring-2 ring-white" />
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-[#D7FB38] text-zinc-900 font-bold text-xs flex items-center justify-center border border-lime-300 shadow-2xs">
            SA
          </div>
        </div>
      </div>
    </header>
  );
};
