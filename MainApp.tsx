import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import SendPage from './pages/SendPage';
import HistoryPage from './pages/HistoryPage';

const MainApp: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-grow p-4 sm:p-6 md:p-8">
            <Routes>
                <Route path="/" element={<SendPage />} />
                <Route path="/history" element={<HistoryPage />} />
            </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default MainApp;