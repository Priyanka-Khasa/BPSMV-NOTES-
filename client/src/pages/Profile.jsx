import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, GraduationCap, BookOpen, Save, ArrowRight } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', degree: '', branch: '', yearOfStudy: '', semester: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        degree: user.degree || '',
        branch: user.branch || '',
        yearOfStudy: user.yearOfStudy || '',
        semester: user.semester || ''
      });
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
    } catch (err) {
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-8">
        <div className="flex items-center gap-4 mb-8">
          <img
            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff&size=96`}
            alt=""
            className="w-20 h-20 rounded-full object-cover border-4 border-brand-100"
          />
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900">{user.name}</h1>
            <p className="text-slate-500 flex items-center gap-2 mt-1">
              <Mail size={14} /> {user.email}
            </p>
            <span className={`inline-flex mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              user.role === 'admin' ? 'bg-violet-50 text-violet-700' : 'bg-brand-50 text-brand-700'
            }`}>
              {user.role === 'admin' ? 'Admin' : 'Student'}
            </span>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-3 rounded-lg text-sm border ${message.includes('success') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Degree</label>
            <select name="degree" value={form.degree} onChange={handleChange} className="input-field" required>
              <option value="" disabled>Select degree</option>
              {degrees.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Branch</label>
            <select name="branch" value={form.branch} onChange={handleChange} className="input-field" required disabled={!form.degree}>
              <option value="" disabled>Select branch</option>
              {(branchesMap[form.degree] || []).map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
          <button type="submit" disabled={saving} className="btn btn-primary w-full">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
