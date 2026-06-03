import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800/50 dark:text-emerald-300',
    error: 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-800/50 dark:text-rose-300',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-800/50 dark:text-blue-300',
  };

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
    error: <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />,
    info: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
  };

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 border rounded-xl shadow-lg glass animate-slide-in ${styles[type]} max-w-sm`}>
      {icons[type]}
      <p className="text-sm font-medium pr-4">{message}</p>
      <button 
        onClick={onClose} 
        className="ml-auto p-1 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
