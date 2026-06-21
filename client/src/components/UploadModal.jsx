import React, { useState } from 'react';
import axios from 'axios';
import './UploadModal.css';

const UploadModal = ({ isOpen, onClose, subjects, currentSubjectId, onUploadSuccess }) => {
  const [title, setTitle] = useState('');
  const [resourceType, setResourceType] = useState('Notes');
  const [year, setYear] = useState('');
  const [subjectId, setSubjectId] = useState(currentSubjectId || '');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('resourceType', resourceType);
    if (year) formData.append('year', year);
    formData.append('subjectId', subjectId);
    formData.append('file', file);

    try {
      await axios.post('http://localhost:5000/api/resources/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      setIsUploading(false);
      onUploadSuccess(subjectId);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to upload resource. Please try again.');
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel">
        <h2>Upload Resource</h2>
        <button className="close-btn" onClick={onClose}>&times;</button>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Subject</label>
            <select 
              value={subjectId} 
              onChange={(e) => setSubjectId(e.target.value)} 
              required
            >
              <option value="">Select a Subject</option>
              {subjects.map(sub => (
                <option key={sub._id} value={sub._id}>{sub.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Title</label>
            <input 
              type="text" 
              placeholder="e.g. Unit 1 Handwritten Notes" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Resource Type</label>
            <select 
              value={resourceType} 
              onChange={(e) => setResourceType(e.target.value)}
            >
              <option value="Notes">Notes</option>
              <option value="Question Paper">Question Paper</option>
              <option value="Syllabus">Syllabus</option>
            </select>
          </div>

          {resourceType === 'Question Paper' && (
            <div className="form-group">
              <label>Year</label>
              <input 
                type="number" 
                placeholder="e.g. 2023" 
                value={year} 
                onChange={(e) => setYear(e.target.value)} 
                required 
              />
            </div>
          )}

          <div className="form-group">
            <label>File (PDF/Image)</label>
            <input 
              type="file" 
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files[0])} 
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary submit-btn" 
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
