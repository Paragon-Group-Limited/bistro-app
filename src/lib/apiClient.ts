// ============================================
// API Client
// Thin fetch wrapper that:
//   - prepends /api (Vite proxies /api → /bistro/api/v1 in dev; same-origin in prod)
//   - attaches the current access token from token storage
//   - on 401, transparently refreshes the access token using the refresh token
//     and retries the original request once
//   - returns parsed JSON on 2xx, throws ApiError on other statuses
// ============================================

const API_BASE = '/api/v1';

const ACCESS_KEY = 'bistro-access-token';
const REFRESH_KEY = 'bistro-refresh-token';
const ACCESS_EXP_KEY = 'bistro-access-expires-at';

export interface ApiErrorBody {
  code: string;
  message: string;
  fields?: Record<string, string>;
}

export class ApiError extends Error {
  status: number;
  code: string;
  fields?: Record<string, string>;
  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.status = status;
    this.code = body.code;
    this.fields = body.fields;
  }
}

// ---------- Token storage ----------

export const tokenStore = {
  getAccess(): string | null { return localStorage.getItem(ACCESS_KEY); },
  getRefresh(): string | null { return localStorage.getItem(REFRESH_KEY); },
  setTokens(access: string, refresh: string, expiresAt: string) {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
    localStorage.setItem(ACCESS_EXP_KEY, expiresAt);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(ACCESS_EXP_KEY);
  },
  isAuthenticated(): boolean { return !!this.getRefresh(); },
};

// ---------- Refresh queueing ----------
// If multiple requests fire while access token is expired, only one refresh runs;
// the rest wait for it.

let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  const refresh = tokenStore.getRefresh();
  if (!refresh) return false;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refresh }),
      });
      if (!res.ok) {
        tokenStore.clear();
        return false;
      }
      const data = await res.json();
      tokenStore.setTokens(data.access_token, data.refresh_token, data.access_expires_at);
      return true;
    } catch {
      tokenStore.clear();
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

// ---------- Core request ----------

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  /** Skip token attach + refresh — used by /auth/* public endpoints */
  noAuth?: boolean;
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const url = buildUrl(path, opts.query);

  const exec = async (): Promise<Response> => {
    const headers: Record<string, string> = {};
    if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
    if (!opts.noAuth) {
      const access = tokenStore.getAccess();
      if (access) headers['Authorization'] = `Bearer ${access}`;
    }
    return fetch(url, {
      method: opts.method ?? (opts.body !== undefined ? 'POST' : 'GET'),
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  };

  let res = await exec();

  if (res.status === 401 && !opts.noAuth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await exec();
    }
  }

  if (res.status === 204) return undefined as unknown as T;

  let parsed: unknown;
  try { parsed = await res.json(); } catch { parsed = null; }

  if (!res.ok) {
    const errBody = (parsed as { error?: ApiErrorBody })?.error ?? {
      code: 'unknown_error',
      message: `Request failed with status ${res.status}`,
    };
    throw new ApiError(res.status, errBody);
  }

  return parsed as T;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  let url = path.startsWith('/') ? `${API_BASE}${path}` : `${API_BASE}/${path}`;
  if (query) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === '') continue;
      params.set(k, String(v));
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }
  return url;
}
