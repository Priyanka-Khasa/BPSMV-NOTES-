import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, Trash2, BookOpen, ArrowLeft, User, Hash, AtSign, Smile } from 'lucide-react';

const Chat = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || '');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchComments(selectedSubject);
    }
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`/resources/subjects`);
      setSubjects(res.data);
      if (!selectedSubject && res.data.length > 0) {
        setSelectedSubject(res.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchComments = async (subjectId) => {
    setLoading(true);
    try {
      const res = await axios.get(`/comments/${subjectId}`);
      setComments(res.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSending(true);
    try {
      await axios.post(`/comments/${selectedSubject}`, { text: newComment.trim() });
      setNewComment('');
      fetchComments(selectedSubject);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to post comment');
    } finally {
      setSending(false);
    }
  };

  const deleteComment = async (id) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await axios.delete(`/comments/${id}`);
      fetchComments(selectedSubject);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const selectedSubjectObj = subjects.find(s => s._id === selectedSubject);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-140px)] min-h-[500px] animate-fade-in">
      {/* Sidebar */}
      <div className={`lg:col-span-3 card flex flex-col overflow-hidden transition-all duration-500 ${mobileSidebarOpen ? 'fixed inset-0 z-40' : 'hidden lg:flex'}`}>
        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-gradient-to-r from-white to-brand-50/30">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <BookOpen size={18} className="text-brand-600" /> Subjects
          </h2>
          <button className="lg:hidden p-1 hover:bg-slate-100 rounded-lg transition-colors" onClick={() => setMobileSidebarOpen(false)}>
            <ArrowLeft size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {subjects.map(sub => (
            <button
              key={sub._id}
              onClick={() => { setSelectedSubject(sub._id); setMobileSidebarOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-300 ${
                selectedSubject === sub._id
                  ? 'bg-brand-50 text-brand-700 font-medium shadow-sm ring-1 ring-brand-200/50'
                  : 'text-slate-600 hover:bg-slate-50 hover:translate-x-0.5'
              }`}
            >
              <div className="font-medium">{sub.name}</div>
              <div className="text-xs text-slate-400">{sub.degree} · {sub.branch} · Sem {sub.semester}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-9 card flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-gradient-to-r from-white to-brand-50/20">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-1.5 hover:bg-slate-100 rounded-lg transition-colors" onClick={() => setMobileSidebarOpen(true)}>
              <BookOpen size={18} className="text-slate-600" />
            </button>
            <div>
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                {selectedSubjectObj?.name || 'Select a subject'}
                <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{comments.length} messages</span>
              </h2>
              <p className="text-xs text-slate-500">{selectedSubjectObj ? `${selectedSubjectObj.degree} · ${selectedSubjectObj.branch}` : ''}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50/30 to-white/50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-brand-200 border-t-brand-600"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-50 to-brand-100 text-brand-300 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <MessageSquare size={32} />
              </div>
              <p className="text-slate-500 text-sm">No comments yet. Start the discussion!</p>
            </div>
          ) : (
            comments.map((comment, idx) => (
              <div key={comment._id} className="flex gap-3 animate-fade-in" style={{ animationDelay: `${idx * 0.03}s` }}>
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userName)}&background=random&color=fff&size=40`}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-1 ring-2 ring-white shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="bg-white border border-slate-200/80 rounded-xl rounded-tl-none px-4 py-3 shadow-sm hover:shadow-md transition-shadow duration-300 group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-slate-900">{comment.userName}</span>
                      <span className="text-xs text-slate-400">{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.text}</p>
                  </div>
                  <button
                    onClick={() => deleteComment(comment._id)}
                    className="mt-1 text-xs text-slate-400 hover:text-red-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-200/80 bg-white/80 backdrop-blur-sm">
          <form onSubmit={sendComment} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="input-field pr-10"
                required
              />
              <Smile size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <button type="submit" disabled={sending} className="btn btn-primary px-5 shadow-brand-500/20 hover:shadow-brand-500/30 hover:-translate-y-0.5 transition-all duration-300">
              {sending ? (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              ) : (
                <Send size={16} className="animate-bounce-x" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
