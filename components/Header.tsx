
import React from 'react';
import { NavLink } from 'react-router-dom';

const Header: React.FC = () => {
  const activeLinkStyle = {
    color: '#111827',
    borderBottom: '2px solid #111827',
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">天才リーチ！</h1>
        <nav className="flex items-center space-x-6">
          <NavLink
            to="/"
            className="text-gray-600 hover:text-gray-900 pb-1 transition-colors duration-200"
            style={({ isActive }) => (isActive ? activeLinkStyle : {})}
          >
            送信
          </NavLink>
          <NavLink
            to="/history"
            className="text-gray-600 hover:text-gray-900 pb-1 transition-colors duration-200"
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
