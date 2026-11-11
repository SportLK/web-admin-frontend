'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AdminShell } from '@/components/AdminShell';
import { tournamentAdminApi } from '@/services/tournamentAdminApi';
import { AdminOrganizerApplication } from '@/types/tournamentAdmin';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  Building,
  MapPin,
  Calendar,
  Phone,
  Mail,
  User,
  Sparkles,
} from 'lucide-react';

export default function OrganizerApprovalsPage() {
  const [applications, setApplications] = useState<AdminOrganizerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Review Modal State
  const [reviewModalApp, setReviewModalApp] = useState<AdminOrganizerApplication | null>(null);
  const [adminFeedback, setAdminFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await tournamentAdminApi.getOrganizerApplications();
      setApplications(data);
    } catch {
      showToast('Error loading organizer applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchStatus = selectedStatus === 'ALL' || app.status === selectedStatus;
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !searchQuery ||
        app.organization.toLowerCase().includes(q) ||
        (app.user?.displayName && app.user.displayName.toLowerCase().includes(q)) ||
        (app.user?.email && app.user.email.toLowerCase().includes(q)) ||
        (app.city && app.city.toLowerCase().includes(q));
      return matchStatus && matchQuery;
    });
  }, [applications, selectedStatus, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    return {
      pending: applications.filter((a) => a.status === 'PENDING').length,
      approved: applications.filter((a) => a.status === 'APPROVED').length,
      rejected: applications.filter((a) => a.status === 'REJECTED').length,
      total: applications.length,
    };
  }, [applications]);

  const handleReview = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!reviewModalApp) return;
    setIsSubmitting(true);
    try {
      await tournamentAdminApi.reviewOrganizerApplication(
        reviewModalApp.id,
        decision,
        adminFeedback,
      );
      showToast(
        decision === 'APPROVED'
          ? `Accreditation granted to "${reviewModalApp.organization}"! 🎖️`
          : `Application for "${reviewModalApp.organization}" declined.`,
      );
      setReviewModalApp(null);
      setAdminFeedback('');
      await loadApplications();
    } catch {
      showToast('Failed to review application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Pending Review', bg: 'bg-amber-50 text-amber-800 border-amber-300' };
      case 'APPROVED':
        return { label: 'Accredited Host', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
      case 'REJECTED':
        return { label: 'Declined', bg: 'bg-rose-50 text-rose-800 border-rose-300' };
      default:
        return { label: status, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <>
      <AdminShell breadcrumbs={[{ label: 'Organizer approvals' }]}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Organizer approvals</h1>
              <p className="text-sm text-gray-500 mt-1">
                Review candidate credentials, verify past hosting track records, and approve tournament organizers.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-emerald-200 bg-emerald-50 text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync Ready
              </span>
              <button
                onClick={loadApplications}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-zinc-800 shadow-2xs transition cursor-pointer"
              >
                <Clock className={`w-3.5 h-3.5 text-zinc-500 ${loading ? 'animate-spin' : ''}`} />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
              <div className="flex items-center justify-between text-amber-700 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Pending Review</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-3xl font-black text-amber-700">{metrics.pending}</p>
              <span className="text-xs text-amber-700/80 mt-1 block">Awaiting committee review</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
              <div className="flex items-center justify-between text-emerald-700 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Accredited Organizers</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-3xl font-black text-emerald-700">{metrics.approved}</p>
              <span className="text-xs text-emerald-600/80 mt-1 block">Active certified hosts</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Applications</span>
                <Building className="w-4 h-4 text-slate-600" />
              </div>
              <p className="text-3xl font-black text-slate-900">{metrics.total}</p>
              <span className="text-xs text-slate-400 mt-1 block">Submissions received</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs">
              <div className="flex items-center justify-between text-rose-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Declined</span>
                <XCircle className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-3xl font-black text-rose-600">{metrics.rejected}</p>
              <span className="text-xs text-rose-500/80 mt-1 block">Did not meet criteria</span>
            </div>
          </div>

          {/* ── Search & Filter Controls ────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-3 h-3" /> Status:
              </span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All Statuses ({applications.length})</option>
                <option value="PENDING">Pending Review ({metrics.pending})</option>
                <option value="APPROVED">Accredited Hosts ({metrics.approved})</option>
                <option value="REJECTED">Declined ({metrics.rejected})</option>
              </select>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search organization, applicant, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* ── Applications Table ──────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-6">Organization & Applicant</th>
                    <th className="py-3.5 px-4">Primary Discipline</th>
                    <th className="py-3.5 px-4">Operating Region</th>
                    <th className="py-3.5 px-4">Credentials Summary</th>
                    <th className="py-3.5 px-4">Submitted Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-6 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">
                        <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-600">No applications match criteria</p>
                        <span className="text-[11px]">Check pending role applications in Member 1 database.</span>
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map((app) => {
                      const badge = getStatusBadge(app.status);
                      return (
                        <tr key={app.id} className="hover:bg-slate-50/60 transition">
                          {/* Organization & Applicant */}
                          <td className="py-4 px-6 font-semibold text-slate-900">
                            <span className="font-bold text-slate-900 text-sm block">
                              {app.organization}
                            </span>
                            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <User className="w-3 h-3" />
                              {app.user?.displayName || app.user?.fullName || 'Applicant'} •{' '}
                              {app.user?.email}
                            </span>
                          </td>

                          {/* Discipline */}
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-1">
                              {(app.sports || ['SPORTS']).map((sp) => (
                                <span
                                  key={sp}
                                  className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-extrabold rounded text-[10px]"
                                >
                                  {sp}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Region */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1 text-slate-700 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{app.city || app.user?.city || 'Sri Lanka'}</span>
                            </div>
                          </td>

                          {/* Experience Preview */}
                          <td className="py-4 px-4 max-w-xs">
                            <p className="truncate text-slate-600" title={app.experience}>
                              {app.experience}
                            </p>
                          </td>

                          {/* Submitted */}
                          <td className="py-4 px-4 text-slate-500 font-medium">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.bg}`}
                            >
                              {badge.label}
                            </span>
                          </td>

                          {/* Action */}
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => {
                                setReviewModalApp(app);
                                setAdminFeedback(app.adminFeedback || '');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                            >
                              {app.status === 'PENDING' ? 'Review & Accredit' : 'View Portfolio'}
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
        </AdminShell>

      {/* ── MODAL: Review & Accredit Organizer ───────────────────────── */}
      {reviewModalApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest">
                  TOURNAMENT ORGANIZER APPLICATION
                </span>
                <h3 className="text-base font-extrabold text-slate-900">
                  {reviewModalApp.organization}
                </h3>
              </div>
              <button
                onClick={() => setReviewModalApp(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Applicant Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Applicant Name</span>
                <span className="font-bold text-slate-800">
                  {reviewModalApp.user?.displayName || reviewModalApp.user?.fullName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Email Address</span>
                <span className="font-bold text-slate-800 truncate block">
                  {reviewModalApp.user?.email}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Operating District</span>
                <span className="font-bold text-slate-800">
                  {reviewModalApp.city || reviewModalApp.user?.city || 'Sri Lanka'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Disciplines</span>
                <span className="font-bold text-slate-800">
                  {reviewModalApp.sports?.join(', ') || 'Multi-Sport'}
                </span>
              </div>
            </div>

            {/* Track Record & Portfolio */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Hosting Credentials & Past Tournament Experience
              </span>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100 whitespace-pre-line">
                {reviewModalApp.experience}
              </p>
            </div>

            {/* Admin Feedback Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Administrative Notes / Feedback for Applicant
              </label>
              <textarea
                rows={2}
                value={adminFeedback}
                onChange={(e) => setAdminFeedback(e.target.value)}
                placeholder="Optional notes or feedback sent to the applicant..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => setReviewModalApp(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleReview('REJECTED')}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-rose-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  Decline ✕
                </button>
                <button
                  onClick={() => handleReview('APPROVED')}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm cursor-pointer"
                >
                  Accredit & Approve ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
