import React, { useState, useEffect } from 'react';
import API from '../services/api.js';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import toast from 'react-hot-toast';
import { ShieldCheck, User, Clock, Terminal } from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await API.get('/audit-logs', {
        params: {
          action: actionFilter || undefined,
          limit: 30,
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">System Audit Logs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Immutable trail of meeting creation, status changes, document uploads, and logins.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center space-x-4">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-600"
        >
          <option value="">All Action Types</option>
          <option value="MEETING_CREATED">Meeting Created</option>
          <option value="MEETING_SUBMITTED">Meeting Submitted</option>
          <option value="MEETING_CLOSED">Meeting Closed</option>
          <option value="DOCUMENT_UPLOADED">Document Uploaded</option>
          <option value="MOM_UPLOADED">MoM Uploaded</option>
          <option value="ACTION_ITEM_CREATED">Action Item Created</option>
          <option value="ACTION_ITEM_COMPLETED">Action Item Completed</option>
          <option value="USER_LOGIN">User Login</option>
        </select>
      </div>

      {/* Audit Log Table */}
      {loading ? (
        <LoadingSkeleton type="table" count={6} />
      ) : logs.length === 0 ? (
        <EmptyState title="No audit logs recorded" description="No activity logs match the selected filter." />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Details</th>
                <th className="py-3.5 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-xs font-mono">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40">
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-sans font-semibold text-slate-900 dark:text-white">
                    {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-700 dark:text-slate-300">
                    {log.details}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
