import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Spinner from '../components/Spinner';
import { 
  Users, 
  BookOpen, 
  CalendarCheck, 
  Award, 
  PlusCircle, 
  Calendar, 
  FileCheck2, 
  Activity,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await API.get('/dashboard');
        setStats(response.data);
      } catch (err) {
        console.error("Error fetching dashboard statistics:", err);
        setError("Could not load dashboard statistics. Please ensure the backend and database are running.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 border rounded-2xl bg-rose-50 border-rose-100 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400">
          <p className="font-semibold">Dashboard Connection Failed</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const { 
    totalStudents, 
    totalCourses, 
    totalAttendanceRecords, 
    attendancePercentage, 
    averagePerformance, 
    recentActivities, 
    topPerformers 
  } = stats;

  const statCards = [
    { 
      title: 'Total Students', 
      value: totalStudents, 
      icon: <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />, 
      color: 'bg-indigo-50 border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/20',
      tagline: 'Active enrollments'
    },
    { 
      title: 'Total Courses', 
      value: totalCourses, 
      icon: <BookOpen className="h-6 w-6 text-amber-600 dark:text-amber-400" />, 
      color: 'bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/20',
      tagline: 'Departments offered'
    },
    { 
      title: 'Attendance Rate', 
      value: `${attendancePercentage.toFixed(1)}%`, 
      icon: <CalendarCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />, 
      color: 'bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/20',
      tagline: 'Present roster percentage'
    },
    { 
      title: 'Avg Performance', 
      value: `${averagePerformance.toFixed(1)}%`, 
      icon: <Award className="h-6 w-6 text-rose-600 dark:text-rose-400" />, 
      color: 'bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/20',
      tagline: 'System-wide GPA'
    },
  ];

  const quickActions = [
    { 
      title: 'Register Student', 
      desc: 'Add new student record to the system', 
      icon: <PlusCircle className="h-5 w-5" />, 
      path: '/students?add=true',
      color: 'bg-primary-600 text-white hover:bg-primary-700'
    },
    { 
      title: 'Mark Attendance', 
      desc: 'Log daily present/absent sheets', 
      icon: <Calendar className="h-5 w-5" />, 
      path: '/attendance',
      color: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-darkCard dark:border-darkBorder dark:text-slate-300 dark:hover:bg-slate-800'
    },
    { 
      title: 'Enter Marks', 
      desc: 'Upload examination grades', 
      icon: <FileCheck2 className="h-5 w-5" />, 
      path: '/marks',
      color: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-darkCard dark:border-darkBorder dark:text-slate-300 dark:hover:bg-slate-800'
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white mb-0">System Overview</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Welcome to your educational institution control panel.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-xl dark:bg-darkCard dark:border-darkBorder text-xs font-semibold text-slate-500 dark:text-slate-400">
          <CalendarCheck className="h-4 w-4 text-primary-500" />
          <span>Session: {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => (
          <div key={idx} className={`p-6 border rounded-2xl shadow-sm flex flex-col justify-between ${card.color}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{card.title}</span>
              <div className="p-2 bg-white rounded-xl dark:bg-slate-900/60 shadow-sm">
                {card.icon}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white leading-none">{card.value}</h3>
              <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">{card.tagline}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Analytical Charts, Top Performers, Logs */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* SVG Analytics Chart */}
        <div className="xl:col-span-2 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm dark:bg-darkCard dark:border-darkBorder">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Academic Performance Distribution</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Grading metrics and registration performance curves</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1 rounded-lg">
              <TrendingUp className="h-4 w-4" />
              <span>Target: 75% Average</span>
            </div>
          </div>
          
          {/* Custom SVG Line Chart */}
          <div className="relative h-64 flex items-end">
            <svg viewBox="0 0 500 200" className="w-full h-full">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgb(77, 110, 255)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="rgb(77, 110, 255)" stopOpacity="0.00" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="5" className="dark:stroke-slate-800" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="5" className="dark:stroke-slate-800" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="5" className="dark:stroke-slate-800" />
              
              {/* Smooth Spline Chart */}
              <path 
                d="M 20 180 Q 100 130, 180 150 T 340 70 T 480 50" 
                fill="none" 
                stroke="rgb(77, 110, 255)" 
                strokeWidth="3.5"
                className="chart-path"
              />
              <path 
                d="M 20 180 Q 100 130, 180 150 T 340 70 T 480 50 L 480 190 L 20 190 Z" 
                fill="url(#gradient)" 
              />

              {/* Data points */}
              <circle cx="20" cy="180" r="5" fill="rgb(77, 110, 255)" stroke="#fff" strokeWidth="1.5" />
              <circle cx="112" cy="144" r="5" fill="rgb(77, 110, 255)" stroke="#fff" strokeWidth="1.5" />
              <circle cx="218" cy="145" r="5" fill="rgb(77, 110, 255)" stroke="#fff" strokeWidth="1.5" />
              <circle cx="328" cy="74" r="5" fill="rgb(77, 110, 255)" stroke="#fff" strokeWidth="1.5" />
              <circle cx="480" cy="50" r="5" fill="rgb(77, 110, 255)" stroke="#fff" strokeWidth="1.5" />
            </svg>
            
            {/* Chart Legends */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
              <span>Sem 1</span>
              <span>Sem 2</span>
              <span>Sem 3</span>
              <span>Sem 4</span>
              <span>Sem 5</span>
              <span>Sem 6</span>
            </div>
          </div>
        </div>

        {/* Top Performers list */}
        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm dark:bg-darkCard dark:border-darkBorder">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-rose-500" />
            Top Performing Students
          </h3>
          {topPerformers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 border border-dashed border-slate-200 rounded-2xl dark:border-slate-800">
              <Award className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm text-slate-400">No examination data available.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topPerformers.map((performer, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-slate-50 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 font-bold text-sm">
                    #{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{performer.studentName}</p>
                    <span className="text-[10px] font-semibold text-primary-500 dark:text-primary-400 uppercase tracking-wider">{performer.courseCode}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-800 dark:text-white">{performer.averagePercentage.toFixed(1)}%</span>
                    <p className="text-[10px] font-semibold text-emerald-500 dark:text-emerald-400">Grade: {performer.grade}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Action Cards */}
        <div className="lg:col-span-1 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm dark:bg-darkCard dark:border-darkBorder flex flex-col">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Quick Management Actions</h3>
          <div className="flex-1 flex flex-col justify-center space-y-3">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => navigate(action.path)}
                className={`flex items-start gap-4 p-4 rounded-2xl text-left transition-all hover:scale-[1.01] ${action.color}`}
              >
                <div className="p-2 rounded-xl bg-slate-500/10 shrink-0">
                  {action.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-sm leading-tight">{action.title}</h4>
                  <p className="mt-1 text-xs opacity-70 leading-normal">{action.desc}</p>
                </div>
                <ChevronRight className="ml-auto h-4 w-4 self-center opacity-70 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Audit Log Timeline */}
        <div className="lg:col-span-2 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm dark:bg-darkCard dark:border-darkBorder">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-500" />
            Recent Logins & Activities
          </h3>
          <div className="flow-root">
            <ul className="-mb-8">
              {recentActivities.map((log, idx) => (
                <li key={log.id}>
                  <div className="relative pb-8">
                    {idx !== recentActivities.length - 1 ? (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100 dark:bg-slate-800" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center ring-8 ring-white dark:ring-darkCard">
                          <Activity className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {log.action}{' '}
                            <span className="font-semibold text-slate-800 dark:text-white">
                              by {log.user}
                            </span>
                          </p>
                        </div>
                        <div className="text-right text-xs whitespace-nowrap text-slate-400 dark:text-slate-500">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
