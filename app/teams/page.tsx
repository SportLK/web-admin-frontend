'use client';

import React, { useState, useMemo } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { TeamDetailModal } from '@/components/TeamDetailModal';
import { SuspendTeamModal } from '@/components/SuspendTeamModal';
import { INITIAL_TEAMS, Team } from '@/data/mockData';
import {
  Search,
  Ban,
  RotateCcw,
} from 'lucide-react';

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Modals state
  const [selectedTeamForView, setSelectedTeamForView] = useState<Team | null>(null);
  const [selectedTeamForSuspension, setSelectedTeamForSuspension] = useState<Team | null>(null);

  // Statistics
  const totalTeams = teams.length;
  const activeTeams = teams.filter((t) => t.status === 'Active').length;
  const suspendedTeams = teams.filter((t) => t.status === 'Suspended').length;
  const totalMembers = teams.reduce(
    (acc, t) => acc + (t.squad ? t.squad.length : t.membersCount),
    0
  );

  // Filtered teams list
  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const matchesSearch =
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.manager.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSport = selectedSport === 'All' || team.sport === selectedSport;
      const matchesStatus = selectedStatus === 'All' || team.status === selectedStatus;

      return matchesSearch && matchesSport && matchesStatus;
    });
  }, [teams, searchQuery, selectedSport, selectedStatus]);

  // Handle Suspension
  const handleConfirmSuspension = (
    teamId: string,
    reason: string,
    duration: string,
    notes: string
  ) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === teamId) {
          return {
            ...t,
            status: 'Suspended',
            suspensionDetails: {
              suspendedAt: '19 Oct 2026',
              suspendedBy: 'SportLK Admin',
              reason,
              duration,
              notes,
            },
          };
        }
        return t;
      })
    );

    if (selectedTeamForView && selectedTeamForView.id === teamId) {
      setSelectedTeamForView((prev) =>
        prev
          ? {
              ...prev,
              status: 'Suspended',
              suspensionDetails: {
                suspendedAt: '19 Oct 2026',
                suspendedBy: 'SportLK Admin',
                reason,
                duration,
                notes,
              },
            }
          : null
      );
    }
  };

  // Handle Reactivation
  const handleReactivateTeam = (teamId: string) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === teamId) {
          const { suspensionDetails, ...rest } = t;
          return {
            ...rest,
            status: 'Active',
          };
        }
        return t;
      })
    );

    if (selectedTeamForView && selectedTeamForView.id === teamId) {
      setSelectedTeamForView((prev) =>
        prev
          ? {
              ...prev,
              status: 'Active',
              suspensionDetails: undefined,
            }
          : null
      );
    }
  };

  // Remove player from squad
  const handleRemoveMember = (teamId: string, memberId: string) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === teamId) {
          const updatedSquad = t.squad.filter((m) => m.id !== memberId);
          return {
            ...t,
            squad: updatedSquad,
            membersCount: updatedSquad.length,
          };
        }
        return t;
      })
    );

    if (selectedTeamForView && selectedTeamForView.id === teamId) {
      setSelectedTeamForView((prev) =>
        prev
          ? {
              ...prev,
              squad: prev.squad.filter((m) => m.id !== memberId),
              membersCount: prev.squad.length - 1,
            }
          : null
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header breadcrumbs={[{ label: 'Teams' }]} />

        <main className="p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Page Heading matching Figma 04 / Teams */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Team management</h1>
              <p className="text-sm text-gray-500 mt-1">
                Monitor squads, managers and team activity.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-lime-100 text-lime-900 border border-lime-300">
                Member 2 Module
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
              <span className="text-xs font-medium text-gray-500 block">Total Teams</span>
              <span className="text-2xl font-extrabold text-zinc-900 mt-1 block">
                {totalTeams}
              </span>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
              <span className="text-xs font-medium text-gray-500 block">Active Squads</span>
              <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">
                {activeTeams}
              </span>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
              <span className="text-xs font-medium text-gray-500 block">Suspended Teams</span>
              <span className="text-2xl font-extrabold text-rose-600 mt-1 block">
                {suspendedTeams}
              </span>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
              <span className="text-xs font-medium text-gray-500 block">Roster Players</span>
              <span className="text-2xl font-extrabold text-zinc-900 mt-1 block">
                {totalMembers}
              </span>
            </div>
          </div>

          {/* Search & Filter Toolbar matching Figma */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search teams or managers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-zinc-900 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-lime-400/30 focus:border-zinc-800 transition-all shadow-2xs"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="text-xs rounded-xl border border-gray-200 bg-white py-2 px-3 text-zinc-700 focus:outline-hidden focus:border-zinc-800 transition-colors shadow-2xs"
              >
                <option value="All">All Sports</option>
                <option value="Futsal">Futsal</option>
                <option value="Cricket">Cricket</option>
                <option value="Badminton">Badminton</option>
                <option value="Basketball">Basketball</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs rounded-xl border border-gray-200 bg-white py-2 px-3 text-zinc-700 focus:outline-hidden focus:border-zinc-800 transition-colors shadow-2xs"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Main Teams Table matching Figma 04 / Teams */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/60 border-b border-gray-200/80 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-4 px-6">TEAM</th>
                    <th className="py-4 px-6">SPORT</th>
                    <th className="py-4 px-6">MANAGER</th>
                    <th className="py-4 px-6">MEMBERS</th>
                    <th className="py-4 px-6">STATUS</th>
                    <th className="py-4 px-6 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTeams.length > 0 ? (
                    filteredTeams.map((team) => (
                      <tr key={team.id} className="hover:bg-gray-50/60 transition-colors group">
                        {/* Team Name & Location */}
                        <td className="py-4 px-6">
                          <div>
                            <span className="font-bold text-zinc-900 block text-xs group-hover:text-black">
                              {team.name}
                            </span>
                            <span className="text-[11px] text-gray-400 mt-0.5 block">
                              {team.location}
                            </span>
                          </div>
                        </td>

                        {/* Sport */}
                        <td className="py-4 px-6">
                          <span className="text-zinc-600 font-medium text-xs">{team.sport}</span>
                        </td>

                        {/* Manager */}
                        <td className="py-4 px-6">
                          <div>
                            <span className="font-semibold text-zinc-900 block text-xs">
                              {team.manager.name}
                            </span>
                          </div>
                        </td>

                        {/* Members */}
                        <td className="py-4 px-6">
                          <span className="text-zinc-700 font-mono font-medium text-xs">
                            {team.squad ? team.squad.length : team.membersCount}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                              team.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                team.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                            {team.status}
                          </span>
                        </td>

                        {/* Action matching Figma "View" button */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedTeamForView(team)}
                              className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-zinc-800 hover:bg-gray-100 hover:border-gray-300 font-semibold text-xs transition-colors shadow-2xs"
                            >
                              View
                            </button>

                            {team.status === 'Active' ? (
                              <button
                                type="button"
                                onClick={() => setSelectedTeamForSuspension(team)}
                                className="p-1.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Suspend Team"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleReactivateTeam(team.id)}
                                className="p-1.5 rounded-xl text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                title="Reactivate Team"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400 text-xs">
                        No teams match your search or filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 px-6 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between text-xs text-gray-500">
              <span>
                Showing <strong>{filteredTeams.length}</strong> of <strong>{totalTeams}</strong>{' '}
                teams
              </span>
              <span className="text-[11px] text-gray-400">SportLK Official Team Registry</span>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <TeamDetailModal
        team={selectedTeamForView}
        onClose={() => setSelectedTeamForView(null)}
        onOpenSuspension={(team) => {
          setSelectedTeamForView(null);
          setSelectedTeamForSuspension(team);
        }}
        onReactivateTeam={handleReactivateTeam}
        onRemoveMember={handleRemoveMember}
      />

      <SuspendTeamModal
        team={selectedTeamForSuspension}
        onClose={() => setSelectedTeamForSuspension(null)}
        onConfirmSuspension={handleConfirmSuspension}
      />
    </div>
  );
}
