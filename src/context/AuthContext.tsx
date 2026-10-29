import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '../types/store';
import { useNotification } from './NotificationContext';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, password?: string) => Promise<boolean>;
  loginAsDemoUser: () => Promise<void>;
  loginAsDemoAdmin: () => Promise<void>;
  register: (name: string, email: string, password?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nexora_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { showToast } = useNotification();

  // Load user profile on mount if token exists
  useEffect(() => {
    async function loadMe() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const profile = await res.json();
          setUser(profile);
        } else {
          // Token expired or invalid
          setToken(null);
          localStorage.removeItem('nexora_token');
        }
      } catch (err) {
        console.error('Failed to authenticate session:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadMe();
  }, [token]);

  const login = useCallback(
    async (email: string, password = 'demo'): Promise<boolean> => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          const data = await res.json();
          showToast({
            type: 'error',
            title: 'Sign In Failed',
            message: data.error || 'Invalid credentials',
          });
          return false;
        }
        const data = await res.json();
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('nexora_token', data.token);
        setIsAuthModalOpen(false);
        showToast({
          type: 'success',
          title: 'Welcome back',
          message: `Signed in as ${data.user.name}`,
        });
        return true;
      } catch (err) {
        showToast({ type: 'error', title: 'Network Error', message: 'Could not reach server' });
        return false;
      }
    },
    [showToast]
  );

  const loginAsDemoUser = useCallback(async () => {
    await login('alex.chen@nexora.io', 'demo');
  }, [login]);

  const loginAsDemoAdmin = useCallback(async () => {
    await login('admin@nexorastore.com', 'admin');
  }, [login]);

  const register = useCallback(
    async (name: string, email: string, password = 'demo'): Promise<boolean> => {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        if (!res.ok) {
          const data = await res.json();
          showToast({
            type: 'error',
            title: 'Registration Failed',
            message: data.error || 'Could not create account',
          });
          return false;
        }
        const data = await res.json();
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('nexora_token', data.token);
        setIsAuthModalOpen(false);
        showToast({
          type: 'success',
          title: 'Account Created',
          message: `Welcome to SAHRIVA Store, ${data.user.name}`,
        });
        return true;
      } catch (err) {
        showToast({ type: 'error', title: 'Network Error', message: 'Could not reach server' });
        return false;
      }
    },
    [showToast]
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('nexora_token');
    showToast({ type: 'info', title: 'Signed Out', message: 'You have been signed out' });
  }, [showToast]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        login,
        loginAsDemoUser,
        loginAsDemoAdmin,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
