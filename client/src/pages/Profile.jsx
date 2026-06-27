import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Mail, Save, Camera, Sparkles, ShieldCheck, Loader2 } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, loading: authLoading, setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', degree: '', branch: '', yearOfStudy: '', semester: '', rollNumber: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        degree: user.degree || '',
        branch: user.branch || '',
        yearOfStudy: user.yearOfStudy || '',
        semester: user.semester || '',
        rollNumber: user.rollNumber || ''
      });
      setPreviewAvatar(user.avatar || null);
    }
  }, [user]);

  const degrees = ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'BBA', 'MBA', 'B.Sc', 'M.Sc', 'B.A', 'M.A', 'Other'];
  const branchesMap = {
    'B.Tech': ['CSE', 'ECE', 'IT', 'ME', 'CE', 'EE'],
    'M.Tech': ['CSE', 'ECE', 'IT'],
    'B.Sc': ['Physics', 'Chemistry', 'Maths', 'Computer Science', 'Biology'],
    'M.Sc': ['Physics', 'Chemistry', 'Maths', 'Computer Science'],
    'BCA': ['General'],
    'MCA': ['General'],
    'BBA': ['General', 'Marketing', 'Finance'],
    'MBA': ['General', 'Marketing', 'Finance', 'HR'],
    'B.A': ['English', 'Hindi', 'History', 'Political Science'],
    'M.A': ['English', 'Hindi', 'History', 'Political Science'],
    'Other': ['General']
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setMessage('');
    try {
      await updateProfile(form);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image size should be less than 5MB.');
      return;
    }
    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewAvatar(ev.target.result);
    reader.readAsDataURL(file);

    setAvatarUploading(true); setMessage('');
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await axios.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(res.data);
      setPreviewAvatar(res.data.avatar);
      setMessage('Avatar updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to upload avatar.');
    } finally {
      setAvatarUploading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-brand-200 border-t-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="card p-8 sm:p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-40 h-40 bg-brand-100/40 rounded-full blur-3xl -z-0 group-hover:scale-150 transition-transform duration-700"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-5 mb-8">
            <div className="relative group/avatar">
              <img
                src={previewAvatar || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=c17a5c&color=fff&size=96`}
                alt=""
                className="w-24 h-24 rounded-full object-cover border-4 border-brand-100 shadow-lg shadow-brand-500/10 group-hover/avatar:scale-105 transition-transform duration-500"
              />
              <button
                onClick={handleAvatarClick}
                disabled={avatarUploading}
                className="absolute bottom-0 right-0 w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center shadow-md cursor-pointer hover:bg-brand-700 transition-colors disabled:opacity-50"
              >
                {avatarUploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
                {user.name}
                <ShieldCheck size={18} className="text-brand-500" />
              </h1>
              <p className="text-slate-500 flex items-center gap-2 mt-1">
                <Mail size={14} /> {user.email}
              </p>
              <span className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                user.role === 'admin' ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200/50' : 'bg-brand-50 text-brand-700 ring-1 ring-brand-200/50'
              }`}>
                {user.role === 'admin' ? 'Admin' : 'Student'}
              </span>
            </div>
          </div>

          {message && (
            <div className={`mb-6 p-3 rounded-xl text-sm border animate-pop flex items-center gap-2 ${
              message.includes('success') ? 'bg-brand-50 text-brand-700 border-brand-200' : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {message.includes('success') ? <Sparkles size={14} /> : <Save size={14} />}
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="animate-slide-up" style={{ animationDelay: '0.05s' }}>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="input-field" required />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.075s' }}>
              <label className="block text-sm font-medium text-slate-700 mb-1">Roll Number</label>
              <input
                name="rollNumber"
                value={form.rollNumber}
                onChange={handleChange}
                className="input-field"
                disabled={user?.role !== 'admin'}
                title={user?.role === 'admin' ? 'Editable for admins only' : 'Roll number cannot be changed'}
              />
              <p className="text-xs text-slate-400 mt-1">{user?.role === 'admin' ? 'Admins can edit roll numbers' : 'Roll number is read-only'}</p>
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <label className="block text-sm font-medium text-slate-700 mb-1">Degree</label>
              <select name="degree" value={form.degree} onChange={handleChange} className="input-field" required>
                <option value="" disabled>Select degree</option>
                {degrees.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
              <label className="block text-sm font-medium text-slate-700 mb-1">Branch</label>
              <select name="branch" value={form.branch} onChange={handleChange} className="input-field" required disabled={!form.degree}>
                <option value="" disabled>Select branch</option>
                {(branchesMap[form.degree] || []).map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Year of Study</label>
                <select name="yearOfStudy" value={form.yearOfStudy} onChange={handleChange} className="input-field" required>
                  <option value="" disabled>Select</option>
                  {[1,2,3,4,5].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Semester</label>
                <select name="semester" value={form.semester} onChange={handleChange} className="input-field" required>
                  <option value="" disabled>Select</option>
                  {[1,2,3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>Sem {s}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn btn-primary w-full shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 hover:-translate-y-0.5 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.25s' }}>
              <Save size={16} /> {saving ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Saving...
                </span>
              ) : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
