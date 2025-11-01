import React, { createContext, useState, useEffect } from 'react';
import { auth as apiAuth } from '../api';

export const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (token) {
      // naive decode (not secure) to get role/userId if needed
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: payload.userId, role: payload.role });
      } catch { setUser(null); }
    } else {
      setUser(null);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res: any = await apiAuth.login(email, password);
    if (res?.token) {
      localStorage.setItem('token', res.token);
      setToken(res.token);
      return true;
    }
    return false;
  };

  const register = async (email: string, password: string, name?: string) => {
    const res: any = await apiAuth.register(email, password, name);
    if (res?.token) {
      localStorage.setItem('token', res.token);
      setToken(res.token);
      return true;
    }
    return false;
  };

  const logout = () => { localStorage.removeItem('token'); setToken(null); };

  return <AuthContext.Provider value={{ token, user, login, register, logout }}>{children}</AuthContext.Provider>;
};