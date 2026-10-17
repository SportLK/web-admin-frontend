'use client';

import React from 'react';
import { Bell } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, actionButton }) => {
  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          {title || 'Dashboard'}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-0.5 font-medium">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button
          className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2.5 right-2.5 ring-2 ring-white"></span>
        </button>

        {/* Action Button Slot (e.g. + Add Venue, + Schedule Match) */}
        {actionButton && <div>{actionButton}</div>}
      </div>
    </header>
  );
};
