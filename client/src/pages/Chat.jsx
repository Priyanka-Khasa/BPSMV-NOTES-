import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, Trash2, BookOpen, ArrowLeft, User } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

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
      const res = await axios.get(`${API_URL}/resources/subjects`);
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
      const res = await axios.get(`${API_URL}/comments/${subjectId}`);
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
    if (!user) {
      alert('Please log in to comment.');
      return;
    }
    setSending(true);
    try {
      await axios.post(`${API_URL}/comments/${selectedSubject}`, { text: newComment.trim() });
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
      await axios.delete(`${API_URL}/comments/${id}`);
      fetchComments(selectedSubject);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const selectedSubjectObj = subjects.find(s => s._id === selectedSubject);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-140px)] min-h-[500px]">
      {/* Sidebar */}
      <div className={`lg:col-span-3 card flex flex-col overflow-hidden ${mobileSidebarOpen ? 'fixed inset-0 z-40' : 'hidden lg:flex'}`}>
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <BookOpen size={18} className="text-brand-600" /> Subjects
          </h2>
          <button className="lg:hidden p-1 hover:bg-slate-100 rounded" onClick={() => setMobileSidebarOpen(false)}>
            <ArrowLeft size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {subjects.map(sub => (
            <button
              key={sub._id}
              onClick={() => { setSelectedSubject(sub._id); setMobileSidebarOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                selectedSubject === sub._id
                  ? 'bg-brand-50 text-brand-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
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
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-1.5 hover:bg-slate-100 rounded-lg" onClick={() => setMobileSidebarOpen(true)}>
              <BookOpen size={18} className="text-slate-600" />
            </button>
            <div>
              <h2 className="font-semibold text-slate-900">{selectedSubjectObj?.name || 'Select a subject'}</h2>
              <p className="text-xs text-slate-500">{selectedSubjectObj ? `${selectedSubjectObj.degree} · ${selectedSubjectObj.branch}` : ''}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare size={40} className="text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm">No comments yet. Start the discussion!</p>
            </div>
          ) : (
            comments.map(comment => (
              <div key={comment._id} className="flex gap-3 animate-fade-in">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userName)}&background=random&color=fff&size=40`}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="bg-white border border-slate-200 rounded-xl rounded-tl-none px-4 py-3 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-slate-900">{comment.userName}</span>
                      <span className="text-xs text-slate-400">{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.text}</p>
                  </div>
                  {(user?.role === 'admin' || comment.userId?._id === user?._id) && (
                    <button
                      onClick={() => deleteComment(comment._id)}
                      className="mt-1 text-xs text-slate-400 hover:text-red-600 flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-200 bg-white">
          {user ? (
            <form onSubmit={sendComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="input-field flex-1"
                required
              />
              <button type="submit" disabled={sending} className="btn btn-primary px-4">
                <Send size={16} />
              </button>
            </form>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm text-slate-500">
                <button onClick={() => navigate('/login')} className="text-brand-600 font-medium hover:underline">Log in</button> to join the discussion.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
