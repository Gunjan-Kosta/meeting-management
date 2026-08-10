import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionFilter, setActionFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'

  // Server-side pagination state
  const [page, setPage] = useState(1);
  const [kanbanPage, setKanbanPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const tablePageSize = 15;
  const kanbanPageSize = 24;

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
      setKanbanPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset pagination when action filter changes
  useEffect(() => {
    setPage(1);
    setKanbanPage(1);
  }, [actionFilter]);

  // Fetch Audit Logs from Backend
  const fetchAuditLogs = useCallback(
    async (targetPage = 1, isAppend = false) => {
      if (isAppend) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const currentLimit = viewMode === 'kanban' ? kanbanPageSize : tablePageSize;
        const res = await API.get('/audit-logs', {
          params: {
            action: actionFilter || undefined,
            search: debouncedSearch || undefined,
            page: targetPage,
            limit: currentLimit,
          },
        });

        const data = res.data.data;
        const newLogs = data.logs || [];
        const pag = data.pagination || {
          total: newLogs.length,
          page: targetPage,
          limit: currentLimit,
          totalPages: Math.ceil(newLogs.length / currentLimit) || 1,
          hasNextPage: false,
          hasPrevPage: targetPage > 1,
        };

        if (isAppend) {
          setLogs((prev) => {
            // Filter out any duplicate IDs just in case
            const existingIds = new Set(prev.map((l) => l.id));
            const uniqueAdditions = newLogs.filter((l) => !existingIds.has(l.id));
            return [...prev, ...uniqueAdditions];
          });
        } else {
          setLogs(newLogs);
        }

        setPagination(pag);
      } catch (err) {
        toast.error('Failed to load system audit logs.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [actionFilter, debouncedSearch, viewMode]
  );

  // Trigger fetch when parameters or view mode change
  useEffect(() => {
    if (viewMode === 'table') {
      fetchAuditLogs(page, false);
    } else {
      fetchAuditLogs(1, false);
      setKanbanPage(1);
    }
  }, [fetchAuditLogs, page, viewMode]);

  // Load More handler for Kanban View
  const handleLoadMoreKanban = () => {
    if (pagination.hasNextPage && !loadingMore) {
      const nextPage = kanbanPage + 1;
      setKanbanPage(nextPage);
      fetchAuditLogs(nextPage, true);
    }
  };

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
          {viewMode === 'table' ? (
            <>
              Showing{' '}
              <strong className="text-slate-900 dark:text-white">
                {pagination.total > 0 ? (page - 1) * tablePageSize + 1 : 0} -{' '}
                {Math.min(page * tablePageSize, pagination.total)}
              </strong>{' '}
              of <strong className="text-slate-900 dark:text-white">{pagination.total}</strong> recorded event
              {pagination.total !== 1 ? 's' : ''}
            </>
          ) : (
            <>
              Loaded{' '}
              <strong className="text-slate-900 dark:text-white">{logs.length}</strong> of{' '}
              <strong className="text-slate-900 dark:text-white">{pagination.total}</strong> recorded event
              {pagination.total !== 1 ? 's' : ''}
            </>
          )}
        </span>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <LoadingSkeleton type="table" count={6} />
      ) : logs.length === 0 ? (
        <EmptyState
          title="No audit logs recorded"
          description="No activity logs match the selected filter or search keyword."
        />
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD VIEW */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
            {kanbanColumns.map((col) => {
              const colLogs = logs.filter((log) => getLogColumn(log.action) === col.id);
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
                            <span
                              className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${getActionBadgeColor(
                                log.action
                              )}`}
                            >
                              {log.action}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-slate-500 inline" />
                              <span>
                                {new Date(log.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
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

          {/* Kanban Load More Footer */}
          {pagination.hasNextPage && (
            <div className="flex justify-center pt-2">
              <button
                onClick={handleLoadMoreKanban}
                disabled={loadingMore}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 hover:border-slate-600 text-xs font-semibold flex items-center space-x-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    <span>Loading more activities...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                    <span>Load More Activities ({logs.length} of {pagination.total})</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* TABLE VIEW (RESPONSIVE HORIZONTAL SCROLL WITH PAGINATION) */
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden flex flex-col">
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
                {logs.map((log) => (
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

          {/* Table Pagination Controls */}
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-500 dark:text-slate-400 font-medium">
              Page <span className="font-bold text-slate-900 dark:text-white">{pagination.page}</span> of{' '}
              <span className="font-bold text-slate-900 dark:text-white">{pagination.totalPages}</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage || loading}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold flex items-center space-x-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <div className="hidden sm:flex items-center space-x-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    // Show current page, first, last, and neighbours
                    return (
                      p === 1 ||
                      p === pagination.totalPages ||
                      Math.abs(p - pagination.page) <= 1
                    );
                  })
                  .map((p, idx, arr) => {
                    const prevP = arr[idx - 1];
                    const isEllipsis = prevP && p - prevP > 1;
                    return (
                      <React.Fragment key={p}>
                        {isEllipsis && <span className="px-1 text-slate-400">...</span>}
                        <button
                          onClick={() => setPage(p)}
                          className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            pagination.page === p
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={!pagination.hasNextPage || loading}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold flex items-center space-x-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
