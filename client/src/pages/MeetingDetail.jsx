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
  Building,
  UploadCloud,
  FileText,
  Trash2,
  Download,
  Eye,
  ExternalLink,
  Plus,
  Send,
  CheckCircle,
  Clock,
  UserCheck,
  Tag,
  X,
} from 'lucide-react';

export default function MeetingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canEditMeeting, canSubmitMeeting, canCloseMeeting, canDeleteMeeting, user } = useAuth();

  const [meeting, setMeeting] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab State
  const [activeTab, setActiveTab] = useState('overview'); // overview, documents, actions, participants

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [docCategory, setDocCategory] = useState('MOM');
  const [uploading, setUploading] = useState(false);

  // Action Item Modal State
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionTitle, setActionTitle] = useState('');
  const [actionDesc, setActionDesc] = useState('');
  const [actionDept, setActionDept] = useState('');
  const [actionTargetDate, setActionTargetDate] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Document Viewer Modal State
  const [previewDoc, setPreviewDoc] = useState(null);

  // Delete document modal
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
      if (res.data.data.length > 0) setActionDept(res.data.data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMeetingDetails();
    fetchDepartments();
  }, [id]);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFiles || uploadFiles.length === 0) {
      toast.error('Please select at least one file.');
      return;
    }

    const currentTotal = meeting?.documents?.length || 0;
    if (currentTotal + uploadFiles.length > 10) {
      toast.error(`Maximum 10 documents allowed per meeting in total. Current total: ${currentTotal}.`);
      return;
    }

    const formData = new FormData();
    for (const file of uploadFiles) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds 10 MB size limit.`);
        return;
      }
      formData.append('documents', file);
    }
    formData.append('fileType', docCategory);

    setUploading(true);
    try {
      await API.post(`/documents/upload/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Documents uploaded successfully.');
      setShowUploadModal(false);
      setUploadFiles([]);
      fetchMeetingDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload documents.');
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
    if (!actionTitle || !actionDept || !actionTargetDate) {
      toast.error('Title, Assigned Department, and Target Date are required.');
      return;
    }

    setActionLoading(true);
    try {
      await API.post('/actions', {
        meetingId: id,
        title: actionTitle,
        description: actionDesc,
        assignedDepartmentId: actionDept,
        targetDate: actionTargetDate,
      });
      toast.success('Action item assigned.');
      setShowActionModal(false);
      setActionTitle('');
      setActionDesc('');
      fetchMeetingDetails();
    } catch (err) {
      toast.error('Failed to add action item.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActionStatusChange = async (actionId, newStatus, currentRemarks) => {
    try {
      await API.put(`/actions/${actionId}`, {
        status: newStatus,
        remarks: currentRemarks,
      });
      toast.success(`Action status updated to ${newStatus}`);
      fetchMeetingDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update action status.');
    }
  };

  if (loading) return <LoadingSkeleton type="form" />;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-start space-x-4">
          <button
            onClick={() => navigate('/meetings')}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded">
                {meeting.meetingCode}
              </span>
              <Badge status={meeting.status} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1.5">{meeting.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(meeting.meetingDate).toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{meeting.venue}, {meeting.district}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5" />
                <span>{meeting.meetingType?.replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {canSubmitMeeting(meeting.status) && (
            <button
              onClick={async () => {
                try {
                  await API.patch(`/meetings/${id}/submit`);
                  toast.success('Meeting submitted.');
                  fetchMeetingDetails();
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Failed to submit meeting.');
                }
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg shadow transition-all flex items-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Record</span>
            </button>
          )}

          {canCloseMeeting && meeting.status === 'SUBMITTED' && (
            <button
              onClick={async () => {
                await API.patch(`/meetings/${id}/close`);
                toast.success('Meeting CLOSED.');
                fetchMeetingDetails();
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg shadow transition-all flex items-center space-x-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Close Meeting</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 space-x-6">
        {[
          { id: 'overview', label: 'Overview & Agendas' },
          { id: 'documents', label: `Documents (${meeting.documents?.length || 0})` },
          { id: 'actions', label: `Action Tracker (${meeting.actionItems?.length || 0})` },
          { id: 'participants', label: `Participants (${meeting.participants?.length || 0})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Meeting Description & Agendas</h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
            {meeting.description || 'No detailed description provided.'}
          </p>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block">Record Creator</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {meeting.creator?.firstName} {meeting.creator?.lastName} ({meeting.creator?.email})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Creation Timestamp</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{new Date(meeting.createdAt).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Last Modification</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{new Date(meeting.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Documents */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Document Summary Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Document Submissions</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Official MoM, Attendance Sheet, Agenda, Proceedings & Supporting documents (PDF, DOCX, XLSX up to 10MB each).
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                (meeting.documents?.length || 0) >= 10
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                  : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
              }`}>
                {meeting.documents?.length || 0} / 10 Documents Submitted
              </span>
              {user?.role !== 'VIEWER' && (
                <button
                  onClick={() => {
                    if ((meeting.documents?.length || 0) >= 10) {
                      toast.error('Maximum limit of 10 documents per meeting reached.');
                      return;
                    }
                    setShowUploadModal(true);
                  }}
                  disabled={(meeting.documents?.length || 0) >= 10}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-xs rounded-lg flex items-center space-x-1.5 transition-all shadow-xs"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Document</span>
                </button>
              )}
            </div>
          </div>

          {/* Categorized Document Sections */}
          {[
            { key: 'MOM', title: 'MoM', isRequired: true },
            { key: 'ATTENDANCE_SHEET', title: 'Attendance sheet (optional)', isOptional: true },
            { key: 'AGENDA', title: 'Agenda Document' },
            { key: 'PROCEEDINGS', title: 'Proceedings Document' },
            { key: 'SUPPORTING', title: 'Supporting documents' },
          ].map((sec) => {
            const secDocs = meeting.documents?.filter((d) => d.fileType === sec.key) || [];
            return (
              <div key={sec.key} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{sec.title}</h4>
                    {sec.isRequired && (
                      <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50 rounded">
                        Required for Submission
                      </span>
                    )}
                    {sec.isOptional && (
                      <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded">
                        Optional
                      </span>
                    )}
                    <span className="text-xs text-slate-400 font-medium">({secDocs.length} file{secDocs.length !== 1 ? 's' : ''})</span>
                  </div>

                  {user?.role !== 'VIEWER' && (
                    <button
                      onClick={() => {
                        if ((meeting.documents?.length || 0) >= 10) {
                          toast.error('Maximum limit of 10 documents per meeting reached.');
                          return;
                        }
                        setDocCategory(sec.key);
                        setShowUploadModal(true);
                      }}
                      disabled={(meeting.documents?.length || 0) >= 10}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-blue-200 dark:border-blue-800/50 rounded-lg transition-colors flex items-center space-x-1 disabled:opacity-40"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload</span>
                    </button>
                  )}
                </div>

                {secDocs.length === 0 ? (
                  <div className="p-4 text-center bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 text-xs">
                    No {sec.title} uploaded yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {secDocs.map((doc) => (
                      <div key={doc.id} className="p-3.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center justify-between shadow-xs">
                        <div className="flex items-center space-x-3 min-w-0 pr-2">
                          <div className="p-2 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{doc.name}</p>
                            <div className="flex items-center space-x-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              <span>{(doc.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                              <span>•</span>
                              <span>Uploaded {new Date(doc.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                          {/* View On Website Button */}
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            title="View Document on Website"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Download Button */}
                          <a
                            href={doc.filePath}
                            target="_blank"
                            rel="noreferrer"
                            download
                            className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            title="Download File"
                          >
                            <Download className="w-4 h-4" />
                          </a>

                          {user?.role !== 'VIEWER' && (
                            <button
                              onClick={() => setDeleteDocId(doc.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                              title="Delete File"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Action Tracker */}
      {activeTab === 'actions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Manage compliance action items assigned to various departments.</p>
            {user?.role !== 'VIEWER' && (
              <button
                onClick={() => setShowActionModal(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Action Item</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {meeting.actionItems?.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 text-xs">
                No action items created for this meeting yet.
              </div>
            ) : (
              meeting.actionItems?.map((action) => (
                <div key={action.id} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{action.title}</h4>
                      <Badge status={action.status} />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{action.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Dept: {action.assignedDepartment?.name} ({action.assignedDepartment?.code})
                      </span>
                      <span>•</span>
                      <span>Target Date: {new Date(action.targetDate).toLocaleDateString()}</span>
                    </div>
                    {action.remarks && (
                      <p className="text-xs italic text-slate-500 bg-slate-50 dark:bg-slate-700/50 p-2 rounded mt-2">
                        Remarks: {action.remarks}
                      </p>
                    )}
                  </div>

                  {user?.role !== 'VIEWER' && action.status !== 'COMPLETED' && (
                    <div className="flex items-center space-x-2">
                      {action.status === 'PENDING' && (
                        <button
                          onClick={() => handleActionStatusChange(action.id, 'IN_PROGRESS', action.remarks)}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 text-xs font-semibold rounded-lg hover:bg-indigo-100"
                        >
                          Mark In Progress
                        </button>
                      )}
                      <button
                        onClick={() => handleActionStatusChange(action.id, 'COMPLETED', action.remarks)}
                        className="px-3 py-1.5 bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-300 text-xs font-semibold rounded-lg hover:bg-teal-100"
                      >
                        Mark Completed
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Participants */}
      {activeTab === 'participants' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-4">Official Name</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-xs">
              {meeting.participants?.map((p) => (
                <tr key={p.id}>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{p.name}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{p.designation || '-'}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{p.department || '-'}</td>
                  <td className="py-3 px-4 text-slate-500">{p.email || p.phone || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* In-Website Document Viewer Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-5xl w-full h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-slate-100 dark:bg-slate-700/70 border-b border-slate-200 dark:border-slate-600 flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{previewDoc.name}</h3>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-blue-600 dark:text-blue-400 uppercase">{previewDoc.fileType?.replace(/_/g, ' ')}</span>
                    <span>•</span>
                    <span>{(previewDoc.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href={previewDoc.filePath}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 rounded-lg transition-colors flex items-center space-x-1.5"
                  title="Open in new browser tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Tab</span>
                </a>
                <a
                  href={previewDoc.filePath}
                  download
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-1.5"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body Frame */}
            <div className="flex-1 p-2 bg-slate-900 overflow-hidden flex flex-col items-center justify-center relative">
              <iframe
                src={previewDoc.filePath}
                title={previewDoc.name}
                className="w-full h-full rounded-xl bg-white border-0 shadow-inner"
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Upload Meeting Document</h3>
              <button onClick={() => setShowUploadModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Document Category</label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                >
                  <option value="MOM">MoM</option>
                  <option value="ATTENDANCE_SHEET">Attendance sheet (optional)</option>
                  <option value="AGENDA">Agenda Document</option>
                  <option value="PROCEEDINGS">Proceedings Document</option>
                  <option value="SUPPORTING">Supporting documents</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Files (PDF, DOCX, XLSX - Max 10MB)</label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.xlsx"
                  onChange={(e) => setUploadFiles(Array.from(e.target.files))}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload Files'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Action Item Modal */}
      {showActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Action Item</h3>
              <button onClick={() => setShowActionModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateActionItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Action Title *</label>
                <input
                  type="text"
                  value={actionTitle}
                  onChange={(e) => setActionTitle(e.target.value)}
                  placeholder="e.g. Conduct road audit on NH-46"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={actionDesc}
                  onChange={(e) => setActionDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Department *</label>
                <select
                  value={actionDept}
                  onChange={(e) => setActionDept(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Completion Date *</label>
                <input
                  type="date"
                  value={actionTargetDate}
                  onChange={(e) => setActionTargetDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowActionModal(false)}
                  className="px-4 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                >
                  {actionLoading ? 'Creating...' : 'Assign Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Document Confirmation */}
      <ConfirmModal
        isOpen={!!deleteDocId}
        onClose={() => setDeleteDocId(null)}
        onConfirm={handleDeleteDocument}
        title="Delete Document"
        message="Are you sure you want to delete this uploaded file?"
        danger={true}
      />
    </div>
  );
}
