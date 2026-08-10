import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API, { getFileUrl } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Badge from '../components/Badge.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  User,
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  Plus,
  CheckCircle2,
  Clock,
  Building2,
  X,
  ExternalLink,
  Send,
  Edit,
  Lock,
  RotateCcw,
  History,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

export default function MeetingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    user,
    isViewer,
    canUploadMom,
    canAddActionItem,
    canEditMeeting,
    canCloseMeeting,
    canReopenMeeting,
    canSubmitMeeting,
    canDeleteMeeting,
  } = useAuth();

  const [meeting, setMeeting] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Meeting Activity / Audit Logs
  const [meetingLogs, setMeetingLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Document Upload Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docCategory, setDocCategory] = useState('MOM');
  const [docFile, setDocFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Document Viewer Modal
  const [previewDoc, setPreviewDoc] = useState(null);

  // Action Item Modal
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionTitle, setActionTitle] = useState('');
  const [actionDesc, setActionDesc] = useState('');
  const [assignedDeptId, setAssignedDeptId] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [creatingAction, setCreatingAction] = useState(false);

  // Status Action Remarks Modal
  const [statusModalAction, setStatusModalAction] = useState(null);
  const [newStatus, setNewStatus] = useState('IN_PROGRESS');
  const [remarks, setRemarks] = useState('');

  // Edit Meeting Modal
  const [showEditMeetingModal, setShowEditMeetingModal] = useState(false);
  const [editMeetingData, setEditMeetingData] = useState({});
  const [savingMeeting, setSavingMeeting] = useState(false);

  // Edit Action Item Details Modal
  const [showEditActionModal, setShowEditActionModal] = useState(false);
  const [editActionData, setEditActionData] = useState({});
  const [savingAction, setSavingAction] = useState(false);

  // Delete / Action Modals
  const [deleteDocId, setDeleteDocId] = useState(null);
  const [showDeleteMeetingConfirm, setShowDeleteMeetingConfirm] = useState(false);
  const [showReopenConfirm, setShowReopenConfirm] = useState(false);

  const fetchMeetingAuditLogs = async (code) => {
    const meetingCode = code || meeting?.meetingCode;
    if (!meetingCode) return;
    try {
      setLoadingLogs(true);
      const res = await API.get('/audit-logs', {
        params: { search: meetingCode, limit: 50 },
      });
      setMeetingLogs(res.data.data?.logs || []);
    } catch (err) {
      console.error('Failed to fetch meeting audit logs', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchMeetingDetails = async () => {
    try {
      const res = await API.get(`/meetings/${id}`);
      setMeeting(res.data.data);
      if (res.data.data?.meetingCode) {
        fetchMeetingAuditLogs(res.data.data.meetingCode);
      }
    } catch (err) {
      toast.error('Failed to load meeting details.');
      navigate('/meetings');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await API.get('/departments');
      setDepartments(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMeetingDetails();
    fetchDepartments();
  }, [id]);

  const handleSubmitMeeting = async () => {
    try {
      await API.patch(`/meetings/${id}/submit`);
      toast.success('Meeting record submitted successfully.');
      fetchMeetingDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit meeting record.');
    }
  };

  const handleCloseMeeting = async () => {
    try {
      await API.patch(`/meetings/${id}/close`);
      toast.success('Meeting closed successfully.');
      fetchMeetingDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to close meeting.');
    }
  };

  const handleReopenMeeting = async () => {
    try {
      await API.patch(`/meetings/${id}/reopen`);
      toast.success('Meeting reopened to DRAFT status successfully.');
      setShowReopenConfirm(false);
      fetchMeetingDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reopen meeting.');
    }
  };

  const handleDeleteMeeting = async () => {
    try {
      await API.delete(`/meetings/${id}`);
      toast.success('Meeting deleted successfully.');
      navigate('/meetings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete meeting.');
    }
  };

  const handleUpdateMeeting = async (e) => {
    e.preventDefault();
    setSavingMeeting(true);
    try {
      await API.put(`/meetings/${id}`, editMeetingData);
      toast.success('Meeting details updated successfully.');
      setShowEditMeetingModal(false);
      fetchMeetingDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update meeting.');
    } finally {
      setSavingMeeting(false);
    }
  };

  const handleOpenUploadModal = (category = 'MOM') => {
    setDocCategory(category === 'ATTENDANCE' ? 'ATTENDANCE_SHEET' : category);
    setShowUploadModal(true);
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!docFile) {
      toast.error('Please choose a file to upload.');
      return;
    }

    const allowedExts = ['.pdf', '.xlsx', '.docx', '.jpg', '.jpeg', '.png'];
    const fileExt = '.' + (docFile.name.split('.').pop() || '').toLowerCase();
    if (!allowedExts.includes(fileExt)) {
      toast.error(`Invalid file format: ${fileExt}. Only PDF, XLSX, DOCX, JPEG, and PNG are allowed.`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('documents', docFile);
      formData.append('fileType', docCategory);
      formData.append('category', docCategory);

      await API.post(`/meetings/${id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Document uploaded successfully.');
      setShowUploadModal(false);
      setDocFile(null);
      fetchMeetingDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!deleteDocId) return;
    try {
      await API.delete(`/documents/${deleteDocId}`);
      toast.success('Document deleted.');
      setDeleteDocId(null);
      fetchMeetingDetails();
    } catch (err) {
      toast.error('Failed to delete document.');
    }
  };

  const handleCreateActionItem = async (e) => {
    e.preventDefault();
    if (!actionTitle || !assignedDeptId || !targetDate) {
      toast.error('Please complete required action item fields.');
      return;
    }

    setCreatingAction(true);
    try {
      await API.post(`/meetings/${id}/actions`, {
        meetingId: id,
        title: actionTitle,
        description: actionDesc,
        assignedDepartmentId: assignedDeptId,
        targetDate,
      });

      toast.success('Action item assigned successfully.');
      setShowActionModal(false);
      setActionTitle('');
      setActionDesc('');
      setAssignedDeptId('');
      setTargetDate('');
      fetchMeetingDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign action item.');
    } finally {
      setCreatingAction(false);
    }
  };

  const handleUpdateActionStatus = async (e) => {
    e.preventDefault();
    if (!statusModalAction) return;

    try {
      await API.put(`/actions/${statusModalAction.id}`, {
        status: newStatus,
        remarks,
      });
      toast.success('Action item status updated.');
      setStatusModalAction(null);
      setRemarks('');
      fetchMeetingDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update action item.');
    }
  };

  const handleUpdateActionDetails = async (e) => {
    e.preventDefault();
    setSavingAction(true);
    try {
      const payload = {
        title: editActionData.title,
        description: editActionData.description,
        assignedDepartmentId: editActionData.assignedDepartmentId,
        targetDate: editActionData.targetDate,
      };
      await API.put(`/actions/${editActionData.id}`, payload);
      toast.success('Action details updated successfully.');
      setShowEditActionModal(false);
      fetchMeetingDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update action item.');
    } finally {
      setSavingAction(false);
    }
  };

  if (loading) return <LoadingSkeleton type="form" count={6} />;
  if (!meeting) return null;

  // Categorized Document Groupings
  const docCategories = [
    { key: 'MOM', name: 'MoM', badge: 'REQUIRED FOR SUBMISSION', badgeColor: 'bg-amber-900/60 text-amber-300 border-amber-700/50' },
    { key: 'ATTENDANCE_SHEET', name: 'Attendance sheet (optional)', badge: 'OPTIONAL', badgeColor: 'bg-slate-800 text-slate-400 border-slate-700' },
    { key: 'AGENDA', name: 'Agenda Document', badge: 'OPTIONAL', badgeColor: 'bg-slate-800 text-slate-400 border-slate-700' },
    { key: 'PROCEEDINGS', name: 'Proceedings Document', badge: 'OPTIONAL', badgeColor: 'bg-slate-800 text-slate-400 border-slate-700' },
    { key: 'SUPPORTING', name: 'Supporting Documents', badge: 'OPTIONAL', badgeColor: 'bg-slate-800 text-slate-400 border-slate-700' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER BANNER CARD */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5 min-w-0">
          <button
            onClick={() => navigate('/meetings')}
            className="p-2.5 text-slate-400 hover:text-white bg-slate-800/80 rounded-xl border border-slate-700/80 cursor-pointer shrink-0 transition-colors"
            title="Back to Meetings"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/80 px-2.5 py-0.5 rounded-md border border-blue-800/60">
                {meeting.meetingCode}
              </span>
              <Badge status={meeting.status} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug truncate">
              {meeting.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
              <div className="flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{new Date(meeting.meetingDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1.5 font-sans">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{meeting.venue}, {meeting.district}</span>
              </div>
              <div className="flex items-center space-x-1.5 font-sans">
                <Tag className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{meeting.meetingType?.replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0 self-stretch sm:self-auto justify-end">
          {canEditMeeting(meeting.status) && (
            <button
              onClick={() => {
                setEditMeetingData({
                  title: meeting.title,
                  description: meeting.description,
                  meetingType: meeting.meetingType,
                  meetingDate: meeting.meetingDate ? meeting.meetingDate.split('T')[0] : '',
                  venue: meeting.venue,
                  district: meeting.district,
                });
                setShowEditMeetingModal(true);
              }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700/80 text-xs sm:text-sm font-semibold rounded-xl flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}

          {canReopenMeeting && meeting.status !== 'DRAFT' && (
            <button
              onClick={() => setShowReopenConfirm(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700/80 text-xs sm:text-sm font-semibold rounded-xl flex items-center space-x-2 transition-all cursor-pointer"
              title="Reopen meeting record back to DRAFT"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reopen</span>
            </button>
          )}

          {canCloseMeeting && meeting.status !== 'CLOSED' && (
            <button
              onClick={handleCloseMeeting}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700/80 text-xs sm:text-sm font-semibold rounded-xl flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Close</span>
            </button>
          )}

          {canSubmitMeeting(meeting.status) && (
            <button
              onClick={handleSubmitMeeting}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/30 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Submit Record</span>
            </button>
          )}

          {canDeleteMeeting && (
            <button
              onClick={() => setShowDeleteMeetingConfirm(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700/80 text-xs sm:text-sm font-semibold rounded-xl flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. TABS BAR */}
      <div className="border-b border-slate-800">
        <nav className="flex space-x-6 overflow-x-auto scrollbar-none text-xs sm:text-sm font-medium">
          {[
            { id: 'overview', label: 'Overview & Agendas' },
            { id: 'documents', label: `Documents (${meeting.documents?.length || 0})` },
            { id: 'actions', label: `Action Tracker (${meeting.actionItems?.length || 0})` },
            { id: 'participants', label: `Participants (${meeting.participants?.length || 0})` },
            { id: 'activity', label: `Activity History (${meetingLogs?.length || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* TAB 1: OVERVIEW & AGENDAS */}
      {activeTab === 'overview' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white mb-2">Meeting Description & Agendas</h3>
            <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
              {meeting.description || 'No description or agenda detailed.'}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-slate-500 font-medium">Record Creator</p>
              <p className="font-semibold text-slate-200 mt-0.5">
                {meeting.creator ? `${meeting.creator.firstName} ${meeting.creator.lastName} (${meeting.creator.email})` : 'State Administrator (admin@gov.in)'}
              </p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Creation Timestamp</p>
              <p className="font-semibold text-slate-200 font-mono mt-0.5">
                {new Date(meeting.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Last Modification</p>
              <p className="font-semibold text-slate-200 font-mono mt-0.5">
                {new Date(meeting.updatedAt || meeting.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOCUMENTS (CATEGORIZED VIEW) */}
      {activeTab === 'documents' && (
        <div className="space-y-5">
          {/* Top Banner Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">Document Submissions</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Official MoM, Attendance Sheet, Agenda, Proceedings & Supporting documents (PDF, XLSX, DOCX, JPEG, PNG up to 10MB each, max 10 files).
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0 self-start sm:self-auto">
              <span className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-blue-400 text-xs font-mono font-bold rounded-lg">
                {meeting.documents?.length || 0} / 10 Documents Uploaded
              </span>
              {canUploadMom(meeting.status) && (
                <button
                  onClick={() => handleOpenUploadModal('MOM')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Document</span>
                </button>
              )}
            </div>
          </div>

          {/* Categorized Document Groups */}
          <div className="space-y-4">
            {docCategories.map((cat) => {
              const catDocs = (meeting.documents || []).filter((d) => {
                const t = d.fileType || d.category || 'SUPPORTING';
                if (cat.key === 'ATTENDANCE_SHEET') {
                  return t === 'ATTENDANCE_SHEET' || t === 'ATTENDANCE';
                }
                return t === cat.key;
              });

              return (
                <div
                  key={cat.key}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-md"
                >
                  {/* Category Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <h4 className="text-xs sm:text-sm font-bold text-white">{cat.name}</h4>
                      <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${cat.badgeColor}`}>
                        {cat.badge}
                      </span>
                      <span className="text-xs text-slate-500">({catDocs.length} file{catDocs.length !== 1 ? 's' : ''})</span>
                    </div>

                    {canUploadMom(meeting.status) && (
                      <button
                        onClick={() => handleOpenUploadModal(cat.key)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-white border border-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1 transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                      </button>
                    )}
                  </div>

                  {/* Documents List inside Category */}
                  {catDocs.length === 0 ? (
                    <div className="py-4 text-center border border-dashed border-slate-800/80 rounded-xl text-slate-500 text-xs">
                      No {cat.name} uploaded yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {catDocs.map((doc) => {
                        const displayName = doc.name || doc.title || doc.fileName || 'Document';
                        const fileSrc = getFileUrl(doc.filePath || doc.fileUrl);
                        return (
                          <div
                            key={doc.id}
                            className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 flex items-center justify-between gap-3 group hover:border-blue-500/50 transition-colors"
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <div className="p-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-lg shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-white truncate group-hover:text-blue-300 transition-colors">
                                  {displayName}
                                </p>
                                <p className="text-[10px] font-mono text-slate-400">
                                  {(doc.fileSize / (1024 * 1024)).toFixed(2)} MB • Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                                  {doc.uploadedBy && ` by ${doc.uploadedBy.firstName || 'User'}`}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-1 shrink-0">
                              <button
                                onClick={() => setPreviewDoc(doc)}
                                className="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-700 cursor-pointer"
                                title="Preview Document"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <a
                                href={fileSrc}
                                download={displayName}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-700 cursor-pointer"
                                title="Download File"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                              {!isViewer && (
                                <button
                                  onClick={() => setDeleteDocId(doc.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-700 cursor-pointer"
                                  title="Delete File"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ACTION TRACKER */}
      {activeTab === 'actions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Action Items & Compliance Tracker</h3>
              <p className="text-xs text-slate-500">Department task assignments resulting from this meeting.</p>
            </div>
            {canAddActionItem(meeting.status) && (
              <button
                onClick={() => setShowActionModal(true)}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Assign Action Item</span>
              </button>
            )}
          </div>

          {meeting.actionItems?.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
              <CheckCircle2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-xs sm:text-sm text-slate-500">No action items assigned to departments yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {meeting.actionItems.map((action) => (
                <div
                  key={action.id}
                  className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {action.assignedDepartment?.code || 'DEPT'}
                      </span>
                      <Badge status={action.status} />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{action.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{action.description || 'No description'}</p>
                    {action.remarks && (
                      <div className="p-2 bg-slate-50 dark:bg-slate-900/50 rounded text-[11px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Remarks: </span>
                        {action.remarks}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-[11px] font-bold text-rose-500 font-mono">
                      Due: {new Date(action.targetDate).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-2">
                      {canAddActionItem(meeting.status) && (
                        <button
                          onClick={() => {
                            setEditActionData({
                              id: action.id,
                              title: action.title,
                              description: action.description || '',
                              assignedDepartmentId: action.assignedDepartmentId,
                              targetDate: action.targetDate ? action.targetDate.split('T')[0] : '',
                            });
                            setShowEditActionModal(true);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-500 dark:text-slate-400 rounded-lg cursor-pointer flex items-center space-x-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setStatusModalAction(action);
                          setNewStatus(action.status || 'IN_PROGRESS');
                          setRemarks(action.remarks || '');
                        }}
                        className="px-2.5 py-1 text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-blue-600 dark:text-blue-400 rounded-lg cursor-pointer"
                      >
                        Update Status
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PARTICIPANTS */}
      {activeTab === 'participants' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3.5 px-4">Official Name</th>
                  <th className="py-3.5 px-4">Designation</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-xs sm:text-sm">
                {meeting.participants?.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{p.name}</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{p.designation || 'N/A'}</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{p.department || 'N/A'}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {p.email && <p>{p.email}</p>}
                      {p.phone && <p>{p.phone}</p>}
                    </td>
                  </tr>
                ))}
                {(!meeting.participants || meeting.participants.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-xs text-slate-500">
                      No participants recorded for this meeting.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: ACTIVITY / AUDIT HISTORY */}
      {activeTab === 'activity' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <History className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm sm:text-base font-bold text-white">Meeting Audit Trail & Activity Log</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono font-bold">
              {meetingLogs.length} Event{meetingLogs.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loadingLogs ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading activity trail...</div>
          ) : meetingLogs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No audit logs recorded for meeting code {meeting.meetingCode}.
            </div>
          ) : (
            <div className="space-y-3">
              {meetingLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/50">
                        {log.action}
                      </span>
                      <span className="text-xs text-slate-300 font-medium">{log.details}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      User: <span className="text-slate-200 font-semibold">{log.user ? `${log.user.firstName} ${log.user.lastName} (${log.user.email})` : 'System'}</span>
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (() => {
        const docName = previewDoc.name || previewDoc.title || previewDoc.fileName || 'Document';
        const fileSrc = getFileUrl(previewDoc.filePath || previewDoc.fileUrl);
        const ext = (docName.split('.').pop() || '').toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png'].includes(ext);
        const isPdf = ext === 'pdf';
        const isOffice = ['docx', 'xlsx'].includes(ext);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-[calc(100%-1.5rem)] max-w-5xl h-[88vh] flex flex-col overflow-hidden shadow-2xl">
              <div className="px-4 py-3 bg-slate-950 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <FileText className="w-5 h-5 text-blue-400 shrink-0" />
                  <h3 className="text-xs sm:text-sm font-bold truncate">{docName}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60 uppercase">
                    {ext}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={fileSrc}
                    download={docName}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Open Original</span>
                  </a>
                  <a
                    href={fileSrc}
                    download={docName}
                    className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Download File"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => setPreviewDoc(null)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-slate-950 p-2 overflow-auto flex items-center justify-center relative">
                {isImage ? (
                  <img
                    src={fileSrc}
                    alt={docName}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  />
                ) : isPdf ? (
                  <object
                    data={fileSrc}
                    type="application/pdf"
                    className="w-full h-full rounded-lg bg-white shadow-inner"
                  >
                    <iframe
                      src={`${fileSrc}#toolbar=1&navpanes=0`}
                      title="PDF Document Preview"
                      className="w-full h-full border-0 rounded-lg bg-white"
                    />
                  </object>
                ) : isOffice ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <div className="p-6 bg-slate-800 border border-slate-700 rounded-2xl flex flex-col items-center max-w-md w-full space-y-4">
                      <div className="p-3.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
                        <FileText className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white truncate max-w-xs">{docName}</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Office documents ({ext.toUpperCase()}) can be downloaded directly or viewed via Google Docs / Office viewer.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <a
                          href={fileSrc}
                          download={docName}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download {ext.toUpperCase()}</span>
                        </a>
                        <a
                          href={`https://docs.google.com/viewer?url=${encodeURIComponent(fileSrc)}&embedded=true`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-xl flex items-center space-x-2 transition-all cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Open in Google Viewer</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <iframe
                    src={fileSrc}
                    title="Document Preview"
                    className="w-full h-full border-0 rounded-lg bg-white"
                  />
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* UPLOAD DOCUMENT MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-[calc(100%-2rem)] max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Upload Meeting Document</h3>
              <button onClick={() => setShowUploadModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleUploadDocument} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                >
                  <option value="MOM">MoM (Required for Submission)</option>
                  <option value="ATTENDANCE_SHEET">Attendance sheet (optional)</option>
                  <option value="AGENDA">Agenda Document</option>
                  <option value="PROCEEDINGS">Proceedings Document</option>
                  <option value="SUPPORTING">Supporting Documents</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select File (PDF, XLSX, DOCX, JPEG, PNG up to 10MB) *</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.xlsx,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => setDocFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN ACTION ITEM MODAL */}
      {showActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-[calc(100%-2rem)] max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Assign Action Item</h3>
              <button onClick={() => setShowActionModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateActionItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inspect highway accident prone zones"
                  value={actionTitle}
                  onChange={(e) => setActionTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Assign to Department *</label>
                <select
                  required
                  value={assignedDeptId}
                  onChange={(e) => setAssignedDeptId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Date *</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Action Description & Remarks</label>
                <textarea
                  rows={3}
                  value={actionDesc}
                  onChange={(e) => setActionDesc(e.target.value)}
                  placeholder="Details of the assigned responsibility..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                ></textarea>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowActionModal(false)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAction}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                >
                  {creatingAction ? 'Assigning...' : 'Assign Action Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE STATUS REMARKS MODAL */}
      {statusModalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-[calc(100%-2rem)] max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Update Task Status</h3>
              <button onClick={() => setStatusModalAction(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleUpdateActionStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Compliance Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Progress Remarks</label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Details of action taken or progress notes..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                ></textarea>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalAction(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Save Status Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reopen Meeting Confirm Modal */}
      <ConfirmModal
        isOpen={showReopenConfirm}
        onClose={() => setShowReopenConfirm(false)}
        onConfirm={handleReopenMeeting}
        title="Reopen Meeting Record"
        message="Are you sure you want to reopen this meeting? It will transition back to DRAFT status allowing modifications and document updates."
        confirmText="Reopen Meeting"
      />

      {/* Delete Meeting Confirm Modal */}
      <ConfirmModal
        isOpen={showDeleteMeetingConfirm}
        onClose={() => setShowDeleteMeetingConfirm(false)}
        onConfirm={handleDeleteMeeting}
        title="Delete Meeting"
        message="Are you sure you want to permanently delete this meeting? This action cannot be undone."
        danger={true}
      />

      {/* EDIT MEETING MODAL */}
      {showEditMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-[calc(100%-2rem)] max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Meeting Details</h3>
              <button onClick={() => setShowEditMeetingModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleUpdateMeeting} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Meeting Title *</label>
                  <input
                    type="text"
                    required
                    value={editMeetingData.title || ''}
                    onChange={(e) => setEditMeetingData({...editMeetingData, title: e.target.value})}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Meeting Type *</label>
                  <select
                    required
                    value={editMeetingData.meetingType || ''}
                    onChange={(e) => setEditMeetingData({...editMeetingData, meetingType: e.target.value})}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                  >
                    <option value="">Select Type</option>
                    <option value="DISTRICT_LEVEL">District Level Meeting</option>
                    <option value="SANSAD">Sansad Meeting</option>
                    <option value="RAJYA_SADAK_SURAKSHA">Rajya Sadak Suraksha Parishad</option>
                    <option value="SAMIKSHA_BAITHAK">Samiksha Baithak</option>
                    <option value="MANTRI_PARISHAD">Mantri Parishad Meeting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Meeting Date *</label>
                  <input
                    type="date"
                    required
                    value={editMeetingData.meetingDate || ''}
                    onChange={(e) => setEditMeetingData({...editMeetingData, meetingDate: e.target.value})}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Venue *</label>
                  <input
                    type="text"
                    required
                    value={editMeetingData.venue || ''}
                    onChange={(e) => setEditMeetingData({...editMeetingData, venue: e.target.value})}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">District *</label>
                  <input
                    type="text"
                    required
                    value={editMeetingData.district || ''}
                    onChange={(e) => setEditMeetingData({...editMeetingData, district: e.target.value})}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description / Agendas</label>
                  <textarea
                    rows={4}
                    value={editMeetingData.description || ''}
                    onChange={(e) => setEditMeetingData({...editMeetingData, description: e.target.value})}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                  ></textarea>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowEditMeetingModal(false)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingMeeting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                >
                  {savingMeeting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ACTION ITEM DETAILS MODAL */}
      {showEditActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-[calc(100%-2rem)] max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Action Item Details</h3>
              <button onClick={() => setShowEditActionModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleUpdateActionDetails} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={editActionData.title || ''}
                  onChange={(e) => setEditActionData({...editActionData, title: e.target.value})}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Assign to Department *</label>
                <select
                  required
                  value={editActionData.assignedDepartmentId || ''}
                  onChange={(e) => setEditActionData({...editActionData, assignedDepartmentId: e.target.value})}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Date *</label>
                <input
                  type="date"
                  required
                  value={editActionData.targetDate || ''}
                  onChange={(e) => setEditActionData({...editActionData, targetDate: e.target.value})}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Action Description & Remarks</label>
                <textarea
                  rows={3}
                  value={editActionData.description || ''}
                  onChange={(e) => setEditActionData({...editActionData, description: e.target.value})}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                ></textarea>
              </div>
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowEditActionModal(false)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAction}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                >
                  {savingAction ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Document Modal */}
      <ConfirmModal
        isOpen={!!deleteDocId}
        onClose={() => setDeleteDocId(null)}
        onConfirm={handleDeleteDocument}
        title="Delete Document"
        message="Are you sure you want to delete this document from the meeting record?"
        danger={true}
      />
    </div>
  );
}
