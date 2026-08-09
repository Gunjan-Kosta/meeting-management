import React, { useState, useEffect } from 'react';
import API from '../services/api.js';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import toast from 'react-hot-toast';
import {
  ShieldCheck,
  User,
  Clock,
  Terminal,
  LayoutGrid,
  List,
  Calendar,
  FileText,
  CheckCircle2,
  Lock,
  Search,
  Activity,
  Globe,
} from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await API.get('/audit-logs', {
        params: {
          action: actionFilter || undefined,
          limit: 100,
        },
      });
      setLogs(res.data.data.logs);
    } catch (err) {
      toast.error('Failed to load system audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [actionFilter]);

  // Filter logs by search query
  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const userName = log.user ? `${log.user.firstName} ${log.user.lastName}`.toLowerCase() : 'system';
    return (
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      userName.includes(q) ||
      (log.ipAddress && log.ipAddress.toLowerCase().includes(q))
    );
  });

  // Categorize logs into 4 Kanban Columns
  const kanbanColumns = [
    {
      id: 'auth',
      title: 'Security & Auth',
      icon: Lock,
      color: 'amber',
      headerBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      badgeBg: 'bg-amber-500/20 text-amber-400',
      actions: ['USER_LOGIN', 'USER_LOGOUT', 'PASSWORD_CHANGED', 'USER_CREATED', 'USER_UPDATED', 'USER_DELETED'],
    },
    {
      id: 'meetings',
      title: 'Meetings Lifecycle',
      icon: Calendar,
      color: 'blue',
      headerBg: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      badgeBg: 'bg-blue-500/20 text-blue-400',
      actions: ['MEETING_CREATED', 'MEETING_UPDATED', 'MEETING_SUBMITTED', 'MEETING_CLOSED', 'MEETING_DELETED', 'MEETING_TEST_VERIFIED'],
    },
    {
      id: 'documents',
      title: 'Documents & MoM',
      icon: FileText,
      color: 'emerald',
      headerBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      badgeBg: 'bg-emerald-500/20 text-emerald-400',
      actions: ['MOM_UPLOADED', 'DOCUMENT_UPLOADED', 'DOCUMENT_DELETED'],
    },
    {
      id: 'actions',
      title: 'Actions & Compliance',
      icon: CheckCircle2,
      color: 'indigo',
      headerBg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      badgeBg: 'bg-indigo-500/20 text-indigo-400',
      actions: ['ACTION_ITEM_CREATED', 'ACTION_ITEM_UPDATED', 'ACTION_ITEM_COMPLETED', 'DEPARTMENT_CREATED', 'DEPARTMENT_UPDATED', 'DEPARTMENT_DELETED'],
    },
  ];

  const getLogColumn = (action) => {
    for (const col of kanbanColumns) {
      if (col.actions.includes(action)) return col.id;
    }
    return 'meetings'; // Fallback
  };

  const getActionBadgeColor = (action) => {
    if (action.includes('CREATED') || action.includes('UPLOADED')) {
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
    if (action.includes('SUBMITTED') || action.includes('CLOSED') || action.includes('COMPLETED')) {
      return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    }
    if (action.includes('LOGIN') || action.includes('AUTH')) {
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
    if (action.includes('DELETED')) {
      return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    }
    return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2.5">
            <Activity className="w-6 h-6 text-blue-500 shrink-0" />
            <span>System Audit Trail</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time visual activity feed of user logins, meeting records, document submissions, and compliance tracking.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800 self-start sm:self-auto shrink-0">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              viewMode === 'kanban'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Table View</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800/90 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px] sm:min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search audit trail by user, keyword, action, or IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Action Types</option>
            <option value="USER_LOGIN">User Login</option>
            <option value="MEETING_CREATED">Meeting Created</option>
            <option value="MEETING_SUBMITTED">Meeting Submitted</option>
            <option value="MEETING_CLOSED">Meeting Closed</option>
            <option value="DOCUMENT_UPLOADED">Document Uploaded</option>
            <option value="MOM_UPLOADED">MoM Uploaded</option>
            <option value="ACTION_ITEM_CREATED">Action Item Created</option>
            <option value="ACTION_ITEM_COMPLETED">Action Item Completed</option>
          </select>
        </div>

        <span className="text-xs font-medium text-slate-400">
          Showing <strong className="text-slate-900 dark:text-white">{filteredLogs.length}</strong> recorded event{filteredLogs.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <LoadingSkeleton type="table" count={6} />
      ) : filteredLogs.length === 0 ? (
        <EmptyState title="No audit logs recorded" description="No activity logs match the selected filter or search keyword." />
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {kanbanColumns.map((col) => {
            const colLogs = filteredLogs.filter((log) => getLogColumn(log.action) === col.id);
            const Icon = col.icon;
            return (
              <div
                key={col.id}
                className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-4 space-y-4 shadow-lg backdrop-blur-xs flex flex-col max-h-[78vh]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-lg border ${col.headerBg}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-200 tracking-wide uppercase">{col.title}</h3>
                  </div>
                  <span className={`px-2 py-0.5 text-[11px] font-mono font-bold rounded-full ${col.badgeBg}`}>
                    {colLogs.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 overflow-y-auto pr-1 flex-1 scrollbar-thin scrollbar-thumb-slate-700">
                  {colLogs.length === 0 ? (
                    <div className="py-8 text-center border border-dashed border-slate-800/80 rounded-xl text-slate-500 text-xs">
                      No logs in this category
                    </div>
                  ) : (
                    colLogs.map((log) => (
                      <div
                        key={log.id}
                        className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700/70 hover:border-blue-500/50 rounded-xl p-3.5 space-y-2.5 transition-all shadow-xs hover:shadow-md group"
                      >
                        {/* Card Top: Action Badge & Time */}
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${getActionBadgeColor(log.action)}`}>
                            {log.action}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-slate-500 inline" />
                            <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </span>
                        </div>

                        {/* Card Details Text */}
                        <p className="text-xs text-slate-200 font-sans leading-relaxed group-hover:text-white transition-colors">
                          {log.details}
                        </p>

                        {/* Card Footer: User & IP */}
                        <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                          <div className="flex items-center space-x-1.5 min-w-0">
                            <div className="w-5 h-5 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {log.user ? log.user.firstName.charAt(0) : 'S'}
                            </div>
                            <span className="font-semibold text-slate-300 truncate">
                              {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1 font-mono text-[10px] text-slate-500 shrink-0">
                            <Globe className="w-3 h-3" />
                            <span>{log.ipAddress || '::1'}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW (RESPONSIVE HORIZONTAL SCROLL) */
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[170px]">Timestamp</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[150px]">User</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[160px]">Action</th>
                  <th className="py-3.5 px-4 min-w-[220px]">Details</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[100px]">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-xs font-mono">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40">
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-sans font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded font-bold border ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-700 dark:text-slate-300">
                      {log.details}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {log.ipAddress || '::1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
