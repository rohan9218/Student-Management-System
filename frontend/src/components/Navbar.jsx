import React from 'react';
import { Menu, Moon, Sun, GraduationCap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ toggleSidebar, title }) {
  const { darkMode, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/80 border-b border-slate-100 dark:bg-darkCard/80 dark:border-darkBorder backdrop-blur-md">
      {/* Sidebar toggle button (Mobile Only) */}
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleSidebar} 
          className="p-2 -ml-2 rounded-lg lg:hidden hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white mb-0 capitalize">{title || 'Dashboard'}</h2>
      </div>

      {/* Action buttons (Theme Toggle and User profile badge) */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-darkBorder dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800 transition-all"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-slate-500" />}
        </button>

        {/* User Information */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-100 dark:border-darkBorder">
          <div className="hidden text-right md:block">
            <p className="text-sm font-semibold text-slate-800 dark:text-white leading-none">{user?.username}</p>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{user?.role}</span>
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 font-bold">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
