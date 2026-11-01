'use client';

import React, { useState, useEffect } from 'react';
import { X, Flame, Radio, Zap, AlertCircle, Loader2, Send, CheckCircle2 } from 'lucide-react';
import { Match, MatchStatus, UpdateScoreDto } from '../../types';
import { adminSocket } from '../../services/socket';

interface LiveScoreModalProps {
  match: Match | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveScore: (matchId: string, scoreDto: UpdateScoreDto) => Promise<void>;
  onUpdateStatus: (matchId: string, status: MatchStatus) => Promise<void>;
}

export const LiveScoreModal: React.FC<LiveScoreModalProps> = ({
  match,
  isOpen,
  onClose,
  onSaveScore,
  onUpdateStatus,
}) => {
  const [matchStatus, setMatchStatus] = useState<MatchStatus>('LIVE');
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [oversOrClock, setOversOrClock] = useState('');
  const [statusText, setStatusText] = useState('');

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  useEffect(() => {
    if (match) {
      setMatchStatus(match.matchStatus || 'LIVE');
      setHomeScore(match.score?.homeTeamScoreDisplay || '0');
      setAwayScore(match.score?.awayTeamScoreDisplay || '0');
      setOversOrClock(
        match.score?.detailedScorecardJson?.overs ||
        match.score?.detailedScorecardJson?.clock ||
        ''
      );
      setStatusText(match.score?.detailedScorecardJson?.currentStatus || '');
      setErrorMessage(null);
      setBroadcastSuccess(false);

      // Connect to WebSocket room for this match
      adminSocket.joinMatch(match.id);
    }
  }, [match, isOpen]);

  if (!isOpen || !match) return null;

  // Quick increment actions
  const addHomeScore = (increment: number, isWicket = false) => {
    if (match.sportType === 'CRICKET') {
      const parts = homeScore.split('/');
      const runs = parseInt(parts[0] || '0', 10) + increment;
      const wkts = isWicket ? Math.min(10, parseInt(parts[1] || '0', 10) + 1) : parseInt(parts[1] || '0', 10);
      setHomeScore(`${runs}/${wkts}`);
    } else {
      const curr = parseInt(homeScore || '0', 10);
      setHomeScore((curr + increment).toString());
    }
  };

  const addAwayScore = (increment: number, isWicket = false) => {
    if (match.sportType === 'CRICKET') {
      const parts = awayScore.split('/');
      const runs = parseInt(parts[0] || '0', 10) + increment;
      const wkts = isWicket ? Math.min(10, parseInt(parts[1] || '0', 10) + 1) : parseInt(parts[1] || '0', 10);
      setAwayScore(`${runs}/${wkts}`);
    } else {
      const curr = parseInt(awayScore || '0', 10);
      setAwayScore((curr + increment).toString());
    }
  };

  const addCricketBall = (type: string, value: number) => {
    addHomeScore(value, type === 'WICKET');
    const currOv = parseFloat(oversOrClock || '0.0');
    setOversOrClock((currOv + 0.1).toFixed(1));
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setBroadcastSuccess(false);

    const detailedScorecard: Record<string, any> = {
      ...(match.score?.detailedScorecardJson || {}),
      currentStatus: statusText.trim() || undefined,
      overs: match.sportType === 'CRICKET' ? oversOrClock.trim() : undefined,
      clock: match.sportType === 'FUTSAL' ? oversOrClock.trim() : undefined,
    };

    const scorePayload: UpdateScoreDto = {
      homeTeamScoreDisplay: homeScore.trim(),
      awayTeamScoreDisplay: awayScore.trim(),
      detailedScorecardJson: detailedScorecard,
    };

    try {
      setSaving(true);

      // 1. Update status if changed
      if (matchStatus !== match.matchStatus) {
        await onUpdateStatus(match.id, matchStatus);
      }

      // 2. Persist in MySQL via HTTP
      await onSaveScore(match.id, scorePayload);

      // 3. Instant WebSocket Broadcast to all mobile listeners
      adminSocket.broadcastScoreUpdate(match.id, scorePayload);

      setBroadcastSuccess(true);
      setTimeout(() => setBroadcastSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to broadcast score');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-red-600/30 text-red-400 flex items-center justify-center font-bold">
              <Radio className="w-4 h-4 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-white">Live Scoreboard Controller</h2>
                <span className="text-[10px] font-extrabold bg-red-500 text-white px-2 py-0.5 rounded-full">
                  WEBSOCKET BROADCASTER
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {match.homeTeam?.teamName || 'Home'} vs {match.awayTeam?.teamName || 'Away'} • {match.sportType}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleBroadcast} className="p-6 space-y-5 text-sm">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {broadcastSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>⚡ Score successfully broadcasted to mobile app in real time!</span>
            </div>
          )}

          {/* Lifecycle Status Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Match Lifecycle State
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['SCHEDULED', 'LIVE', 'COMPLETED'] as MatchStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setMatchStatus(st)}
                  className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
                    matchStatus === st
                      ? st === 'LIVE'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'LIVE' ? '● LIVE' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Scoreboard Cards */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-900 text-white">
            {/* Home Team */}
            <div className="text-center p-3 rounded-lg bg-slate-800/80">
              <p className="text-xs font-bold text-emerald-400 truncate mb-1">
                {match.homeTeam?.teamName || 'Home Team'}
              </p>
              <input
                type="text"
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                placeholder="146/3"
                className="w-full text-center text-2xl font-black bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-emerald-500"
              />
              {/* Quick buttons */}
              {match.sportType === 'CRICKET' ? (
                <div className="flex justify-center gap-1 mt-2">
                  <button type="button" onClick={() => addCricketBall('SINGLE', 1)} className="px-2 py-1 rounded bg-slate-700 text-[10px] font-bold hover:bg-slate-600">+1</button>
                  <button type="button" onClick={() => addCricketBall('FOUR', 4)} className="px-2 py-1 rounded bg-emerald-700 text-[10px] font-bold hover:bg-emerald-600">+4</button>
                  <button type="button" onClick={() => addCricketBall('SIX', 6)} className="px-2 py-1 rounded bg-purple-700 text-[10px] font-bold hover:bg-purple-600">+6</button>
                  <button type="button" onClick={() => addCricketBall('WICKET', 0)} className="px-2 py-1 rounded bg-red-700 text-[10px] font-bold hover:bg-red-600">+W</button>
                </div>
              ) : (
                <div className="flex justify-center gap-1 mt-2">
                  <button type="button" onClick={() => addHomeScore(1)} className="px-3 py-1 rounded bg-emerald-600 text-xs font-bold hover:bg-emerald-500">+1 Goal</button>
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="text-center p-3 rounded-lg bg-slate-800/80">
              <p className="text-xs font-bold text-blue-400 truncate mb-1">
                {match.awayTeam?.teamName || 'Away Team'}
              </p>
              <input
                type="text"
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                placeholder="158/7"
                className="w-full text-center text-2xl font-black bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-blue-500"
              />
              {/* Quick buttons */}
              {match.sportType === 'CRICKET' ? (
                <div className="flex justify-center gap-1 mt-2">
                  <button type="button" onClick={() => addAwayScore(1)} className="px-2 py-1 rounded bg-slate-700 text-[10px] font-bold hover:bg-slate-600">+1</button>
                  <button type="button" onClick={() => addAwayScore(4)} className="px-2 py-1 rounded bg-emerald-700 text-[10px] font-bold hover:bg-emerald-600">+4</button>
                  <button type="button" onClick={() => addAwayScore(6)} className="px-2 py-1 rounded bg-purple-700 text-[10px] font-bold hover:bg-purple-600">+6</button>
                  <button type="button" onClick={() => addAwayScore(0, true)} className="px-2 py-1 rounded bg-red-700 text-[10px] font-bold hover:bg-red-600">+W</button>
                </div>
              ) : (
                <div className="flex justify-center gap-1 mt-2">
                  <button type="button" onClick={() => addAwayScore(1)} className="px-3 py-1 rounded bg-blue-600 text-xs font-bold hover:bg-blue-500">+1 Goal</button>
                </div>
              )}
            </div>
          </div>

          {/* Overs or Match Clock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                {match.sportType === 'CRICKET' ? 'Overs (e.g. 17.4)' : 'Match Clock (e.g. 38:20)'}
              </label>
              <input
                type="text"
                placeholder={match.sportType === 'CRICKET' ? '17.4' : '38:20'}
                value={oversOrClock}
                onChange={(e) => setOversOrClock(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Target / Status Equation
              </label>
              <input
                type="text"
                placeholder="e.g. Colombo Lions need 13 runs from 16 balls"
                value={statusText}
                onChange={(e) => setStatusText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              ⚡ Broadcasts immediately via WebSocket room <code>match_{match.id}</code>
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/30 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Broadcast Score Now</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
