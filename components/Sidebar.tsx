import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const { logout, mode } = useAuth();
  const isMasterMode = mode === 'master';
  
  const commonLinkClasses = "flex items-center px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors duration-200 rounded-md";
  const activeLinkClasses = "bg-slate-700 text-white";
  const disabledLinkClasses = "opacity-50 pointer-events-none";

  const LightbulbIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="#FBC02D">
      <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17h8v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/>
    </svg>
  );

  const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );

  const AdminIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
            {isMasterMode && (
                <li>
                    <NavLink to="/admin/templates" className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeLinkClasses : ''}`}>
                        <AdminIcon />
                        <span className="ml-3 font-bold">テンプレ管理</span>
                    </NavLink>
                </li>
            )}
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => `${commonLinkClasses} ${isActive && !isMasterMode ? activeLinkClasses : ''} ${isMasterMode ? disabledLinkClasses : ''}`}
            >
              <span className="ml-3">送信</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/history"
              className={({ isActive }) => `${commonLinkClasses} ${isActive && !isMasterMode ? activeLinkClasses : ''} ${isMasterMode ? disabledLinkClasses : ''}`}
            >
              <span className="ml-3">送信履歴</span>
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="p-4 border-t border-slate-700 space-y-4">
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors duration-200 rounded-md"
          >
            <LogoutIcon />
            <span className="ml-3">ログアウト</span>
          </button>
        <p className="text-center text-xs text-slate-500">© タマシステム2025</p>
      </div>
    </aside>
  );
};

export default Sidebar;
