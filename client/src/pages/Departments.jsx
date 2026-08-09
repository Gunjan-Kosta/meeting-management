import React, { useState, useEffect } from 'react';
import API from '../services/api.js';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import toast from 'react-hot-toast';
import { Building2, Plus, Edit, Trash2, X } from 'lucide-react';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');

  const [deleteId, setDeleteId] = useState(null);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await API.get('/departments');
      setDepartments(res.data.data);
    } catch (err) {
      toast.error('Failed to load departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenModal = (dept = null) => {
    if (dept) {
      setEditId(dept.id);
      setName(dept.name);
      setCode(dept.code);
      setDescription(dept.description || '');
    } else {
      setEditId(null);
      setName('');
      setCode('');
      setDescription('');
    }
    setShowModal(true);
  };

  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    if (!name || !code) {
      toast.error('Department Name and Code are required.');
      return;
    }

    try {
      if (editId) {
        await API.put(`/departments/${editId}`, { name, code, description });
        toast.success('Department updated.');
      } else {
        await API.post('/departments', { name, code, description });
        toast.success('Department created.');
      }
      setShowModal(false);
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save department.');
    }
  };

  const handleDeleteDepartment = async () => {
    if (!deleteId) return;
    try {
      await API.delete(`/departments/${deleteId}`);
      toast.success('Department deleted.');
      setDeleteId(null);
      fetchDepartments();
    } catch (err) {
      toast.error('Failed to delete department.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Department Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Manage state departments for task assignments and compliance tracking.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm rounded-lg shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Department</span>
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton type="table" count={4} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {departments.map((d) => (
            <div key={d.id} className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                    {d.code}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button onClick={() => handleOpenModal(d)} className="p-1.5 text-slate-400 hover:text-amber-600 cursor-pointer">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteId(d.id)} className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-2">{d.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{d.description || 'No description provided.'}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500">
                <span>Associated Users: {d._count?.users || 0}</span>
                <span>Active Tasks: {d._count?.actionItems || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Responsive Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-[calc(100%-2rem)] max-w-md p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{editId ? 'Edit Department' : 'Create Department'}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleSaveDepartment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Department Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Public Works Department"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Unique Code *</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. PWD-ROAD"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                ></textarea>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-700 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteDepartment}
        title="Delete Department"
        message="Are you sure you want to delete this department?"
        danger={true}
      />
    </div>
  );
}
