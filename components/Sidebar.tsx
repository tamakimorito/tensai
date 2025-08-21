import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const commonLinkClasses = "flex items-center px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors duration-200 rounded-md";
  const activeLinkClasses = "bg-slate-700 text-white";

  const LightbulbIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="#FBC02D">
      <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17h8v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/>
    </svg>
  );

  return (
    <aside className="w-64 bg-slate-800 text-white flex flex-col flex-shrink-0 min-h-screen">
      <div className="h-16 flex items-center justify-center px-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <LightbulbIcon />
          <h1 className="text-xl font-bold tracking-wider">天才リーチ！</h1>
        </div>
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