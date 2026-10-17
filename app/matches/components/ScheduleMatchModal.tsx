'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Users, Trophy, AlertCircle, Loader2 } from 'lucide-react';
import { venuesApi } from '../../services/api';
import { Venue, CreateMatchDto, SportType } from '../../types';

interface ScheduleMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (dto: CreateMatchDto) => Promise<void>;
}

export const ScheduleMatchModal: React.FC<ScheduleMatchModalProps> = ({
  isOpen,
  onClose,
  onSchedule,
}) => {
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [venueId, setVenueId] = useState('');
  const [scheduledStartTime, setScheduledStartTime] = useState('');
  const [sportType, setSportType] = useState<SportType>('CRICKET');
  const [tournamentId, setTournamentId] = useState('');

  const [venues, setVenues] = useState<Venue[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load registered venues from Venue Management
  useEffect(() => {
    if (isOpen) {
      async function loadVenues() {
        try {
          setLoadingVenues(true);
          const data = await venuesApi.getAll();
          setVenues(Array.isArray(data) ? data : []);
          if (data && data.length > 0) {
            setVenueId(data[0].id);
          }
        } catch (e: any) {
          console.warn('Could not load venues for modal:', e.message);
        } finally {
          setLoadingVenues(false);
        }
      }
      loadVenues();

      // Default date & time to 2 hours from now
      const d = new Date(Date.now() + 7200000);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      setScheduledStartTime(d.toISOString().slice(0, 16));
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!homeTeamId.trim()) {
      setErrorMessage('Home Team ID / Name is required');
      return;
    }
    if (!awayTeamId.trim()) {
      setErrorMessage('Away Team ID / Name is required');
      return;
    }
    if (homeTeamId.trim() === awayTeamId.trim()) {
      setErrorMessage('Home team and Away team cannot be the same');
      return;
    }
    if (!scheduledStartTime) {
      setErrorMessage('Scheduled start time is required');
      return;
    }

    const payload: CreateMatchDto = {
      homeTeamId: homeTeamId.trim(),
      awayTeamId: awayTeamId.trim(),
      venueId: venueId || undefined,
      tournamentId: tournamentId.trim() || undefined,
      scheduledStartTime: new Date(scheduledStartTime).toISOString(),
      sportType,
    };

    try {
      setSubmitting(true);
      await onSchedule(payload);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to schedule match');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Schedule Match Fixture</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Creates tournament match and initializes live scorecard in MySQL
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Sport Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Sport Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['CRICKET', 'FUTSAL', 'BADMINTON', 'BASKETBALL'] as SportType[]).map((s) => {
                const isSelected = sportType === s;
                const emoji = s === 'CRICKET' ? '🏏' : s === 'FUTSAL' ? '⚽' : s === 'BADMINTON' ? '🏸' : '🏀';
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSportType(s)}
                    className={`py-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span className="text-sm">{emoji}</span>
                    <span className="text-[10px]">{s}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Teams Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Home Team ID / Name *
              </label>
              <input
                type="text"
                placeholder="e.g. 1 (or Colombo Lions)"
                value={homeTeamId}
                onChange={(e) => setHomeTeamId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Away Team ID / Name *
              </label>
              <input
                type="text"
                placeholder="e.g. 2 (or Kandy Kings)"
                value={awayTeamId}
                onChange={(e) => setAwayTeamId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Venue Selector (Connected to Venue Management) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Select Sports Ground / Venue
            </label>
            <select
              value={venueId}
              onChange={(e) => setVenueId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="">No Venue Assigned</option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  📍 {v.venueName} ({v.city})
                </option>
              ))}
            </select>
            {venues.length === 0 && !loadingVenues && (
              <p className="text-[11px] text-amber-600 mt-1">
                Tip: Add grounds in Venue Management to assign them to fixtures.
              </p>
            )}
          </div>

          {/* Tournament ID (Optional) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Tournament ID (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 1"
              value={tournamentId}
              onChange={(e) => setTournamentId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Scheduled Start Time */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Scheduled Date & Time *
            </label>
            <input
              type="datetime-local"
              value={scheduledStartTime}
              onChange={(e) => setScheduledStartTime(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Schedule Fixture</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
