import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare, Send, Trash2, BookOpen, ArrowLeft,
  Mic, MicOff, StopCircle, Play, Pause, Smile, X
} from 'lucide-react';

const EMOJIS = [
  '😀','😂','😍','🥳','😎','🤔','👍','👎','❤️','🔥',
  '🎉','✅','❌','👏','🙏','🤝','👀','🤷','😭','😅',
  '😊','🤗','😴','😡','🤯','🤓','🥺','🤩','🥶','🤠'
];

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
  const [showEmoji, setShowEmoji] = useState(false);

  // Voice recording states
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [recordError, setRecordError] = useState('');
  const [previewBlob, setPreviewBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewDuration, setPreviewDuration] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const previewAudioRef = useRef(null);

  // Audio playback states
  const [playingId, setPlayingId] = useState(null);
  const [audioProgress, setAudioProgress] = useState({ currentTime: 0, duration: 0 });
  const audioPlayerRef = useRef(null);

  const discardPreview = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    setPreviewBlob(null);
    setPreviewUrl('');
    setPreviewPlaying(false);
    setPreviewDuration(0);
  };

  useEffect(() => {
    fetchSubjects();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedSubject) return;

    fetchComments(selectedSubject);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setPlayingId(null);
      setAudioProgress({ currentTime: 0, duration: 0 });
    }
    discardPreview();

    // Start polling for new messages every 4 seconds (Real-time updates)
    const interval = setInterval(() => {
      fetchCommentsSilent(selectedSubject);
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedSubject]);

  const fetchCommentsSilent = async (subjectId) => {
    try {
      const res = await axios.get(`/comments/${subjectId}`);
      setComments(res.data);
    } catch (error) {
      console.error('Error polling comments:', error);
    }
  };

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
      setShowEmoji(false);
      fetchComments(selectedSubject);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to post comment');
    } finally {
      setSending(false);
    }
  };

  const sendVoiceComment = async () => {
    if (!previewBlob) return;
    setSending(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append('audio', previewBlob, 'voice-message.webm');
      await axios.post(`/comments/${selectedSubject}/voice`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      discardPreview();
      fetchComments(selectedSubject);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send voice message');
    } finally {
      setSending(false);
      setUploadProgress(0);
    }
  };

  const deleteComment = async (id) => {
    if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) return;
    try {
      // Optimistic UI update: instantly remove the message
      setComments(prev => prev.filter(c => c._id !== id));
      
      await axios.delete(`/comments/${id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete message');
      fetchComments(selectedSubject);
    }
  };

  const handlePreviewPlayPause = () => {
    if (!previewUrl) return;
    if (previewPlaying) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      setPreviewPlaying(false);
    } else {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      const audio = new Audio(previewUrl);
      audio.onended = () => setPreviewPlaying(false);
      audio.onerror = () => {
        setPreviewPlaying(false);
        alert('Failed to play preview');
      };
      audio.play();
      previewAudioRef.current = audio;
      setPreviewPlaying(true);
    }
  };

  const startRecording = async () => {
    setRecordError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        stream.getTracks().forEach(t => t.stop());
        setPreviewBlob(audioBlob);
        setPreviewUrl(audioUrl);
        setPreviewDuration(recordTime);
        setRecordTime(0);
      };

      mediaRecorder.onerror = (e) => {
        console.error('MediaRecorder error:', e);
        setRecordError('Recording failed. Please try again.');
        setRecording(false);
      };

      mediaRecorder.start();
      setRecording(true);
      setRecordTime(0);
      timerRef.current = setInterval(() => setRecordTime(t => t + 1), 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
      setRecordError('Microphone access denied or unavailable.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
  };

  const togglePlay = (audioUrl, commentId) => {
    if (playingId === commentId) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setPlayingId(null);
      setAudioProgress({ currentTime: 0, duration: 0 });
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audio.addEventListener('loadedmetadata', () => {
        setAudioProgress(prev => ({ ...prev, duration: audio.duration }));
      });
      audio.addEventListener('timeupdate', () => {
        setAudioProgress({ currentTime: audio.currentTime, duration: audio.duration || 0 });
      });
      audio.onended = () => {
        setPlayingId(null);
        setAudioProgress({ currentTime: 0, duration: 0 });
      };
      audio.onerror = () => {
        setPlayingId(null);
        setAudioProgress({ currentTime: 0, duration: 0 });
        alert('Failed to play audio');
      };
      audio.play();
      audioPlayerRef.current = audio;
      setPlayingId(commentId);
    }
  };

  const addEmoji = (emoji) => {
    setNewComment(prev => prev + emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const canDelete = (comment) => {
    if (!user) return false;
    return user.role === 'admin' || comment.userId?._id?.toString() === user._id || comment.userId?.toString() === user._id;
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
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
              <p className="text-slate-500 text-sm">No messages yet. Start the discussion!</p>
            </div>
          ) : (
            comments.map((comment, idx) => (
              <div key={comment._id} className="flex gap-3 animate-fade-in group" style={{ animationDelay: `${idx * 0.03}s` }}>
                <img
                  src={comment.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userName)}&background=random&color=fff&size=40`}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-1 ring-2 ring-white shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="bg-white border border-slate-200/80 rounded-xl rounded-tl-none px-4 py-3 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-slate-900">{comment.userName}</span>
                      <span className="text-xs text-slate-400">{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    {comment.type === 'voice' && comment.audioUrl ? (
                      <div className="flex items-center gap-3 mt-1 w-full max-w-sm bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                        <button
                          type="button"
                          onClick={() => togglePlay(comment.audioUrl, comment._id)}
                          className="w-9 h-9 bg-brand-600 text-white rounded-full flex items-center justify-center hover:bg-brand-700 transition-colors shadow-sm"
                        >
                          {playingId === comment._id ? <Pause size={16} /> : <Play size={16} />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="h-2 bg-slate-200/80 rounded-full overflow-hidden relative">
                            <div 
                              className="h-full bg-brand-500 rounded-full transition-all duration-100" 
                              style={{ width: `${playingId === comment._id ? (audioProgress.duration ? (audioProgress.currentTime / audioProgress.duration) * 100 : 0) : 0}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[10px] font-medium text-slate-500">
                              {playingId === comment._id 
                                ? `${formatTime(Math.round(audioProgress.currentTime))} / ${formatTime(Math.round(audioProgress.duration))}` 
                                : 'Voice message'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.text}</p>
                    )}
                  </div>
                  {canDelete(comment) && (
                    <button
                      onClick={() => deleteComment(comment._id)}
                      className="mt-1 text-xs text-slate-400 hover:text-red-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recording indicator */}
        {recording && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700 text-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              Recording... {formatTime(recordTime)}
            </div>
            <button onClick={stopRecording} className="text-red-700 hover:text-red-800 transition-colors">
              <StopCircle size={20} />
            </button>
          </div>
        )}
        {recordError && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-100 text-red-700 text-sm flex items-center gap-2">
            <X size={14} /> {recordError}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-slate-200/80 bg-white/80 backdrop-blur-sm relative">
          {/* Emoji picker */}
          {showEmoji && (
            <div className="absolute bottom-full left-4 mb-2 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-20 w-64">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Emoji</span>
                <button onClick={() => setShowEmoji(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => addEmoji(emoji)}
                    className="text-xl hover:bg-slate-50 rounded-lg p-1 transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {previewUrl ? (
            <div className="flex gap-3 items-center bg-brand-50/50 border border-brand-200/50 rounded-xl p-3 animate-fade-in">
              <button
                type="button"
                onClick={handlePreviewPlayPause}
                className="w-10 h-10 bg-brand-600 text-white rounded-full flex items-center justify-center hover:bg-brand-700 transition-colors shadow-md shadow-brand-500/10"
              >
                {previewPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-brand-900">Voice Message Preview</p>
                {uploadProgress > 0 ? (
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                    <div className="bg-brand-600 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Ready to send ({formatTime(previewDuration)})</p>
                )}
              </div>
              {uploadProgress > 0 && (
                <span className="text-xs font-bold text-brand-700">{uploadProgress}%</span>
              )}
              <button
                type="button"
                onClick={discardPreview}
                disabled={sending}
                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                title="Discard Recording"
              >
                <Trash2 size={18} />
              </button>
              <button
                type="button"
                onClick={sendVoiceComment}
                disabled={sending}
                className="btn btn-primary px-5 py-2.5 shadow-brand-500/20 hover:shadow-brand-500/30 transition-all duration-300 disabled:opacity-50"
              >
                {sending ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          ) : (
            <form onSubmit={sendComment} className="flex gap-2 items-center">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={recording ? 'Recording voice...' : 'Write a message...'}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="input-field pr-20"
                  disabled={recording}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowEmoji(v => !v)}
                    className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <Smile size={18} />
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={recording ? stopRecording : startRecording}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  recording
                    ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {recording ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <button
                type="submit"
                disabled={sending || recording || !newComment.trim()}
                className="btn btn-primary px-5 shadow-brand-500/20 hover:shadow-brand-500/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {sending ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                ) : (
                  <Send size={16} className="animate-bounce-x" />
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
