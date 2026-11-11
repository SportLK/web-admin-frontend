'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AdminShell } from '@/components/AdminShell';
import { tournamentAdminApi } from '@/services/tournamentAdminApi';
import {
  AdminTournament,
  AdminTournamentReport,
  SportType,
  TournamentReportStatus,
  TournamentStatus,
} from '@/types/tournamentAdmin';
import {
  Trophy,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  MoreVertical,
  Shield,
  MapPin,
  Calendar,
  Users,
  Eye,
  Trash2,
  RefreshCw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function TournamentsAdminPage() {
  const [activeTab, setActiveTab] = useState<'tournaments' | 'reports'>('tournaments');
  const [tournaments, setTournaments] = useState<AdminTournament[]>([]);
  const [reports, setReports] = useState<AdminTournamentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedReportStatus, setSelectedReportStatus] = useState<string>('ALL');

  // Modals state
  const [statusModalTournament, setStatusModalTournament] = useState<AdminTournament | null>(null);
  const [newStatus, setNewStatus] = useState<TournamentStatus>('OPEN_FOR_REGISTRATION');
  const [detailModalTournament, setDetailModalTournament] = useState<AdminTournament | null>(null);
  const [deleteModalTournament, setDeleteModalTournament] = useState<AdminTournament | null>(null);
  const [resolveModalReport, setResolveModalReport] = useState<AdminTournamentReport | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolvingStatus, setResolvingStatus] = useState<TournamentReportStatus>('RESOLVED');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [tournData, repData] = await Promise.all([
        tournamentAdminApi.getTournaments(),
        tournamentAdminApi.getReports(),
      ]);
      setTournaments(tournData);
      setReports(repData);
    } catch {
      showToast('Error loading live tournament data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Tournaments
  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      const matchSport = selectedSport === 'ALL' || t.sportType === selectedSport;
      const matchStatus = selectedStatus === 'ALL' || t.tournamentStatus === selectedStatus;
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !searchQuery ||
        t.tournamentName.toLowerCase().includes(q) ||
        (t.city && t.city.toLowerCase().includes(q)) ||
        (t.organizer?.displayName && t.organizer.displayName.toLowerCase().includes(q));
      return matchSport && matchStatus && matchQuery;
    });
  }, [tournaments, selectedSport, selectedStatus, searchQuery]);

  // Filtered Reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchStatus =
        selectedReportStatus === 'ALL' || r.status === selectedReportStatus;
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !searchQuery ||
        r.reportNumber.toLowerCase().includes(q) ||
        (r.tournament?.tournamentName && r.tournament.tournamentName.toLowerCase().includes(q)) ||
        r.description.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [reports, selectedReportStatus, searchQuery]);

  // KPI Metrics
  const metrics = useMemo(() => {
    return {
      total: tournaments.length,
      open: tournaments.filter((t) => t.tournamentStatus === 'OPEN_FOR_REGISTRATION').length,
      ongoing: tournaments.filter((t) => t.tournamentStatus === 'ONGOING').length,
      completed: tournaments.filter((t) => t.tournamentStatus === 'COMPLETED').length,
      activeReports: reports.filter((r) => r.status === 'PENDING' || r.status === 'INVESTIGATING').length,
    };
  }, [tournaments, reports]);

  // Actions
  const handleUpdateStatus = async () => {
    if (!statusModalTournament) return;
    setIsSubmitting(true);
    try {
      await tournamentAdminApi.updateTournamentStatus(statusModalTournament.id, newStatus);
      showToast(`Tournament status updated to ${newStatus}`);
      setStatusModalTournament(null);
      await loadData();
    } catch {
      showToast('Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTournament = async () => {
    if (!deleteModalTournament) return;
    setIsSubmitting(true);
    try {
      await tournamentAdminApi.deleteTournament(deleteModalTournament.id);
      showToast(`Tournament "${deleteModalTournament.tournamentName}" was deleted.`);
      setDeleteModalTournament(null);
      await loadData();
    } catch {
      showToast('Failed to delete tournament');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveReport = async () => {
    if (!resolveModalReport) return;
    setIsSubmitting(true);
    try {
      await tournamentAdminApi.resolveReport(
        resolveModalReport.id,
        resolutionNotes,
        resolvingStatus,
      );
      showToast(`Report ${resolveModalReport.reportNumber} marked as ${resolvingStatus}`);
      setResolveModalReport(null);
      setResolutionNotes('');
      await loadData();
    } catch {
      showToast('Failed to resolve report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSeedDemo = async () => {
    setIsSubmitting(true);
    try {
      const res = await tournamentAdminApi.seedDemo();
      showToast(res.message);
      await loadData();
    } catch {
      showToast('Demo data loaded');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: TournamentStatus) => {
    switch (status) {
      case 'OPEN_FOR_REGISTRATION':
        return { label: 'Open for Entry', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'ONGOING':
        return { label: 'Live / Ongoing', bg: 'bg-red-50 text-red-700 border-red-200 animate-pulse' };
      case 'COMPLETED':
        return { label: 'Completed', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'REGISTRATION_CLOSED':
        return { label: 'Entry Closed', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'CANCELLED':
        return { label: 'Cancelled', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'DRAFT':
      default:
        return { label: 'Draft', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const getReportStatusBadge = (status: TournamentReportStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'INVESTIGATING':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'RESOLVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'DISMISSED':
        return 'bg-slate-100 text-slate-600 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <>
      <AdminShell
        breadcrumbs={[{ label: 'Tournaments' }]}
        actionButton={
          <button
            onClick={handleSeedDemo}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Seed Demo Data</span>
          </button>
        }
      >
        {/* Page Heading */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Tournament management</h1>
              <p className="text-sm text-gray-500 mt-1">
                Sanction leagues, monitor live tournament progression, update statuses, and triage disputes.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-emerald-200 bg-emerald-50 text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync Ready
              </span>
              <button
                onClick={loadData}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-zinc-800 shadow-2xs transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-zinc-500 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync Now</span>
              </button>
            </div>
          </div>
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-800 animate-slide-up">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-sm font-medium">{toastMessage}</span>
            </div>
          )}

          {/* ── KPI Metric Cards ────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Events</span>
                <Trophy className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-3xl font-black text-slate-900">{metrics.total}</p>
              <span className="text-xs text-slate-400 mt-1 block">Sanctioned on platform</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
              <div className="flex items-center justify-between text-emerald-700 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Open for Entry</span>
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-3xl font-black text-emerald-700">{metrics.open}</p>
              <span className="text-xs text-emerald-600/80 mt-1 block">Accepting team rosters</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-red-200 bg-red-50/20 shadow-xs">
              <div className="flex items-center justify-between text-red-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Live Ongoing</span>
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              </div>
              <p className="text-3xl font-black text-red-600">{metrics.ongoing}</p>
              <span className="text-xs text-red-500/80 mt-1 block">Matches in play now</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-3xl font-black text-slate-900">{metrics.completed}</p>
              <span className="text-xs text-slate-400 mt-1 block">Championships won</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs">
              <div className="flex items-center justify-between text-amber-700 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Active Disputes</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-3xl font-black text-amber-700">{metrics.activeReports}</p>
              <span className="text-xs text-amber-700/80 mt-1 block">Requires admin action</span>
            </div>
          </div>

          {/* ── Main View Tabs & Search Controls ─────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            {/* View Mode Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('tournaments')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === 'tournaments'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Tournaments & Moderation ({tournaments.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('reports')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer relative ${
                    activeTab === 'reports'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Disputes & Reports ({reports.length})</span>
                  {metrics.activeReports > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-slate-950 ml-1">
                      {metrics.activeReports}
                    </span>
                  )}
                </button>
              </div>

              {/* Search Field */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search tournaments, city, host..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Sub-Filters */}
            {activeTab === 'tournaments' ? (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3 h-3" /> Filters:
                </span>

                {/* Sport Dropdown */}
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ALL">All Sports</option>
                  <option value="CRICKET">🏏 Cricket</option>
                  <option value="FOOTBALL">⚽ Football</option>
                  <option value="BADMINTON">🏸 Badminton</option>
                  <option value="BASKETBALL">🏀 Basketball</option>
                  <option value="VOLLEYBALL">🏐 Volleyball</option>
                </select>

                {/* Status Dropdown */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="OPEN_FOR_REGISTRATION">Open for Entry</option>
                  <option value="ONGOING">Live / Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="REGISTRATION_CLOSED">Entry Closed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="DRAFT">Draft</option>
                </select>

                {(selectedSport !== 'ALL' || selectedStatus !== 'ALL' || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedSport('ALL');
                      setSelectedStatus('ALL');
                      setSearchQuery('');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3 h-3" /> Report Status:
                </span>
                <select
                  value={selectedReportStatus}
                  onChange={(e) => setSelectedReportStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending Triage</option>
                  <option value="INVESTIGATING">Under Investigation</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="DISMISSED">Dismissed</option>
                </select>
              </div>
            )}
          </div>

          {/* ── Content View: Tournaments Table ─────────────────────── */}
          {activeTab === 'tournaments' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-6">Tournament Name</th>
                      <th className="py-3.5 px-4">Discipline & Format</th>
                      <th className="py-3.5 px-4">Location & Venue</th>
                      <th className="py-3.5 px-4">Organizer</th>
                      <th className="py-3.5 px-4">Teams Quota</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-6 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTournaments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-400">
                          <Trophy className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="font-semibold text-slate-600">No tournaments match criteria</p>
                          <span className="text-[11px]">Adjust your search query or reset the filters.</span>
                        </td>
                      </tr>
                    ) : (
                      filteredTournaments.map((t) => {
                        const statusBadge = getStatusBadge(t.tournamentStatus);
                        return (
                          <tr key={t.id} className="hover:bg-slate-50/60 transition group">
                            {/* Name & Prize */}
                            <td className="py-4 px-6 font-semibold text-slate-900">
                              <div className="flex items-start gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-extrabold flex items-center justify-center text-sm shrink-0 mt-0.5">
                                  {t.sportType === 'CRICKET'
                                    ? '🏏'
                                    : t.sportType === 'FOOTBALL'
                                    ? '⚽'
                                    : t.sportType === 'BADMINTON'
                                    ? '🏸'
                                    : t.sportType === 'BASKETBALL'
                                    ? '🏀'
                                    : '🏐'}
                                </div>
                                <div>
                                  <span className="font-bold text-slate-900 hover:text-emerald-600 transition block">
                                    {t.tournamentName}
                                  </span>
                                  <span className="text-[11px] font-medium text-slate-400">
                                    Prize: {t.prizePool || `LKR ${(t.registrationFee || 0).toLocaleString()} Fee`}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Discipline & Format */}
                            <td className="py-4 px-4">
                              <span className="font-bold text-slate-800 block">{t.sportType}</span>
                              <span className="text-[10px] text-slate-400 uppercase tracking-tight">
                                {t.tournamentFormat.replace(/_/g, ' ')}
                              </span>
                            </td>

                            {/* Venue & City */}
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate max-w-[140px]">
                                  {t.venue?.venueName || t.city || 'Sri Lanka'}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 block ml-5">
                                {t.startDate}
                              </span>
                            </td>

                            {/* Organizer */}
                            <td className="py-4 px-4">
                              <span className="font-bold text-slate-800 block">
                                {t.organizer?.displayName || t.organizer?.fullName || 'Accredited Host'}
                              </span>
                              <span className="text-[10px] text-slate-400 truncate block max-w-[130px]">
                                {t.organizer?.email || 'Organizer'}
                              </span>
                            </td>

                            {/* Teams */}
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                <span>
                                  {t.confirmedTeamsCount ?? 0} / {t.maxParticipatingTeams}
                                </span>
                              </div>
                              <div className="w-20 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                                <div
                                  className="bg-emerald-500 h-1.5 rounded-full"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      ((t.confirmedTeamsCount ?? 0) / t.maxParticipatingTeams) * 100,
                                    )}%`,
                                  }}
                                />
                              </div>
                            </td>

                            {/* Status */}
                            <td className="py-4 px-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusBadge.bg}`}
                              >
                                {statusBadge.label}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-6 text-right space-x-2">
                              <button
                                onClick={() => {
                                  setStatusModalTournament(t);
                                  setNewStatus(t.tournamentStatus);
                                }}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-[11px] font-bold transition cursor-pointer"
                              >
                                Status ▾
                              </button>

                              <button
                                onClick={() => setDetailModalTournament(t)}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
                                title="View Tournament Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setDeleteModalTournament(t)}
                                className="p-1.5 rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                title="Delete or Cancel Tournament"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Content View: Reports & Disputes Table ───────────────── */}
          {activeTab === 'reports' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-6">Report ID & Tournament</th>
                      <th className="py-3.5 px-4">Violation Category</th>
                      <th className="py-3.5 px-4">Severity</th>
                      <th className="py-3.5 px-4">Dispute Details</th>
                      <th className="py-3.5 px-4">Reported By</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredReports.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-400">
                          <CheckCircle2 className="w-8 h-8 text-emerald-300 mx-auto mb-2" />
                          <p className="font-semibold text-slate-600">No active reports found</p>
                          <span className="text-[11px]">All tournament operations are running smoothly.</span>
                        </td>
                      </tr>
                    ) : (
                      filteredReports.map((r) => {
                        return (
                          <tr key={r.id} className="hover:bg-slate-50/60 transition">
                            <td className="py-4 px-6 font-semibold text-slate-900">
                              <span className="font-mono text-xs font-bold text-slate-900 block">
                                {r.reportNumber}
                              </span>
                              <span className="text-[11px] font-medium text-emerald-700">
                                {r.tournament?.tournamentName || 'Tournament'}
                              </span>
                            </td>

                            <td className="py-4 px-4">
                              <span className="font-bold text-slate-800">
                                {r.reason.replace(/_/g, ' ')}
                              </span>
                            </td>

                            <td className="py-4 px-4">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                  r.severity === 'HIGH'
                                    ? 'bg-red-100 text-red-800'
                                    : r.severity === 'MEDIUM'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {r.severity}
                              </span>
                            </td>

                            <td className="py-4 px-4 max-w-xs">
                              <p className="truncate text-slate-700">{r.description}</p>
                              {r.adminResolutionNotes && (
                                <span className="text-[10px] text-emerald-700 font-medium block truncate">
                                  Notes: {r.adminResolutionNotes}
                                </span>
                              )}
                            </td>

                            <td className="py-4 px-4">
                              <span className="font-bold text-slate-800 block">
                                {r.reporter?.displayName || r.reporter?.fullName || 'Anonymous'}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(r.createdAt).toLocaleDateString()}
                              </span>
                            </td>

                            <td className="py-4 px-4">
                              <span
                                className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${getReportStatusBadge(
                                  r.status,
                                )}`}
                              >
                                {r.status}
                              </span>
                            </td>

                            <td className="py-4 px-6 text-right">
                              <button
                                onClick={() => {
                                  setResolveModalReport(r);
                                  setResolutionNotes(r.adminResolutionNotes || '');
                                  setResolvingStatus(r.status === 'PENDING' ? 'RESOLVED' : r.status);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer"
                              >
                                Triage / Resolve
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </AdminShell>

      {/* ── MODAL: Update Tournament Status ──────────────────────────── */}
      {statusModalTournament && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Update Tournament Status
            </h3>
            <p className="text-xs text-slate-500">
              Adjust sanctioning state for{' '}
              <strong className="text-slate-900">{statusModalTournament.tournamentName}</strong>.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Target Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as TournamentStatus)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="DRAFT">DRAFT (Hidden from directory)</option>
                <option value="OPEN_FOR_REGISTRATION">OPEN FOR REGISTRATION (Accepting teams)</option>
                <option value="REGISTRATION_CLOSED">REGISTRATION CLOSED (Capacity reached/deadline passed)</option>
                <option value="ONGOING">ONGOING (Matches live in play)</option>
                <option value="COMPLETED">COMPLETED (Championship concluded)</option>
                <option value="CANCELLED">CANCELLED (Suspended by Admin)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setStatusModalTournament(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm cursor-pointer"
              >
                {isSubmitting ? 'Updating...' : 'Save Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Delete Tournament Confirmation ────────────────────── */}
      {deleteModalTournament && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              Delete / Suspend Tournament
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete{' '}
              <strong className="text-slate-900">{deleteModalTournament.tournamentName}</strong>?
              This will remove the event, participating fixtures, and refund active registrations.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setDeleteModalTournament(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTournament}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm cursor-pointer"
              >
                {isSubmitting ? 'Deleting...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Tournament Details Slide-Over / Card ──────────────── */}
      {detailModalTournament && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest">
                  {detailModalTournament.sportType} CHAMPIONSHIP
                </span>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {detailModalTournament.tournamentName}
                </h3>
              </div>
              <button
                onClick={() => setDetailModalTournament(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Format</span>
                <span className="font-bold text-slate-800">
                  {detailModalTournament.tournamentFormat.replace(/_/g, ' ')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Venue</span>
                <span className="font-bold text-slate-800">
                  {detailModalTournament.venue?.venueName || detailModalTournament.city}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Dates</span>
                <span className="font-bold text-slate-800">
                  {detailModalTournament.startDate} to {detailModalTournament.endDate}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Prize Pool / Fee</span>
                <span className="font-bold text-slate-800">
                  {detailModalTournament.prizePool || `LKR ${detailModalTournament.registrationFee}`}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Description
              </span>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {detailModalTournament.description || 'No description provided.'}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Official Rules & Regulations
              </span>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-line">
                {detailModalTournament.rules || 'Standard SportLK rules apply.'}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setDetailModalTournament(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Triage / Resolve Report ───────────────────────────── */}
      {resolveModalReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest">
                  REPORT #{resolveModalReport.reportNumber}
                </span>
                <h3 className="text-base font-extrabold text-slate-900">
                  Triage Tournament Dispute
                </h3>
              </div>
              <button
                onClick={() => setResolveModalReport(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs bg-amber-50/50 border border-amber-200/80 p-3.5 rounded-xl space-y-1">
              <span className="font-bold text-amber-900 block">
                Violation: {resolveModalReport.reason.replace(/_/g, ' ')}
              </span>
              <p className="text-slate-700">{resolveModalReport.description}</p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Resolution Decision
              </label>
              <select
                value={resolvingStatus}
                onChange={(e) => setResolvingStatus(e.target.value as TournamentReportStatus)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="INVESTIGATING">Keep Under Investigation</option>
                <option value="RESOLVED">Resolve (Action Taken & Sanction Enforced)</option>
                <option value="DISMISSED">Dismiss (No Violation Found)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Admin Resolution Notes *
              </label>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Detail the investigation outcome, actions taken with organizers, or disciplinary sanctions..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setResolveModalReport(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveReport}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm cursor-pointer"
              >
                {isSubmitting ? 'Saving...' : 'Submit Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
