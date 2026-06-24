import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Trash2, FileText, CheckCircle, XCircle, AlertTriangle, BarChart3, TrendingUp, Users, Clock } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchResources();
  }, [filter]);

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

  const filteredResources = resources.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.subjectName?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: 'Total Resources', value: resources.length, icon: FileText, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Pending', value: resources.filter(r => !r.isApproved).length, icon: AlertTriangle, color: 'text-brand-700', bg: 'bg-brand-100' },
    { label: 'Approved', value: resources.filter(r => r.isApproved).length, icon: CheckCircle, color: 'text-brand-600', bg: 'bg-brand-50' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 rounded-xl flex items-center justify-center shadow-sm">
          <Shield size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Admin Panel</h1>
          <p className="text-sm text-slate-500">Manage and moderate all resources</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="card p-5 flex items-center gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-500 group">
              <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters & Search */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          {['all', 'approved', 'pending'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                filter === f
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:-translate-y-0.5'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-4"
          />
        </div>
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
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-brand-200 border-t-brand-600 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredResources.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    <FileText size={32} className="mx-auto mb-3 text-slate-300" />
                    No resources found.
                  </td>
                </tr>
              ) : (
                filteredResources.map(r => (
                  <tr key={r._id} className="hover:bg-slate-50 transition-colors duration-200 group">
                    <td className="px-4 py-3 font-medium text-slate-900 group-hover:text-brand-700 transition-colors">{r.title}</td>
                    <td className="px-4 py-3 text-slate-600">{r.subjectName}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${
                        r.resourceType === 'Note' ? 'bg-brand-50 text-brand-700' :
                        r.resourceType === 'Question Paper' ? 'bg-brand-100 text-brand-800' :
                        'bg-brand-50 text-brand-700'
                      }`}>{r.resourceType}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.uploaderName}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                        r.isApproved
                          ? 'bg-brand-50 text-brand-600 ring-1 ring-brand-200/50'
                          : 'bg-brand-50 text-brand-700 ring-1 ring-brand-300/50'
                      }`}>
                        {r.isApproved ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {r.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-12"
                      >
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
