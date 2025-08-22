import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import MainApp from './MainApp';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, mode } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      document.body.classList.add(mode === 'mmk' ? 'mmk-mode' : 'normal-mode');
      document.body.classList.remove(mode === 'mmk' ? 'normal-mode' : 'mmk-mode');
    } else {
      document.body.classList.remove('mmk-mode', 'normal-mode');
      document.body.classList.add('normal-mode'); // Default for login page
    }
  }, [isAuthenticated, mode]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>読み込み中...</p>
      </div>
    );
  }

  return isAuthenticated ? <MainApp /> : <LoginPage />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;