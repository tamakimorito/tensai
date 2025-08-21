import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const commonLinkClasses = "flex items-center px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors duration-200 rounded-md";
  const activeLinkClasses = "bg-slate-700 text-white";

  return (
    <aside className="w-64 bg-slate-800 text-white flex flex-col flex-shrink-0 min-h-screen">
      <div className="h-16 flex items-center justify-center border-b border-slate-700">
        <h1 className="text-xl font-bold tracking-wider">天才リーチ！</h1>
      </div>
      <nav className="flex-grow p-4">
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeLinkClasses : ''}`}
            >
              <span className="ml-3">送信</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/history"
              className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeLinkClasses : ''}`}
            >
              <span className="ml-3">送信履歴</span>
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="p-4 border-t border-slate-700 text-center text-xs text-slate-500">
        <p>© タマシステム2025</p>
      </div>
    </aside>
  );
};

export default Sidebar;