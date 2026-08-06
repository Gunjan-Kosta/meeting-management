import React, { useState, useEffect } from 'react';
import API from '../services/api.js';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import Badge from '../components/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { canCreateMeeting } = useAuth();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get('/dashboard/stats');
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSkeleton type="cards" count={6} />;

  const { cards, charts, recentActivities, upcomingDeadlines } = data || {};

  const cardItems = [
    { title: 'Total Meetings', value: cards?.totalMeetings || 0, icon: Calendar, color: 'text-blue-600 bg-blue-100 dark:bg-blue-950 dark:text-blue-400' },
    { title: 'Pending Meetings', value: cards?.pendingMeetings || 0, icon: Clock, color: 'text-amber-600 bg-amber-100 dark:bg-amber-950 dark:text-amber-400' },
    { title: 'Completed Meetings', value: cards?.completedMeetings || 0, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400' },
    { title: 'Pending Action Items', value: cards?.pendingActionItems || 0, icon: AlertCircle, color: 'text-rose-600 bg-rose-100 dark:bg-rose-950 dark:text-rose-400' },
    { title: 'Completed Action Items', value: cards?.completedActionItems || 0, icon: CheckCircle2, color: 'text-teal-600 bg-teal-100 dark:bg-teal-950 dark:text-teal-400' },
    { title: 'Departments Count', value: cards?.departmentCount || 0, icon: Building2, color: 'text-purple-600 bg-purple-100 dark:bg-purple-950 dark:text-purple-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Overview of state meetings, compliance tracking, and department actions.</p>
        </div>
        {canCreateMeeting && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/meetings/new')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition-all flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Create New Meeting</span>
            </button>
          </div>
        )}
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cardItems.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{c.title}</p>
                  <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{c.value}</h3>
                </div>
                <div className={`p-3.5 rounded-xl ${c.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Meetings Trend */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Monthly Meetings Volume</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total meetings conducted throughout the year</p>
            </div>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.monthlyMeetings || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Meeting Type Distribution */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Meeting Type Distribution</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Breakdown by official meeting category</p>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.meetingTypeDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="type"
                >
                  {(charts?.meetingTypeDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, name?.replace(/_/g, ' ')]}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Activities & Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Audit Activities */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent System Activities</h3>
            <button onClick={() => navigate('/audit-logs')} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {recentActivities?.length === 0 ? (
              <p className="py-4 text-xs text-slate-500">No recent activities recorded.</p>
            ) : (
              recentActivities?.slice(0, 5).map((log) => (
                <div key={log.id} className="py-3 flex items-start space-x-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 mt-0.5">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">{log.details}</p>
                    <div className="flex items-center space-x-2 mt-0.5 text-[10px] text-slate-500">
                      <span>{log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}</span>
                      <span>•</span>
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Action Deadlines */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Upcoming Action Item Deadlines</h3>
            <button onClick={() => navigate('/actions')} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1">
              <span>Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {upcomingDeadlines?.length === 0 ? (
              <p className="py-4 text-xs text-slate-500">No pending action deadlines.</p>
            ) : (
              upcomingDeadlines?.map((action) => (
                <div key={action.id} className="py-3 flex items-center justify-between">
                  <div className="min-w-0 pr-4">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{action.title}</p>
                    <p className="text-[11px] text-slate-500 truncate">{action.meeting?.title} • {action.assignedDepartment?.name}</p>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                      {new Date(action.targetDate).toLocaleDateString()}
                    </span>
                    <div className="mt-0.5">
                      <Badge status={action.status} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
