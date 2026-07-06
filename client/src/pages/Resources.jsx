import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, FileText, ExternalLink, Trash2, BookOpen, X, Sparkles, Grid, List, ArrowUpDown } from 'lucide-react';

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
  const [viewMode, setViewMode] = useState('grid');

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
      const res = await axios.get(`/resources/all?${params.toString()}`);
      setResources(res.data.resources || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const res = await axios.get(`/resources/filter-options`);
      setFilterOptions(res.data);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`/resources/subjects`);
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
      await axios.delete(`/resources/${id}`);
      fetchResources();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 rounded-xl flex items-center justify-center shadow-sm">
            <BookOpen size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900">All Resources</h1>
            <p className="text-sm text-slate-500">Browse and discover academic materials</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all duration-300"
            title={viewMode === 'grid' ? 'List view' : 'Grid view'}
          >
            {viewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="card p-4 hover:shadow-md transition-all duration-300">
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
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`btn btn-secondary text-sm relative ${showFilters ? 'bg-brand-50 text-brand-700 border-brand-200' : ''}`}
            >
              <Filter size={16} /> Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pop">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button type="submit" className="btn btn-primary text-sm shadow-brand-500/20 hover:shadow-brand-500/30">
              <Search size={16} /> Search
            </button>
          </div>
        </form>

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-200 overflow-hidden transition-all duration-500 ${showFilters ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
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
            <button onClick={applyFilters} className="btn btn-primary text-sm shadow-brand-500/20">Apply Filters</button>
            <button onClick={clearFilters} className="btn btn-secondary text-sm">Clear</button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {loading ? 'Loading resources...' : `${resources.length} resource${resources.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-brand-200 border-t-brand-600"></div>
        </div>
      ) : resources.length === 0 ? (
        <div className="card p-12 text-center animate-scale-in">
          <BookOpen size={40} className="text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">No resources found</h2>
          <p className="text-slate-500">Try adjusting your search or filters.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
          {resources.map((res, idx) => (
            <div key={res._id} className="card p-5 flex flex-col group hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
              <div className="flex items-center justify-between mb-3">
                <span className={`badge ${
                  res.resourceType === 'Note' ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200/50' :
                  res.resourceType === 'Question Paper' ? 'bg-brand-100 text-brand-800 ring-1 ring-brand-300/50' :
                  res.resourceType === 'Link' ? 'bg-brand-200 text-brand-900 ring-1 ring-brand-300/50' :
                  'bg-brand-50 text-brand-700 ring-1 ring-brand-200/50'
                }`}>
                  {res.resourceType}
                </span>
                <button onClick={() => handleDelete(res._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-12">
                  <Trash2 size={14} />
                </button>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2 group-hover:text-brand-700 transition-colors duration-300">{res.title}</h3>
              <p className="text-xs text-slate-500 mb-1">{res.subjectName} · {res.degree} · {res.branch}</p>
              {res.year && <p className="text-xs text-slate-500 mb-1">Year: {res.year}</p>}
              <p className="text-xs text-slate-400 mb-4">By {res.uploaderName} · {new Date(res.createdAt).toLocaleDateString()}</p>
              <div className="mt-auto">
                {res.resourceType === 'Link' ? (
                  <a href={res.linkUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary w-full text-sm py-2 hover:bg-brand-50 hover:text-brand-700 transition-all duration-300">
                    <ExternalLink size={14} /> Open Link
                  </a>
                ) : (
                  <button onClick={() => navigate(`/viewer/${res._id}`)} className="btn btn-primary w-full text-sm py-2 shadow-brand-500/15 hover:shadow-brand-500/25 hover:-translate-y-0.5 transition-all duration-300">
                    <FileText size={14} /> View
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden stagger-children">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Uploader</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {resources.map(r => (
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
                    <td className="px-4 py-3 text-right">
                      {r.resourceType === 'Link' ? (
                        <a href={r.linkUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary text-xs py-1.5 px-3">
                          <ExternalLink size={12} /> Open
                        </a>
                      ) : (
                        <button onClick={() => navigate(`/viewer/${r._id}`)} className="btn btn-primary text-xs py-1.5 px-3">
                          <FileText size={12} /> View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;
