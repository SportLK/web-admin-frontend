'use client';

import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Plus, Search, MapPin, Eye, Edit3, Trash2, CheckCircle2, XCircle } from 'lucide-react';

export default function VenuesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Venues"
        subtitle="Manage sports grounds catalog, GPS spatial coordinates, and facility specs"
        actionButton={
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-sm transition-colors">
            <Plus className="w-4 h-4" />
            Add Venue
          </button>
        }
      />

      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Grounds</p>
            <p className="text-2xl font-black text-slate-900 mt-1">32</p>
            <p className="text-xs text-slate-500 mt-1">Verified sports grounds</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Catalog</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">28</p>
            <p className="text-xs text-slate-500 mt-1">Available for tournaments</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Cities Covered</p>
            <p className="text-2xl font-black text-slate-900 mt-1">6</p>
            <p className="text-xs text-slate-500 mt-1">Colombo, Moratuwa, Kandy, Galle...</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by ground name, city, district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Venues Table matching Figma Frame 07 */}
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base">Registered Sports Grounds</h2>
            <span className="text-xs text-slate-400 font-medium">Showing 4 grounds</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Venue Name</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5">GPS Coordinates</th>
                  <th className="px-6 py-3.5">Facilities</th>
                  <th className="px-6 py-3.5">Hourly Rate</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {/* Ground 1 */}
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">
                    Colombo Racecourse Grounds
                    <p className="text-xs text-slate-400 font-normal">Grass Turf • Cricket & Futsal</p>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">Colombo 07, Colombo</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">6.9038° N, 79.8631° E</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">Floodlights</span>
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">Parking</span>
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-bold">Changing</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 text-xs">LKR 4,500 / hr</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors">
                      Edit
                    </button>
                  </td>
                </tr>

                {/* Ground 2 */}
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">
                    CR & FC Indoor Sports Arena
                    <p className="text-xs text-slate-400 font-normal">Synthetic Turf • Futsal & Badminton</p>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">Colombo 07, Colombo</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">6.9072° N, 79.8665° E</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">Floodlights</span>
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">Parking</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 text-xs">LKR 3,800 / hr</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors">
                      Edit
                    </button>
                  </td>
                </tr>

                {/* Ground 3 */}
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">
                    Tyronne Fernando Stadium
                    <p className="text-xs text-slate-400 font-normal">Turf Ground • Cricket</p>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">Moratuwa, Colombo</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">6.7725° N, 79.8833° E</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">Floodlights</span>
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-bold">Changing</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 text-xs">LKR 5,000 / hr</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors">
                      Edit
                    </button>
                  </td>
                </tr>

                {/* Ground 4 */}
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">
                    Otters Athletic Club Arena
                    <p className="text-xs text-slate-400 font-normal">Wooden Court • Badminton</p>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">Colombo 07, Colombo</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">6.8920° N, 79.8650° E</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">Parking</span>
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-bold">Changing</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 text-xs">LKR 2,500 / hr</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors">
                      Edit
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
