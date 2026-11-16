'use client';

import React from 'react';

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
        {/* Action Button Slot (e.g. + Add Venue, + Schedule Match) */}
        {actionButton && <div>{actionButton}</div>}
      </div>
    </header>
  );
};
