'use client';

import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Match } from '../../types';

interface DeleteMatchModalProps {
  match: Match | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const DeleteMatchModal: React.FC<DeleteMatchModalProps> = ({ match, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  if (!match) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-extrabold text-slate-900 mb-1">
          Cancel Match Fixture?
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-6">
          Are you sure you want to cancel the match between <strong className="text-slate-800">{match.homeTeam?.teamName}</strong> and <strong className="text-slate-800">{match.awayTeam?.teamName}</strong>?
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Go Back
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-colors disabled:opacity-50"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Cancel Fixture</span>
          </button>
        </div>
      </div>
    </div>
  );
};
