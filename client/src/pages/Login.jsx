import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import API from '../services/api.js';
import toast from 'react-hot-toast';
import { LogIn, Mail, Lock, ShieldCheck, UserCheck, Eye, X } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/login', data);
      const { token, user } = res.data.data;
      login(user, token);
      toast.success(`Welcome back, ${user.firstName}!`);
      navigate('/dashboard');
    } catch (error) {
      console.error('[LOGIN ERROR]', error);
      const msg = error.response?.data?.message || error.message || 'Login failed. Please check your credentials or backend server.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (email, password) => {
    setValue('email', email);
    setValue('password', password);
    onSubmit({ email, password });
  };

  return (
    <div>
      <h3 className="text-lg sm:text-xl font-bold text-white text-center mb-6">Sign In to Your Account</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Official Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="email"
              {...register('email', { required: 'Email address is required' })}
              placeholder="e.g. admin@gov.in"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 text-white text-xs sm:text-sm rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden transition-all"
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="password"
              {...register('password', { required: 'Password is required' })}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 text-white text-xs sm:text-sm rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden transition-all"
            />
          </div>
          {errors.password && <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <label className="flex items-center text-slate-400 cursor-pointer">
            <input type="checkbox" className="rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-900 mr-2" defaultChecked />
            Remember session
          </label>
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-blue-400 hover:text-blue-300 font-medium text-left sm:text-right cursor-pointer"
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <span>Authenticating...</span>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </>
          )}
        </button>
      </form>

      {/* Quick Demo Login Preset Buttons */}
      <div className="mt-6 sm:mt-8 pt-6 border-t border-slate-700/80">
        <p className="text-xs font-semibold text-slate-400 text-center mb-3">Quick Demo Logins (Click to autofill & sign in)</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin('admin@gov.in', 'Admin@123')}
            className="w-full px-2.5 py-2 bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-600 flex items-center justify-center space-x-1 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>State Admin</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('district.user@gov.in', 'Admin@123')}
            className="w-full px-2.5 py-2 bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-600 flex items-center justify-center space-x-1 transition-all cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>District User</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('viewer@gov.in', 'Admin@123')}
            className="w-full px-2.5 py-2 bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-600 flex items-center justify-center space-x-1 transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Viewer</span>
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 w-[calc(100%-2rem)] max-w-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-base font-bold text-white">Password Recovery</h4>
              <button onClick={() => setShowForgotPassword(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              For security compliance, password resets require Administrator authorization. Please contact your State System Administrator or email support@gov.in.
            </p>
            <button
              onClick={() => setShowForgotPassword(false)}
              className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
