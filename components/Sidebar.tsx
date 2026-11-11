'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BadgeCheck,
  Shield,
  Trophy,
  Swords,
  MapPin,
  Flag,
  LogOut,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const pathname = usePathname();

  const navigation = [
    { name: 'Tournaments', href: '/tournaments', icon: Trophy, isMember3: true },
    { name: 'Organizer approvals', href: '/organizers', icon: BadgeCheck, isMember3: true },
    { name: 'Matches', href: '/matches', icon: Swords },
    { name: 'Venues', href: '/venues', icon: MapPin },
    { name: 'Teams', href: '/teams', icon: Shield, isMember2: true },
    { name: 'Reports', href: '/reports', icon: Flag, isMember2: true },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container: Fixed slide-over on mobile/tablet, sticky sidebar on desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200/80 flex flex-col justify-between p-5 select-none transition-transform duration-300 ease-in-out lg:static lg:w-64 lg:min-h-screen lg:h-screen lg:sticky lg:top-0 lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Workspace Brand / Header */}
          <div className="mb-6 px-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-[#D7FB38] font-black text-sm tracking-tighter shadow-xs">
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

            {/* Mobile Close Button */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-xl text-gray-400 hover:text-zinc-900 hover:bg-gray-100 transition-colors"
                title="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
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
                (item.href === '/teams' && (pathname === '/' || pathname.startsWith('/teams'))) ||
                (item.href === '/tournaments' && pathname.startsWith('/tournaments')) ||
                (item.href === '/organizers' && pathname.startsWith('/organizers')) ||
                (item.href === '/matches' && pathname.startsWith('/matches')) ||
                (item.href === '/venues' && pathname.startsWith('/venues')) ||
                (item.href === '/reports' && pathname.startsWith('/reports'));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => onClose?.()}
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
                  {item.isMember3 && (
                    <span
                      className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-zinc-950 text-[#D7FB38]'
                          : 'bg-emerald-100 text-emerald-800 group-hover:bg-emerald-200'
                      }`}
                    >
                      M3
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Profile */}
        <div className="pt-4 border-t border-gray-100">
          <div className="bg-white border border-gray-200 rounded-2xl p-3 flex items-center justify-between shadow-2xs hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#D7FB38] text-zinc-900 font-extrabold text-xs flex items-center justify-center shrink-0 border border-lime-300 shadow-2xs">
                SA
              </div>
              <div className="truncate min-w-0">
                <p className="text-xs font-bold text-zinc-900 leading-tight truncate">SportLK Admin</p>
                <p className="text-[10px] text-gray-500 truncate leading-tight mt-0.5">
                  Platform administrator
                </p>
              </div>
            </div>
            <button
              type="button"
              className="text-gray-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
              title="Admin session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
