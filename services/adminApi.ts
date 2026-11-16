import { apiRequest } from '@/lib/api';
import { Team, TeamReport } from '@/data/mockData';

export const adminApi = {
  getTeams: (params?: { sportType?: string; status?: string; city?: string; search?: string }): Promise<Team[]> => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params ?? {})) if (value) query.set(key, value);
    return apiRequest(`/admin/teams${query.size ? `?${query}` : ''}`, { cache: 'no-store' });
  },
  getTeamDetail: (id: string): Promise<Team> => apiRequest(`/admin/teams/${id}`, { cache: 'no-store' }),
  createTeam: (data: { managerId: string; teamName: string; sportType: string; primaryLocationCity?: string; teamBio?: string }): Promise<Team> =>
    apiRequest('/admin/teams', { method: 'POST', body: JSON.stringify(data) }),
  searchRegisteredPlayers: (search: string): Promise<RegisteredPlayer[]> =>
    apiRequest(`/admin/teams/players?search=${encodeURIComponent(search)}`, { cache: 'no-store' }),
  requestPlayerToJoin: (teamId: string, userId: string): Promise<unknown> =>
    apiRequest(`/admin/teams/${teamId}/join-requests`, { method: 'POST', body: JSON.stringify({ userId }) }),
  getJoinRequests: (teamId: string): Promise<TeamJoinRequest[]> =>
    apiRequest(`/admin/teams/${teamId}/join-requests`, { cache: 'no-store' }),
  decideJoinRequest: (teamId: string, requestId: string, decision: 'accept' | 'reject'): Promise<unknown> =>
    apiRequest(`/admin/teams/${teamId}/join-requests/${requestId}/${decision}`, { method: 'POST' }),
  suspendTeam: (id: string, data: { reason: string; duration: string; notes?: string }): Promise<Team> =>
    apiRequest(`/admin/teams/${id}/suspend`, { method: 'POST', body: JSON.stringify(data) }),
  reactivateTeam: (id: string): Promise<Team> => apiRequest(`/admin/teams/${id}/reactivate`, { method: 'POST' }),
  removeMember: (teamId: string, memberId: string): Promise<{ success: boolean; message: string }> =>
    apiRequest(`/admin/teams/${teamId}/members/${memberId}`, { method: 'DELETE' }),
  getReports: (): Promise<TeamReport[]> => apiRequest('/admin/teams/reports', { cache: 'no-store' }),
  createReport: (data: { teamId: string; reason: string; details: string; severity: string }): Promise<TeamReport> =>
    apiRequest('/admin/teams/reports', { method: 'POST', body: JSON.stringify(data) }),
  updateReport: (id: string, data: { status: 'RESOLVED' | 'DISMISSED' | 'IN_REVIEW'; resolutionNotes?: string }): Promise<TeamReport[]> =>
    apiRequest(`/admin/teams/reports/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getAnalytics: (): Promise<{ totalTeams: number; activeTeams: number; suspendedTeams: number; totalMembers: number; avgSquadSize: string; complianceRate: number; totalReports: number; openReports: number }> =>
    apiRequest('/admin/teams/analytics', { cache: 'no-store' }),
};

export interface RegisteredPlayer { id: string; fullName: string; email: string; city?: string | null; }
export interface TeamJoinRequest { id: string; invitedUserId: string; status: string; createdAt: string; invitedUser?: { fullName?: string; email?: string }; }
