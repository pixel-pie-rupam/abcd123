import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AdminContext = createContext();
const ADMIN_TOKEN_KEY = 'pragni-admin-token';
const ADMIN_USER_KEY = 'pragni-admin-user';

const normalizeUser = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const permissions = Array.isArray(raw.permissions) ? raw.permissions : [];
  return { ...raw, permissions };
};

export function AdminProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(ADMIN_TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try { return normalizeUser(JSON.parse(sessionStorage.getItem(ADMIN_USER_KEY))); } catch { return null; }
  });

  const login = (tok, usr) => {
    const safeUser = normalizeUser(usr);
    sessionStorage.setItem(ADMIN_TOKEN_KEY, tok);
    sessionStorage.setItem(ADMIN_USER_KEY, JSON.stringify(safeUser));
    setToken(tok); setUser(safeUser);
  };

  const logout = useCallback(() => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_USER_KEY);
    setToken(null); setUser(null);
  }, []);

  useEffect(() => {
    const onAuthExpired = () => logout();
    window.addEventListener('admin-auth-expired', onAuthExpired);
    return () => window.removeEventListener('admin-auth-expired', onAuthExpired);
  }, [logout]);

  return (
    <AdminContext.Provider value={{ token, user, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
