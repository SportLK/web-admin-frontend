'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, Activity, Sparkles, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, actionButton }) => {
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch(`${API_BASE_URL}/statistics/overview`, { method: 'GET' });
        setIsBackendHealthy(res.ok);
      } catch {
        setIsBackendHealthy(false);
      }
    }
    checkHealth();
  }, []);

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
        {/* Backend API Connection Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border bg-slate-50 border-slate-200">
          <span
            className={`w-2 h-2 rounded-full ${
              isBackendHealthy === null
                ? 'bg-amber-400 animate-pulse'
                : isBackendHealthy
                ? 'bg-emerald-500'
                : 'bg-amber-500'
            }`}
          />
          <span className="text-slate-600">
            {isBackendHealthy === null
              ? 'Checking API...'
              : isBackendHealthy
              ? 'Backend API Connected'
              : 'Offline Demo Mode'}
          </span>
        </div>

        {/* Global Live Ticker Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-800">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Member 4 Active</span>
        </div>

        {/* Action Button Slot (e.g. + Add Venue, + Schedule Match) */}
        {actionButton && <div>{actionButton}</div>}
      </div>
    </header>
  );
};
