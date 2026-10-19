'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BadgeCheck,
  Shield,
  Trophy,
  Swords,
  MapPin,
  MessageSquare,
  Flag,
  Bell,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navigation = [
    { name: 'Overview', href: '/overview', icon: LayoutDashboard, disabled: true },
    { name: 'Users', href: '/users', icon: Users, disabled: true },
    { name: 'Role applications', href: '/role-applications', icon: BadgeCheck, disabled: true },
    { name: 'Teams', href: '/teams', icon: Shield, isMember2: true },
    { name: 'Tournaments', href: '/tournaments', icon: Trophy, disabled: true },
    { name: 'Matches', href: '/matches', icon: Swords, disabled: true },
    { name: 'Venues', href: '/venues', icon: MapPin, disabled: true },
    { name: 'Community', href: '/community', icon: MessageSquare, disabled: true },
    { name: 'Reports', href: '/reports', icon: Flag, isMember2: true },
    { name: 'Notifications', href: '/notifications', icon: Bell, disabled: true },
    { name: 'Settings', href: '/settings', icon: Settings, disabled: true },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200/80 min-h-screen flex flex-col justify-between p-5 select-none shrink-0 sticky top-0 h-screen">
      <div>
        {/* Workspace Brand / Header */}
        <div className="mb-6 px-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-[#D7FB38] font-black text-sm tracking-tighter">
              SL
            </div>
            <div>
              <span className="font-extrabold text-zinc-900 tracking-tight text-base block leading-none">
                Sport<span className="text-lime-600">LK</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block mt-0.5">
                Admin Console
              </span>
            </div>
          </div>
        </div>

        {/* Section Label */}
        <div className="px-3 mb-3">
          <p className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
            ADMINISTRATION
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href === '/teams' && (pathname === '/' || pathname.startsWith('/teams')));

            if (item.disabled) {
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-gray-400 text-sm font-medium opacity-60 cursor-not-allowed group"
                  title="Allocated to other group members"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span>{item.name}</span>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#D7FB38] text-zinc-950 font-semibold shadow-sm shadow-lime-300/30'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-zinc-950 stroke-[2.2]' : 'text-zinc-500'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.isMember2 && (
                  <span
                    className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-zinc-950 text-[#D7FB38]'
                        : 'bg-zinc-100 text-zinc-600 group-hover:bg-zinc-200'
                    }`}
                  >
                    M2
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Member 2 Badge & Admin Profile */}
      <div className="space-y-3 pt-4 border-t border-gray-100">
        <div className="bg-lime-50/70 border border-lime-200/80 rounded-xl p-2.5 flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#D7FB38] flex items-center justify-center text-zinc-950 shrink-0">
            <Sparkles className="w-3 h-3 text-zinc-950" />
          </div>
          <div className="text-[11px] leading-tight text-zinc-700">
            <span className="font-bold text-zinc-900 block">Member 2 Scope</span>
            Teams, Roster, Suspension & Reports
          </div>
        </div>

        {/* Admin User Card (from Figma) */}
        <div className="bg-white border border-gray-200 rounded-2xl p-3 flex items-center justify-between shadow-2xs hover:border-gray-300 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#D7FB38] text-zinc-900 font-extrabold text-xs flex items-center justify-center shrink-0 border border-lime-300 shadow-2xs">
              SA
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-zinc-900 leading-tight">SportLK Admin</p>
              <p className="text-[10px] text-gray-500 truncate leading-tight mt-0.5">
                Platform administrator
              </p>
            </div>
          </div>
          <button
            type="button"
            className="text-gray-400 hover:text-zinc-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            title="Admin session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
