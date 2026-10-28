// Centralised API client. The base URL comes from VITE_API_BASE_URL.
//
// Auth model: the JWT lives in an HttpOnly cookie that JavaScript cannot read, so
// requests just use `credentials: 'include'`. The CSRF token (returned by /login and
// /me) is kept in memory only and sent as X-CSRF-Token on state-changing requests.
// Nothing sensitive is written to localStorage or sessionStorage.

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');

let csrfToken = null;
let unauthorizedHandler = null;

export function setCsrfToken(token) {
  csrfToken = token || null;
}

/** Registered by AuthContext so an expired session on any request signs the UI out. */
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export class ApiError extends Error {
  constructor(message, { status = 0, fieldErrors = {} } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const GENERIC_ERROR = 'Something went wrong. Please try again.';

function messageFor(status, data) {
  if (typeof data?.detail === 'string') return data.detail;
  if (status >= 500) return 'The server ran into a problem. Please try again in a moment.';
  return GENERIC_ERROR;
}

export async function request(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (method !== 'GET' && csrfToken) headers['X-CSRF-Token'] = csrfToken;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      credentials: 'include',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Unable to reach the server. Check your connection and try again.');
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // Non-JSON or empty body - handled below via status.
  }

  if (!response.ok) {
    if (response.status === 401 && unauthorizedHandler) unauthorizedHandler();
    throw new ApiError(messageFor(response.status, data), {
      status: response.status,
      fieldErrors: data?.errors ?? {},
    });
  }
  return data;
}
