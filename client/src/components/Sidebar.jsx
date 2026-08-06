import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  FileBarChart,
  ShieldCheck,
  Building2,
  Users,
  User,
  LogOut,
  Landmark,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout, isStateAdmin } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['STATE_ADMIN', 'DISTRICT_USER', 'VIEWER'] },
    { name: 'Meetings Record', path: '/meetings', icon: Calendar, roles: ['STATE_ADMIN', 'DISTRICT_USER', 'VIEWER'] },
    { name: 'Action Tracker', path: '/actions', icon: CheckSquare, roles: ['STATE_ADMIN', 'DISTRICT_USER', 'VIEWER'] },
    { name: 'Reports', path: '/reports', icon: FileBarChart, roles: ['STATE_ADMIN', 'DISTRICT_USER', 'VIEWER'] },
    { name: 'Audit Logs', path: '/audit-logs', icon: ShieldCheck, roles: ['STATE_ADMIN'] },
    { name: 'Departments', path: '/departments', icon: Building2, roles: ['STATE_ADMIN'] },
    { name: 'Users Management', path: '/users', icon: Users, roles: ['STATE_ADMIN'] },
    { name: 'My Profile', path: '/profile', icon: User, roles: ['STATE_ADMIN', 'DISTRICT_USER', 'VIEWER'] },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        ></div>
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-slate-900 text-slate-100 flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Header Seal */}
          <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg text-white">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white leading-tight">Meeting Management</h1>
              <p className="text-xs text-blue-400 font-medium">Enterprise Portal</p>
            </div>
          </div>

          {/* User Info Bar */}
          {user && (
            <div className="p-4 mx-3 my-4 bg-slate-800/80 rounded-xl border border-slate-700/60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-inner">
                  {user.firstName ? user.firstName[0] : 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-white truncate">{user.firstName} {user.lastName}</p>
                  <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-blue-900/60 text-blue-300 rounded border border-blue-700/50">
                    {user.role?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {navItems
              .filter((item) => item.roles.includes(user?.role))
              .map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
