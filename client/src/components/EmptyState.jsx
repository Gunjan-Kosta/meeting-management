import React from 'react';
import { FolderOpen } from 'lucide-react';

export default function EmptyState({ title = 'No data found', description = 'There are no records matching your criteria.', actionText, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center shadow-sm">
      <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-400 dark:text-slate-300">
        <FolderOpen className="w-10 h-10" />
      </div>
      <h4 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">{title}</h4>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
