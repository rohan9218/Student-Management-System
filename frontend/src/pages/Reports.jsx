import React, { useEffect, useState } from 'react';
import API from '../services/api';
import Toast from '../components/Toast';
import Spinner from '../components/Spinner';
import { 
  BarChart3, 
  Download, 
  FileText, 
  Table, 
  FileSpreadsheet, 
  Users, 
  Calendar, 
  Award,
  Filter
} from 'lucide-react';

export default function Reports() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  
  // Student report filters
  const [studentCourse, setStudentCourse] = useState('');
  const [studentSemester, setStudentSemester] = useState('');

  // Attendance report filters
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  // Marks report filters
  const [marksStudentId, setMarksStudentId] = useState('');

  // UI state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [coursesRes, studentsRes] = await Promise.all([
          API.get('/courses'),
          API.get('/students')
        ]);
        setCourses(coursesRes.data);
        setStudents(studentsRes.data);
      } catch (err) {
        showToast("Failed to load report filter details.", "error");
      }
    };
    loadFilters();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleDownload = async (url, params, defaultFilename) => {
    setDownloading(true);
    try {
      const response = await API.get(url, {
        params,
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = defaultFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      showToast("Report generated and downloaded successfully!");
    } catch (err) {
      console.error(err);
      showToast("Could not generate report file.", "error");
    } finally {
      setDownloading(false);
    }
  };

  const reportCards = [
    {
      id: 'students',
      title: 'Student Roster Exports',
      desc: 'Export listings of enrolled students filtered by department and semester.',
      icon: <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
      color: 'border-indigo-100 dark:border-indigo-900/20 bg-indigo-50/20 dark:bg-indigo-950/5',
      filters: (
        <div className="grid grid-cols-2 gap-2 mt-4">
          <select
            value={studentCourse}
            onChange={(e) => setStudentCourse(e.target.value)}
            className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg dark:bg-slate-900 dark:border-darkBorder dark:text-slate-300 outline-none text-xs"
          >
            <option value="">All Courses</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.courseCode}</option>)}
          </select>
          <select
            value={studentSemester}
            onChange={(e) => setStudentSemester(e.target.value)}
            className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg dark:bg-slate-900 dark:border-darkBorder dark:text-slate-300 outline-none text-xs"
          >
            <option value="">All Semesters</option>
            {[1,2,3,4,5,6,7,8].map(sem => <option key={sem} value={sem}>Sem {sem}</option>)}
          </select>
        </div>
      ),
      actions: [
        { label: 'PDF', type: 'pdf', path: '/reports/students/pdf', getParams: () => ({ courseId: studentCourse || null, semester: studentSemester || null }), file: 'students_list.pdf' },
        { label: 'Excel', type: 'excel', path: '/reports/students/excel', getParams: () => ({ courseId: studentCourse || null, semester: studentSemester || null }), file: 'students_list.xlsx' },
        { label: 'CSV', type: 'csv', path: '/reports/students/csv', getParams: () => ({ courseId: studentCourse || null, semester: studentSemester || null }), file: 'students_list.csv' },
      ]
    },
    {
      id: 'attendance',
      title: 'Daily Attendance Exports',
      desc: 'Export student attendance presence rosters logged on a specific calendar date.',
      icon: <Calendar className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
      color: 'border-emerald-100 dark:border-emerald-900/20 bg-emerald-50/20 dark:bg-emerald-950/5',
      filters: (
        <div className="mt-4">
          <input
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg dark:bg-slate-900 dark:border-darkBorder dark:text-slate-300 outline-none text-xs"
          />
        </div>
      ),
      actions: [
        { label: 'PDF', type: 'pdf', path: '/reports/attendance/pdf', getParams: () => ({ date: attendanceDate }), file: `attendance_${attendanceDate}.pdf` },
        { label: 'Excel', type: 'excel', path: '/reports/attendance/excel', getParams: () => ({ date: attendanceDate }), file: `attendance_${attendanceDate}.xlsx` },
        { label: 'CSV', type: 'csv', path: '/reports/attendance/csv', getParams: () => ({ date: attendanceDate }), file: `attendance_${attendanceDate}.csv` },
      ]
    },
    {
      id: 'marks',
      title: 'Academic Results Exports',
      desc: 'Export examination score sheets, grades, and grade percentages across subjects.',
      icon: <Award className="h-6 w-6 text-rose-600 dark:text-rose-400" />,
      color: 'border-rose-100 dark:border-rose-900/20 bg-rose-50/20 dark:bg-rose-950/5',
      filters: (
        <div className="mt-4">
          <select
            value={marksStudentId}
            onChange={(e) => setMarksStudentId(e.target.value)}
            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg dark:bg-slate-900 dark:border-darkBorder dark:text-slate-300 outline-none text-xs"
          >
            <option value="">All Students (Global summary)</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} (#{s.id})</option>)}
          </select>
        </div>
      ),
      actions: [
        { label: 'PDF', type: 'pdf', path: '/reports/marks/pdf', getParams: () => ({ studentId: marksStudentId || null }), file: 'gpa_grades_report.pdf' },
        { label: 'Excel', type: 'excel', path: '/reports/marks/excel', getParams: () => ({ studentId: marksStudentId || null }), file: 'gpa_grades_report.xlsx' },
        { label: 'CSV', type: 'csv', path: '/reports/marks/csv', getParams: () => ({ studentId: marksStudentId || null }), file: 'gpa_grades_report.csv' },
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}

      {/* Header Panel */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-0">Report Export Center</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Generate, filter and export data sheets into multiple offline formats</p>
      </div>

      {downloading && (
        <div className="flex items-center gap-3 p-4 border rounded-2xl bg-indigo-50 border-indigo-150 text-indigo-800 dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:text-indigo-400">
          <Spinner size="sm" />
          <p className="text-sm font-semibold">Generating report file from database. Please wait...</p>
        </div>
      )}

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {reportCards.map((card) => (
          <div key={card.id} className={`p-6 border rounded-2xl shadow-sm flex flex-col justify-between bg-white dark:bg-darkCard dark:border-darkBorder ${card.color}`}>
            <div>
              {/* Card Title */}
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-xl dark:bg-slate-900/40 shadow-sm border border-slate-100 dark:border-slate-800">
                  {card.icon}
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">{card.title}</h3>
              </div>

              {/* Description */}
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{card.desc}</p>
              
              {/* Filter inputs */}
              {card.filters}
            </div>

            {/* Export buttons */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-darkBorder grid grid-cols-3 gap-2">
              {card.actions.map((act) => (
                <button
                  key={act.label}
                  onClick={() => handleDownload(act.path, act.getParams(), act.file)}
                  disabled={downloading}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl dark:bg-slate-900 dark:text-slate-300 dark:border-darkBorder dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  {act.label}
                </button>
              ))}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
