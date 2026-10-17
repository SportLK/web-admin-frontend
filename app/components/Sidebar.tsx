'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  MapPin,
  Users,
  Trophy,
  ShieldCheck,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Activity,
  Flame,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  memberScope?: string;
  isMember4Active?: boolean;
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      label: 'Overview',
      href: '/',
      icon: <LayoutDashboard className="w-5 h-5" />,
      memberScope: 'Member 4',
      isMember4Active: true,
    },
    {
      label: 'Matches',
      href: '/matches',
      icon: <Calendar className="w-5 h-5" />,
      memberScope: 'Member 4',
      isMember4Active: true,
    },
    {
      label: 'Venues',
      href: '/venues',
      icon: <MapPin className="w-5 h-5" />,
      memberScope: 'Member 4',
      isMember4Active: true,
    },
    {
      label: 'Tournaments',
      href: '#',
      icon: <Trophy className="w-5 h-5" />,
      memberScope: 'Member 3',
      isMember4Active: false,
    },
    {
      label: 'Teams',
      href: '#',
      icon: <Users className="w-5 h-5" />,
      memberScope: 'Member 2',
      isMember4Active: false,
    },
    {
      label: 'Users',
      href: '#',
      icon: <Users className="w-5 h-5" />,
      memberScope: 'Member 1',
      isMember4Active: false,
    },
    {
      label: 'Role applications',
      href: '#',
      icon: <ShieldCheck className="w-5 h-5" />,
      memberScope: 'Member 1',
      isMember4Active: false,
    },
    {
      label: 'Community',
      href: '#',
      icon: <MessageSquare className="w-5 h-5" />,
      memberScope: 'Member 1',
      isMember4Active: false,
    },
    {
      label: 'Notifications',
      href: '#',
      icon: <Bell className="w-5 h-5" />,
      isMember4Active: false,
    },
    {
      label: 'Settings',
      href: '#',
      icon: <Settings className="w-5 h-5" />,
      isMember4Active: false,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 select-none z-30">
      <div>
        {/* Brand / Logo Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-emerald-200 mr-3">
            S
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 tracking-tight text-base">SportLK</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">ADMIN</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Grassroots Sports Portal</p>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            ADMINISTRATION
          </p>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const isClickable = item.isMember4Active;

              if (!isClickable) {
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-400 opacity-60 cursor-not-allowed group"
                    title={item.memberScope ? `Managed by ${item.memberScope}` : undefined}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    {item.memberScope && (
                      <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.memberScope}
                      </span>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-bold shadow-sm shadow-emerald-50 border border-emerald-200/60'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-emerald-600' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.label === 'Matches' && (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                      LIVE
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Admin Profile Footer matching Figma Frame */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-200 text-emerald-900 font-bold flex items-center justify-center text-xs">
              SA
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">SportLK Admin</p>
              <p className="text-[11px] text-slate-500 leading-tight">Platform admin</p>
            </div>
          </div>
          <button
            title="Sign out"
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
