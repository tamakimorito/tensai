import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { gasService } from '../services/gasService';

type AuthMode = 'normal' | 'mmk' | 'kmk' | 'master';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  mode: AuthMode;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mode, setMode] = useState<AuthMode>('normal');

  useEffect(() => {
    // Check session storage on initial load
    const sessionAuth = sessionStorage.getItem('isAuthenticated');
    if (sessionAuth === 'true') {
      const sessionMode = sessionStorage.getItem('authMode') as AuthMode;
      setIsAuthenticated(true);
      if (sessionMode === 'mmk' || sessionMode === 'kmk' || sessionMode === 'master') {
        setMode(sessionMode);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const correctPassword = await gasService.fetchPassword();
      const passwordLower = password.toLowerCase();
      
      const suffixes = ['mmk', 'kmk', 'master'];
      let matchedSuffix: AuthMode | null = null;
      let basePassword = password;

      for (const suffix of suffixes) {
          if (passwordLower.endsWith(suffix)) {
              const potentialBase = password.slice(0, -suffix.length);
              if (potentialBase === correctPassword) {
                  matchedSuffix = suffix as AuthMode;
                  basePassword = potentialBase;
                  break;
              }
          }
      }

      if (matchedSuffix) {
          sessionStorage.setItem('isAuthenticated', 'true');
          sessionStorage.setItem('authMode', matchedSuffix);
          setIsAuthenticated(true);
          setMode(matchedSuffix);
          if (matchedSuffix === 'master') {
              sessionStorage.setItem('adminPass', password);
          }
          return true;
      }
      
      if (password === correctPassword) {
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('authMode', 'normal');
        setIsAuthenticated(true);
        setMode('normal');
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
    sessionStorage.removeItem('authMode');
    sessionStorage.removeItem('adminPass');
    setIsAuthenticated(false);
    setMode('normal');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, mode, login, logout }}>
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
