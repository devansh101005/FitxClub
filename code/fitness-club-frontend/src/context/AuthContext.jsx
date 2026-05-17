import { createContext, useContext, useState } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

function decodeJwtPayload(token) {
  if (!token) return null;

  try {
    const [, payload] = token.split('.');
    if (!payload) return null;

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), '=');
    return JSON.parse(window.atob(padded));
  } catch {
    return null;
  }
}

function buildUserData(authResponse = {}, existingUser = null) {
  const accessToken = authResponse.accessToken || existingUser?.token || null;
  const refreshToken = authResponse.refreshToken || existingUser?.refreshToken || null;
  const payload = decodeJwtPayload(accessToken);

  return {
    token: accessToken,
    refreshToken,
    role: authResponse.role || payload?.role || existingUser?.role || null,
    email: authResponse.email || payload?.sub || existingUser?.email || null,
    userId: authResponse.userId || payload?.userId || existingUser?.userId || null,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return null;

    try {
      return buildUserData({}, JSON.parse(stored));
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      if (!res?.data) {
        throw new Error('Login response was empty');
      }
      const userData = buildUserData(res.data);
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (payload) => {
    setLoading(true);
    try {
      const res = await authApi.signup(payload);
      if (!res?.data) {
        throw new Error('Signup response was empty');
      }
      const userData = buildUserData(res.data);
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const hasRole = (...roles) => user && roles.includes(user.role);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
