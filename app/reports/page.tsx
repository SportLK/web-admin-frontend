'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ReportReviewModal } from '@/components/ReportReviewModal';
import { SuspendTeamModal } from '@/components/SuspendTeamModal';
import { INITIAL_REPORTS, INITIAL_TEAMS, TeamReport, Team } from '@/data/mockData';
import { adminApi } from '@/services/adminApi';
import {
  Flag,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Filter,
  BarChart3,
  ShieldAlert,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react';

export default function ReportsPage() {
  const [reports, setReports] = useState<TeamReport[]>(INITIAL_REPORTS);
  const [selectedReport, setSelectedReport] = useState<TeamReport | null>(null);
  const [suspensionTargetTeam, setSuspensionTargetTeam] = useState<Team | null>(null);
  const [activeTab, setActiveTab] = useState<'reports' | 'analytics'>('reports');

  // Real-time synchronization state
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch real-time reports data
  const fetchLiveReports = useCallback(async (silent = false) => {
    if (!silent) setIsSyncing(true);
    try {
      const data = await adminApi.getReports();
      if (Array.isArray(data) && data.length > 0) {
        setReports(data);
        setIsLiveConnected(true);
      } else {
        setIsLiveConnected(true);
      }
      setLastSynced(new Date());
    } catch {
      setIsLiveConnected(false);
    } finally {
      if (!silent) setIsSyncing(false);
    }
  }, []);

  // Real-time polling every 8 seconds
  useEffect(() => {
    fetchLiveReports();
    const interval = setInterval(() => {
      fetchLiveReports(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [fetchLiveReports]);

  // Metrics
  const openReports = reports.filter((r) => r.status === 'Open').length;
  const inReviewReports = reports.filter((r) => r.status === 'In Review').length;
  const resolvedReports = reports.filter((r) => r.status === 'Resolved').length;

  const handleResolveReport = async (
    reportId: string,
    status: TeamReport['status'],
    notes: string
  ) => {
    // Optimistic update
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status,
              resolutionNotes: notes,
            }
          : r
      )
    );

    try {
      const statusEnum =
        status === 'Resolved'
          ? 'RESOLVED'
          : status === 'Dismissed'
          ? 'DISMISSED'
          : 'IN_REVIEW';
      await adminApi.updateReport(reportId, { status: statusEnum, resolutionNotes: notes });
    } catch (err) {
      console.error('Failed to update report on backend:', err);
    }
  };

  const handleTriggerTeamSuspension = (teamId: string) => {
    const target = INITIAL_TEAMS.find((t) => t.id === teamId);
    if (target) {
      setSuspensionTargetTeam(target);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Report ID', 'Team', 'Reason', 'Received Date', 'Status', 'Severity'];
    const rows = reports.map((r) => [
      r.reportNumber,
      r.teamName,
      r.reason,
      r.receivedDate,
      r.status,
      r.severity,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SportLK_Team_Reports_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header breadcrumbs={[{ label: 'Reports' }]} />

        <main className="p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Page Heading matching Figma 09 / Reports */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                Reports & moderation
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Review concerns across posts, teams and tournaments
              </p>
            </div>

            <div className="flex items-center gap-2.5">
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
                onClick={() => fetchLiveReports(false)}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-zinc-700 hover:bg-gray-50 shadow-2xs transition-colors disabled:opacity-50"
                title="Refresh real-time data"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-zinc-500 ${isSyncing ? 'animate-spin text-lime-600' : ''}`}
                />
                <span>Sync Now</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-zinc-800 hover:bg-gray-50 shadow-2xs flex items-center gap-2 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-gray-500" />
                Export Reports CSV
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
              <span className="text-xs font-medium text-gray-500 block">Total Team Reports</span>
              <span className="text-2xl font-extrabold text-zinc-900 mt-1 block">
                {reports.length}
              </span>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
              <span className="text-xs font-medium text-gray-500 block">Open Inquiries</span>
              <span className="text-2xl font-extrabold text-amber-600 mt-1 block">
                {openReports}
              </span>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
              <span className="text-xs font-medium text-gray-500 block">Under Review</span>
              <span className="text-2xl font-extrabold text-blue-600 mt-1 block">
                {inReviewReports}
              </span>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
              <span className="text-xs font-medium text-gray-500 block">Resolved / Closed</span>
              <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">
                {resolvedReports}
              </span>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="border-b border-gray-200 flex gap-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'reports'
                  ? 'border-zinc-900 text-zinc-900'
                  : 'border-transparent text-gray-400 hover:text-zinc-600'
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              Team Moderation Queue
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'analytics'
                  ? 'border-zinc-900 text-zinc-900'
                  : 'border-transparent text-gray-400 hover:text-zinc-600'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Team Analytics & Activity Summary
            </button>
          </div>

          {activeTab === 'reports' ? (
            /* Reports Table matching Figma 09 / Reports */
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50/60 border-b border-gray-200/80 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-4 px-6">REPORTED ITEM</th>
                      <th className="py-4 px-6">REASON</th>
                      <th className="py-4 px-6">RECEIVED</th>
                      <th className="py-4 px-6">STATUS</th>
                      <th className="py-4 px-6 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50/60 transition-colors group">
                        {/* Reported Item */}
                        <td className="py-4 px-6">
                          <div>
                            <span className="font-bold text-zinc-900 block text-xs group-hover:text-black">
                              {report.teamName}
                            </span>
                            <span className="text-[11px] text-gray-400 mt-0.5 block">
                              Team · Report #{report.reportNumber}
                            </span>
                          </div>
                        </td>

                        {/* Reason */}
                        <td className="py-4 px-6">
                          <span className="text-zinc-700 font-medium text-xs">
                            {report.reason}
                          </span>
                        </td>

                        {/* Received */}
                        <td className="py-4 px-6 text-gray-500 font-medium text-xs">
                          {report.receivedDate}
                        </td>

                        {/* Status matching Figma styling */}
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                              report.status === 'Open'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : report.status === 'In Review'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : report.status === 'Resolved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                report.status === 'Open'
                                  ? 'bg-amber-500'
                                  : report.status === 'In Review'
                                  ? 'bg-blue-500'
                                  : report.status === 'Resolved'
                                  ? 'bg-emerald-500'
                                  : 'bg-gray-400'
                              }`}
                            />
                            {report.status}
                          </span>
                        </td>

                        {/* Action matching Figma "Review" button */}
                        <td className="py-4 px-6 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedReport(report)}
                            className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-zinc-800 hover:bg-gray-100 hover:border-gray-300 font-semibold text-xs transition-colors shadow-2xs"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 px-6 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between text-xs text-gray-500">
                <span>Team Concerns & Dispute Moderation</span>
                <span className="text-[11px] text-gray-400">Total {reports.length} records</span>
              </div>
            </div>
          ) : (
            /* Team Analytics & Performance Summary */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-2xs">
                  <h3 className="text-sm font-bold text-zinc-900 mb-1">Squad Roster Compliance</h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Average registered players per active squad
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-zinc-900">12.8</span>
                    <span className="text-xs text-emerald-600 font-semibold">
                      Within 5-15 rule
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
                    <div className="bg-[#D7FB38] h-full rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-2xs">
                  <h3 className="text-sm font-bold text-zinc-900 mb-1">Platform Standing</h3>
                  <p className="text-xs text-gray-500 mb-4">Good standing vs Suspended teams</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-emerald-600">83.3%</span>
                    <span className="text-xs text-gray-400">Active status</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '83%' }} />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-2xs">
                  <h3 className="text-sm font-bold text-zinc-900 mb-1">Challenge Dispute Rate</h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Reported issues per 100 played matches
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-zinc-900">1.4%</span>
                    <span className="text-xs text-emerald-600 font-semibold">Low dispute</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
                    <div className="bg-lime-400 h-full rounded-full" style={{ width: '14%' }} />
                  </div>
                </div>
              </div>

              {/* Summary Breakdown */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-2xs">
                <h3 className="text-base font-bold text-zinc-900 mb-4">
                  Disciplinary & Suspension Summary Log
                </h3>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="w-5 h-5 text-rose-500" />
                      <div>
                        <span className="font-bold text-zinc-900 block">
                          Moratuwa Ballers — Suspended
                        </span>
                        <span className="text-gray-400">
                          Ineligible player fielded during Western Cup • 30 Days Duration
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                      Active Suspension
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      <div>
                        <span className="font-bold text-zinc-900 block">
                          Negombo FC — Notice Issued
                        </span>
                        <span className="text-gray-400">
                          Substitution protocol dispute resolved with team manager
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      Resolved
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <ReportReviewModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onResolveReport={handleResolveReport}
        onTriggerTeamSuspension={handleTriggerTeamSuspension}
      />

      <SuspendTeamModal
        team={suspensionTargetTeam}
        onClose={() => setSuspensionTargetTeam(null)}
        onConfirmSuspension={(teamId, reason, duration, notes) => {
          handleResolveReport(
            selectedReport?.id || '',
            'Resolved',
            `Team suspended: ${reason} (${duration})`
          );
          setSuspensionTargetTeam(null);
        }}
      />
    </div>
  );
}
