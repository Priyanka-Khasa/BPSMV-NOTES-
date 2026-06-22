import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BookOpen, FileText, ExternalLink, Trash2, Upload, ArrowRight, ChevronRight } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    if (user && !user.onboarded) {
      navigate('/onboarding');
      return;
    }
    if (user?.degree && user?.branch) {
      fetchSubjects(user.degree, user.branch);
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSubjects = async (degree, branch) => {
    try {
      const res = await axios.get(`${API_URL}/resources/subjects?degree=${degree}&branch=${branch}`);
      setSubjects(res.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async (subjectId) => {
    setSelectedSubject(subjectId);
    try {
      const res = await axios.get(`${API_URL}/resources/subject/${subjectId}`);
      setResources(res.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this resource?')) return;
    try {
      await axios.delete(`${API_URL}/resources/${id}`);
      fetchResources(selectedSubject);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const selectedSubjectObj = subjects.find(s => s._id === selectedSubject);

  const groupedSubjects = subjects.reduce((acc, s) => {
    const sem = `Semester ${s.semester}`;
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(s);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Sidebar */}
      <div className="lg:col-span-3 space-y-4">
        <div className="card p-4">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&background=2563eb&color=fff`}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 text-sm truncate">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.degree} · {user?.branch}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setUploadOpen(true)} className="btn btn-primary flex-1 text-sm py-2">
              <Upload size={14} /> Upload
            </button>
            <button onClick={() => navigate('/resources')} className="btn btn-secondary flex-1 text-sm py-2">
              Browse
            </button>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <BookOpen size={16} className="text-brand-600" /> Your Subjects
          </h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {Object.entries(groupedSubjects).map(([sem, items]) => (
              <div key={sem}>
                <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">{sem}</p>
                <div className="space-y-1">
                  {items.map(sub => (
                    <button
                      key={sub._id}
                      onClick={() => fetchResources(sub._id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedSubject === sub._id
                          ? 'bg-brand-50 text-brand-700 font-medium'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {subjects.length === 0 && (
              <p className="text-sm text-slate-400 italic">No subjects found for your branch.</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-9 space-y-4">
        <div className="card p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-display font-bold text-slate-900">
              {selectedSubjectObj ? selectedSubjectObj.name : 'Dashboard'}
            </h1>
            <p className="text-sm text-slate-500">
              {selectedSubjectObj ? `${selectedSubjectObj.degree} · ${selectedSubjectObj.branch} · Sem ${selectedSubjectObj.semester}` : 'Select a subject to view resources'}
            </p>
          </div>
          {selectedSubject && (
            <div className="flex gap-2">
              <button onClick={() => setUploadOpen(true)} className="btn btn-primary text-sm py-2">
                <Upload size={14} /> Upload
              </button>
              <button onClick={() => navigate(`/chat?subject=${selectedSubject}`)} className="btn btn-secondary text-sm py-2">
                Discussion
              </button>
            </div>
          )}
        </div>

        {!selectedSubject ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-brand-50 text-brand-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen size={32} />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Welcome back, {user?.name?.split(' ')[0]}!</h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">Select a subject from the sidebar to view notes, question papers, and shared resources.</p>
            <button onClick={() => navigate('/resources')} className="btn btn-primary">
              Explore All Resources <ArrowRight size={16} />
            </button>
          </div>
        ) : resources.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText size={32} />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">No resources yet</h2>
            <p className="text-slate-500 mb-6">Be the first to upload notes or question papers for this subject.</p>
            <button onClick={() => setUploadOpen(true)} className="btn btn-primary">
              <Upload size={16} /> Upload Resource
            </button>
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
                {res.year && <p className="text-xs text-slate-500 mb-1">Year: {res.year}</p>}
                <p className="text-xs text-slate-400 mb-4">By {res.uploaderName} · {new Date(res.createdAt).toLocaleDateString()}</p>
                <div className="mt-auto">
                  {res.resourceType === 'Link' ? (
                    <a href={res.linkUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary w-full text-sm py-2">
                      <ExternalLink size={14} /> Open Link
                    </a>
                  ) : (
                    <button onClick={() => navigate(`/viewer/${res._id}`)} className="btn btn-primary w-full text-sm py-2">
                      <FileText size={14} /> View PDF
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {uploadOpen && (
        <UploadModal
          isOpen={uploadOpen}
          onClose={() => setUploadOpen(false)}
          subjects={subjects}
          currentSubjectId={selectedSubject}
          onUploadSuccess={() => selectedSubject && fetchResources(selectedSubject)}
        />
      )}
    </div>
  );
};

/* Inline UploadModal for Dashboard reuse */
const UploadModal = ({ isOpen, onClose, subjects, currentSubjectId, onUploadSuccess }) => {
  const [title, setTitle] = useState('');
  const [resourceType, setResourceType] = useState('Note');
  const [year, setYear] = useState('');
  const [subjectId, setSubjectId] = useState(currentSubjectId || '');
  const [file, setFile] = useState(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (resourceType !== 'Link' && !file) { setError('Please select a file.'); return; }
    if (resourceType === 'Link' && !linkUrl) { setError('Please enter a link URL.'); return; }

    setIsUploading(true); setError('');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('resourceType', resourceType);
    if (year) formData.append('year', year);
    formData.append('subjectId', subjectId);
    if (file) formData.append('file', file);
    if (linkUrl) formData.append('linkUrl', linkUrl);

    try {
      await axios.post(`${API_URL}/resources/add`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      setIsUploading(false);
      onUploadSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-display font-bold text-slate-900">Upload Resource</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700">&times;</button>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="input-field" required>
              <option value="">Select a Subject</option>
              {subjects.map(sub => <option key={sub._id} value={sub._id}>{sub.name} (Sem {sub.semester})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input type="text" placeholder="e.g. Unit 1 Handwritten Notes" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Resource Type</label>
            <select value={resourceType} onChange={(e) => setResourceType(e.target.value)} className="input-field">
              <option value="Note">Notes</option>
              <option value="Question Paper">Question Paper</option>
              <option value="Link">External Link</option>
              <option value="Syllabus">Syllabus</option>
            </select>
          </div>
          {resourceType === 'Question Paper' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
              <input type="number" placeholder="e.g. 2023" value={year} onChange={(e) => setYear(e.target.value)} className="input-field" />
            </div>
          )}
          {resourceType === 'Link' ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Link URL</label>
              <input type="url" placeholder="https://..." value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="input-field" required />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">File (PDF/Image)</label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files[0])} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" required />
            </div>
          )}
          <button type="submit" disabled={isUploading} className="btn btn-primary w-full">
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
