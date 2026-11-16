import { apiRequest } from '@/lib/api';
import { AdminOrganizerApplication, AdminTournament, AdminTournamentReport, TournamentReportStatus, TournamentStatus } from '../types/tournamentAdmin';

type ApiRoleApplication = {
  id: string; userId: string; requestedRole: string; justificationNotes?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED'; adminFeedback?: string | null;
  createdAt: string; user?: { id: string; fullName?: string; displayName?: string; email: string; city?: string };
};

export const tournamentAdminApi = {
  async getTournaments(params?: { sportType?: string; status?: string; city?: string; search?: string }): Promise<AdminTournament[]> {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params ?? {})) if (value) query.set(key, value);
    return apiRequest<AdminTournament[]>(`/admin/tournaments${query.size ? `?${query}` : ''}`, { cache: 'no-store' });
  },
  updateTournamentStatus(id: string, status: TournamentStatus): Promise<AdminTournament> {
    return apiRequest(`/admin/tournaments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  },
  deleteTournament(id: string): Promise<{ success: boolean }> {
    return apiRequest(`/admin/tournaments/${id}`, { method: 'DELETE' });
  },
  seedDemo(): Promise<{ success: boolean; message: string }> {
    return apiRequest('/admin/tournaments/seed-demo', { method: 'POST' });
  },
  async getReports(status?: TournamentReportStatus): Promise<AdminTournamentReport[]> {
    const backendStatus = status === 'PENDING' ? 'OPEN' : status === 'INVESTIGATING' ? 'IN_REVIEW' : status;
    const rows = await apiRequest<Array<Record<string, unknown>>>(`/admin/tournaments/reports${backendStatus ? `?status=${backendStatus}` : ''}`, { cache: 'no-store' });
    return rows.map((row) => ({
      ...row,
      description: row.details ?? row.description,
      adminResolutionNotes: row.resolutionNotes ?? row.adminResolutionNotes,
      status: row.status === 'OPEN' ? 'PENDING' : row.status === 'IN_REVIEW' ? 'INVESTIGATING' : row.status,
    })) as AdminTournamentReport[];
  },
  resolveReport(reportId: string, notes: string, status: TournamentReportStatus = 'RESOLVED'): Promise<AdminTournamentReport> {
    return apiRequest(`/admin/tournaments/reports/${reportId}/resolve`, {
      method: 'PATCH', body: JSON.stringify({ resolutionNotes: notes, status: status === 'PENDING' ? 'OPEN' : status === 'INVESTIGATING' ? 'IN_REVIEW' : status }),
    });
  },
  async getOrganizerApplications(): Promise<AdminOrganizerApplication[]> {
    const rows = await apiRequest<ApiRoleApplication[]>('/role-applications', { cache: 'no-store' });
    return rows.map((row) => {
        const [organization = '', ...experience] = (row.justificationNotes ?? '').split(' | ');
        return {
          ...row,
          requestedRole: row.requestedRole === 'TEAM_MANAGER' ? 'TEAM_MANAGER' : 'TOURNAMENT_ORGANIZER',
          organization,
          experience: experience.join(' | '),
          city: row.user?.city,
        } as AdminOrganizerApplication;
      });
  },
  reviewOrganizerApplication(id: string, decision: 'APPROVED' | 'REJECTED', feedback?: string): Promise<AdminOrganizerApplication> {
    return apiRequest(`/role-applications/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ status: decision.toLowerCase(), reviewNote: feedback }),
    });
  },
};
