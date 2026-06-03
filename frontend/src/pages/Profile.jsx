import React, { useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import { 
  User, 
  Lock, 
  Database, 
  Download, 
  Upload, 
  Mail, 
  Shield, 
  Save, 
  RefreshCw 
} from 'lucide-react';

export default function Profile() {
  const { user, isAdmin, updateProfileEmail } = useAuth();

  // Email form
  const [email, setEmail] = useState(user?.email || '');
  const [updatingEmail, setUpdatingEmail] = useState(false);

  // Password form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Database Backup/Restore
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreFile, setRestoreFile] = useState(null);

  // Toast message
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (!email) return;

    setUpdatingEmail(true);
    try {
      const response = await API.put(`/profile/details`, null, { params: { email } });
      updateProfileEmail(response.data.email);
      showToast("Email address updated successfully!");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update profile details.";
      showToast(msg, "error");
    } finally {
      setUpdatingEmail(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match.", "error");
      return;
    }

    setUpdatingPassword(true);
    try {
      await API.put(`/profile/password`, { oldPassword, newPassword });
      showToast("Password updated successfully!");
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to change password. Validate current password.";
      showToast(msg, "error");
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Database actions
  const handleBackup = async () => {
    setBackingUp(true);
    try {
      const response = await API.get('/system/backup', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `student_management_db_backup_${new Date().toISOString().split('T')[0]}.sql`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast("Database SQL snapshot downloaded successfully!");
    } catch (err) {
      showToast("Could not export database. Verify MySQL Server is online.", "error");
    } finally {
      setBackingUp(false);
    }
  };

  const handleRestoreFileChange = (e) => {
    setRestoreFile(e.target.files[0]);
  };

  const handleRestore = async (e) => {
    e.preventDefault();
    if (!restoreFile) return;

    const confirmAction = window.confirm("WARNING: Restoring the database will overwrite all existing tables, students, courses, grades, and logs. Do you want to proceed?");
    if (!confirmAction) return;

    setRestoring(true);
    const formData = new FormData();
    formData.append('file', restoreFile);

    try {
      await API.post('/system/restore', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast("Database successfully restored!");
      setRestoreFile(null);
      // Reset input element
      e.target.reset();
    } catch (err) {
      showToast("Database restoration failed. Ensure the SQL script is valid.", "error");
    } finally {
      setRestoring(false);
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
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-0">Account Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your profile details, passwords, and database system tools</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card & Info Update */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* User Meta Card */}
          <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm dark:bg-darkCard dark:border-darkBorder flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 font-bold text-2xl mb-4">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{user?.username}</h3>
            <span className="mt-1 px-2.5 py-0.5 text-xs font-semibold rounded-lg bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-100 dark:border-slate-700 uppercase tracking-wider">
              {user?.role}
            </span>
            <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">Registered Account: {user?.email}</p>
          </div>

          {/* Details form */}
          <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm dark:bg-darkCard dark:border-darkBorder">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Mail className="h-4.5 w-4.5 text-primary-500" />
              Update Email Details
            </h4>
            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl dark:bg-slate-900/30 dark:border-darkBorder dark:text-white outline-none focus:border-primary-500 text-xs"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={updatingEmail}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                {updatingEmail ? <Spinner size="sm" /> : <Save className="h-4 w-4" />}
                Save Changes
              </button>
            </form>
          </div>

        </div>

        {/* Change Password Form */}
        <div className="lg:col-span-1 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm dark:bg-darkCard dark:border-darkBorder">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Lock className="h-4.5 w-4.5 text-rose-500" />
            Change Password
          </h4>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl dark:bg-slate-900/30 dark:border-darkBorder dark:text-white outline-none focus:border-primary-500 text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl dark:bg-slate-900/30 dark:border-darkBorder dark:text-white outline-none focus:border-primary-500 text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl dark:bg-slate-900/30 dark:border-darkBorder dark:text-white outline-none focus:border-primary-500 text-xs"
                required
              />
            </div>
            <button
              type="submit"
              disabled={updatingPassword}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              {updatingPassword ? <Spinner size="sm" /> : <RefreshCw className="h-4 w-4" />}
              Update Password
            </button>
          </form>
        </div>

        {/* Database Backup & Restore (Admin Only) */}
        <div className="lg:col-span-1 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm dark:bg-darkCard dark:border-darkBorder flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Database className="h-4.5 w-4.5 text-indigo-500" />
              System Backup & Restore
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Database tools are restricted to administrator privileges. Safeguard academic logs by exporting backups regularly.
            </p>

            {isAdmin() ? (
              <div className="space-y-6">
                
                {/* Backup block */}
                <div className="p-4 border border-dashed border-indigo-150 bg-indigo-50/10 rounded-2xl dark:border-indigo-900/30">
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">Backup MySQL Schema</h5>
                  <p className="mt-1 text-[10px] text-slate-400">Download a full SQL dump including students, attendance and marks.</p>
                  <button
                    onClick={handleBackup}
                    disabled={backingUp}
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                  >
                    {backingUp ? <Spinner size="sm" /> : <Download className="h-3.5 w-3.5" />}
                    Download Backup SQL
                  </button>
                </div>

                {/* Restore block */}
                <form onSubmit={handleRestore} className="p-4 border border-dashed border-slate-200 bg-slate-50/30 rounded-2xl dark:border-darkBorder">
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">Restore Database</h5>
                  <p className="mt-1 text-[10px] text-slate-400">Upload a previously exported SQL script to replace current data.</p>
                  <div className="mt-3">
                    <input
                      type="file"
                      accept=".sql"
                      onChange={handleRestoreFileChange}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 dark:file:bg-slate-800 dark:file:text-slate-300 cursor-pointer"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={restoring || !restoreFile}
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                  >
                    {restoring ? <Spinner size="sm" /> : <Upload className="h-3.5 w-3.5" />}
                    Upload & Restore
                  </button>
                </form>

              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 border rounded-2xl bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400">
                <Shield className="h-5 w-5 shrink-0" />
                <p className="text-[10px] font-semibold">Database recovery options are locked. Contact administrative users to run backups.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
