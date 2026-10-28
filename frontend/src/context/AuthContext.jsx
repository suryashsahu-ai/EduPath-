import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setCsrfToken, setUnauthorizedHandler } from '../services/api.js';
import * as authService from '../services/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Ask the backend who we are. The HttpOnly cookie is the source of truth.
  useEffect(() => {
    let cancelled = false;
    authService
      .getCurrentUser()
      .then((currentUser) => !cancelled && setUser(currentUser))
      .catch(() => !cancelled && setUser(null))
      .finally(() => !cancelled && setInitializing(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // If any API call comes back 401 (e.g. the token expired), drop the local session.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setCsrfToken(null);
      setUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async (credentials) => {
    const signedInUser = await authService.login(credentials);
    setUser(signedInUser);
    return signedInUser;
  }, []);

  const register = useCallback((details) => authService.register(details), []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Even if the request failed, leave the UI signed out; the cookie expires on its own.
    } finally {
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (details) => {
    const updatedUser = await authService.updateProfile(details);
    setUser(updatedUser);
    return updatedUser;
  }, []);

  const deleteAccount = useCallback(async () => {
    try {
      await authService.deleteAccount();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      initializing,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      updateProfile,
      deleteAccount,
    }),
    [user, initializing, login, register, logout, updateProfile, deleteAccount],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.');
  return context;
}
