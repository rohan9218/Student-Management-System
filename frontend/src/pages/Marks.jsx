import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { 
  FileSpreadsheet, 
  Plus, 
  Edit2, 
  Trash2, 
  GraduationCap, 
  Users, 
  Award, 
  Check, 
  X,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function Marks() {
  const { isStaff } = useAuth();

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingGrades, setLoadingGrades] = useState(false);

  // Filters
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('1');

  // Modal displays
  const [isGradesOpen, setIsGradesOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Student's marked subjects list
  const [studentMarks, setStudentMarks] = useState([]);

  // Grade Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    subject: '',
    marksObtained: '',
    totalMarks: '100'
  });

  // Toasts / Confirms
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

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

  // Fetch students when filters change
  useEffect(() => {
    if (!selectedCourse || !selectedSemester) return;
    fetchStudents();
  }, [selectedCourse, selectedSemester]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await API.get('/students', {
        params: { courseId: selectedCourse, semester: selectedSemester }
      });
      setStudents(response.data);
    } catch (err) {
      showToast("Could not load student roster.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // Open Grades panel for specific student
  const openGradesModal = async (student) => {
    setSelectedStudent(student);
    setIsGradesOpen(true);
    setIsFormOpen(false);
    await fetchStudentGrades(student.id);
  };

  const fetchStudentGrades = async (studentId) => {
    setLoadingGrades(true);
    try {
      const response = await API.get(`/marks/student/${studentId}`);
      setStudentMarks(response.data);
    } catch (err) {
      console.error("Could not fetch student marks", err);
    } finally {
      setLoadingGrades(false);
    }
  };

  // Grade Form Handlers
  const openAddGradeForm = () => {
    setIsEditMode(false);
    setFormData({
      id: null,
      subject: '',
      marksObtained: '',
      totalMarks: '100'
    });
    setIsFormOpen(true);
  };

  const openEditGradeForm = (mark) => {
    setIsEditMode(true);
    setFormData({
      id: mark.id,
      subject: mark.subject,
      marksObtained: mark.marksObtained.toString(),
      totalMarks: mark.totalMarks.toString()
    });
    setIsFormOpen(true);
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    
    const marksObtainedNum = parseFloat(formData.marksObtained);
    const totalMarksNum = parseFloat(formData.totalMarks);

    if (marksObtainedNum > totalMarksNum) {
      showToast("Marks obtained cannot exceed total marks.", "error");
      return;
    }

    try {
      const payload = {
        studentId: selectedStudent.id,
        subject: formData.subject,
        marksObtained: marksObtainedNum,
        totalMarks: totalMarksNum
      };

      await API.post('/marks', payload);
      showToast("Academic marks updated successfully!");
      setIsFormOpen(false);
      fetchStudentGrades(selectedStudent.id);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save marks record.";
      showToast(msg, "error");
    }
  };

  // Delete grade
  const handleDeleteClick = (id) => {
    setDeleteConfirm({ show: true, id });
  };

  const handleConfirmDelete = async () => {
    try {
      await API.delete(`/marks/${deleteConfirm.id}`);
      showToast("Marks entry removed.");
      fetchStudentGrades(selectedStudent.id);
    } catch (err) {
      showToast("Failed to delete marks entry.", "error");
    } finally {
      setDeleteConfirm({ show: false, id: null });
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

      <ConfirmDialog 
        isOpen={deleteConfirm.show}
        title="Delete Marks Entry"
        message="Are you sure you want to remove this subject mark entry from the student's record?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: null })}
      />

      {/* Header Panel */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-0">Grade Registry</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage and view student academic course grades and score sheets</p>
        </div>
        
        {/* Grading Scheme Guide */}
        <div className="flex flex-wrap gap-2 text-[10px] font-semibold">
          <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-100/30">90%+ A+</span>
          <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-100/30">80%+ A</span>
          <span className="px-2 py-1 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-100/30">70%+ B</span>
          <span className="px-2 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-lg border border-amber-100/30">60%+ C</span>
          <span className="px-2 py-1 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-lg border border-rose-100/30">&lt;60% Fail</span>
        </div>
      </div>

      {/* Filters Card */}
      <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm dark:bg-darkCard dark:border-darkBorder">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          
          {/* Course selection */}
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

          {/* Semester selection */}
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

          {/* Roster Stats info */}
          <div className="flex items-center gap-3 px-4 border border-slate-150 rounded-xl bg-slate-50/50 dark:border-darkBorder dark:bg-slate-900/10 text-xs text-slate-500 dark:text-slate-400">
            <Users className="h-4.5 w-4.5 text-primary-500" />
            <span>Found <b>{students.length}</b> students registered in this segment.</span>
          </div>

        </div>
      </div>

      {/* Students list for grading */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-dashed border-slate-200 rounded-2xl dark:bg-darkCard dark:border-darkBorder">
          <Users className="h-16 w-16 text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-white">No Students Found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select another course/semester to load students roster.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-slate-100 rounded-2xl shadow-sm dark:bg-darkCard dark:border-darkBorder">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 dark:bg-slate-800/40 dark:border-darkBorder text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4 text-right">Academic Records</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-darkBorder text-sm text-slate-600 dark:text-slate-300">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white">#{student.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-800 dark:text-white">{student.firstName} {student.lastName}</td>
                  <td className="px-6 py-4 font-mono text-xs">{student.email}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openGradesModal(student)}
                      className="px-4 py-1.5 text-xs font-semibold text-primary-600 border border-primary-200 hover:bg-primary-50 rounded-xl dark:text-primary-400 dark:border-primary-900/30 dark:hover:bg-primary-950/20 transition-all"
                    >
                      Manage Grades
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grades Management Drawer Modal */}
      {isGradesOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white border border-slate-100 rounded-3xl shadow-2xl dark:bg-darkCard dark:border-darkBorder animate-slide-in flex flex-col max-h-[85vh]">
            
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-darkBorder shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">Student Grade Book</h3>
                <p className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">Demographic: {selectedStudent.firstName} {selectedStudent.lastName} (ID: #{selectedStudent.id})</p>
              </div>
              <button 
                onClick={() => setIsGradesOpen(false)} 
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Grade input form overlay */}
            {isFormOpen && isStaff() && (
              <form onSubmit={handleGradeSubmit} className="p-4 bg-slate-50 border-b border-slate-100 dark:bg-slate-900/30 dark:border-darkBorder space-y-3 shrink-0 animate-slide-in">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  <Sparkles className="h-4 w-4 text-primary-500" />
                  <span>{isEditMode ? 'Modify Grade record' : 'Add Subject Marks'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl dark:bg-darkCard dark:border-darkBorder dark:text-white outline-none focus:border-primary-500 text-xs"
                      placeholder="Subject Name (e.g. Java)"
                      disabled={isEditMode}
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={formData.marksObtained}
                      onChange={(e) => setFormData({ ...formData, marksObtained: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl dark:bg-darkCard dark:border-darkBorder dark:text-white outline-none focus:border-primary-500 text-xs"
                      placeholder="Marks Scored (e.g. 85)"
                      step="0.5"
                      min="0"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.totalMarks}
                      onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl dark:bg-darkCard dark:border-darkBorder dark:text-white outline-none focus:border-primary-500 text-xs"
                      placeholder="Total Marks (e.g. 100)"
                      step="0.5"
                      min="1"
                      required
                    />
                    <button
                      type="submit"
                      className="px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-xs shadow-sm shadow-primary-500/10 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="p-2 border border-slate-200 text-slate-400 hover:bg-slate-100 rounded-xl dark:border-darkBorder dark:hover:bg-slate-800 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Student Marks List */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Report Card Scores ({studentMarks.length})</h4>
                {isStaff() && !isFormOpen && (
                  <button
                    onClick={openAddGradeForm}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Marks
                  </button>
                )}
              </div>

              {loadingGrades ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size="md" />
                </div>
              ) : studentMarks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileSpreadsheet className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-sm text-slate-400">No marks entries loaded for this student.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-50 dark:border-darkBorder rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 dark:bg-slate-800/40 dark:border-darkBorder font-bold text-slate-400 dark:text-slate-500 uppercase">
                        <th className="px-4 py-3">Subject</th>
                        <th className="px-4 py-3 text-center">Marks</th>
                        <th className="px-4 py-3 text-center">Percentage</th>
                        <th className="px-4 py-3 text-center">Grade</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        {isStaff() && <th className="px-4 py-3 text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-darkBorder font-medium">
                      {studentMarks.map((mark) => (
                        <tr key={mark.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">{mark.subject}</td>
                          <td className="px-4 py-3 text-center">{mark.marksObtained} / {mark.totalMarks}</td>
                          <td className="px-4 py-3 text-center font-semibold">{mark.percentage.toFixed(1)}%</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${mark.grade === 'Fail' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400'}`}>
                              {mark.grade}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {mark.resultStatus === 'Pass' ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                                <Check className="h-3.5 w-3.5" /> Pass
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                                <X className="h-3.5 w-3.5" /> Fail
                              </span>
                            )}
                          </td>
                          {isStaff() && (
                            <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                              <button
                                onClick={() => openEditGradeForm(mark)}
                                className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(mark.id)}
                                className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-rose-600 dark:hover:bg-slate-800 dark:hover:text-rose-400 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-darkBorder shrink-0">
              <button
                onClick={() => setIsGradesOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 dark:bg-darkCard dark:text-slate-300 dark:border-darkBorder dark:hover:bg-slate-800 transition-colors"
              >
                Close Grade Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
