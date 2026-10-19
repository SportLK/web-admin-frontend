'use client';

import React, { useState } from 'react';
import {
  X,
  Flag,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Ban,
  Clock,
  User,
} from 'lucide-react';
import { TeamReport } from '../data/mockData';

interface ReportReviewModalProps {
  report: TeamReport | null;
  onClose: () => void;
  onResolveReport: (reportId: string, status: TeamReport['status'], notes: string) => void;
  onTriggerTeamSuspension?: (teamId: string) => void;
}

export const ReportReviewModal: React.FC<ReportReviewModalProps> = ({
  report,
  onClose,
  onResolveReport,
  onTriggerTeamSuspension,
}) => {
  const [resolutionNotes, setResolutionNotes] = useState('');

  if (!report) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-200 shrink-0">
              <Flag className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-900">Review Team Report</h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-200 text-zinc-700">
                  #{report.reportNumber}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Reported Item: <strong>{report.teamName}</strong>
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

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                Violation Type
              </span>
              <span className="font-semibold text-zinc-900 block">{report.reason}</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                Received Date
              </span>
              <span className="font-semibold text-zinc-900 block flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {report.receivedDate}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
                Submitted By
              </span>
              <span className="font-bold text-zinc-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gray-400" />
                {report.reportedBy} ({report.reporterRole})
              </span>
            </div>
            <span
              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                report.severity === 'High'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : report.severity === 'Medium'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-blue-100 text-blue-800 border border-blue-200'
              }`}
            >
              {report.severity} Severity
            </span>
          </div>

          {/* Description */}
          <div className="p-3.5 rounded-xl bg-white border border-gray-200">
            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
              Report Details & Specifics
            </span>
            <p className="text-zinc-700 leading-relaxed">{report.details}</p>
          </div>

          {/* Resolution Notes Input */}
          <div>
            <label className="block text-xs font-bold text-zinc-800 mb-1.5">
              Admin Resolution Remarks
            </label>
            <textarea
              rows={2}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Record findings, warnings issued, or dismissal reason..."
              className="w-full text-xs rounded-xl border border-gray-300 p-2.5 text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-lime-500/20 focus:border-zinc-800 transition-colors resize-none"
            />
          </div>

          {/* Action Resolution Buttons */}
          <div className="pt-2 border-t border-gray-100 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  onResolveReport(report.id, 'Dismissed', resolutionNotes || 'Dismissed as unfounded');
                  onClose();
                }}
                className="flex-1 py-2 px-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5 text-gray-500" />
                Dismiss Report
              </button>

              <button
                type="button"
                onClick={() => {
                  onResolveReport(
                    report.id,
                    'Resolved',
                    resolutionNotes || 'Official warning dispatched to team manager'
                  );
                  onClose();
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-[#D7FB38] hover:bg-[#c9ee2c] text-zinc-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <CheckCircle className="w-3.5 h-3.5 text-zinc-900" />
                Mark Resolved
              </button>
            </div>

            {onTriggerTeamSuspension && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onTriggerTeamSuspension(report.teamId);
                }}
                className="w-full py-2 px-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Ban className="w-3.5 h-3.5" />
                Escalate & Suspend Team
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
