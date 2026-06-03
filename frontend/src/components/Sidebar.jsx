import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  CalendarCheck, 
  FileSpreadsheet, 
  BarChart3, 
  User, 
  LogOut, 
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { user, logout } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Students', path: '/students', icon: <Users className="h-5 w-5" /> },
    { name: 'Courses', path: '/courses', icon: <BookOpen className="h-5 w-5" /> },
    { name: 'Attendance', path: '/attendance', icon: <CalendarCheck className="h-5 w-5" /> },
    { name: 'Marks & Results', path: '/marks', icon: <FileSpreadsheet className="h-5 w-5" /> },
    { name: 'Reports', path: '/reports', icon: <BarChart3 className="h-5 w-5" /> },
    { name: 'Profile', path: '/profile', icon: <User className="h-5 w-5" /> },
  ];

  return (
    <>
      {/* Mobile Sidebar Backdrop */}
      {isOpen && (
        <div 
          onClick={toggleSidebar} 
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col w-64 bg-white border-r border-slate-100 dark:bg-darkCard dark:border-darkBorder transition-transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Brand Logo Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 dark:border-darkBorder">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-600 text-white shadow-lg shadow-primary-500/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 dark:text-white leading-none">EduManage</h1>
            <span className="text-[10px] font-semibold tracking-wider text-primary-500 uppercase">SYS ADMIN</span>
          </div>
        </div>

        {/* Links Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => {
                if (window.innerWidth < 1024) toggleSidebar();
              }}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${isActive ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'}`}
            >
              {link.icon}
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Bottom User Info & Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-darkBorder">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 font-bold text-sm">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{user?.username}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">{user?.role}</p>
            </div>
            <button 
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200/50 hover:text-rose-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-rose-400 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
