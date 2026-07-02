import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, FileText, Calendar, User, BookOpen, ExternalLink, ShieldCheck, CheckCircle, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const getYoutubeEmbedUrl = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
};

const isDirectVideo = (url) => /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);

const PDFViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completeSaving, setCompleteSaving] = useState(false);
  const [completeMessage, setCompleteMessage] = useState('');

  useEffect(() => {
    fetchResource();
  }, [id]);

  const fetchResource = async () => {
    try {
      const res = await axios.get(`/resources/${id}`);
      setResource(res.data);
      if (res.data.fileType === 'pdf') {
        axios.post(`/activity/pdf-open/${id}`).catch(() => {});
      }
    } catch (err) {
      setError('Resource not found or could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  const markCompleted = async () => {
    setCompleteSaving(true);
    setCompleteMessage('');
    try {
      await axios.post(`/activity/pdf-complete/${id}`);
      setCompleteMessage('Marked completed. Your profile activity is updated.');
      setTimeout(() => setCompleteMessage(''), 3000);
    } catch (err) {
      setCompleteMessage(err.response?.data?.message || 'Could not mark this PDF completed.');
    } finally {
      setCompleteSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-brand-200 border-t-brand-600"></div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="card p-8 text-center max-w-md animate-scale-in">
          <FileText size={40} className="text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Resource not found</h2>
          <button onClick={() => navigate(-1)} className="btn btn-primary mt-4 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 hover:-translate-y-0.5 transition-all duration-300">
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const isPdf = resource.fileType === 'pdf';
  const isImage = resource.fileType === 'image';
  const hasProtectedPreview = isPdf || isImage;
  const secureFileUrl = `${API_BASE}/resources/${id}/file`;
  const securePdfUrl = `${secureFileUrl}#toolbar=0&navpanes=0&scrollbar=0&download=0&print=0`;

  return (
    <div className="space-y-4 animate-fade-in" onContextMenu={(event) => event.preventDefault()}>
      {/* Header */}
      <div className="card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-all duration-300 hover:scale-105 mt-0.5">
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900">{resource.title}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1"><BookOpen size={14} /> {resource.subjectName}</span>
                <span className="flex items-center gap-1"><User size={14} /> {resource.uploaderName}</span>
                <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(resource.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
            <ShieldCheck size={16} />
            Protected preview
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:flex-row sm:items-center sm:justify-between">
        <span>Downloading and sharing resource PDFs is disabled. Access is session-protected and intended only for in-app reading.</span>
        {isPdf && (
          <button
            type="button"
            onClick={markCompleted}
            disabled={completeSaving}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-emerald-700 disabled:opacity-60"
          >
            {completeSaving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
            Mark completed
          </button>
        )}
      </div>

      {completeMessage && (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${completeMessage.includes('updated') ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {completeMessage}
        </div>
      )}

      {/* Viewer */}
      <div className="card overflow-hidden">
        {resource.resourceType === 'Link' || resource.fileType === 'link' ? (
          (() => {
            const youtubeEmbed = getYoutubeEmbedUrl(resource.linkUrl);
            if (youtubeEmbed) {
              return (
                <div className="w-full h-[70vh] sm:h-[80vh] bg-slate-900">
                  <iframe
                    src={youtubeEmbed}
                    title={resource.title}
                    className="w-full h-full border-0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              );
            }
            if (isDirectVideo(resource.linkUrl)) {
              return (
                <div className="w-full p-4 flex justify-center bg-slate-900">
                  <video controls className="max-w-full max-h-[80vh] rounded-xl">
                    <source src={resource.linkUrl} />
                    Your browser does not support the video tag.
                  </video>
                </div>
              );
            }
            return (
              <div className="p-12 text-center">
                <ExternalLink size={48} className="text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-2">This is an external link.</p>
                <p className="text-xs text-slate-400 mb-6 break-all max-w-md mx-auto">{resource.linkUrl}</p>
                <a href={resource.linkUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary inline-flex">
                  <ExternalLink size={16} /> Open Link
                </a>
              </div>
            );
          })()
        ) : isPdf && hasProtectedPreview ? (
          <div className="w-full h-[70vh] sm:h-[80vh]">
            <iframe
              src={securePdfUrl}
              title={resource.title}
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
        ) : isImage && hasProtectedPreview ? (
          <div className="p-4 flex justify-center">
            <img src={secureFileUrl} alt={resource.title} className="max-w-full max-h-[80vh] object-contain rounded-xl" draggable="false" />
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Preview not available for this file type.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
