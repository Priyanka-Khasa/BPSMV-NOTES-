import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Download, FileText, Calendar, User, BookOpen, ExternalLink } from 'lucide-react';

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

  useEffect(() => {
    fetchResource();
  }, [id]);

  const fetchResource = async () => {
    try {
      const res = await axios.get(`/resources/${id}`);
      setResource(res.data);
    } catch (err) {
      setError('Resource not found or could not be loaded.');
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-4 animate-fade-in">
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
          <div className="flex gap-2">
            {resource.fileUrl && (
              <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary text-sm">
                <Download size={16} /> Download
              </a>
            )}
          </div>
        </div>
      </div>

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
        ) : isPdf && resource.fileUrl ? (
          <div className="w-full h-[70vh] sm:h-[80vh]">
            <iframe
              src={resource.fileUrl}
              title={resource.title}
              className="w-full h-full border-0"
            />
          </div>
        ) : isImage && resource.fileUrl ? (
          <div className="p-4 flex justify-center">
            <img src={resource.fileUrl} alt={resource.title} className="max-w-full max-h-[80vh] object-contain rounded-xl" />
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Preview not available for this file type.</p>
            {resource.fileUrl && (
              <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-4 inline-flex">
                <Download size={16} /> Open File
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
