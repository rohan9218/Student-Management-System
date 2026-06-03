import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { 
  BookOpen, 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  Clock, 
  X, 
  UserMinus, 
  UserPlus, 
  CheckCircle,
  Hash
} from 'lucide-react';

export default function Courses() {
  const { isStaff, isAdmin } = useAuth();

  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]); // All students, for assign list
  const [courseStudents, setCourseStudents] = useState([]); // Students in selected course
  const [loading, setLoading] = useState(true);

  // Modal displays
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // Roster student assign selection
  const [assignStudentId, setAssignStudentId] = useState('');

  // Course Form
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    courseName: '',
    courseCode: '',
    duration: '2 Years',
    description: ''
  });

  // Toasts / Confirms
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  const fetchCourses = async () => {
    try {
      const response = await API.get('/courses');
      setCourses(response.data);
    } catch (err) {
      showToast("Failed to fetch courses.", "error");
    }
  };

  const fetchAllStudents = async () => {
    try {
      const response = await API.get('/students');
      setStudents(response.data);
    } catch (err) {
      console.error("Failed to load students list", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchCourses(), fetchAllStudents()]);
      setLoading(false);
    };
    init();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // Form actions
  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({
      id: null,
      courseName: '',
      courseCode: '',
      duration: '2 Years',
      description: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (course) => {
    setIsEditMode(true);
    setFormData({
      id: course.id,
      courseName: course.courseName,
      courseCode: course.courseCode,
      duration: course.duration,
      description: course.description
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await API.put(`/courses/${formData.id}`, formData);
        showToast("Course details updated successfully!");
      } else {
        await API.post('/courses', formData);
        showToast("Course created successfully!");
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch (err) {
      showToast("Could not save course. Double check code uniqueness.", "error");
    }
  };

  // Roster Roster operations
  const openRosterModal = async (course) => {
    setSelectedCourse(course);
    setIsRosterOpen(true);
    setAssignStudentId('');
    await fetchRoster(course.id);
  };

  const fetchRoster = async (courseId) => {
    try {
      const response = await API.get('/students', { params: { courseId } });
      setCourseStudents(response.data);
    } catch (err) {
      console.error("Could not fetch course roster", err);
    }
  };

  const handleAssignStudent = async (e) => {
    e.preventDefault();
    if (!assignStudentId) return;

    try {
      // Load current student details, update course, submit PUT
      const studentRes = await API.get(`/students/${assignStudentId}`);
      const student = studentRes.data;

      const studentPayload = {
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone,
        gender: student.gender,
        dob: student.dob,
        address: student.address,
        courseId: selectedCourse.id,
        semester: student.semester,
        admissionDate: student.admissionDate,
        photoUrl: student.photoUrl
      };

      await API.put(`/students/${student.id}`, studentPayload);
      showToast(`Student successfully assigned to ${selectedCourse.courseCode}!`);
      setAssignStudentId('');
      fetchRoster(selectedCourse.id);
      fetchAllStudents(); // Refresh all students list
    } catch (err) {
      showToast("Failed to assign student to course.", "error");
    }
  };

  const handleRemoveFromRoster = async (student) => {
    try {
      const studentPayload = {
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone,
        gender: student.gender,
        dob: student.dob,
        address: student.address,
        courseId: null, // Remove course
        semester: student.semester,
        admissionDate: student.admissionDate,
        photoUrl: student.photoUrl
      };

      await API.put(`/students/${student.id}`, studentPayload);
      showToast("Student removed from course roster.");
      fetchRoster(selectedCourse.id);
      fetchAllStudents();
    } catch (err) {
      showToast("Failed to remove student from course.", "error");
    }
  };

  // Delete Course
  const handleDeleteClick = (id) => {
    setDeleteConfirm({ show: true, id });
  };

  const handleConfirmDelete = async () => {
    try {
      await API.delete(`/courses/${deleteConfirm.id}`);
      showToast("Course deleted successfully.");
      fetchCourses();
    } catch (err) {
      showToast("Could not delete course. Confirm that no students are assigned first.", "error");
    } finally {
      setDeleteConfirm({ show: false, id: null });
    }
  };

  // Calculate student count per course for cards
  const getStudentCount = (courseId) => {
    return students.filter(s => s.course?.id === courseId).length;
  };

  // Filter students who are NOT currently in this course, for assign dropdown
  const getEligibleStudents = () => {
    return students.filter(s => s.course?.id !== selectedCourse?.id);
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
        title="Delete Academic Course"
        message="Are you sure you want to permanently delete this course? This operation will unassign all students currently linked to it."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: null })}
      />

      {/* Header Panel */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-0">Course Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">View, create, and manage academic courses and syllabus offerings</p>
        </div>
        {isStaff() && (
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/10 hover:shadow-primary-500/20 active:scale-95 transition-all text-sm self-start md:self-auto"
          >
            <Plus className="h-4.5 w-4.5" />
            Add Course
          </button>
        )}
      </div>

      {/* Course Grid Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-dashed border-slate-200 rounded-2xl dark:bg-darkCard dark:border-darkBorder">
          <BookOpen className="h-16 w-16 text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-white">No Courses Configured</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure a new course structure to begin mapping enrollments</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="flex flex-col justify-between p-6 bg-white border border-slate-100 dark:bg-darkCard dark:border-darkBorder rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                    {course.courseCode}
                  </span>
                </div>

                {/* Content */}
                <div className="mt-4">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">{course.courseName}</h3>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {course.description || 'No detailed syllabus or syllabus mapping has been provided for this course module.'}
                  </p>
                </div>
              </div>

              {/* Metrics and Actions footer */}
              <div className="mt-6 pt-4 border-t border-slate-50 dark:border-darkBorder flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 dark:text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-primary-500" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-indigo-500" />
                    <span>{getStudentCount(course.id)} Enrolled</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => openRosterModal(course)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
                    title="Course Roster"
                  >
                    <Users className="h-4 w-4" />
                  </button>
                  {isStaff() && (
                    <button 
                      onClick={() => openEditModal(course)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
                      title="Edit Course"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  )}
                  {isAdmin() && (
                    <button 
                      onClick={() => handleDeleteClick(course.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-rose-600 dark:hover:bg-slate-800 dark:hover:text-rose-400 transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl shadow-2xl dark:bg-darkCard dark:border-darkBorder animate-slide-in">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-darkBorder">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {isEditMode ? 'Modify Course structure' : 'Create Academic Course'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Course Title</label>
                <input
                  type="text"
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl dark:bg-slate-900/30 dark:border-darkBorder dark:text-white outline-none focus:border-primary-500 text-sm transition-colors"
                  placeholder="Master of Computer Applications"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Course Code</label>
                  <input
                    type="text"
                    name="courseCode"
                    value={formData.courseCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl dark:bg-slate-900/30 dark:border-darkBorder dark:text-white outline-none focus:border-primary-500 text-sm transition-colors"
                    placeholder="MCA"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl dark:bg-slate-900/30 dark:border-darkBorder dark:text-white outline-none focus:border-primary-500 text-sm transition-colors"
                    placeholder="2 Years"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl dark:bg-slate-900/30 dark:border-darkBorder dark:text-white outline-none focus:border-primary-500 text-sm transition-colors"
                  placeholder="Syllabus overview..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-darkBorder">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 dark:bg-darkCard dark:text-slate-300 dark:border-darkBorder dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-lg shadow-primary-500/10 hover:shadow-primary-500/20 active:scale-95 transition-all"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Roster Assignment Modal */}
      {isRosterOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-slate-100 rounded-3xl shadow-2xl dark:bg-darkCard dark:border-darkBorder animate-slide-in flex flex-col max-h-[85vh]">
            
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-darkBorder shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">Course Roster Mapping</h3>
                <p className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">Course: {selectedCourse.courseName}</p>
              </div>
              <button 
                onClick={() => setIsRosterOpen(false)} 
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Assignment form inside roster */}
            {isStaff() && (
              <form onSubmit={handleAssignStudent} className="p-4 bg-slate-50 border-b border-slate-100 dark:bg-slate-900/30 dark:border-darkBorder flex items-center gap-3 shrink-0">
                <div className="relative flex-1">
                  <select
                    value={assignStudentId}
                    onChange={(e) => setAssignStudentId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl dark:bg-darkCard dark:border-darkBorder dark:text-slate-300 outline-none text-sm"
                    required
                  >
                    <option value="">Select student to assign...</option>
                    {getEligibleStudents().map(student => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName} (#{student.id}) {student.course ? `[Currently in ${student.course.courseCode}]` : '[Unassigned]'}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={!assignStudentId}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <UserPlus className="h-4 w-4" />
                  Assign
                </button>
              </form>
            )}

            {/* Roster student list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Assigned Students ({courseStudents.length})</h4>
              
              {courseStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-sm text-slate-400">No students are currently mapped to this course.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-darkBorder">
                  {courseStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold text-xs">
                          {student.firstName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-white">{student.firstName} {student.lastName}</p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">Roll ID: #{student.id} | Sem {student.semester}</span>
                        </div>
                      </div>
                      {isStaff() && (
                        <button
                          onClick={() => handleRemoveFromRoster(student)}
                          className="p-1 rounded-lg hover:bg-slate-50 hover:text-rose-600 dark:hover:bg-slate-800 dark:hover:text-rose-400 text-slate-400 transition-colors"
                          title="Remove from Course"
                        >
                          <UserMinus className="h-4.5 w-4.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-darkBorder shrink-0">
              <button
                onClick={() => setIsRosterOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 dark:bg-darkCard dark:text-slate-300 dark:border-darkBorder dark:hover:bg-slate-800 transition-colors"
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
