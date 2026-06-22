import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, FileText, ExternalLink, Trash2, BookOpen, X } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Resources = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ degrees: [], branches: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ degree: '', branch: '', semester: '', year: '', resourceType: '', subjectId: '' });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchResources();
    fetchFilterOptions();
    fetchSubjects();
  }, []);

  const fetchResources = async (override = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const merged = { ...filters, ...override };
      Object.entries(merged).forEach(([k, v]) => { if (v) params.append(k, v); });
      if (search) params.append('search', search);
      const res = await axios.get(`${API_URL}/resources/all?${params.toString()}`);
      setResources(res.data.resources || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const res = await axios.get(`${API_URL}/resources/filter-options`);
      setFilterOptions(res.data);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`${API_URL}/resources/subjects`);
      setSubjects(res.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchResources();
  };

  const applyFilters = () => {
    fetchResources();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({ degree: '', branch: '', semester: '', year: '', resourceType: '', subjectId: '' });
    fetchResources({ degree: '', branch: '', semester: '', year: '', resourceType: '', subjectId: '' });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-display font-bold text-slate-900">All Resources</h1>
      </div>

      {/* Search & Filter */}
      <div className="card p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by title or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowFilters(!showFilters)} className="btn btn-secondary text-sm">
              <Filter size={16} /> Filters
            </button>
            <button type="submit" className="btn btn-primary text-sm">
              Search
            </button>
          </div>
        </form>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-200">
            <select value={filters.degree} onChange={(e) => setFilters({ ...filters, degree: e.target.value })} className="input-field">
              <option value="">All Degrees</option>
              {filterOptions.degrees.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={filters.branch} onChange={(e) => setFilters({ ...filters, branch: e.target.value })} className="input-field">
              <option value="">All Branches</option>
              {filterOptions.branches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <select value={filters.semester} onChange={(e) => setFilters({ ...filters, semester: e.target.value })} className="input-field">
              <option value="">All Semesters</option>
              {[1,2,3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
            <select value={filters.resourceType} onChange={(e) => setFilters({ ...filters, resourceType: e.target.value })} className="input-field">
              <option value="">All Types</option>
              <option value="Note">Notes</option>
              <option value="Question Paper">Question Paper</option>
              <option value="Link">Link</option>
              <option value="Syllabus">Syllabus</option>
            </select>
            <select value={filters.subjectId} onChange={(e) => setFilters({ ...filters, subjectId: e.target.value })} className="input-field">
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            <input
              type="number"
              placeholder="Year (e.g. 2023)"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              className="input-field"
            />
            <div className="sm:col-span-2 lg:col-span-3 flex gap-2">
              <button onClick={applyFilters} className="btn btn-primary text-sm">Apply Filters</button>
              <button onClick={clearFilters} className="btn btn-secondary text-sm">Clear</button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      ) : resources.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen size={40} className="text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">No resources found</h2>
          <p className="text-slate-500">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {resources.map(res => (
            <div key={res._id} className="card p-5 flex flex-col animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <span className={`badge ${
                  res.resourceType === 'Note' ? 'bg-emerald-50 text-emerald-700' :
                  res.resourceType === 'Question Paper' ? 'bg-violet-50 text-violet-700' :
                  res.resourceType === 'Link' ? 'bg-sky-50 text-sky-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {res.resourceType}
                </span>
                {(user?.role === 'admin' || res.uploadedBy?._id === user?._id) && (
                  <button onClick={() => handleDelete(res._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">{res.title}</h3>
              <p className="text-xs text-slate-500 mb-1">{res.subjectName} · {res.degree} · {res.branch}</p>
              {res.year && <p className="text-xs text-slate-500 mb-1">Year: {res.year}</p>}
              <p className="text-xs text-slate-400 mb-4">By {res.uploaderName} · {new Date(res.createdAt).toLocaleDateString()}</p>
              <div className="mt-auto">
                {res.resourceType === 'Link' ? (
                  <a href={res.linkUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary w-full text-sm py-2">
                    <ExternalLink size={14} /> Open Link
                  </a>
                ) : (
                  <button onClick={() => navigate(`/viewer/${res._id}`)} className="btn btn-primary w-full text-sm py-2">
                    <FileText size={14} /> View / Download
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Resources;
