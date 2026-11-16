'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { AdminShell } from '@/components/AdminShell';
import { TeamDetailModal } from '@/components/TeamDetailModal';
import { SuspendTeamModal } from '@/components/SuspendTeamModal';
import { Team } from '@/data/mockData';
import { adminApi, RegisteredPlayer } from '@/services/adminApi';
import {
  Search,
  Ban,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Real-time synchronization state
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch real-time teams data
  const fetchLiveTeams = useCallback(async (silent = false) => {
    if (!silent) setIsSyncing(true);
    try {
      const data = await adminApi.getTeams();
      setTeams(Array.isArray(data) ? data : []);
      setIsLiveConnected(true);
      setLastSynced(new Date());
    } catch {
      setIsLiveConnected(false);
    } finally {
      if (!silent) setIsSyncing(false);
    }
  }, []);

  // Real-time polling every 8 seconds
  useEffect(() => {
    fetchLiveTeams();
    const interval = setInterval(() => {
      fetchLiveTeams(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [fetchLiveTeams]);

  // Modals state
  const [selectedTeamForView, setSelectedTeamForView] = useState<Team | null>(null);
  const [selectedTeamForSuspension, setSelectedTeamForSuspension] = useState<Team | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [managerSearch, setManagerSearch] = useState('');
  const [managerResults, setManagerResults] = useState<RegisteredPlayer[]>([]);
  const [selectedManager, setSelectedManager] = useState<RegisteredPlayer | null>(null);
  const [newTeam, setNewTeam] = useState({ teamName: '', sportType: 'FUTSAL', primaryLocationCity: '', teamBio: '' });
  const [createError, setCreateError] = useState('');
  const [creatingTeam, setCreatingTeam] = useState(false);

  useEffect(() => {
    if (managerSearch.trim().length < 2) { setManagerResults([]); return; }
    const timer = setTimeout(() => adminApi.searchRegisteredPlayers(managerSearch).then(setManagerResults).catch(() => setManagerResults([])), 250);
    return () => clearTimeout(timer);
  }, [managerSearch]);

  const handleCreateTeam = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedManager) return;
    setCreatingTeam(true);
    setCreateError('');
    try {
      await adminApi.createTeam({ ...newTeam, managerId: selectedManager.id });
      setCreateOpen(false);
      setSelectedManager(null);
      setManagerSearch('');
      setNewTeam({ teamName: '', sportType: 'FUTSAL', primaryLocationCity: '', teamBio: '' });
      await fetchLiveTeams(true);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Could not create the team.');
    } finally { setCreatingTeam(false); }
  };

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
  const handleConfirmSuspension = async (
    teamId: string,
    reason: string,
    duration: string,
    notes: string
  ) => {
    // Optimistic UI update
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === teamId) {
          return {
            ...t,
            status: 'Suspended',
            suspensionDetails: {
              suspendedAt: 'Just now',
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
                suspendedAt: 'Just now',
                suspendedBy: 'SportLK Admin',
                reason,
                duration,
                notes,
              },
            }
          : null
      );
    }

    try {
      const updated = await adminApi.suspendTeam(teamId, { reason, duration, notes });
      if (updated) {
        setTeams((prev) => prev.map((t) => (t.id === teamId ? updated : t)));
        if (selectedTeamForView && selectedTeamForView.id === teamId) {
          setSelectedTeamForView(updated);
        }
      }
    } catch (err) {
      console.error('Failed to suspend team on backend:', err);
      await fetchLiveTeams(true);
      alert(err instanceof Error ? err.message : 'Could not suspend this team.');
    }
  };

  // Handle Reactivation
  const handleReactivateTeam = async (teamId: string) => {
    // Optimistic UI update
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

    try {
      const updated = await adminApi.reactivateTeam(teamId);
      if (updated) {
        setTeams((prev) => prev.map((t) => (t.id === teamId ? updated : t)));
        if (selectedTeamForView && selectedTeamForView.id === teamId) {
          setSelectedTeamForView(updated);
        }
      }
    } catch (err) {
      console.error('Failed to reactivate team on backend:', err);
      await fetchLiveTeams(true);
      alert(err instanceof Error ? err.message : 'Could not reactivate this team.');
    }
  };

  // Remove player from squad
  const handleRemoveMember = async (teamId: string, memberId: string) => {
    // Optimistic UI update
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

    try {
      await adminApi.removeMember(teamId, memberId);
    } catch (err) {
      console.error('Failed to remove member on backend:', err);
      await fetchLiveTeams(true);
      alert(err instanceof Error ? err.message : 'Could not remove this member.');
    }
  };

  return (
    <>
      <AdminShell breadcrumbs={[{ label: 'Teams' }]}>
        {/* Page Heading matching Figma 04 / Teams */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Team management</h1>
              <p className="text-sm text-gray-500 mt-1">
                Monitor squads, managers and team activity.
              </p>
            </div>

            {/* Real-time Data Sync Controls */}
            <div className="flex items-center gap-2.5">
              <button type="button" onClick={() => setCreateOpen(true)} className="rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-800">Add team</button>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  isLiveConnected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isLiveConnected ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'
                  }`}
                />
                {isLiveConnected ? 'Real-Time Sync' : 'Live Sync Ready'}
              </span>

              <button
                type="button"
                onClick={() => fetchLiveTeams(false)}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-zinc-700 hover:bg-gray-50 shadow-2xs transition-colors disabled:opacity-50"
                title="Refresh real-time data"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-zinc-500 ${isSyncing ? 'animate-spin text-lime-600' : ''}`}
                />
                <span>Sync Now</span>
              </button>
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
        </AdminShell>

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
        onRequestPlayer={async (teamId, userId) => {
          try {
            await adminApi.requestPlayerToJoin(teamId, userId);
            alert('Join request saved. The selected registered player is now pending team approval.');
          } catch (error) {
            alert(error instanceof Error ? error.message : 'Could not create the join request.');
          }
        }}
      />

      <SuspendTeamModal
        team={selectedTeamForSuspension}
        onClose={() => setSelectedTeamForSuspension(null)}
        onConfirmSuspension={handleConfirmSuspension}
      />
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleCreateTeam} className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
            <div><h2 className="text-lg font-bold text-zinc-900">Add a team</h2><p className="mt-1 text-sm text-gray-500">Choose an existing SportLK account as team manager.</p></div>
            <label className="block text-sm font-medium text-zinc-700">Team name<input required maxLength={100} value={newTeam.teamName} onChange={(e) => setNewTeam({ ...newTeam, teamName: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm text-zinc-900" /></label>
            <label className="block text-sm font-medium text-zinc-700">Sport<select value={newTeam.sportType} onChange={(e) => setNewTeam({ ...newTeam, sportType: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-zinc-900"><option value="FUTSAL">Futsal</option><option value="FOOTBALL">Football</option><option value="CRICKET">Cricket</option><option value="BADMINTON">Badminton</option><option value="BASKETBALL">Basketball</option><option value="VOLLEYBALL">Volleyball</option></select></label>
            <label className="block text-sm font-medium text-zinc-700">City<input value={newTeam.primaryLocationCity} onChange={(e) => setNewTeam({ ...newTeam, primaryLocationCity: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm text-zinc-900" /></label>
            <label className="block text-sm font-medium text-zinc-700">Manager search (registered players only)<input value={selectedManager ? `${selectedManager.fullName} · ${selectedManager.email}` : managerSearch} onChange={(e) => { setSelectedManager(null); setManagerSearch(e.target.value); }} placeholder="Search by name or email" className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm text-zinc-900" /></label>
            {!selectedManager && managerResults.length > 0 && <div className="max-h-36 overflow-auto rounded-lg border border-gray-200">{managerResults.map((player) => <button key={player.id} type="button" onClick={() => { setSelectedManager(player); setManagerSearch(''); setManagerResults([]); }} className="block w-full border-b border-gray-100 px-3 py-2 text-left text-sm text-zinc-800 hover:bg-gray-50">{player.fullName} <span className="text-gray-500">{player.email}</span></button>)}</div>}
            <label className="block text-sm font-medium text-zinc-700">Team description<textarea value={newTeam.teamBio} onChange={(e) => setNewTeam({ ...newTeam, teamBio: e.target.value })} rows={3} className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm text-zinc-900" /></label>
            {createError && <p role="alert" className="text-sm text-rose-700">{createError}</p>}
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setCreateOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-zinc-800">Cancel</button><button disabled={!selectedManager || creatingTeam} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{creatingTeam ? 'Creating…' : 'Create team'}</button></div>
          </form>
        </div>
      )}
    </>
  );
}
