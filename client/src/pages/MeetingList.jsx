import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Badge from '../components/Badge.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import toast from 'react-hot-toast';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Send,
  CheckCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Calendar as CalendarIcon,
} from 'lucide-react';

export default function MeetingList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { canCreateMeeting, canEditMeeting, canSubmitMeeting, canCloseMeeting, canDeleteMeeting } = useAuth();

  const [meetings, setMeetings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [meetingType, setMeetingType] = useState(searchParams.get('meetingType') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [district, setDistrict] = useState(searchParams.get('district') || '');
  const [year, setYear] = useState(searchParams.get('year') || '');
  const [month, setMonth] = useState(searchParams.get('month') || '');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [page, setPage] = useState(1);

  // Modals
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        search,
        meetingType: meetingType || undefined,
        status: status || undefined,
        district: district || undefined,
        year: year || undefined,
        month: month || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      const res = await API.get('/meetings', { params });
      setMeetings(res.data.data.meetings);
      setPagination(res.data.data.pagination);
    } catch (error) {
      toast.error('Failed to load meetings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [page, meetingType, status, district, year, month, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMeetings();
  };

  const handleClearFilters = () => {
    setSearch('');
    setMeetingType('');
    setStatus('');
    setDistrict('');
    setYear('');
    setMonth('');
    setStartDate('');
    setEndDate('');
    setPage(1);
    setSearchParams({});
  };

  const handleDeleteMeeting = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await API.delete(`/meetings/${deleteId}`);
      toast.success('Meeting deleted successfully.');
      setDeleteId(null);
      fetchMeetings();
    } catch (err) {
      toast.error('Failed to delete meeting record.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSubmitMeeting = async (id) => {
    try {
      await API.patch(`/meetings/${id}/submit`);
      toast.success('Meeting submitted successfully.');
      fetchMeetings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit meeting.');
    }
  };

  const handleCloseMeeting = async (id) => {
    try {
      await API.patch(`/meetings/${id}/close`);
      toast.success('Meeting marked as CLOSED.');
      fetchMeetings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to close meeting.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Meetings Records</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Search, filter, manage, and monitor state level meetings.</p>
        </div>
        {canCreateMeeting && (
          <button
            onClick={() => navigate('/meetings/new')}
            className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm rounded-lg shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Meeting</span>
          </button>
        )}
      </div>

      {/* Filter and Search Drawer */}
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by code, title, venue, or district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700/60 text-slate-900 dark:text-white text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 dark:bg-slate-700 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            Search
          </button>
        </form>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-700/60">
          <select
            value={meetingType}
            onChange={(e) => { setMeetingType(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700/60 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-600"
          >
            <option value="">All Meeting Types</option>
            <option value="DISTRICT_LEVEL">District Level Meeting</option>
            <option value="SANSAD">Sansad Meeting</option>
            <option value="RAJYA_SADAK_SURAKSHA">Rajya Sadak Suraksha Parishad</option>
            <option value="SAMIKSHA_BAITHAK">Samiksha Baithak</option>
            <option value="MANTRI_PARISHAD">Mantri Parishad Meeting</option>
          </select>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700/60 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-600"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="CLOSED">Closed</option>
          </select>

          <input
            type="text"
            placeholder="Filter District..."
            value={district}
            onChange={(e) => { setDistrict(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700/60 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-600"
          />

          <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-700/60 rounded-lg border border-slate-200 dark:border-slate-600 px-2.5 py-1.5">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="w-full text-xs bg-transparent text-slate-800 dark:text-slate-200 focus:outline-hidden"
              title="Meeting Start Date"
            />
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-700/60 rounded-lg border border-slate-200 dark:border-slate-600 px-2.5 py-1.5">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="w-full text-xs bg-transparent text-slate-800 dark:text-slate-200 focus:outline-hidden"
              title="Meeting End Date"
            />
          </div>

          <select
            value={year}
            onChange={(e) => { setYear(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700/60 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-600"
          >
            <option value="">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>

          <button
            type="button"
            onClick={handleClearFilters}
            className="w-full px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center space-x-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Meetings Data Table Container */}
      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : meetings.length === 0 ? (
        <EmptyState
          title="No meetings found"
          description="Try modifying your search query or filter settings."
          actionText={canCreateMeeting ? "Create Meeting" : null}
          onAction={canCreateMeeting ? () => navigate('/meetings/new') : null}
        />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 whitespace-nowrap">Code</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Title & Type</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Date & Venue</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">District</th>
                  <th className="py-3.5 px-4 whitespace-nowrap text-center">Attendees</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Created By</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Created Date</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3.5 px-4 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-xs sm:text-sm">
                {meetings.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400 text-xs whitespace-nowrap">
                      {m.meetingCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">{m.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{m.meetingType?.replace(/_/g, ' ')}</p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5 text-xs text-slate-700 dark:text-slate-300">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{new Date(m.meetingDate).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">{m.venue}</p>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300 text-xs whitespace-nowrap">
                      {m.district}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300 text-center whitespace-nowrap">
                      <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-700/80 rounded-full border border-slate-200 dark:border-slate-600">
                        {m._count?.participants || 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {m.creator ? `${m.creator.firstName} ${m.creator.lastName}` : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge status={m.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => navigate(`/meetings/${m.id}`)}
                          title="View Details"
                          className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {canEditMeeting(m.status) && (
                          <button
                            onClick={() => navigate(`/meetings/edit/${m.id}`)}
                            title="Edit Meeting"
                            className="p-1.5 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}

                        {canSubmitMeeting(m.status) && (
                          <button
                            onClick={() => handleSubmitMeeting(m.id)}
                            title="Submit Meeting"
                            className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}

                        {canCloseMeeting && m.status === 'SUBMITTED' && (
                          <button
                            onClick={() => handleCloseMeeting(m.id)}
                            title="Close Meeting"
                            className="p-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {canDeleteMeeting && (
                          <button
                            onClick={() => setDeleteId(m.id)}
                            title="Delete Meeting"
                            className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-4 sm:px-6 py-3.5 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
              Showing page <strong className="text-slate-900 dark:text-white">{pagination.page}</strong> of{' '}
              <strong className="text-slate-900 dark:text-white">{pagination.totalPages}</strong> ({pagination.total} records)
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPage((prev) => prev - 1)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((prev) => prev + 1)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteMeeting}
        title="Delete Meeting Record"
        message="Are you sure you want to permanently delete this meeting? All uploaded documents and action items will also be removed."
        danger={true}
        loading={deleteLoading}
      />
    </div>
  );
}
