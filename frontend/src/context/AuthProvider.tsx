import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { auth as apiAuth } from '../api';
import { AuthContext } from './AuthContext';
import type { AuthContextValue, AuthResponse, AuthUser } from '../types';

const decodeToken = (token: string): AuthUser | null => {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload)) as { userId?: string; role?: AuthUser['role'] };
    if (!decoded.userId || !decoded.role) return null;
    return { id: decoded.userId, role: decoded.role };
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(token ? decodeToken(token) : null);
  }, [token]);

  const persistToken = useCallback((value: string | null) => {
    if (value) {
      localStorage.setItem('token', value);
    } else {
      localStorage.removeItem('token');
    }
    setToken(value);
  }, []);

  const login = useCallback<AuthContextValue['login']>(async (email, password) => {
    const res: AuthResponse = await apiAuth.login(email, password);
    if (res.token) {
      persistToken(res.token);
      return true;
    }
    return false;
  }, [persistToken]);

  const register = useCallback<AuthContextValue['register']>(async (email, password, name) => {
    const res: AuthResponse = await apiAuth.register(email, password, name);
    if (res.token) {
      persistToken(res.token);
      return true;
    }
    return false;
  }, [persistToken]);

  const logout = useCallback(() => {
    persistToken(null);
  }, [persistToken]);

  const value = useMemo<AuthContextValue>(() => ({ token, user, login, register, logout }), [login, logout, register, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
