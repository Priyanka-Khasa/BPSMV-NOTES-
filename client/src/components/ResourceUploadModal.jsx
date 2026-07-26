import React, { useState } from 'react';
import axios from 'axios';
import { Upload } from 'lucide-react';

const ResourceUploadModal = ({ isOpen, onClose, subjects, currentSubjectId, onUploadSuccess }) => {
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
    if (resourceType !== 'Link' && !file) {
      setError('Please select a file.');
      return;
    }
    if (resourceType === 'Link' && !linkUrl) {
      setError('Please enter a link URL.');
      return;
    }

    setIsUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('resourceType', resourceType);
    if (year) formData.append('year', year);
    formData.append('subjectId', subjectId);
    if (file) formData.append('file', file);
    if (linkUrl) formData.append('linkUrl', linkUrl);

    try {
      await axios.post('/resources/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl animate-scale-in sm:max-h-[90vh] sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex min-w-0 items-center gap-2 text-base font-semibold text-slate-900 sm:text-lg">
            <Upload size={18} className="text-slate-700" /> Upload Resource
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700 hover:rotate-90"
          >
            &times;
          </button>
        </div>
        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 animate-shake">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Subject</label>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="input-field" required>
              <option value="">Select a Subject</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name} (Sem {subject.semester})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
            <input type="text" placeholder="e.g. Unit 1 Handwritten Notes" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Resource Type</label>
            <select value={resourceType} onChange={(e) => setResourceType(e.target.value)} className="input-field">
              <option value="Note">Notes</option>
              <option value="Question Paper">Question Paper</option>
              <option value="Link">External Link</option>
              <option value="Syllabus">Syllabus</option>
            </select>
          </div>
          {resourceType === 'Question Paper' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Year</label>
              <input type="number" placeholder="e.g. 2023" value={year} onChange={(e) => setYear(e.target.value)} className="input-field" />
            </div>
          )}
          {resourceType === 'Link' ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Link URL</label>
              <input type="url" placeholder="https://..." value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="input-field" required />
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">File (PDF/Image)</label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files[0])} className="block w-full cursor-pointer text-sm text-slate-500 transition-all file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200" required />
            </div>
          )}
          <button type="submit" disabled={isUploading} className="btn dashboard-action-primary w-full text-sm">
            {isUploading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                Uploading...
              </span>
            ) : (
              'Upload'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResourceUploadModal;
