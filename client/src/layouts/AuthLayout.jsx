import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Landmark } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-8 sm:py-12 px-3 sm:px-6 lg:px-8 relative overflow-hidden max-w-full">
      <Toaster position="top-right" />
      
      {/* Background Decorative Gradient Spheres */}
      <div className="absolute top-0 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center p-3 sm:p-3.5 bg-blue-600 rounded-2xl shadow-xl shadow-blue-600/30 text-white mb-3 sm:mb-4">
          <Landmark className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Meeting Management System</h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">Enterprise Government Administration Portal</p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 w-full">
        <div className="bg-slate-800/90 backdrop-blur-md py-6 sm:py-8 px-4 sm:px-10 shadow-2xl rounded-2xl border border-slate-700/80">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
