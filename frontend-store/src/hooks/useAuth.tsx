import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (userData: User, accessToken: string, refreshToken: string) => boolean;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
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

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
