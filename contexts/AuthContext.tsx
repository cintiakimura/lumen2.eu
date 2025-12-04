
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { getUsers } from '../services/db';
import { MOCK_USERS } from '../constants';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Check for saved session
  useEffect(() => {
    const savedUser = localStorage.getItem('lumen_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string): Promise<boolean> => {
    setLoading(true);
    try {
      // 1. Try to fetch from DB/Mock
      const allUsers = await getUsers();
      const foundUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem('lumen_user', JSON.stringify(foundUser));
        setLoading(false);
        return true;
      }
      
      setLoading(false);
      return false;
    } catch (e) {
      console.error("Login error", e);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lumen_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
