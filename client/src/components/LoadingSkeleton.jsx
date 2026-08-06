import React from 'react';

export default function LoadingSkeleton({ type = 'table', count = 5 }) {
  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className="space-y-6 animate-pulse p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
        <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
      <div className="h-12 bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600"></div>
      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="h-14 px-6 py-4 bg-white dark:bg-slate-800 flex items-center justify-between">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/6"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
