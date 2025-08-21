import React from 'react';
import { NavLink } from 'react-router-dom';

const Header: React.FC = () => {
  const activeLinkStyle = {
    color: '#0284c7', // sky-600
    borderBottom: '2px solid #0284c7', // sky-600
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-md sticky top-0 z-20 border-b border-slate-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 tracking-wider">天才リーチ！</h1>
        <nav className="flex items-center space-x-6">
          <NavLink
            to="/"
            className="text-slate-500 hover:text-sky-600 pb-1 transition-colors duration-200 font-medium"
            style={({ isActive }) => (isActive ? activeLinkStyle : {})}
          >
            送信
          </NavLink>
          <NavLink
            to="/history"
            className="text-slate-500 hover:text-sky-600 pb-1 transition-colors duration-200 font-medium"
            style={({ isActive }) => (isActive ? activeLinkStyle : {})}
          >
            送信履歴
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Header;