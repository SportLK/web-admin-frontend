'use client';

import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Plus, Search, Calendar, Filter, Eye, Edit3, Flame } from 'lucide-react';

export default function MatchesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Matches"
        subtitle="Monitor live matches, manage tournament fixtures, and update scores"
        actionButton={
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-sm transition-colors">
            <Plus className="w-4 h-4" />
            Schedule Match
          </button>
        }
      />

      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Matches</p>
            <p className="text-2xl font-black text-slate-900 mt-1">148</p>
            <p className="text-xs text-slate-500 mt-1">Across 12 tournaments</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Matches</p>
              <span className="flex items-center gap-1 text-[10px] font-extrabold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                ACTIVE
              </span>
            </div>
            <p className="text-2xl font-black text-red-600 mt-1">4</p>
            <p className="text-xs text-slate-500 mt-1">Real-time WebSocket broadcasting</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed</p>
            <p className="text-2xl font-black text-slate-900 mt-1">116</p>
            <p className="text-xs text-slate-500 mt-1">Official scores finalized</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by team, tournament, or ground..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {['ALL', 'LIVE', 'SCHEDULED', 'COMPLETED'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  selectedStatus === status
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Matches Table matching Figma Frame 06 */}
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base">Match Fixtures</h2>
            <span className="text-xs text-slate-400 font-medium">Showing 4 fixtures</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Match Details</th>
                  <th className="px-6 py-3.5">Tournament</th>
                  <th className="px-6 py-3.5">Venue</th>
                  <th className="px-6 py-3.5">Score / Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {/* Row 1 (Live Cricket) */}
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🏏</span>
                      <div>
                        <p className="font-bold text-slate-900">Colombo Lions CC vs Kandy Kings CC</p>
                        <p className="text-xs text-slate-400">Cricket • T20 Match</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-600">Western Province T20 League</td>
                  <td className="px-6 py-4 text-xs text-slate-500">Colombo Racecourse Grounds</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-red-100 text-red-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                      LIVE • 146/3 (17.2 ov)
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-colors">
                      Live Score Controller
                    </button>
                  </td>
                </tr>

                {/* Row 2 (Live Futsal) */}
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">⚽</span>
                      <div>
                        <p className="font-bold text-slate-900">CR&FC Strikers vs Java Lane FC</p>
                        <p className="text-xs text-slate-400">Futsal • Semi-Final</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-600">Colombo Futsal Championship</td>
                  <td className="px-6 py-4 text-xs text-slate-500">CR & FC Indoor Sports Arena</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-red-100 text-red-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                      LIVE • 3 - 2 (34')
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-colors">
                      Live Score Controller
                    </button>
                  </td>
                </tr>

                {/* Row 3 (Scheduled Badminton) */}
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🏸</span>
                      <div>
                        <p className="font-bold text-slate-900">Moratuwa Smashers vs Royal College SC</p>
                        <p className="text-xs text-slate-400">Badminton • Court 1</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-600">Sri Lanka Shuttle Open</td>
                  <td className="px-6 py-4 text-xs text-slate-500">Otters Athletic Club Arena</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                      Today • 05:30 PM
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-colors">
                      Edit Fixture
                    </button>
                  </td>
                </tr>

                {/* Row 4 (Completed Cricket) */}
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🏏</span>
                      <div>
                        <p className="font-bold text-slate-900">Galle Gladiators vs Negombo Titans</p>
                        <p className="text-xs text-slate-400">Cricket • Group B</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-600">Western Province T20 League</td>
                  <td className="px-6 py-4 text-xs text-slate-500">Tyronne Fernando Stadium</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                      GG won by 28 runs
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-colors">
                      View Scorecard
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
