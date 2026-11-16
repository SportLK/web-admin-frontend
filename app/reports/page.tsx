'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminShell } from '@/components/AdminShell';
import { ReportReviewModal } from '@/components/ReportReviewModal';
import { SuspendTeamModal } from '@/components/SuspendTeamModal';
import { TeamReport, Team } from '@/data/mockData';
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
  const [reports, setReports] = useState<TeamReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<TeamReport | null>(null);
  const [suspensionTargetTeam, setSuspensionTargetTeam] = useState<Team | null>(null);
  const [activeTab, setActiveTab] = useState<'reports' | 'analytics'>('reports');
  const [createOpen, setCreateOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [draftReport, setDraftReport] = useState({ teamId: '', reason: 'OTHER', details: '', severity: 'MEDIUM' });
  const [savingReport, setSavingReport] = useState(false);
  const [formError, setFormError] = useState('');
  const [analytics, setAnalytics] = useState<{ avgSquadSize: string; complianceRate: number; totalTeams: number; activeTeams: number; totalReports: number; openReports: number } | null>(null);

  // Real-time synchronization state
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch real-time reports data
  const fetchLiveReports = useCallback(async (silent = false) => {
    if (!silent) setIsSyncing(true);
    try {
      const data = await adminApi.getReports();
      setReports(Array.isArray(data) ? data : []);
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
    fetchLiveReports();
    const interval = setInterval(() => {
      fetchLiveReports(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [fetchLiveReports]);

  useEffect(() => {
    adminApi.getTeams().then(setTeams).catch(() => setTeams([]));
    adminApi.getAnalytics().then(setAnalytics).catch(() => setAnalytics(null));
  }, []);

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
      await fetchLiveReports(true);
      alert(err instanceof Error ? err.message : 'Could not update this report.');
    }
  };

  const handleTriggerTeamSuspension = (teamId: string) => {
    adminApi.getTeamDetail(teamId).then(setSuspensionTargetTeam).catch((error) => alert(error instanceof Error ? error.message : 'Could not load team details.'));
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

  const handleCreateReport = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingReport(true);
    setFormError('');
    try {
      await adminApi.createReport(draftReport);
      setCreateOpen(false);
      setDraftReport({ teamId: '', reason: 'OTHER', details: '', severity: 'MEDIUM' });
      await fetchLiveReports(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not create the report.');
    } finally {
      setSavingReport(false);
    }
  };

  return (
    <>
      <AdminShell breadcrumbs={[{ label: 'Reports' }]}>
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
              <button type="button" onClick={() => setCreateOpen(true)} className="rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-800">
                Add report
              </button>
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
                    <span className="text-3xl font-extrabold text-zinc-900">{analytics?.avgSquadSize ?? '—'}</span>
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
                  <p className="text-xs text-gray-500 mb-4">{analytics ? `${analytics.activeTeams} of ${analytics.totalTeams} teams currently active` : 'Loading team standing'}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-emerald-600">{analytics ? `${analytics.complianceRate}%` : '—'}</span>
                    <span className="text-xs text-gray-400">Active status</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${analytics?.complianceRate ?? 0}%` }} />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-2xs">
                  <h3 className="text-sm font-bold text-zinc-900 mb-1">Challenge Dispute Rate</h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Open moderation reports per team
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-zinc-900">{analytics && analytics.totalTeams > 0 ? (analytics.openReports / analytics.totalTeams).toFixed(2) : '—'}</span>
                    <span className="text-xs text-emerald-600 font-semibold">Current rate</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
                    <div className="bg-lime-400 h-full rounded-full" style={{ width: `${analytics && analytics.totalReports ? Math.min(100, (analytics.openReports / analytics.totalReports) * 100) : 0}%` }} />
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
        </AdminShell>

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleCreateReport} className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
            <div><h2 className="text-lg font-bold text-zinc-900">Create team report</h2><p className="mt-1 text-sm text-gray-500">This report will be saved to the moderation database under your admin account.</p></div>
            <label className="block text-sm font-medium text-zinc-700">Team
              <select required value={draftReport.teamId} onChange={(e) => setDraftReport({ ...draftReport, teamId: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-zinc-900">
                <option value="">Choose a team</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium text-zinc-700">Reason
              <select value={draftReport.reason} onChange={(e) => setDraftReport({ ...draftReport, reason: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-zinc-900">
                <option value="OTHER">Other concern</option><option value="MISLEADING_INFORMATION">Misleading information</option><option value="ROSTER_ELIGIBILITY_DISPUTE">Roster eligibility dispute</option><option value="UNSPORTSMANLIKE_CONDUCT">Unsportsmanlike conduct</option><option value="INACTIVE_FORFEIT">Inactive / forfeit</option><option value="HARASSMENT">Harassment</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-zinc-700">Details<textarea required minLength={5} value={draftReport.details} onChange={(e) => setDraftReport({ ...draftReport, details: e.target.value })} rows={4} className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm text-zinc-900" /></label>
            <label className="block text-sm font-medium text-zinc-700">Severity<select value={draftReport.severity} onChange={(e) => setDraftReport({ ...draftReport, severity: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-zinc-900"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></label>
            {formError && <p role="alert" className="text-sm text-rose-700">{formError}</p>}
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setCreateOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-zinc-800">Cancel</button><button disabled={savingReport || teams.length === 0} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{savingReport ? 'Saving…' : 'Create report'}</button></div>
          </form>
        </div>
      )}

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
    </>
  );
}
