import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../services/api.js';
import toast from 'react-hot-toast';
import { Calendar, Save, Send, Plus, Trash2, ArrowLeft } from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';

export default function MeetingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [meetingType, setMeetingType] = useState('DISTRICT_LEVEL');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [venue, setVenue] = useState('');
  const [district, setDistrict] = useState('Bhopal');
  const [description, setDescription] = useState('');

  // Dynamic Participants List
  const [participants, setParticipants] = useState([
    { name: '', designation: '', department: '', email: '', phone: '' },
  ]);

  useEffect(() => {
    if (isEdit) {
      const fetchMeeting = async () => {
        try {
          const res = await API.get(`/meetings/${id}`);
          const m = res.data.data;
          setTitle(m.title);
          setMeetingType(m.meetingType);
          setMeetingDate(m.meetingDate ? m.meetingDate.split('T')[0] : '');
          setMeetingTime(m.meetingTime || '');
          setVenue(m.venue || '');
          setDistrict(m.district || '');
          setDescription(m.description || '');
          if (m.participants && m.participants.length > 0) {
            setParticipants(m.participants.map((p) => ({
              name: p.name || '',
              designation: p.designation || '',
              department: p.department || '',
              email: p.email || '',
              phone: p.phone || '',
            })));
          }
        } catch (err) {
          toast.error('Failed to load meeting details.');
        } finally {
          setLoading(false);
        }
      };
      fetchMeeting();
    }
  }, [id, isEdit]);

  const handleAddParticipant = () => {
    setParticipants([...participants, { name: '', designation: '', department: '', email: '', phone: '' }]);
  };

  const handleRemoveParticipant = (index) => {
    if (participants.length === 1) return;
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const handleParticipantChange = (index, field, value) => {
    const updated = [...participants];
    updated[index][field] = value;
    setParticipants(updated);
  };

  const handleSave = async (submitNow = false) => {
    if (!title || !meetingDate || !venue) {
      toast.error('Please complete all required fields (Title, Date, Venue).');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        meetingType,
        meetingDate,
        meetingTime,
        venue,
        district,
        description,
        participants: participants.filter((p) => p.name.trim() !== ''),
      };

      if (isEdit) {
        await API.put(`/meetings/${id}`, payload);
        toast.success('Meeting updated successfully.');
      } else {
        const res = await API.post('/meetings', payload);
        toast.success('Meeting created as DRAFT.');
        if (submitNow) {
          await API.patch(`/meetings/${res.data.data.id}/submit`);
          toast.success('Meeting submitted for official review.');
        }
      }
      navigate('/meetings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save meeting record.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSkeleton type="form" count={6} />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/meetings')}
          className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isEdit ? 'Edit Meeting Record' : 'Create New Meeting Record'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Fill in meeting details, venue, and designated participants for tracking.
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white dark:bg-slate-800 p-5 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
        {/* Core Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Meeting Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Quarterly Road Safety Review & Infrastructure Progress"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700/60 text-slate-900 dark:text-white text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Meeting Category *
            </label>
            <select
              value={meetingType}
              onChange={(e) => setMeetingType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700/60 text-slate-900 dark:text-white text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-600"
            >
              <option value="DISTRICT_LEVEL">District Level Meeting</option>
              <option value="SANSAD">Sansad Meeting</option>
              <option value="RAJYA_SADAK_SURAKSHA">Rajya Sadak Suraksha Parishad</option>
              <option value="SAMIKSHA_BAITHAK">Samiksha Baithak</option>
              <option value="MANTRI_PARISHAD">Mantri Parishad Meeting</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              District Scope *
            </label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Bhopal"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700/60 text-slate-900 dark:text-white text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Meeting Date *
            </label>
            <input
              type="date"
              required
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700/60 text-slate-900 dark:text-white text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Scheduled Time
            </label>
            <input
              type="text"
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
              placeholder="e.g. 11:00 AM"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700/60 text-slate-900 dark:text-white text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-600"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Venue / Location *
            </label>
            <input
              type="text"
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. District Collectorate Conference Hall"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700/60 text-slate-900 dark:text-white text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-600"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Meeting Overview & Context
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide background information or purpose of this meeting..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700/60 text-slate-900 dark:text-white text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-hidden"
            ></textarea>
          </div>
        </div>

        {/* Dynamic Participants Builder */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Designated Attendees / Participants</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Add officials participating in this meeting.</p>
            </div>
            <button
              type="button"
              onClick={handleAddParticipant}
              className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold text-xs rounded-lg border border-blue-200 dark:border-blue-900 flex items-center space-x-1 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Official</span>
            </button>
          </div>

          <div className="space-y-3">
            {participants.map((p, idx) => (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-slate-700/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 relative group"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pr-8">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={p.name}
                    onChange={(e) => handleParticipantChange(idx, 'name', e.target.value)}
                    className="px-3 py-1.5 text-xs bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                  />
                  <input
                    type="text"
                    placeholder="Designation"
                    value={p.designation}
                    onChange={(e) => handleParticipantChange(idx, 'designation', e.target.value)}
                    className="px-3 py-1.5 text-xs bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                  />
                  <input
                    type="text"
                    placeholder="Department"
                    value={p.department}
                    onChange={(e) => handleParticipantChange(idx, 'department', e.target.value)}
                    className="px-3 py-1.5 text-xs bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={p.email}
                    onChange={(e) => handleParticipantChange(idx, 'email', e.target.value)}
                    className="px-3 py-1.5 text-xs bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                  />
                  <input
                    type="text"
                    placeholder="Contact Number"
                    value={p.phone}
                    onChange={(e) => handleParticipantChange(idx, 'phone', e.target.value)}
                    className="px-3 py-1.5 text-xs bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                  />
                </div>
                {participants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveParticipant(idx)}
                    className="absolute right-2.5 top-3.5 p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/meetings')}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSave(false)}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Saving...' : isEdit ? 'Update Meeting' : 'Save as Draft'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
