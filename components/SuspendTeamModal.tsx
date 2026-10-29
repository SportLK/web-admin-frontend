'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, Ban, ShieldAlert } from 'lucide-react';
import { Team } from '../data/mockData';

interface SuspendTeamModalProps {
  team: Team | null;
  onClose: () => void;
  onConfirmSuspension: (
    teamId: string,
    reason: string,
    duration: string,
    notes: string
  ) => void;
}

const REASONS = [
  'Misleading information / Fake roster participant',
  'Unsportsmanlike conduct during match / challenge',
  'Tournament forfeiture without advance notice',
  'Code of conduct violation',
  'Organizer dispute pending arbitration',
  'Ineligible squad age / regional criteria',
];

const DURATIONS = ['14 Days', '30 Days', '60 Days', '90 Days', 'Indefinite'];

export const SuspendTeamModal: React.FC<SuspendTeamModalProps> = ({
  team,
  onClose,
  onConfirmSuspension,
}) => {
  const [reason, setReason] = useState<string>(REASONS[0]);
  const [duration, setDuration] = useState<string>(DURATIONS[1]);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!team) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirmSuspension(team.id, reason, duration, notes);
      setIsSubmitting(false);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-rose-50/60 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-200 shrink-0">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">Suspend Team Access</h3>
              <p className="text-xs text-rose-800">
                Action affects <strong>{team.name}</strong> and all squad activity.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-zinc-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Suspended teams cannot issue challenges, register for tournaments, or recruit new
              players until reactivated.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-800 mb-1.5">
              Violation / Reason for Suspension
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs rounded-xl border border-gray-300 p-2.5 bg-white text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-800 mb-1.5">
              Suspension Duration
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {DURATIONS.map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`text-xs py-2 px-1 rounded-xl font-semibold border transition-all text-center ${
                    duration === d
                      ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-2xs'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-800 mb-1.5">
              Administrative Remarks / Justification
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide evidence or internal notes for group audit log..."
              className="w-full text-xs rounded-xl border border-gray-300 p-2.5 text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
            >
              <Ban className="w-3.5 h-3.5" />
              {isSubmitting ? 'Applying...' : 'Confirm Suspension'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
