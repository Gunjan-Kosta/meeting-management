import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api.js';
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
} from 'lucide-react';

export default function MeetingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, canUploadMom, canAddActionItem, canCloseMeeting, canSubmitMeeting } = useAuth();

  const [meeting, setMeeting] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Document Upload Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docCategory, setDocCategory] = useState('MOM');
  const [docTitle, setDocTitle] = useState('');
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

  // Delete Modals
  const [deleteDocId, setDeleteDocId] = useState(null);

  const fetchMeetingDetails = async () => {
    try {
      const res = await API.get(`/meetings/${id}`);
      setMeeting(res.data.data);
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
      setDepartments(res.data.data);
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

  const handleOpenUploadModal = (category = 'MOM') => {
    setDocCategory(category);
    setShowUploadModal(true);
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!docFile) {
      toast.error('Please choose a file to upload.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', docFile);
      formData.append('category', docCategory);
      if (docTitle) formData.append('title', docTitle);

      await API.post(`/meetings/${id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Document uploaded successfully.');
      setShowUploadModal(false);
      setDocFile(null);
      setDocTitle('');
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
        title: actionTitle,
        description: actionDesc,
        assignedDepartmentId: assignedDeptId,
        targetDate,
        priority,
      });

      toast.success('Action item assigned successfully.');
      setShowActionModal(false);
      setActionTitle('');
      setActionDesc('');
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
      await API.put(`/actions/${statusModalAction.id}/status`, {
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

  if (loading) return <LoadingSkeleton type="form" count={6} />;
  if (!meeting) return null;

  // Categorized Document Groupings
  const docCategories = [
    { key: 'MOM', name: 'MoM', badge: 'REQUIRED FOR SUBMISSION', badgeColor: 'bg-amber-900/60 text-amber-300 border-amber-700/50' },
    { key: 'ATTENDANCE', name: 'Attendance sheet (optional)', badge: 'OPTIONAL', badgeColor: 'bg-slate-800 text-slate-400 border-slate-700' },
    { key: 'AGENDA', name: 'Agenda Document', badge: 'OPTIONAL', badgeColor: 'bg-slate-800 text-slate-400 border-slate-700' },
    { key: 'PROCEEDINGS', name: 'Proceedings & Annexures', badge: 'OPTIONAL', badgeColor: 'bg-slate-800 text-slate-400 border-slate-700' },
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
                <span>{new Date(meeting.meetingDate).toLocaleDateString()}, {meeting.meetingTime || '10:28:00 PM'}</span>
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

        {/* Right Header Action Button */}
        {canSubmitMeeting(meeting.status) && (
          <button
            onClick={handleSubmitMeeting}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/30 flex items-center space-x-2 transition-all cursor-pointer shrink-0 self-stretch sm:self-auto justify-center"
          >
            <Send className="w-4 h-4" />
            <span>Submit Record</span>
          </button>
        )}
      </div>

      {/* 2. TABS BAR */}
      <div className="border-b border-slate-800">
        <nav className="flex space-x-6 overflow-x-auto scrollbar-none text-xs sm:text-sm font-medium">
          {[
            { id: 'overview', label: 'Overview & Agendas' },
            { id: 'documents', label: `Documents (${meeting.documents?.length || 0})` },
            { id: 'actions', label: `Action Tracker (${meeting.actionItems?.length || 0})` },
            { id: 'participants', label: `Participants (${meeting.participants?.length || 0})` },
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
              {meeting.description || meeting.agenda || 'No description or agenda detailed.'}
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
                Official MoM, Attendance Sheet, Agenda, Proceedings & Supporting documents (PDF, DOCX, XLSX up to 10MB each).
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0 self-start sm:self-auto">
              <span className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-blue-400 text-xs font-mono font-bold rounded-lg">
                {meeting.documents?.length || 0} / 10 Documents Submitted
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
              const catDocs = (meeting.documents || []).filter((d) => d.category === cat.key || (cat.key === 'MOM' && !d.category));
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
                      {catDocs.map((doc) => (
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
                                {doc.title || doc.fileName}
                              </p>
                              <p className="text-[10px] font-mono text-slate-400">
                                {(doc.fileSize / (1024 * 1024)).toFixed(2)} MB • Uploaded {new Date(doc.createdAt).toLocaleDateString()}
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
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-700 cursor-pointer"
                              title="Download File"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => setDeleteDocId(doc.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-700 cursor-pointer"
                              title="Delete File"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
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
                        {action.assignedDepartment?.code}
                      </span>
                      <Badge status={action.status} />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{action.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{action.description || 'No description'}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-bold text-rose-600">
                      Due: {new Date(action.targetDate).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => setStatusModalAction(action)}
                      className="px-2.5 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-lg cursor-pointer"
                    >
                      Update Status
                    </button>
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
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-700 w-[calc(100%-1.5rem)] max-w-5xl h-[88vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
              <div className="flex items-center space-x-2 min-w-0">
                <FileText className="w-5 h-5 text-blue-400 shrink-0" />
                <h3 className="text-xs sm:text-sm font-bold truncate">{previewDoc.title || previewDoc.fileName}</h3>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={previewDoc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Open Original</span>
                </a>
                <button onClick={() => setPreviewDoc(null)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-900 p-2 overflow-auto flex items-center justify-center">
              {previewDoc.fileName.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                <img src={previewDoc.fileUrl} alt={previewDoc.title} className="max-w-full max-h-full object-contain rounded-lg" />
              ) : (
                <iframe src={previewDoc.fileUrl} title="Document Preview" className="w-full h-full border-0 rounded-lg bg-white" />
              )}
            </div>
          </div>
        </div>
      )}

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
                  <option value="MOM">Minutes of Meeting (MoM)</option>
                  <option value="ATTENDANCE">Attendance Sheet</option>
                  <option value="AGENDA">Official Agenda Document</option>
                  <option value="PROCEEDINGS">Proceedings & Annexures</option>
                  <option value="OTHER">Other Annexure Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Official Signed Minutes of Meeting"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select File (PDF, Office, Images up to 10MB) *</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
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

              <div className="grid grid-cols-2 gap-3">
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
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Action Description & Remarks</label>
                <textarea
                  rows={3}
                  value={actionDesc}
                  onChange={(e) => setActionDesc(e.target.value)}
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
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Progress Remarks</label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Details of action taken or reasons for delay..."
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

      {/* Delete Document Modal */}
      <ConfirmModal
        isOpen={!!deleteDocId}
        onClose={() => setDeleteDocId(null)}
        onConfirm={handleDeleteDocument}
        title="Delete Document"
        message="Are you sure you want to delete this document?"
        danger={true}
      />
    </div>
  );
}
