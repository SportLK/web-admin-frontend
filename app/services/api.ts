import {
  Venue,
  CreateVenueDto,
  Match,
  CreateMatchDto,
  UpdateScoreDto,
  MatchStatus,
} from '../types';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    let errMessage = res.statusText;
    try {
      const errJson = await res.json();
      errMessage = errJson.message || JSON.stringify(errJson);
    } catch {
      errMessage = await res.text();
    }
    throw new Error(Array.isArray(errMessage) ? errMessage.join(', ') : errMessage);
  }

  return await res.json();
}

// ==========================================
// VENUES API (Member 4)
// ==========================================
export const venuesApi = {
  getAll: (sportType?: string, city?: string) => {
    const params = new URLSearchParams();
    if (sportType && sportType !== 'ALL') params.append('sportType', sportType);
    if (city && city !== 'ALL') params.append('city', city);
    const qs = params.toString();
    return apiFetch<Venue[]>(`/venues${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) => apiFetch<Venue>(`/venues/${id}`),

  create: (dto: CreateVenueDto) =>
    apiFetch<Venue>('/venues', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  update: (id: string, dto: Partial<CreateVenueDto> & { isActive?: boolean }) =>
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
    apiFetch<{ message?: string }>(`/venues/${id}`, {
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
    apiFetch<{ message?: string }>(`/matches/${id}`, {
      method: 'DELETE',
    }),
};
