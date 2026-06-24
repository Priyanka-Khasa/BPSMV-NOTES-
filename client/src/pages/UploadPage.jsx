import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Upload, FileText, ArrowRight, ExternalLink, CheckCircle, Sparkles, CloudUpload } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const UploadPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [title, setTitle] = useState('');
  const [resourceType, setResourceType] = useState('Note');
  const [year, setYear] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [file, setFile] = useState(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`${API_URL}/resources/subjects`);
      setSubjects(res.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (resourceType !== 'Link' && !file) { setError('Please select a file.'); return; }
    if (resourceType === 'Link' && !linkUrl) { setError('Please enter a link URL.'); return; }

    setIsUploading(true); setError(''); setSuccess('');
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
      setSuccess('Resource uploaded successfully!');
      setTitle(''); setYear(''); setFile(null); setLinkUrl(''); setSubjectId('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="card p-8 sm:p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-40 h-40 bg-brand-100/40 rounded-full blur-3xl -z-0 group-hover:scale-150 transition-transform duration-700"></div>
        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <Upload size={28} />
            </div>
            <h1 className="text-2xl font-display font-bold text-slate-900 mb-1">Upload Resource</h1>
            <p className="text-slate-500 text-sm">Share notes, question papers, or useful links with fellow students.</p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200 animate-shake">{error}</div>}
          {success && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm border border-emerald-200 flex items-center gap-2 animate-pop">
              <CheckCircle size={16} /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="animate-slide-up" style={{ animationDelay: '0.05s' }}>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="input-field" required>
                <option value="">Select a Subject</option>
                {subjects.map(sub => <option key={sub._id} value={sub._id}>{sub.name} ({sub.degree} · {sub.branch} · Sem {sub.semester})</option>)}
              </select>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input type="text" placeholder="e.g. Unit 1 Handwritten Notes" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" required />
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
              <label className="block text-sm font-medium text-slate-700 mb-1">Resource Type</label>
              <select value={resourceType} onChange={(e) => setResourceType(e.target.value)} className="input-field">
                <option value="Note">Notes</option>
                <option value="Question Paper">Question Paper</option>
                <option value="Link">External Link</option>
                <option value="Syllabus">Syllabus</option>
              </select>
            </div>

            {resourceType === 'Question Paper' && (
              <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                <input type="number" placeholder="e.g. 2023" value={year} onChange={(e) => setYear(e.target.value)} className="input-field" />
              </div>
            )}

            {resourceType === 'Link' ? (
              <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <label className="block text-sm font-medium text-slate-700 mb-1">Link URL</label>
                <input type="url" placeholder="https://..." value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="input-field" required />
              </div>
            ) : (
              <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <label className="block text-sm font-medium text-slate-700 mb-1">File (PDF/Image)</label>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
                    dragActive
                      ? 'border-brand-500 bg-brand-50/50 shadow-lg shadow-brand-500/10'
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <CloudUpload size={32} className={`mx-auto mb-2 transition-colors duration-300 ${dragActive ? 'text-brand-500' : 'text-slate-400'}`} />
                  <p className="text-sm text-slate-600 mb-1">
                    {file ? file.name : 'Drag & drop a file here, or click to browse'}
                  </p>
                  <p className="text-xs text-slate-400">PDF, JPG, PNG up to 10MB</p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                    id="file-upload"
                    required={!file}
                  />
                  <label htmlFor="file-upload" className="btn btn-secondary text-sm mt-3 cursor-pointer inline-flex">
                    <FileText size={14} /> Browse Files
                  </label>
                </div>
                {file && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 animate-pop">
                    <CheckCircle size={14} /> Selected: {file.name}
                  </div>
                )}
              </div>
            )}

            <button type="submit" disabled={isUploading} className="btn btn-primary w-full shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 hover:-translate-y-0.5 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.25s' }}>
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Uploading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles size={16} /> Upload Resource
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
