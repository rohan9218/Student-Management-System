import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Upload, 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  BookOpen, 
  GraduationCap
} from 'lucide-react';

export default function Students() {
  const { isStaff, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // State Management
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter Settings
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  // Form Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Action state (Add vs Edit)
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'Male',
    dob: '',
    address: '',
    courseId: '',
    semester: 1,
    admissionDate: new Date().toISOString().split('T')[0],
    photoUrl: ''
  });

  // Photo uploading state
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Dialog / Notification triggers
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  // Load students & courses
  const fetchStudents = async () => {
    try {
      const response = await API.get('/students', {
        params: {
          search,
          courseId: selectedCourse || null,
          semester: selectedSemester || null
        }
      });
      setStudents(response.data);
    } catch (err) {
      showToast("Failed to fetch students roster.", "error");
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await API.get('/courses');
      setCourses(response.data);
    } catch (err) {
      console.error("Failed to load courses", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchStudents(), fetchCourses()]);
      setLoading(false);

      // Check if redirected from dashboard with "Register Student" quick action
      const queryParams = new URLSearchParams(location.search);
      if (queryParams.get('add') === 'true' && isStaff()) {
        openAddModal();
        // Clear url query params so it doesn't open again on page refresh
        navigate('/students', { replace: true });
      }
    };
    init();
  }, [search, selectedCourse, selectedSemester]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // Form handlers
  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({
      id: null,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      gender: 'Male',
      dob: '',
      address: '',
      courseId: courses[0]?.id || '',
      semester: 1,
      admissionDate: new Date().toISOString().split('T')[0],
      photoUrl: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    setIsEditMode(true);
    setFormData({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      gender: student.gender,
      dob: student.dob,
      address: student.address,
      courseId: student.course?.id || '',
      semester: student.semester,
      admissionDate: student.admissionDate,
      photoUrl: student.photoUrl || ''
    });
    setIsModalOpen(true);
  };

  const openDetailsModal = (student) => {
    setSelectedStudent(student);
    setIsDetailsOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle image upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("File size too large. Limit is 5MB.", "error");
      return;
    }

    const uploadData = new FormData();
    uploadData.append('file', file);
    setUploadingPhoto(true);

    try {
      const response = await API.post('/students/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData({ ...formData, photoUrl: response.data.photoUrl });
      showToast("Profile photo uploaded successfully!");
    } catch (err) {
      showToast("Could not upload profile photo.", "error");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditMode) {
        await API.put(`/students/${formData.id}`, formData);
        showToast("Student profile updated successfully!");
      } else {
        await API.post('/students', formData);
        showToast("Student registered successfully!");
      }
      setIsModalOpen(false);
      fetchStudents();
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to save student record.";
      showToast(errMsg, "error");
    }
  };

  // Delete handlers
  const handleDeleteClick = (id) => {
    setDeleteConfirm({ show: true, id });
  };

  const handleConfirmDelete = async () => {
    try {
      await API.delete(`/students/${deleteConfirm.id}`);
      showToast("Student record deleted successfully.");
      fetchStudents();
    } catch (err) {
      showToast("Could not delete student record.", "error");
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
        title="Delete Student Record"
        message="Are you sure you want to permanently delete this student? This operation will remove all their grades, attendance logs, and photo assets."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: null })}
      />

      {/* Header Panel */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-0">Student Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">View, register, and update student demographic records</p>
        </div>
        {isStaff() && (
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/10 hover:shadow-primary-500/20 active:scale-95 transition-all text-sm self-start md:self-auto"
          >
            <Plus className="h-4.5 w-4.5" />
            Register Student
          </button>
        )}
      </div>

      {/* Filters Dashboard Card */}
      <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm dark:bg-darkCard dark:border-darkBorder">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Search bar */}
          <div className="relative md:col-span-2">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Search className="h-5 w-5" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:border-primary-500 dark:bg-slate-900/30 dark:border-darkBorder dark:text-white dark:focus:bg-darkCard transition-all outline-none text-sm"
              placeholder="Search by ID, name or email..."
            />
          </div>

          {/* Course filter */}
          <div>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl dark:bg-slate-900/30 dark:border-darkBorder dark:text-slate-300 outline-none text-sm"
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.courseCode}</option>
              ))}
            </select>
          </div>

          {/* Semester filter */}
          <div>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl dark:bg-slate-900/30 dark:border-darkBorder dark:text-slate-300 outline-none text-sm"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Roster Display */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-dashed border-slate-200 rounded-2xl dark:bg-darkCard dark:border-darkBorder">
          <GraduationCap className="h-16 w-16 text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-white">No Students Found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Try modifying your query filters or register a new student</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-slate-100 rounded-2xl shadow-sm dark:bg-darkCard dark:border-darkBorder">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 dark:bg-slate-800/40 dark:border-darkBorder text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <th className="px-6 py-4">Student ID</th>
                <th className="px-6 py-4">Photo</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Semester</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-darkBorder text-sm text-slate-600 dark:text-slate-300">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white">#{student.id}</td>
                  <td className="px-6 py-4">
                    {student.photoUrl ? (
                      <img 
                        src={`http://localhost:8081${student.photoUrl}`} 
                        alt={student.firstName}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'; }}
                      />
                    ) : (
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400 font-bold">
                        {student.firstName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800 dark:text-white">{student.firstName} {student.lastName}</td>
                  <td className="px-6 py-4 font-mono text-xs">{student.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/10">
                      {student.course ? student.course.courseCode : 'Unassigned'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">Sem {student.semester}</td>
                  <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                    <button 
                      onClick={() => openDetailsModal(student)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4.5 w-4.5" />
                    </button>
                    {isStaff() && (
                      <button 
                        onClick={() => openEditModal(student)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
                        title="Edit student"
                      >
                        <Edit2 className="h-4.5 w-4.5" />
                      </button>
                    )}
                    {isAdmin() && (
                      <button 
                        onClick={() => handleDeleteClick(student.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800 dark:hover:text-rose-400 transition-colors"
                        title="Delete Student"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Roster Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-slate-100 rounded-3xl shadow-2xl dark:bg-darkCard dark:border-darkBorder animate-slide-in my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-darkBorder">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {isEditMode ? 'Modify Student Profile' : 'Register New Student'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
              {/* Photo Upload widget */}
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div className="relative w-24 h-24 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-darkBorder flex items-center justify-center overflow-hidden shrink-0 group">
                  {formData.photoUrl ? (
                    <img 
                      src={`http://localhost:8081${formData.photoUrl}`} 
                      alt="Student Preview" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <User className="h-10 w-10 text-slate-400" />
                  )}
                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                      <Spinner size="sm" />
                    </div>
                  )}
                </div>
                
                <div className="text-center sm:text-left space-y-1">
                  <label className="relative flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900/40 dark:border-darkBorder dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 font-semibold rounded-xl cursor-pointer text-xs transition-colors">
                    <Upload className="h-4 w-4" />
                    {uploadingPhoto ? 'Uploading...' : 'Upload Student Photo'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoUpload} 
                      className="hidden" 
                    />
                  </label>
                  <p className="text-[10px] text-slate-400">JPEG or PNG. Max size 5MB.</p>
                </div>
              </div>

              {/* Grid Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl dark:bg-slate-900/30 dark:border-darkBorder dark:text-white outline-none focus:border-primary-500 text-sm transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl dark:bg-slate-900/30 dark:border-darkBorder dark:text-white outline-none focus:border-primary-500 text-sm transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl dark:bg-slate-900/30 dark:border-darkBorder dark:text-white outline-none focus:border-primary-500 text-sm transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl dark:bg-slate-900/30 dark:border-darkBorder dark:text-white outline-none focus:border-primary-500 text-sm transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl dark:bg-slate-900/30 dark:border-darkBorder dark:text-white outline-none text-sm transition-colors"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl dark:bg-slate-900/30 dark:border-darkBorder dark:text-white outline-none focus:border-primary-500 text-sm transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Assign Course</label>
                  <select
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl dark:bg-slate-900/30 dark:border-darkBorder dark:text-white outline-none text-sm transition-colors"
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.courseName} ({course.courseCode})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Semester</label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl dark:bg-slate-900/30 dark:border-darkBorder dark:text-white outline-none text-sm transition-colors"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Admission Date</label>
                  <input
                    type="date"
                    name="admissionDate"
                    value={formData.admissionDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl dark:bg-slate-900/30 dark:border-darkBorder dark:text-white outline-none focus:border-primary-500 text-sm transition-colors"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Address Description</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl dark:bg-slate-900/30 dark:border-darkBorder dark:text-white outline-none focus:border-primary-500 text-sm transition-colors"
                  />
                </div>
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
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {isDetailsOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-slate-100 rounded-3xl shadow-2xl dark:bg-darkCard dark:border-darkBorder animate-slide-in">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-darkBorder">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Student Information Summary</h3>
              <button 
                onClick={() => setIsDetailsOpen(false)} 
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Header profile */}
              <div className="flex items-center gap-4">
                {selectedStudent.photoUrl ? (
                  <img 
                    src={`http://localhost:8081${selectedStudent.photoUrl}`} 
                    alt={selectedStudent.firstName} 
                    className="w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-100 dark:ring-slate-800 shrink-0" 
                  />
                ) : (
                  <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 font-bold text-2xl shrink-0">
                    {selectedStudent.firstName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase mt-1">Student Roll Number: #{selectedStudent.id}</p>
                </div>
              </div>

              {/* Data list grid */}
              <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 dark:border-darkBorder py-5">
                <div className="flex items-center gap-3">
                  <Mail className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Email</p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{selectedStudent.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Phone</p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{selectedStudent.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Course Code</p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {selectedStudent.course ? selectedStudent.course.courseCode : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Semester</p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Semester {selectedStudent.semester}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Date of Birth</p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{selectedStudent.dob}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Admission Date</p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{selectedStudent.admissionDate}</p>
                  </div>
                </div>
              </div>

              {/* Location details */}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Residential Address</p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                    {selectedStudent.address || 'No residential details provided.'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-darkBorder">
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 dark:bg-darkCard dark:text-slate-300 dark:border-darkBorder dark:hover:bg-slate-800 transition-colors"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
