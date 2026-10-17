'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/Header';
import { matchesApi } from '../services/api';
import { adminSocket } from '../services/socket';
import { Match, MatchStatus, CreateMatchDto, UpdateScoreDto } from '../types';
import { ScheduleMatchModal } from './components/ScheduleMatchModal';
import { LiveScoreModal } from './components/LiveScoreModal';
import { DeleteMatchModal } from './components/DeleteMatchModal';
import {
  Plus,
  Search,
  Calendar,
  Radio,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Play,
  CheckCircle,
} from 'lucide-react';

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<MatchStatus | 'ALL'>('ALL');
  const [selectedSport, setSelectedSport] = useState<string>('ALL');

  // Modals
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scoringMatch, setScoringMatch] = useState<Match | null>(null);
  const [deletingMatch, setDeletingMatch] = useState<Match | null>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Fetch real matches from NestJS backend
  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await matchesApi.getAll(selectedStatus, selectedSport);
      setMatches(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.warn('Backend fetch error:', err.message);
      setError(err.message || 'Failed to connect to backend API');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, selectedSport]);

  useEffect(() => {
    fetchMatches();

    // Listen to real-time score updates from gateway
    adminSocket.onScoreUpdated((payload) => {
      setMatches((prev) =>
        prev.map((m) => {
          if (m.id === payload.matchId && payload.score) {
            return {
              ...m,
              score: {
                ...m.score,
                ...payload.score,
              },
            };
          }
          return m;
        })
      );
    });

    // Listen to real-time status updates
    adminSocket.onStatusChanged((payload) => {
      setMatches((prev) =>
        prev.map((m) => (m.id === payload.matchId && payload.match ? { ...m, ...payload.match } : m))
      );
    });
  }, [fetchMatches]);

  // 2. Schedule Match
  const handleScheduleMatch = async (dto: CreateMatchDto) => {
    await matchesApi.create(dto);
    showToast('Match fixture scheduled successfully in MySQL!');
    await fetchMatches();
  };

  // 3. Save Score
  const handleSaveScore = async (matchId: string, scoreDto: UpdateScoreDto) => {
    await matchesApi.updateScore(matchId, scoreDto);
    showToast('Score updated and broadcasted to mobile users!');
    await fetchMatches();
  };

  // 4. Update Status (e.g. SCHEDULED -> LIVE or LIVE -> COMPLETED)
  const handleUpdateStatus = async (matchId: string, status: MatchStatus) => {
    await matchesApi.updateStatus(matchId, status);
    showToast(`Match status updated to ${status}`);
    await fetchMatches();
  };

  // 5. Delete Match
  const handleDeleteConfirm = async () => {
    if (!deletingMatch) return;
    try {
      await matchesApi.delete(deletingMatch.id);
      showToast('Match fixture cancelled successfully');
      await fetchMatches();
    } catch (err: any) {
      alert(`Failed to delete match: ${err.message}`);
    }
  };

  // Client-side search filtering
  const filteredMatches = matches.filter((m) => {
    const term = searchTerm.toLowerCase();
    const home = m.homeTeam?.teamName?.toLowerCase() || '';
    const away = m.awayTeam?.teamName?.toLowerCase() || '';
    const tourney = m.tournament?.tournamentName?.toLowerCase() || '';
    const venue = m.venue?.venueName?.toLowerCase() || '';
    return home.includes(term) || away.includes(term) || tourney.includes(term) || venue.includes(term);
  });

  // Calculate live stats
  const totalCount = matches.length;
  const liveCount = matches.filter((m) => m.matchStatus === 'LIVE').length;
  const completedCount = matches.filter((m) => m.matchStatus === 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <Header
        title="Matches"
        subtitle="Schedule fixtures, control live scoreboards, and broadcast scores to mobile users"
        actionButton={
          <button
            onClick={() => setIsScheduleOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Schedule Match
          </button>
        }
      />

      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-900">
              ✕
            </button>
          </div>
        )}

        {/* Backend Offline Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Backend API Notice: <strong>{error}</strong>. Ensure your NestJS backend is running on <code>http://localhost:3000</code>.
              </span>
            </div>
            <button
              onClick={fetchMatches}
              className="px-3 py-1 rounded-lg bg-amber-200/60 hover:bg-amber-200 font-bold text-amber-900 text-xs"
            >
              Retry
            </button>
          </div>
        )}

        {/* Dynamic KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Fixtures</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalCount}</p>
            <p className="text-xs text-slate-500 mt-1">Real fixtures in MySQL database</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Matches</p>
              {liveCount > 0 && (
                <span className="flex items-center gap-1 text-[10px] font-extrabold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  BROADCASTING
                </span>
              )}
            </div>
            <p className="text-2xl font-black text-red-600 mt-1">{liveCount}</p>
            <p className="text-xs text-slate-500 mt-1">Active WebSocket room subscriptions</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed Fixtures</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{completedCount}</p>
            <p className="text-xs text-slate-500 mt-1">Final scores recorded</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Field */}
          <div className="relative flex-1 w-full md:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by team, tournament, or ground..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            />
          </div>

          {/* Status Tabs & Sport Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Sports</option>
              <option value="CRICKET">🏏 Cricket</option>
              <option value="FUTSAL">⚽ Futsal</option>
              <option value="BADMINTON">🏸 Badminton</option>
              <option value="BASKETBALL">🏀 Basketball</option>
            </select>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(['ALL', 'LIVE', 'SCHEDULED', 'COMPLETED'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                    selectedStatus === status
                      ? status === 'LIVE'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {status === 'LIVE' ? '● LIVE' : status}
                </button>
              ))}
            </div>

            {/* Refresh */}
            <button
              onClick={fetchMatches}
              title="Refresh from backend"
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Matches Data Table */}
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Match Fixtures</h2>
              <p className="text-xs text-slate-400 font-medium">Real fixtures from MySQL <code>matches</code> table</p>
            </div>
            <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2.5 py-1 rounded-full">
              {filteredMatches.length} {filteredMatches.length === 1 ? 'match' : 'matches'}
            </span>
          </div>

          {loading ? (
            <div className="p-16 text-center">
              <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">Loading matches from backend...</p>
              <p className="text-xs text-slate-400 mt-1">Connecting to NestJS API & WebSocket Gateway</p>
            </div>
          ) : filteredMatches.length === 0 ? (
            /* Clean Empty State when no mock data is entered */
            <div className="p-16 text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg mb-1">
                No match fixtures found
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                No matches currently match your filter in MySQL. Click the button below to schedule your first fixture at a sports ground.
              </p>
              <button
                onClick={() => setIsScheduleOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Schedule First Match
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Match Details</th>
                    <th className="px-6 py-3.5">Tournament</th>
                    <th className="px-6 py-3.5">Venue Ground</th>
                    <th className="px-6 py-3.5">Schedule Time</th>
                    <th className="px-6 py-3.5">Current Score / Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredMatches.map((m) => {
                    const isLive = m.matchStatus === 'LIVE';
                    const isCompleted = m.matchStatus === 'COMPLETED';
                    const isScheduled = m.matchStatus === 'SCHEDULED';

                    const emoji =
                      m.sportType === 'CRICKET' ? '🏏' :
                      m.sportType === 'FUTSAL' ? '⚽' :
                      m.sportType === 'BADMINTON' ? '🏸' : '🏀';

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Match Details */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{emoji}</span>
                            <div>
                              <p className="font-bold text-slate-900">
                                {m.homeTeam?.teamName || `Team ${m.homeTeamId}`} vs {m.awayTeam?.teamName || `Team ${m.awayTeamId}`}
                              </p>
                              <p className="text-xs text-slate-400">{m.sportType} Match</p>
                            </div>
                          </div>
                        </td>

                        {/* Tournament */}
                        <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                          {m.tournament?.tournamentName || 'Friendly / League Match'}
                        </td>

                        {/* Venue Ground */}
                        <td className="px-6 py-4 text-xs text-slate-600">
                          {m.venue?.venueName ? (
                            <span>📍 {m.venue.venueName}</span>
                          ) : (
                            <span className="text-slate-400 italic">No ground assigned</span>
                          )}
                        </td>

                        {/* Schedule Time */}
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {new Date(m.scheduledStartTime).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>

                        {/* Score & Status */}
                        <td className="px-6 py-4">
                          {isLive && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-red-100 text-red-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                              <span>
                                LIVE • {m.score?.homeTeamScoreDisplay || '0'} - {m.score?.awayTeamScoreDisplay || '0'}
                              </span>
                            </div>
                          )}
                          {isScheduled && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                              SCHEDULED
                            </span>
                          )}
                          {isCompleted && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                              FINAL • {m.score?.homeTeamScoreDisplay || '0'} - {m.score?.awayTeamScoreDisplay || '0'}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Live Score Controller */}
                            <button
                              onClick={() => setScoringMatch(m)}
                              title="Open Live Score Controller"
                              className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Radio className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Score Controller</span>
                            </button>

                            {/* Quick Start Match */}
                            {isScheduled && (
                              <button
                                onClick={() => handleUpdateStatus(m.id, 'LIVE')}
                                title="Start Match (Set to LIVE)"
                                className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                              >
                                <Play className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Quick Finish Match */}
                            {isLive && (
                              <button
                                onClick={() => handleUpdateStatus(m.id, 'COMPLETED')}
                                title="Finish Match (Set to COMPLETED)"
                                className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Cancel Match */}
                            <button
                              onClick={() => setDeletingMatch(m)}
                              title="Cancel Match"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Match Modal */}
      <ScheduleMatchModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onSchedule={handleScheduleMatch}
      />

      {/* Live Score Controller Modal */}
      <LiveScoreModal
        match={scoringMatch}
        isOpen={!!scoringMatch}
        onClose={() => setScoringMatch(null)}
        onSaveScore={handleSaveScore}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Cancel Match Confirm Modal */}
      <DeleteMatchModal
        match={deletingMatch}
        onClose={() => setDeletingMatch(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
