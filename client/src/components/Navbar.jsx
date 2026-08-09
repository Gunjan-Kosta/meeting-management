import React, { useState } from 'react';
import { Menu, Search, Bell, MapPin, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onToggleSidebar }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/meetings?search=${encodeURIComponent(searchTerm.trim())}`);
      setShowMobileSearch(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-3 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs">
      {/* Mobile Search Overlay Input */}
      {showMobileSearch ? (
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center space-x-2 animate-fadeIn">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search meetings by code, title, venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 dark:bg-slate-700/80 text-slate-900 dark:text-white rounded-lg border-0 focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowMobileSearch(false)}
            className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </form>
      ) : (
        <>
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
            {/* Hamburger Toggle Button */}
            <button
              onClick={onToggleSidebar}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 lg:hidden focus:outline-hidden rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer shrink-0"
              title="Open Navigation Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Mobile Header Title */}
            <div className="lg:hidden min-w-0">
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate block">
                Meeting Management
              </span>
            </div>

            {/* Desktop Global Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-64 lg:w-96">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Global search by meeting code, title, or venue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-100 dark:bg-slate-700/60 text-slate-900 dark:text-white rounded-lg border-0 focus:ring-2 focus:ring-blue-500/50 outline-hidden transition-all"
              />
            </form>
          </div>

          {/* Right User Controls Bar */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Mobile Search Button Toggle */}
            <button
              onClick={() => setShowMobileSearch(true)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 md:hidden"
              title="Search Meetings"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* District Scope Badge */}
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 rounded-lg text-blue-700 dark:text-blue-300 text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[120px] lg:max-w-none">{user?.district || 'State HQ'}</span>
            </div>

            {/* System Notifications Bell */}
            <button
              onClick={() => navigate('/actions')}
              title="Upcoming Deadlines & Action Items"
              className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full animate-ping"></span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full"></span>
            </button>

            {/* User Profile Avatar & Badge */}
            <div
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-2 border-l border-slate-200 dark:border-slate-700 pl-2.5 sm:pl-3.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                {user?.firstName ? user.firstName[0] : 'U'}
              </div>
              <div className="hidden md:block text-left min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight truncate max-w-[110px] lg:max-w-none">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
