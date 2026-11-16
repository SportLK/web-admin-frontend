import { ADMIN_REFRESH_TOKEN_KEY, clearAdminSession, getAdminAccessToken, storeAdminSession } from './admin-auth';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export async function apiRequest<T>(path: string, options: RequestInit = {}, token = getAdminAccessToken()): Promise<T> {
  const send = async (accessToken?: string) => {
    try {
      return await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      });
    } catch {
      throw new Error(`Cannot connect to the SportLK API at ${API_URL}.`);
    }
  };
  let response = await send(token);
  if (response.status === 401 && !path.startsWith('/auth/')) {
    const refreshToken = window.localStorage.getItem(ADMIN_REFRESH_TOKEN_KEY);
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (refreshResponse.ok) {
          const session = await refreshResponse.json();
          storeAdminSession(session.accessToken, session.refreshToken);
          response = await send(session.accessToken);
        } else clearAdminSession();
      } catch {
        clearAdminSession();
      }
    } else clearAdminSession();
  }

  const payload = await response.json().catch(() => undefined);
  if (response.status === 401) clearAdminSession();
  if (!response.ok) {
    const message = payload?.message;
    throw new Error(Array.isArray(message) ? message.join(', ') : message || `API request failed (${response.status})`);
  }
  return payload as T;
}

export const adminRequest = <T>(path: string, token: string, options: RequestInit = {}) =>
  apiRequest<T>(path, options, token);
