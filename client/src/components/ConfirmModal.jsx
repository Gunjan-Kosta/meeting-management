import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', danger = false, loading = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-[calc(100%-2rem)] max-w-md max-h-[90vh] overflow-y-auto transform transition-all">
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div className={`p-3 rounded-full shrink-0 ${danger ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'}`}>
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{message}</p>
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row items-center sm:justify-end gap-2.5 sm:gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-white rounded-lg transition-colors shadow-xs ${
                danger
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500/50'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/50'
              } disabled:opacity-50 cursor-pointer`}
            >
              {loading ? 'Processing...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
