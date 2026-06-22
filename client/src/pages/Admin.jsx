import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Trash2, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved

  useEffect(() => {
    if (!isAdmin) return;
    fetchResources();
  }, [isAdmin, filter]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter === 'pending') params.append('isApproved', 'false');
      if (filter === 'approved') params.append('isApproved', 'true');
      const res = await axios.get(`${API_URL}/resources/all?${params.toString()}`);
      setResources(res.data.resources || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this resource?')) return;
    try {
      await axios.delete(`${API_URL}/resources/${id}`);
      fetchResources();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="card p-8 text-center max-w-md">
          <AlertTriangle size={40} className="text-amber-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500">You need admin privileges to view this page.</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary mt-4">Go to Dashboard</button>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Resources', value: resources.length, icon: FileText },
    { label: 'Pending', value: resources.filter(r => !r.isApproved).length, icon: AlertTriangle },
    { label: 'Approved', value: resources.filter(r => r.isApproved).length, icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield size={24} className="text-violet-600" />
        <h1 className="text-2xl font-display font-bold text-slate-900">Admin Panel</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="card p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-lg flex items-center justify-center">
                <Icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'approved', 'pending'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Resources Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-semibold">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Uploader</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
              ) : resources.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No resources found.</td></tr>
              ) : (
                resources.map(r => (
                  <tr key={r._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{r.title}</td>
                    <td className="px-4 py-3 text-slate-600">{r.subjectName}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${
                        r.resourceType === 'Note' ? 'bg-emerald-50 text-emerald-700' :
                        r.resourceType === 'Question Paper' ? 'bg-violet-50 text-violet-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>{r.resourceType}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.uploaderName}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${r.isApproved ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {r.isApproved ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {r.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(r._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
