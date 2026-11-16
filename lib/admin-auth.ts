export const ADMIN_ACCESS_TOKEN_KEY = 'sportlk_admin_access_token';
export const ADMIN_REFRESH_TOKEN_KEY = 'sportlk_admin_refresh_token';

export function getAdminAccessToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY) ?? undefined;
}

export function storeAdminSession(accessToken: string, refreshToken: string) {
  window.localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, refreshToken);
}

export function clearAdminSession() {
  window.localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
  window.dispatchEvent(new Event('sportlk:auth-expired'));
}
