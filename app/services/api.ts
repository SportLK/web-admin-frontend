import {
  Venue,
  CreateVenueDto,
  Match,
  CreateMatchDto,
  UpdateScoreDto,
  MatchStatus,
  PlatformOverviewStats,
  SportBreakdownItem,
  TopVenueItem,
} from '../types';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`API Error (${res.status}): ${errText || res.statusText}`);
    }

    return await res.json();
  } catch (error: any) {
    console.warn(`API request failed for ${url}:`, error.message);
    throw error;
  }
}

// ==========================================
// VENUES API (Member 4)
// ==========================================
export const venuesApi = {
  getAll: (sportType?: string, city?: string) => {
    const params = new URLSearchParams();
    if (sportType) params.append('sportType', sportType);
    if (city) params.append('city', city);
    const qs = params.toString();
    return apiFetch<Venue[]>(`/venues${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) => apiFetch<Venue>(`/venues/${id}`),

  create: (dto: CreateVenueDto) =>
    apiFetch<Venue>('/venues', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  update: (id: string, dto: Partial<CreateVenueDto>) =>
    apiFetch<Venue>(`/venues/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),

  toggleStatus: (id: string, isActive: boolean) =>
    apiFetch<Venue>(`/venues/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),

  delete: (id: string) =>
    apiFetch<{ success: boolean; message?: string }>(`/venues/${id}`, {
      method: 'DELETE',
    }),
};

// ==========================================
// MATCHES API (Member 4)
// ==========================================
export const matchesApi = {
  getAll: (status?: MatchStatus | 'ALL', sportType?: string) => {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('matchStatus', status);
    if (sportType && sportType !== 'ALL') params.append('sportType', sportType);
    const qs = params.toString();
    return apiFetch<Match[]>(`/matches${qs ? `?${qs}` : ''}`);
  },

  getLive: () => apiFetch<Match[]>('/matches/live'),

  getById: (id: string) => apiFetch<Match>(`/matches/${id}`),

  create: (dto: CreateMatchDto) =>
    apiFetch<Match>('/matches', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  updateScore: (id: string, scoreDto: UpdateScoreDto) =>
    apiFetch<any>(`/matches/${id}/score`, {
      method: 'PUT',
      body: JSON.stringify(scoreDto),
    }),

  updateStatus: (id: string, matchStatus: MatchStatus) =>
    apiFetch<Match>(`/matches/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ matchStatus }),
    }),

  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/matches/${id}`, {
      method: 'DELETE',
    }),
};

// ==========================================
// STATISTICS API (Member 4)
// ==========================================
export const statisticsApi = {
  getOverview: () => apiFetch<PlatformOverviewStats>('/statistics/overview'),

  getMatchStats: () =>
    apiFetch<{ sportsBreakdown: SportBreakdownItem[]; recentCompleted: any[] }>('/statistics/matches'),

  getVenueStats: () =>
    apiFetch<{ topVenues: TopVenueItem[]; cityDistribution: any[]; facilitiesOverview: any }>('/statistics/venues'),
};
