'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from './components/Header';
import { MapPin, Calendar, Activity, BarChart3, ArrowRight, ShieldCheck } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div>
      <Header
        title="Admin Overview"
        subtitle="Manage grassroots matches, grounds, live scoring, and platform analytics"
      />

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Welcome Hero Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              Member 4 Scope Active: Match, Live Score, Venue & Statistics
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight mb-2">
              SportLK Grassroots Sports Portal
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Full control over sports grounds catalog, live match scoring, tournament fixtures, and platform statistics. Fully synchronized with the mobile app and NestJS backend.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/venues"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md shadow-emerald-500/30 transition-all"
              >
                <MapPin className="w-4 h-4" />
                Manage Venues
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link
                href="/matches"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all"
              >
                <Calendar className="w-4 h-4" />
                Manage Matches & Live Scoring
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Launch Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Venues */}
          <Link
            href="/venues"
            className="group block p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-emerald-700 transition-colors">
              Venue Management
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-4">
              Add and maintain sports grounds with GPS coordinates, surface types, hourly pricing, and facilities (floodlights, parking, etc.).
            </p>
            <span className="text-xs font-bold text-emerald-600 inline-flex items-center gap-1">
              Go to Venues <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Card 2: Matches */}
          <Link
            href="/matches"
            className="group block p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-blue-700 transition-colors">
              Match Management & Live Scoring
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-4">
              Schedule grassroots fixtures and control live match scoreboards with instant WebSocket broadcasting to spectators.
            </p>
            <span className="text-xs font-bold text-blue-600 inline-flex items-center gap-1">
              Go to Matches <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Card 3: Statistics */}
          <div className="block p-6 rounded-2xl bg-white border border-slate-200/80">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">
              Analytics & KPIs
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-4">
              High-level grassroots metrics, venue hosting frequency, sports popularity share, and team win-rate leaderboards.
            </p>
            <span className="text-xs font-bold text-purple-600 inline-flex items-center gap-1">
              Built in Step 4 Overview
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
