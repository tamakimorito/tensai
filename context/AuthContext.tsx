import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { gasService } from '../services/gasService';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check session storage on initial load
    const sessionAuth = sessionStorage.getItem('isAuthenticated');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const correctPassword = await gasService.fetchPassword();
      if (password === correctPassword) {
        sessionStorage.setItem('isAuthenticated', 'true');
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = () => {
    sessionStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
