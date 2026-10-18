'use client';

import React from 'react';
import { Match } from '../../types';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Activity,
  Shield,
  Sparkles,
} from 'lucide-react';

interface MatchDetailsModalProps {
  match: Match | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({
  match,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !match) return null;

  const isLive = match.matchStatus === 'LIVE';
  const isCompleted = match.matchStatus === 'COMPLETED';
  const isScheduled = match.matchStatus === 'SCHEDULED';

  const sportEmoji =
    match.sportType === 'CRICKET' ? '🏏' :
    match.sportType === 'FUTSAL' ? '⚽' :
    match.sportType === 'BADMINTON' ? '🏸' : '🏀';

  const statusNote = match.score?.detailedScorecardJson?.currentStatus;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{sportEmoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight">
                  {match.sportType} Match Overview
                </h3>
                {isLive && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    LIVE NOW
                  </span>
                )}
                {isScheduled && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                    SCHEDULED
                  </span>
                )}
                {isCompleted && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300">
                    COMPLETED
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Match ID: <code className="font-mono text-slate-300">{match.id}</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* Scoreboard Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden shadow-md">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none"></div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>{match.tournament?.tournamentName || 'Grassroots Exhibition Match'}</span>
              </div>
              {isLive && (
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  <span>Real-Time Sync Active</span>
                </div>
              )}
            </div>

            {/* Teams & Score Display */}
            <div className="grid grid-cols-5 items-center gap-2 text-center py-2">
              {/* Home Team */}
              <div className="col-span-2 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center border border-emerald-500/30">
                    {(match.homeTeam?.teamName || 'H').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-black text-sm text-white truncate max-w-[140px]">
                      {match.homeTeam?.teamName || 'Home Team'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold">HOME</p>
                  </div>
                </div>
                <p className="text-2xl font-black text-emerald-400 mt-2">
                  {match.score?.homeTeamScoreDisplay || (isScheduled ? '-' : '0')}
                </p>
              </div>

              {/* VS Pill */}
              <div className="col-span-1 flex flex-col items-center justify-center">
                <span className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 text-xs font-black flex items-center justify-center border border-slate-700">
                  VS
                </span>
              </div>

              {/* Away Team */}
              <div className="col-span-2 text-right">
                <div className="flex items-center justify-end gap-2 mb-1">
                  <div>
                    <p className="font-black text-sm text-white truncate max-w-[140px]">
                      {match.awayTeam?.teamName || 'Away Team'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold">AWAY</p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 font-black text-xs flex items-center justify-center border border-blue-500/30">
                    {(match.awayTeam?.teamName || 'A').slice(0, 2).toUpperCase()}
                  </div>
                </div>
                <p className="text-2xl font-black text-blue-400 mt-2">
                  {match.score?.awayTeamScoreDisplay || (isScheduled ? '-' : '0')}
                </p>
              </div>
            </div>

            {/* Commentary / Status Ticker */}
            {statusNote && (
              <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center gap-2 text-xs text-slate-300">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="italic font-medium">{statusNote}</span>
              </div>
            )}
          </div>

          {/* Match Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ground / Venue Details */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Venue & Ground</span>
              </div>
              {match.venue ? (
                <div>
                  <p className="font-bold text-slate-900 text-sm">{match.venue.venueName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    📍 {match.venue.city}, Sri Lanka
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No official venue registered for this fixture.</p>
              )}
            </div>

            {/* Timing & Schedule */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Schedule & Timing</span>
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">
                  {new Date(match.scheduledStartTime).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Kickoff: {new Date(match.scheduledStartTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Status: <strong className="text-slate-700">{match.matchStatus}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Organizer / Admin Notice */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-emerald-900">Event Organizer & Match Official Fixture</p>
              <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
                Fixtures are scheduled and operated by registered Event Organizers and Tournament Directors. As a Platform Administrator, you have full observational monitoring over ongoing scores, ground allocations, and live feeds.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">
            Last updated: {match.score?.updatedAt ? new Date(match.score.updatedAt).toLocaleTimeString() : (match.createdAt ? new Date(match.createdAt).toLocaleTimeString() : 'Recent')}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            Close Overview
          </button>
        </div>

      </div>
    </div>
  );
};
