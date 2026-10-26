import { Team, TeamReport } from '@/data/mockData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const adminApi = {
  // Fetch all teams for admin management
  async getTeams(): Promise<Team[]> {
    const res = await fetch(`${API_BASE_URL}/admin/teams`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch admin teams: ${res.statusText}`);
    }
    return res.json();
  },

  // Fetch detailed team information including roster
  async getTeamDetail(id: string): Promise<Team> {
    const res = await fetch(`${API_BASE_URL}/admin/teams/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch team ${id}: ${res.statusText}`);
    }
    return res.json();
  },

  // Suspend a team
  async suspendTeam(
    id: string,
    data: { reason: string; duration: string; notes?: string }
  ): Promise<Team> {
    const res = await fetch(`${API_BASE_URL}/admin/teams/${id}/suspend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(`Failed to suspend team: ${res.statusText}`);
    }
    return res.json();
  },

  // Reactivate a suspended team
  async reactivateTeam(id: string): Promise<Team> {
    const res = await fetch(`${API_BASE_URL}/admin/teams/${id}/reactivate`, {
      method: 'POST',
    });
    if (!res.ok) {
      throw new Error(`Failed to reactivate team: ${res.statusText}`);
    }
    return res.json();
  },

  // Remove a member from a team's squad roster
  async removeMember(teamId: string, memberId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/admin/teams/${teamId}/members/${memberId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(`Failed to remove member: ${res.statusText}`);
    }
    return res.json();
  },

  // Fetch all team-related incident reports
  async getReports(): Promise<TeamReport[]> {
    const res = await fetch(`${API_BASE_URL}/admin/teams/reports`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch team reports: ${res.statusText}`);
    }
    return res.json();
  },

  // Resolve or dismiss an incident report
  async updateReport(
    id: string,
    data: { status: 'RESOLVED' | 'DISMISSED' | 'IN_REVIEW'; resolutionNotes?: string }
  ): Promise<TeamReport[]> {
    const res = await fetch(`${API_BASE_URL}/admin/teams/reports/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(`Failed to update report: ${res.statusText}`);
    }
    return res.json();
  },

  // Fetch high-level analytics for Member 2 team management
  async getAnalytics(): Promise<{
    totalTeams: number;
    activeTeams: number;
    suspendedTeams: number;
    totalMembers: number;
    avgSquadSize: string;
    complianceRate: number;
    totalReports: number;
    openReports: number;
  }> {
    const res = await fetch(`${API_BASE_URL}/admin/teams/analytics`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch team analytics: ${res.statusText}`);
    }
    return res.json();
  },
};
