import { useState, useEffect, useCallback } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as User;
        if (!parsed.role.includes('ADMIN')) {
          sessionStorage.clear();
          setUser(null);
        } else {
          setUser(parsed);
        }
      } catch {
        sessionStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((userData: User, accessToken: string, refreshToken: string) => {
    if (!userData.role.includes('ADMIN')) return false;
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return true;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.clear();
    setUser(null);
  }, []);

  return { user, loading, login, logout, isLoggedIn: !!user };
}
