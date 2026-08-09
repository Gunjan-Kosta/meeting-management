import React, { useState, useEffect } from 'react';
import API from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Badge from '../components/Badge.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import toast from 'react-hot-toast';
import { CheckSquare, Calendar, Building, CheckCircle2, Clock, MessageSquare } from 'lucide-react';

export default function ActionTracker() {
  const { user } = useAuth();
  const [actions, setActions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Remarks update state
  const [editingRemarksId, setEditingRemarksId] = useState(null);
  const [remarksInput, setRemarksInput] = useState('');

  const fetchActions = async () => {
    setLoading(true);
    try {
      const res = await API.get('/actions', {
        params: {
          status: statusFilter || undefined,
          departmentId: departmentFilter || undefined,
        },
      });
      setActions(res.data.data.actionItems);
    } catch (err) {
      toast.error('Failed to load action items.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await API.get('/departments');
      setDepartments(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchActions();
  }, [statusFilter, departmentFilter]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleUpdateStatus = async (id, newStatus, currentRemarks) => {
    try {
      await API.put(`/actions/${id}`, {
        status: newStatus,
        remarks: currentRemarks,
      });
      toast.success(`Action status updated to ${newStatus.replace('_', ' ')}`);
      fetchActions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update action status.');
    }
  };

  const handleSaveRemarks = async (id, currentStatus) => {
    try {
      await API.put(`/actions/${id}`, {
        status: currentStatus,
        remarks: remarksInput,
      });
      toast.success('Remarks updated.');
      setEditingRemarksId(null);
      fetchActions();
    } catch (err) {
      toast.error('Failed to update remarks.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Compliance Action Tracker</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Track department commitments, update progress, and log remarks.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-600"
        >
          <option value="">All Statuses (Pending, In Progress, Completed)</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-600"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
          ))}
        </select>
      </div>

      {/* Action Items List */}
      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : actions.length === 0 ? (
        <EmptyState title="No action items found" description="There are no action items matching the selected filters." />
      ) : (
        <div className="space-y-4">
          {actions.map((action) => (
            <div
              key={action.id}
              className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">{action.title}</h3>
                    <Badge status={action.status} />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{action.description}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 pt-1">
                    <span>Meeting: <strong className="text-slate-700 dark:text-slate-300">{action.meeting?.title}</strong></span>
                    <span>•</span>
                    <span>Department: <strong className="text-slate-700 dark:text-slate-300">{action.assignedDepartment?.name}</strong></span>
                    <span>•</span>
                    <span className="text-rose-600 dark:text-rose-400 font-semibold">
                      Target: {new Date(action.targetDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Status Action buttons */}
                {user?.role !== 'VIEWER' && action.status !== 'COMPLETED' && (
                  <div className="flex items-center space-x-2 shrink-0 self-start md:self-auto">
                    {action.status === 'PENDING' && (
                      <button
                        onClick={() => handleUpdateStatus(action.id, 'IN_PROGRESS', action.remarks)}
                        className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Start Progress
                      </button>
                    )}
                    <button
                      onClick={() => handleUpdateStatus(action.id, 'COMPLETED', action.remarks)}
                      className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      Mark Completed
                    </button>
                  </div>
                )}
              </div>

              {/* Remarks Section */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-2 text-slate-500 w-full min-w-0">
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  {editingRemarksId === action.id ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                      <input
                        type="text"
                        value={remarksInput}
                        onChange={(e) => setRemarksInput(e.target.value)}
                        placeholder="Add progress remarks..."
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs"
                      />
                      <button
                        onClick={() => handleSaveRemarks(action.id, action.status)}
                        className="px-3 py-1.5 bg-blue-600 text-white font-semibold rounded-lg text-xs cursor-pointer shrink-0"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <span className="italic truncate">
                      {action.remarks ? `Remarks: "${action.remarks}"` : 'No remarks logged yet.'}
                    </span>
                  )}
                </div>

                {user?.role !== 'VIEWER' && action.status !== 'COMPLETED' && editingRemarksId !== action.id && (
                  <button
                    onClick={() => {
                      setEditingRemarksId(action.id);
                      setRemarksInput(action.remarks || '');
                    }}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0 self-end sm:self-auto cursor-pointer"
                  >
                    Edit Remarks
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
