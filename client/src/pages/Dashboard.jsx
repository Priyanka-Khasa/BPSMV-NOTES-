import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BookOpen, FileText, ExternalLink, Trash2, Upload, ArrowRight, MessageSquare, Sparkles, TrendingUp, Clock, Layers } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    if (user?.degree && user?.branch) {
      fetchSubjects(user.degree, user.branch);
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSubjects = async (degree, branch) => {
    try {
      const res = await axios.get(`/resources/subjects?degree=${degree}&branch=${branch}`);
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
      const res = await axios.get(`/resources/subject/${subjectId}`);
      setResources(res.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this resource?')) return;
    try {
      await axios.delete(`/resources/${id}`);
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
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-brand-200 border-t-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      <div className="orb -left-24 top-10 w-72 h-72 bg-amber-300/16 animate-drift"></div>
      <div className="orb right-0 top-1/3 w-96 h-96 bg-emerald-300/12 animate-spotlight"></div>
      {/* Sidebar */}
      <div className="relative z-10 lg:col-span-3 space-y-4">
        {/* Profile Card */}
        <div className="cinematic-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&background=c17a5c&color=fff`}
                alt=""
                className="w-12 h-12 rounded-full object-cover ring-4 ring-white shadow-lg shadow-brand-500/10"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 text-sm truncate">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.degree} / {user?.branch}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setUploadOpen(true)} className="btn btn-primary text-sm py-2 shadow-brand-500/20 hover:shadow-brand-500/30">
              <Upload size={14} /> Upload
            </button>
            <button onClick={() => navigate('/resources')} className="btn btn-secondary text-sm py-2">
              Browse
            </button>
          </div>
        </div>

        {/* Stats mini */}
        <div className="grid grid-cols-2 gap-3">
          <div className="cinematic-panel rounded-2xl p-3 text-center hover:scale-[1.02] transition-all duration-300">
            <Layers size={18} className="mx-auto mb-1 text-brand-500" />
            <p className="text-lg font-bold text-slate-900">{subjects.length}</p>
            <p className="text-xs text-slate-500">Subjects</p>
          </div>
          <div className="cinematic-panel rounded-2xl p-3 text-center hover:scale-[1.02] transition-all duration-300">
            <TrendingUp size={18} className="mx-auto mb-1 text-brand-500" />
            <p className="text-lg font-bold text-slate-900">{resources.length}</p>
            <p className="text-xs text-slate-500">Resources</p>
          </div>
        </div>

        {/* Subjects */}
        <div className="cinematic-card p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <BookOpen size={16} className="text-brand-600" /> Your Subjects
          </h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {Object.entries(groupedSubjects).map(([sem, items]) => (
              <div key={sem} className="animate-slide-up">
                <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Clock size={10} /> {sem}
                </p>
                <div className="space-y-1">
                  {items.map(sub => (
                    <button
                      key={sub._id}
                      onClick={() => fetchResources(sub._id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all duration-300 ${
                        selectedSubject === sub._id
                          ? 'bg-white text-brand-700 font-semibold shadow-sm shadow-brand-500/10 ring-1 ring-brand-200/60'
                          : 'text-slate-600 hover:bg-white/70 hover:translate-x-0.5 hover:shadow-sm'
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
      <div className="relative z-10 lg:col-span-9 space-y-4">
        {/* Header Card */}
        <div className="cinematic-card p-5 flex items-center justify-between flex-wrap gap-3 bg-gradient-to-r from-white/90 via-brand-50/45 to-emerald-50/35">
          <div>
            <h1 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
              {selectedSubjectObj ? selectedSubjectObj.name : `Welcome, ${user?.name?.split(' ')[0] || 'Student'}`}
              {!selectedSubject && <Sparkles size={18} className="text-brand-500 animate-wiggle" />}
            </h1>
            <p className="text-sm text-slate-500">
              {selectedSubjectObj ? `${selectedSubjectObj.degree} / ${selectedSubjectObj.branch} / Sem ${selectedSubjectObj.semester}` : 'Choose a subject and continue your study flow'}
            </p>
          </div>
          {selectedSubject && (
            <div className="flex gap-2">
              <button onClick={() => setUploadOpen(true)} className="btn btn-primary text-sm py-2 shadow-brand-500/20 hover:shadow-brand-500/30">
                <Upload size={14} /> Upload
              </button>
              <button onClick={() => navigate(`/chat?subject=${selectedSubject}`)} className="btn btn-secondary text-sm py-2 flex items-center gap-1.5">
                <MessageSquare size={14} /> Discussion
              </button>
            </div>
          )}
        </div>

        {!selectedSubject ? (
          <div className="cinematic-card p-8 sm:p-12 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-56 h-56 bg-brand-100/60 rounded-full blur-3xl -z-0 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-emerald-100/45 rounded-full blur-3xl -z-0 animate-spotlight"></div>
            <div className="relative z-10">
              <div className="relative w-full max-w-xs mx-auto mb-6">
                <div className="absolute -inset-5 bg-gradient-to-br from-brand-100/70 via-amber-100/50 to-emerald-100/40 rounded-3xl blur-xl"></div>
                <img
                  src="/image4.jpeg"
                  alt="Bright aesthetic study desk"
                  className="relative w-full h-auto rounded-2xl shadow-2xl shadow-brand-500/20 object-cover ring-1 ring-white/80 transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mb-2">Welcome back, {user?.name?.split(' ')[0]}!</h2>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">Your dashboard is ready. Pick a subject to open notes, question papers, discussions, and shared resources.</p>
              <button onClick={() => navigate('/resources')} className="btn btn-primary shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 hover:-translate-y-0.5">
                Explore All Resources <ArrowRight size={16} className="animate-bounce-x" />
              </button>
            </div>
          </div>
        ) : resources.length === 0 ? (
          <div className="cinematic-card p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-white to-brand-50 text-brand-300 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/10 ring-1 ring-white">
              <FileText size={32} />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">No resources yet</h2>
            <p className="text-slate-500 mb-6">Be the first to upload notes or question papers for this subject.</p>
            <button onClick={() => setUploadOpen(true)} className="btn btn-primary shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 hover:-translate-y-0.5">
              <Upload size={16} /> Upload Resource
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
            {resources.map((res, idx) => (
              <div key={res._id} className="cinematic-card p-5 flex flex-col group">
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
                {res.year && <p className="text-xs text-slate-500 mb-1">Year: {res.year}</p>}
                <p className="text-xs text-slate-400 mb-4">By {res.uploaderName} / {new Date(res.createdAt).toLocaleDateString()}</p>
                <div className="mt-auto">
                  {res.resourceType === 'Link' ? (
                    <a href={res.linkUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary w-full text-sm py-2 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition-all duration-300">
                      <ExternalLink size={14} /> Open Link
                    </a>
                  ) : (
                    <button onClick={() => navigate(`/viewer/${res._id}`)} className="btn btn-primary w-full text-sm py-2 shadow-brand-500/15 hover:shadow-brand-500/25 hover:-translate-y-0.5 transition-all duration-300">
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
      await axios.post(`/resources/add`, formData, {
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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-display font-bold text-slate-900 flex items-center gap-2">
            <Upload size={18} className="text-brand-600" /> Upload Resource
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 hover:rotate-90 transition-all duration-300">&times;</button>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 animate-shake">{error}</div>}
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
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files[0])} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 transition-all cursor-pointer" required />
            </div>
          )}
          <button type="submit" disabled={isUploading} className="btn btn-primary w-full shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 hover:-translate-y-0.5 transition-all duration-300">
            {isUploading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Uploading...
              </span>
            ) : 'Upload'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;

