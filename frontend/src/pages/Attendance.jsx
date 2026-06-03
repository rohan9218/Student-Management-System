import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import { 
  Calendar, 
  Check, 
  X, 
  Save, 
  Users, 
  Filter, 
  CalendarCheck2, 
  PieChart
} from 'lucide-react';

export default function Attendance() {
  const { isStaff } = useAuth();

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filters
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('1');

  // Local attendance state mapping: studentId -> 'PRESENT' | 'ABSENT'
  const [attendanceSheet, setAttendanceSheet] = useState({});

  // Stats
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);

  // Toast notifications
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Load courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await API.get('/courses');
        setCourses(response.data);
        if (response.data.length > 0) {
          setSelectedCourse(response.data[0].id);
        }
      } catch (err) {
        showToast("Failed to fetch courses.", "error");
      }
    };
    fetchCourses();
  }, []);

  // Fetch student roster and prefill logs when filter options change
  useEffect(() => {
    if (!selectedCourse || !selectedSemester || !date) return;
    loadRosterAndAttendance();
  }, [selectedCourse, selectedSemester, date]);

  // Recalculate quick aggregate stats on sheet update
  useEffect(() => {
    let present = 0;
    let absent = 0;
    Object.values(attendanceSheet).forEach(status => {
      if (status === 'PRESENT') present++;
      if (status === 'ABSENT') absent++;
    });
    setPresentCount(present);
    setAbsentCount(absent);
  }, [attendanceSheet]);

  const loadRosterAndAttendance = async () => {
    setLoading(true);
    try {
      // 1. Fetch eligible students based on course and semester
      const studentRes = await API.get('/students', {
        params: { courseId: selectedCourse, semester: selectedSemester }
      });
      const studentList = studentRes.data;
      setStudents(studentList);

      // 2. Fetch already marked daily attendance
      const attendanceRes = await API.get('/attendance/daily', { params: { date } });
      const dailyLogs = attendanceRes.data;

      // 3. Map logs or default
      const sheet = {};
      studentList.forEach(student => {
        const markedRecord = dailyLogs.find(log => log.student.id === student.id);
        sheet[student.id] = markedRecord ? markedRecord.status : 'PRESENT'; // Default to PRESENT
      });

      setAttendanceSheet(sheet);
    } catch (err) {
      showToast("Could not load attendance roster.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceSheet(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleToggleAll = (status) => {
    const updated = {};
    students.forEach(s => {
      updated[s.id] = status;
    });
    setAttendanceSheet(updated);
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendanceSheet).map(([studentId, status]) => ({
        studentId: parseInt(studentId),
        status
      }));

      await API.post('/attendance', {
        date,
        records
      });

      showToast("Attendance updated successfully!");
    } catch (err) {
      showToast("Failed to save attendance logs.", "error");
    } finally {
      setSaving(false);
    }
  };

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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-0">Attendance Tracker</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Mark daily attendance rosters and generate attendance metrics</p>
        </div>
        {isStaff() && students.length > 0 && (
          <button 
            onClick={handleSaveAttendance}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/10 hover:shadow-primary-500/20 active:scale-95 transition-all text-sm self-start md:self-auto"
          >
            {saving ? <Spinner size="sm" /> : <Save className="h-4.5 w-4.5" />}
            Save Attendance
          </button>
        )}
      </div>

      {/* Configuration Panel */}
      <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm dark:bg-darkCard dark:border-darkBorder">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          
          {/* Date selection */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Calendar className="h-5 w-5" />
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:border-primary-500 dark:bg-slate-900/30 dark:border-darkBorder dark:text-white dark:focus:bg-darkCard transition-all outline-none text-sm"
            />
          </div>

          {/* Course select */}
          <div>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl dark:bg-slate-900/30 dark:border-darkBorder dark:text-slate-300 outline-none text-sm"
            >
              <option value="" disabled>Select Course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.courseCode}</option>
              ))}
            </select>
          </div>

          {/* Semester select */}
          <div>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl dark:bg-slate-900/30 dark:border-darkBorder dark:text-slate-300 outline-none text-sm"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>

          {/* Roster stats */}
          <div className="flex items-center justify-around px-4 border border-slate-100 rounded-xl bg-slate-50/50 dark:border-darkBorder dark:bg-slate-900/10">
            <div className="text-center">
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Present</span>
              <p className="text-lg font-extrabold text-slate-800 dark:text-white leading-none mt-1">{presentCount}</p>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-darkBorder" />
            <div className="text-center">
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Absent</span>
              <p className="text-lg font-extrabold text-slate-800 dark:text-white leading-none mt-1">{absentCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk tools */}
      {isStaff() && students.length > 0 && !loading && (
        <div className="flex gap-2">
          <button
            onClick={() => handleToggleAll('PRESENT')}
            className="px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-xl border border-emerald-100/50 dark:border-emerald-900/10 transition-colors"
          >
            Mark All Present
          </button>
          <button
            onClick={() => handleToggleAll('ABSENT')}
            className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400 rounded-xl border border-rose-100/50 dark:border-rose-900/10 transition-colors"
          >
            Mark All Absent
          </button>
        </div>
      )}

      {/* Roster Grid Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-dashed border-slate-200 rounded-2xl dark:bg-darkCard dark:border-darkBorder">
          <Users className="h-16 w-16 text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-white">No Students Registered</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            No students match the selected Course and Semester filters.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-slate-100 rounded-2xl shadow-sm dark:bg-darkCard dark:border-darkBorder">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 dark:bg-slate-800/40 dark:border-darkBorder text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Status Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-darkBorder text-sm text-slate-600 dark:text-slate-300">
              {students.map((student) => {
                const currentStatus = attendanceSheet[student.id] || 'PRESENT';
                return (
                  <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white">#{student.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-white">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex p-1 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-darkBorder rounded-2xl">
                        <button
                          type="button"
                          disabled={!isStaff()}
                          onClick={() => handleStatusChange(student.id, 'PRESENT')}
                          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${currentStatus === 'PRESENT' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                        >
                          <Check className="h-3.5 w-3.5" />
                          Present
                        </button>
                        <button
                          type="button"
                          disabled={!isStaff()}
                          onClick={() => handleStatusChange(student.id, 'ABSENT')}
                          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${currentStatus === 'ABSENT' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                        >
                          <X className="h-3.5 w-3.5" />
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
