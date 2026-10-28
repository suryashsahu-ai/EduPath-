import { request, setCsrfToken } from './api.js';

export async function register({ fullName, email, password }) {
  return request('/api/auth/register', {
    method: 'POST',
    body: { full_name: fullName, email, password },
  });
}

export async function login({ email, password }) {
  const data = await request('/api/auth/login', { method: 'POST', body: { email, password } });
  setCsrfToken(data.csrf_token);
  return data.user;
}

/** Restores the session after a page reload (the cookie is sent automatically). */
export async function getCurrentUser() {
  const data = await request('/api/auth/me');
  setCsrfToken(data.csrf_token);
  return data.user;
}

export async function logout() {
  try {
    await request('/api/auth/logout', { method: 'POST' });
  } finally {
    setCsrfToken(null);
  }
}

export async function updateProfile({ fullName, email, avatar, bio }) {
  const data = await request('/api/auth/profile', {
    method: 'PATCH',
    body: {
      full_name: fullName,
      email: email || undefined,
      avatar: avatar !== undefined ? avatar : undefined,
      bio: bio !== undefined ? bio : undefined,
    },
  });
  return data.user;
}

export async function changePassword({ currentPassword, newPassword }) {
  return request('/api/auth/password', {
    method: 'PUT',
    body: {
      current_password: currentPassword,
      new_password: newPassword,
    },
  });
}

export async function deleteAccount() {
  try {
    return await request('/api/auth/account', { method: 'DELETE' });
  } finally {
    setCsrfToken(null);
  }
}
