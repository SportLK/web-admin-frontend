import {
  MOCK_ADMIN_REPORTS,
  MOCK_ADMIN_TOURNAMENTS,
  MOCK_ORGANIZER_APPLICATIONS,
} from '../data/tournamentMockData';
import {
  AdminOrganizerApplication,
  AdminTournament,
  AdminTournamentReport,
  TournamentReportStatus,
  TournamentStatus,
} from '../types/tournamentAdmin';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const tournamentAdminApi = {
  // ── 1. Tournament Management & Moderation ────────────────────────────────
  async getTournaments(params?: {
    sportType?: string;
    status?: string;
    city?: string;
    search?: string;
  }): Promise<AdminTournament[]> {
    try {
      const query = new URLSearchParams();
      if (params?.sportType) query.append('sportType', params.sportType);
      if (params?.status) query.append('status', params.status);
      if (params?.city) query.append('city', params.city);
      if (params?.search) query.append('search', params.search);

      const qs = query.toString() ? `?${query.toString()}` : '';
      const res = await fetch(`${API_BASE}/admin/tournaments${qs}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Live API error');
      const data = await res.json();
      return Array.isArray(data) ? data : MOCK_ADMIN_TOURNAMENTS;
    } catch {
      // Offline fallback
      let filtered = [...MOCK_ADMIN_TOURNAMENTS];
      if (params?.sportType) {
        filtered = filtered.filter((t) => t.sportType === params.sportType);
      }
      if (params?.status) {
        filtered = filtered.filter((t) => t.tournamentStatus === params.status);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.tournamentName.toLowerCase().includes(q) ||
            t.city?.toLowerCase().includes(q) ||
            t.organizer?.displayName?.toLowerCase().includes(q),
        );
      }
      return filtered;
    }
  },

  async updateTournamentStatus(
    id: string,
    status: TournamentStatus,
    token?: string,
  ): Promise<AdminTournament> {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/admin/tournaments/${id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status on server');
      return res.json();
    } catch {
      const item = MOCK_ADMIN_TOURNAMENTS.find((t) => t.id === id);
      if (item) item.tournamentStatus = status;
      return item || ({} as AdminTournament);
    }
  },

  async deleteTournament(id: string, token?: string): Promise<{ success: boolean }> {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/admin/tournaments/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) throw new Error('Failed to delete tournament');
      return res.json();
    } catch {
      const idx = MOCK_ADMIN_TOURNAMENTS.findIndex((t) => t.id === id);
      if (idx !== -1) MOCK_ADMIN_TOURNAMENTS.splice(idx, 1);
      return { success: true };
    }
  },

  async seedDemo(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/admin/tournaments/seed-demo`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to seed demo');
      return res.json();
    } catch {
      return {
        success: true,
        message: 'Demo tournaments, matches, and dispute reports successfully loaded.',
      };
    }
  },

  // ── 2. Tournament Reports & Disputes ─────────────────────────────────────
  async getReports(status?: TournamentReportStatus): Promise<AdminTournamentReport[]> {
    try {
      const qs = status ? `?status=${status}` : '';
      const res = await fetch(`${API_BASE}/admin/tournaments/reports${qs}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Live API error');
      return res.json();
    } catch {
      if (status) {
        return MOCK_ADMIN_REPORTS.filter((r) => r.status === status);
      }
      return MOCK_ADMIN_REPORTS;
    }
  },

  async resolveReport(
    reportId: string,
    notes: string,
    status: TournamentReportStatus = 'RESOLVED',
    token?: string,
  ): Promise<AdminTournamentReport> {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/admin/tournaments/reports/${reportId}/resolve`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ adminResolutionNotes: notes, status }),
      });
      if (!res.ok) throw new Error('Failed to resolve report on server');
      return res.json();
    } catch {
      const rep = MOCK_ADMIN_REPORTS.find((r) => r.id === reportId);
      if (rep) {
        rep.status = status;
        rep.adminResolutionNotes = notes;
        rep.resolvedAt = new Date().toISOString();
      }
      return rep || ({} as AdminTournamentReport);
    }
  },

  // ── 3. Organizer Applications & Approvals ────────────────────────────────
  async getOrganizerApplications(): Promise<AdminOrganizerApplication[]> {
    try {
      const res = await fetch(`${API_BASE}/role-applications/pending`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Live API error');
      const data = await res.json();
      return Array.isArray(data) ? data : MOCK_ORGANIZER_APPLICATIONS;
    } catch {
      return MOCK_ORGANIZER_APPLICATIONS;
    }
  },

  async reviewOrganizerApplication(
    id: string,
    decision: 'APPROVED' | 'REJECTED',
    feedback?: string,
    token?: string,
  ): Promise<AdminOrganizerApplication> {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/role-applications/${id}/review`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ decision, feedback }),
      });
      if (!res.ok) throw new Error('Failed to review application');
      return res.json();
    } catch {
      const app = MOCK_ORGANIZER_APPLICATIONS.find((a) => a.id === id);
      if (app) {
        app.status = decision;
        app.adminFeedback = feedback || null;
        app.updatedAt = new Date().toISOString();
      }
      return app || ({} as AdminOrganizerApplication);
    }
  },
};

