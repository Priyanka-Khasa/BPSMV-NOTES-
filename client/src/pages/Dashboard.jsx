import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BookOpen, FileText, ExternalLink, Trash2, Upload, ArrowRight, MessageSquare, TrendingUp, Clock, Layers, Search, UserRound } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    if (user?.degree && user?.branch && user?.semester) {
      fetchSubjects();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSubjects = async () => {
    setLoading(true);
    setSelectedSubject(null);
    setResources([]);
    try {
      const params = new URLSearchParams({
        degree: user.degree,
        branch: user.branch,
        semester: String(user.semester)
      });
      if (user.yearOfStudy) params.set('year', String(user.yearOfStudy));
      const res = await axios.get(`/resources/subjects?${params.toString()}`);
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

  const currentSemesterLabel = user?.semester ? `Semester ${user.semester}` : 'Semester';
  const visibleSubjects = subjects;
  const firstName = user?.name?.split(' ')[0] || 'Student';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-brand-200 border-t-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="relative animate-fade-in">
      <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[340px_minmax(0,1fr)] gap-4 lg:gap-6">
        <section className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <div className="cinematic-card p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&background=c17a5c&color=fff`}
                  alt=""
                  className="h-12 w-12 rounded-xl object-cover ring-2 ring-white shadow-md shadow-brand-500/10 sm:h-14 sm:w-14"
                />
                <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm"></div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-bold text-slate-900">Hi, {firstName}</p>
                <p className="truncate text-xs font-medium text-slate-500">{user?.degree} / {user?.branch} / Sem {user?.semester || '-'}</p>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/80 text-slate-600 shadow-sm ring-1 ring-white/80 transition-all hover:bg-white hover:text-brand-700"
                title="Profile"
                aria-label="Profile"
              >
                <UserRound size={18} />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => setUploadOpen(true)} className="btn btn-primary min-h-11 px-3 py-2 text-sm shadow-brand-500/20 hover:shadow-brand-500/30">
                <Upload size={15} /> Upload
              </button>
              <button onClick={() => navigate('/resources')} className="btn btn-secondary min-h-11 px-3 py-2 text-sm">
                <Search size={15} /> Browse
              </button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-white/70 p-3 text-center ring-1 ring-white/80">
                <Layers size={16} className="mx-auto mb-1 text-brand-600" />
                <p className="text-lg font-bold leading-none text-slate-900">{subjects.length}</p>
                <p className="mt-1 text-[11px] font-medium text-slate-500">Subjects</p>
              </div>
              <div className="rounded-xl bg-white/70 p-3 text-center ring-1 ring-white/80">
                <Clock size={16} className="mx-auto mb-1 text-brand-600" />
                <p className="text-lg font-bold leading-none text-slate-900">{user?.semester || '-'}</p>
                <p className="mt-1 text-[11px] font-medium text-slate-500">Semester</p>
              </div>
              <div className="rounded-xl bg-white/70 p-3 text-center ring-1 ring-white/80">
                <TrendingUp size={16} className="mx-auto mb-1 text-brand-600" />
                <p className="text-lg font-bold leading-none text-slate-900">{resources.length}</p>
                <p className="mt-1 text-[11px] font-medium text-slate-500">Open</p>
              </div>
            </div>
          </div>

          <div className="cinematic-card p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <BookOpen size={17} className="text-brand-600" /> Subjects
              </h2>
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                {currentSemesterLabel}
              </span>
            </div>

            <div className="grid max-h-[260px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 xl:max-h-[360px] xl:grid-cols-1">
              {visibleSubjects.map(sub => (
                <button
                  key={sub._id}
                  onClick={() => fetchResources(sub._id)}
                  className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-300 ${
                    selectedSubject === sub._id
                      ? 'bg-white text-brand-700 font-semibold shadow-sm shadow-brand-500/10 ring-1 ring-brand-200/70'
                      : 'bg-white/45 text-slate-600 ring-1 ring-white/60 hover:bg-white/80 hover:shadow-sm'
                  }`}
                >
                  <span className="line-clamp-2 leading-snug">{sub.name}</span>
                </button>
              ))}
              {subjects.length === 0 && (
                <p className="rounded-xl bg-white/60 p-3 text-sm italic text-slate-500">No subjects added for your current semester yet.</p>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="cinematic-card bg-gradient-to-r from-white/92 via-brand-50/40 to-emerald-50/35 p-4 sm:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
                  {selectedSubjectObj ? `Semester ${selectedSubjectObj.semester}` : 'Dashboard'}
                </p>
                <h1 className="line-clamp-2 text-xl font-display font-bold text-slate-900 sm:text-2xl">
                  {selectedSubjectObj ? selectedSubjectObj.name : 'Pick a subject to start'}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedSubjectObj ? `${selectedSubjectObj.degree} / ${selectedSubjectObj.branch}` : 'Notes, papers, uploads, and discussion stay focused after you choose one subject.'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <button onClick={() => setUploadOpen(true)} className="btn btn-primary min-h-11 px-3 py-2 text-sm shadow-brand-500/20 hover:shadow-brand-500/30">
                  <Upload size={15} /> Upload
                </button>
                <button onClick={() => selectedSubject ? navigate(`/chat?subject=${selectedSubject}`) : navigate('/resources')} className="btn btn-secondary min-h-11 px-3 py-2 text-sm">
                  {selectedSubject ? <MessageSquare size={15} /> : <ArrowRight size={15} />}
                  {selectedSubject ? 'Discussion' : 'Explore'}
                </button>
              </div>
            </div>
          </div>

        {!selectedSubject ? (
          <div className="cinematic-card overflow-hidden">
            <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_300px]">
              <div className="p-5 sm:p-7">
                <p className="mb-2 text-sm font-semibold text-brand-700">Welcome back, {firstName}</p>
                <h2 className="max-w-xl text-2xl font-display font-bold text-slate-900 sm:text-3xl">Choose one subject and the dashboard becomes a focused study desk.</h2>
                <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">Your dashboard now shows only {user?.branch || 'your branch'} Semester {user?.semester || '-'} subjects. Choose one to see notes, papers, links, and discussion.</p>
                <button onClick={() => navigate('/resources')} className="btn btn-primary mt-5 min-h-11 px-4 py-2.5 text-sm shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30">
                  Explore All Resources <ArrowRight size={16} />
                </button>
              </div>
              <img
                src="/image4.jpeg"
                alt="Bright study desk"
                className="hidden h-full min-h-[260px] w-full object-cover md:block"
              />
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
                      <FileText size={14} /> View
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        </section>
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

