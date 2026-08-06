import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../services/api.js';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Plus, Trash2, Calendar, UserPlus } from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';

export default function MeetingForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      meetingType: 'DISTRICT_LEVEL',
      meetingDate: new Date().toISOString().slice(0, 16),
      venue: '',
      district: 'Bhopal',
      description: '',
      participants: [{ name: '', designation: '', department: '', email: '', phone: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'participants',
  });

  useEffect(() => {
    if (isEdit) {
      const fetchMeeting = async () => {
        try {
          const res = await API.get(`/meetings/${id}`);
          const data = res.data.data;
          reset({
            title: data.title,
            meetingType: data.meetingType,
            meetingDate: new Date(data.meetingDate).toISOString().slice(0, 16),
            venue: data.venue,
            district: data.district,
            description: data.description,
            participants: data.participants?.length
              ? data.participants
              : [{ name: '', designation: '', department: '', email: '', phone: '' }],
          });
        } catch (err) {
          toast.error('Failed to load meeting record for editing.');
          navigate('/meetings');
        } finally {
          setInitialLoading(false);
        }
      };
      fetchMeeting();
    }
  }, [id, isEdit, reset, navigate]);

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      if (isEdit) {
        await API.put(`/meetings/${id}`, formData);
        toast.success('Meeting updated successfully.');
      } else {
        const res = await API.post('/meetings', formData);
        toast.success(`Meeting created as DRAFT (${res.data.data.meetingCode})`);
      }
      navigate('/meetings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save meeting record.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <LoadingSkeleton type="form" />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/meetings')}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isEdit ? 'Edit Meeting Record' : 'Schedule New Meeting'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Fill in official meeting details and add key participants.</p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">
            General Information
          </h3>

          {/* Meeting Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Meeting Title *
            </label>
            <input
              type="text"
              {...register('title', { required: 'Meeting title is required' })}
              placeholder="e.g. District Road Safety Advisory Committee Review"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
            {errors.title && <p className="mt-1 text-xs text-rose-500">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Meeting Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Meeting Type *
              </label>
              <select
                {...register('meetingType', { required: 'Meeting type is required' })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="DISTRICT_LEVEL">District Level Meeting</option>
                <option value="SANSAD">Sansad Meeting</option>
                <option value="RAJYA_SADAK_SURAKSHA">Rajya Sadak Suraksha Parishad Meeting</option>
                <option value="SAMIKSHA_BAITHAK">Samiksha Baithak</option>
                <option value="MANTRI_PARISHAD">Mantri Parishad Meeting</option>
              </select>
            </div>

            {/* Meeting Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Meeting Date & Time *
              </label>
              <input
                type="datetime-local"
                {...register('meetingDate', { required: 'Meeting date is required' })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
              />
              {errors.meetingDate && <p className="mt-1 text-xs text-rose-500">{errors.meetingDate.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Venue */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Venue *
              </label>
              <input
                type="text"
                {...register('venue', { required: 'Venue is required' })}
                placeholder="e.g. Collectorate Conference Hall B"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
              />
              {errors.venue && <p className="mt-1 text-xs text-rose-500">{errors.venue.message}</p>}
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                District *
              </label>
              <input
                type="text"
                {...register('district', { required: 'District is required' })}
                placeholder="e.g. Bhopal"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
              />
              {errors.district && <p className="mt-1 text-xs text-rose-500">{errors.district.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Description / Agendas Summary
            </label>
            <textarea
              rows={4}
              {...register('description')}
              placeholder="Outline main discussion points, agenda items, or context..."
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
            ></textarea>
          </div>
        </div>

        {/* Participants Builder Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Attendees & Key Officials</h3>
              <p className="text-xs text-slate-500">Record designated participants present or invited.</p>
            </div>
            <button
              type="button"
              onClick={() => append({ name: '', designation: '', department: '', email: '', phone: '' })}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg flex items-center space-x-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Attendee</span>
            </button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-lg border border-slate-200 dark:border-slate-600/60 grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
                <input
                  type="text"
                  placeholder="Full Name *"
                  {...register(`participants.${index}.name`, { required: true })}
                  className="px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Designation"
                  {...register(`participants.${index}.designation`)}
                  className="px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Department"
                  {...register(`participants.${index}.department`)}
                  className="px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  {...register(`participants.${index}.email`)}
                  className="px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg"
                />
                <div className="flex items-center justify-between space-x-2">
                  <input
                    type="text"
                    placeholder="Phone"
                    {...register(`participants.${index}.phone`)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg"
                  />
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/60 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/meetings')}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving Record...' : isEdit ? 'Update Meeting' : 'Save as DRAFT'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
