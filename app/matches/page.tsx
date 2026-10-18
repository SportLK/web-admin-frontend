'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/Header';
import { matchesApi } from '../services/api';
import { adminSocket } from '../services/socket';
import { Match, MatchStatus } from '../types';
import { MatchDetailsModal } from './components/MatchDetailsModal';
import {
  Search,
  Calendar,
  RefreshCw,
  Eye,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<MatchStatus | 'ALL'>('ALL');
  const [selectedSport, setSelectedSport] = useState<string>('ALL');

  // Details Modal
  const [detailsMatch, setDetailsMatch] = useState<Match | null>(null);

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
            const updated = {
              ...m,
              score: {
                ...m.score,
                ...payload.score,
              },
            };
            setDetailsMatch((curr) => (curr && curr.id === payload.matchId ? updated : curr));
            return updated;
          }
          return m;
        })
      );
    });

    // Listen to real-time status updates
    adminSocket.onStatusChanged((payload) => {
      setMatches((prev) =>
        prev.map((m) => {
          if (m.id === payload.matchId && payload.match) {
            const updated = { ...m, ...payload.match };
            setDetailsMatch((curr) => (curr && curr.id === payload.matchId ? updated : curr));
            return updated;
          }
          return m;
        })
      );
    });
  }, [fetchMatches]);

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
  const liveMatches = matches.filter((m) => m.matchStatus === 'LIVE');
  const liveCount = liveMatches.length;
  const completedCount = matches.filter((m) => m.matchStatus === 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header - Strictly Monitoring & Oversight */}
      <Header
        title="Matches & Live Monitoring"
        subtitle="Live oversight of ongoing matches, scores, and scheduled fixtures across Sri Lanka"
        actionButton={
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Sync Active</span>
          </div>
        }
      />

      <div className="p-8 max-w-7xl mx-auto space-y-6">

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
              className="px-3 py-1 rounded-lg bg-amber-200/60 hover:bg-amber-200 font-bold text-amber-900 text-xs cursor-pointer"
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
            <p className="text-xs text-slate-500 mt-1">Scheduled by Event Organizers</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Ongoing Matches</p>
              {liveCount > 0 && (
                <span className="flex items-center gap-1 text-[10px] font-extrabold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  LIVE NOW
                </span>
              )}
            </div>
            <p className="text-2xl font-black text-red-600 mt-1">{liveCount}</p>
            <p className="text-xs text-slate-500 mt-1">Real-time WebSocket score stream</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed Fixtures</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{completedCount}</p>
            <p className="text-xs text-slate-500 mt-1">Final results recorded</p>
          </div>
        </div>

        {/* ONGOING MATCHES SHOWCASE (Featured Live Matches) */}
        {liveCount > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  Ongoing Matches ({liveCount})
                </h2>
              </div>
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                ● Live Scoreboard Broadcast
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveMatches.map((m) => (
                <div
                  key={m.id}
                  className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-3">
                    <span className="font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      {m.sportType} • {m.tournament?.tournamentName || 'Live Encounter'}
                    </span>
                    <span className="text-slate-400">
                      {m.venue?.venueName ? `📍 ${m.venue.venueName}` : 'Live Ground'}
                    </span>
                  </div>

                  <div className="grid grid-cols-5 items-center py-2 text-center">
                    <div className="col-span-2 text-left">
                      <p className="font-black text-sm text-white truncate">
                        {m.homeTeam?.teamName || 'Home'}
                      </p>
                      <p className="text-2xl font-black text-emerald-400 mt-1">
                        {m.score?.homeTeamScoreDisplay || '0'}
                      </p>
                    </div>
                    <div className="col-span-1 text-slate-500 text-xs font-black">VS</div>
                    <div className="col-span-2 text-right">
                      <p className="font-black text-sm text-white truncate">
                        {m.awayTeam?.teamName || 'Away'}
                      </p>
                      <p className="text-2xl font-black text-blue-400 mt-1">
                        {m.score?.awayTeamScoreDisplay || '0'}
                      </p>
                    </div>
                  </div>

                  {m.score?.detailedScorecardJson?.currentStatus && (
                    <div className="mt-3 pt-2.5 border-t border-slate-700/60 text-xs text-slate-300 italic flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{m.score.detailedScorecardJson.currentStatus}</span>
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Live sync active
                    </span>
                    <button
                      onClick={() => setDetailsMatch(m)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Match</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
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
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Matches Data Table */}
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Match Fixtures Directory</h2>
              <p className="text-xs text-slate-400 font-medium">
                Fixtures scheduled and operated by Event Organizers & Match Scorers
              </p>
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
            /* Clean Empty State */
            <div className="p-16 text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg mb-1">
                No match fixtures found
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                No matches match your current filter. When Event Organizers create and schedule matches in tournaments, they will appear here automatically for administrative monitoring.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Match Details</th>
                    <th className="px-6 py-3.5">Tournament / Event</th>
                    <th className="px-6 py-3.5">Venue Ground</th>
                    <th className="px-6 py-3.5">Schedule Time</th>
                    <th className="px-6 py-3.5">Current Score / Status</th>
                    <th className="px-6 py-3.5 text-right">Details</th>
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
                          {m.tournament?.tournamentName || 'Friendly / Exhibition'}
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

                        {/* Action - View Details */}
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setDetailsMatch(m)}
                            title="View Full Match Details"
                            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                            <span>View Details</span>
                          </button>
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

      {/* Match Details Modal */}
      <MatchDetailsModal
        match={detailsMatch}
        isOpen={!!detailsMatch}
        onClose={() => setDetailsMatch(null)}
      />
    </div>
  );
}
