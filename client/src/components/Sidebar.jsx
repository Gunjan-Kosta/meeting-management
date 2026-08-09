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
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();

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
      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity duration-300"
        ></div>
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 text-slate-100 flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-slate-800 shadow-2xl lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Header Seal with Close Button */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg text-white shrink-0">
                <Landmark className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base font-bold tracking-tight text-white leading-tight truncate">Meeting Management</h1>
                <p className="text-xs text-blue-400 font-medium">Enterprise Portal</p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 lg:hidden shrink-0 cursor-pointer"
              title="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Info Bar */}
          {user && (
            <div className="p-3.5 mx-3 my-3 bg-slate-800/80 rounded-xl border border-slate-700/60 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-inner shrink-0 text-sm">
                  {user.firstName ? user.firstName[0] : 'U'}
                </div>
                <div className="overflow-hidden min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{user.firstName} {user.lastName}</p>
                  <span className="inline-block mt-0.5 px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase bg-blue-900/60 text-blue-300 rounded border border-blue-700/50 truncate max-w-full">
                    {user.role?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="px-3 space-y-1.5 flex-1">
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
                      `flex items-center space-x-3 px-3.5 py-3 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </NavLink>
                );
              })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 border-t border-slate-800 shrink-0">
          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
