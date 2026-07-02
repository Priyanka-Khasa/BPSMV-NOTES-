import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  AlertCircle,
  BriefcaseBusiness,
  Camera,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  ExternalLink,
  Facebook,
  FileCheck2,
  Gauge,
  Github,
  Globe,
  GraduationCap,
  Instagram,
  Linkedin,
  Loader2,
  Mail,
  Save,
  Share2,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import ActivityCalendar from '../components/ActivityCalendar';

const socialFields = [
  { key: 'github', label: 'GitHub', icon: Github, placeholder: 'https://github.com/username' },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/username' },
  { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/username' },
  { key: 'leetcode', label: 'LeetCode', icon: Code2, placeholder: 'https://leetcode.com/username' },
  { key: 'portfolio', label: 'Portfolio', icon: Globe, placeholder: 'https://your-portfolio.com' },
  { key: 'hackerrank', label: 'HackerRank', icon: Code2, placeholder: 'https://hackerrank.com/username' },
  { key: 'website', label: 'Website', icon: ExternalLink, placeholder: 'https://example.com' },
];

const emptyLinks = socialFields.reduce((acc, field) => ({ ...acc, [field.key]: '' }), {});
const months = ['January', 'June'];
const defaultSemesterCgpa = Array.from({ length: 8 }, (_, index) => ({
  semester: index + 1,
  cgpa: '',
  completedMonth: index % 2 === 0 ? 'January' : 'June',
  completedYear: '',
}));

const Profile = () => {
  const { user, updateProfile, loading: authLoading, setUser } = useAuth();
  const [form, setForm] = useState({
    name: '',
    degree: '',
    branch: '',
    yearOfStudy: '',
    semester: '',
    rollNumber: '',
    bio: '',
    socialLinks: emptyLinks,
    semesterCgpa: defaultSemesterCgpa,
  });
  const [activity, setActivity] = useState({ totals: {}, daily: [], recent: [] });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [shareCopied, setShareCopied] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        degree: user.degree || '',
        branch: user.branch || '',
        yearOfStudy: user.yearOfStudy || '',
        semester: user.semester || '',
        rollNumber: user.rollNumber || '',
        bio: user.bio || '',
        socialLinks: { ...emptyLinks, ...(user.socialLinks || {}) },
        semesterCgpa: defaultSemesterCgpa.map((row) => {
          const saved = (user.semesterCgpa || []).find((item) => Number(item.semester) === row.semester);
          return {
            ...row,
            cgpa: saved?.cgpa ?? '',
            completedMonth: saved?.completedMonth || row.completedMonth,
            completedYear: saved?.completedYear ?? '',
          };
        }),
      });
      setPreviewAvatar(user.avatar || null);
    }
  }, [user]);

  useEffect(() => {
    const loadActivity = async () => {
      try {
        const res = await axios.get('/activity/me');
        setActivity(res.data);
      } catch (error) {
        console.error('Activity load error:', error);
      }
    };
    loadActivity();
  }, []);

  const degrees = ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'BBA', 'MBA', 'B.Sc', 'M.Sc', 'B.A', 'M.A', 'Other'];
  const branchesMap = {
    'B.Tech': ['CSE', 'ECE', 'IT', 'ME', 'CE', 'EE'],
    'M.Tech': ['CSE', 'ECE', 'IT'],
    'B.Sc': ['Physics', 'Chemistry', 'Maths', 'Computer Science', 'Biology'],
    'M.Sc': ['Physics', 'Chemistry', 'Maths', 'Computer Science'],
    BCA: ['General'],
    MCA: ['General'],
    BBA: ['General', 'Marketing', 'Finance'],
    MBA: ['General', 'Marketing', 'Finance', 'HR'],
    'B.A': ['English', 'Hindi', 'History', 'Political Science'],
    'M.A': ['English', 'Hindi', 'History', 'Political Science'],
    Other: ['General'],
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSocialChange = (key, value) => {
    setForm((current) => ({
      ...current,
      socialLinks: { ...current.socialLinks, [key]: value },
    }));
  };

  const handleSemesterCgpaChange = (index, key, value) => {
    setForm((current) => {
      const rows = current.semesterCgpa.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row));
      const completed = rows.filter((row) => row.cgpa !== '' && row.completedMonth);
      const latestCompleted = completed.length ? Math.max(...completed.map((row) => row.semester)) : Number(current.semester) || 1;
      return {
        ...current,
        semester: String(Math.min(latestCompleted + 1, 8)),
        semesterCgpa: rows,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateProfile(form);
      setMessageType('success');
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessageType('error');
      setMessage(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessageType('error');
      setMessage('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessageType('error');
      setMessage('Image size should be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => setPreviewAvatar(ev.target.result);
    reader.readAsDataURL(file);

    setAvatarUploading(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await axios.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser(res.data);
      setPreviewAvatar(res.data.avatar);
      setMessageType('success');
      setMessage('Avatar updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessageType('error');
      setMessage(err.response?.data?.message || 'Failed to upload avatar.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const profileIdentifier = user?._id || user?.id || user?.rollNumber;
  const shareUrl = profileIdentifier ? `${window.location.origin}/u/${profileIdentifier}` : '';
  const copyShareLink = async () => {
    if (!shareUrl) {
      setMessageType('error');
      setMessage('Profile link is not ready yet. Please refresh after saving your profile.');
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1800);
    } catch (error) {
      setMessageType('error');
      setMessage('Could not copy profile link.');
    }
  };

  const completedCgpaRows = form.semesterCgpa.filter((row) => row.cgpa !== '' && !Number.isNaN(Number(row.cgpa)));
  const averageCgpa = completedCgpaRows.length
    ? (completedCgpaRows.reduce((sum, row) => sum + Number(row.cgpa), 0) / completedCgpaRows.length).toFixed(2)
    : '--';

  const filledSocialLinks = Object.values(form.socialLinks || {}).filter(Boolean).length;

  const completeness = useMemo(() => {
    const checks = [
      { label: 'Photo', done: Boolean(previewAvatar) },
      { label: 'Bio', done: form.bio.trim().length > 0 },
      { label: 'Roll number', done: Boolean(form.rollNumber) },
      { label: 'Degree & branch', done: Boolean(form.degree && form.branch) },
      { label: 'At least one social link', done: filledSocialLinks > 0 },
      { label: 'At least one CGPA entry', done: completedCgpaRows.length > 0 },
    ];
    const done = checks.filter((c) => c.done).length;
    const percent = Math.round((done / checks.length) * 100);
    const nextMissing = checks.find((c) => !c.done);
    return { checks, percent, nextMissing };
  }, [previewAvatar, form.bio, form.rollNumber, form.degree, form.branch, filledSocialLinks, completedCgpaRows.length]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  const stats = [
    { label: 'Internships applied', value: activity.totals?.internshipsApplied || 0, icon: BriefcaseBusiness },
    { label: 'Resources opened', value: activity.totals?.pdfOpened || 0, icon: UserRound },
    { label: 'Resources completed', value: activity.totals?.pdfCompleted || 0, icon: FileCheck2 },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16 animate-fade-in">
      {/* Identity card */}
      <section className="overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-sm">
        <div className="bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 px-5 py-8 text-white sm:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <img
                  src={
                    previewAvatar ||
                    user.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=c17a5c&color=fff&size=128`
                  }
                  alt=""
                  className="h-24 w-24 rounded-2xl border-4 border-white/15 object-cover shadow-xl sm:h-28 sm:w-28"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="absolute -bottom-2 -right-2 grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-lg transition-colors hover:bg-brand-700 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  title="Change photo"
                >
                  {avatarUploading ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate font-display text-2xl font-bold sm:text-3xl">{user.name}</h1>
                  <ShieldCheck size={18} className="shrink-0 text-brand-100" aria-label="Verified student" />
                </div>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-300">
                  <Mail size={14} className="shrink-0" /> {user.email}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-brand-100">
                  <span>{user.degree || 'Degree'}</span>
                  <span className="text-brand-300">&middot;</span>
                  <span>{user.branch || 'Branch'}</span>
                  <span className="text-brand-300">&middot;</span>
                  <span>Semester {user.semester || '-'}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={copyShareLink}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-800 shadow-lg shadow-brand-900/15 transition-all hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {shareCopied ? <Copy size={16} /> : <Share2 size={16} />}
              {shareCopied ? 'Copied' : 'Share profile'}
            </button>
          </div>
        </div>

        <div className="grid divide-y divide-brand-100 border-t border-brand-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center gap-3 px-6 py-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-2xl font-bold leading-none text-charcoal">{stat.value}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Profile strength */}
      {completeness.percent < 100 && (
        <section className="card p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Gauge size={18} />
              </span>
              <div>
                <p className="text-sm font-bold text-charcoal">Profile strength: {completeness.percent}%</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {completeness.nextMissing ? `Add ${completeness.nextMissing.label.toLowerCase()} to improve it.` : 'Looking good.'}
                </p>
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-parchment sm:w-56">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-700 transition-all duration-500"
                style={{ width: `${completeness.percent}%` }}
              />
            </div>
          </div>
        </section>
      )}

      <ActivityCalendar daily={activity.daily || []} />

      {/* CGPA */}
      <section className="card p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap size={19} className="text-brand-700" />
            <div>
              <h2 className="font-display text-lg font-bold text-charcoal">Semester CGPA</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Add CGPA once a semester is done. January and June are prefilled as the usual cycle.
              </p>
            </div>
          </div>
          <div className="flex items-baseline gap-2 self-start rounded-xl bg-brand-50 px-4 py-2.5 ring-1 ring-brand-100 sm:self-auto">
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-700">Average</span>
            <span className="text-xl font-bold text-brand-800">{averageCgpa}</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100 rounded-xl border border-slate-100">
          {form.semesterCgpa.map((row, index) => {
            const isCompleted = row.cgpa !== '';
            return (
              <div
                key={row.semester}
                className="flex flex-col gap-3 px-4 py-3.5 transition-colors hover:bg-parchment-light/60 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3 sm:w-48 sm:shrink-0">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isCompleted ? 'bg-brand-600 text-white' : 'bg-parchment text-slate-400 ring-1 ring-parchment-dark'
                    }`}
                  >
                    {isCompleted ? <Check size={14} /> : row.semester}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-charcoal">Semester {row.semester}</p>
                    <p className="text-xs text-slate-400">{isCompleted ? 'Completed' : 'Not completed yet'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-[1fr_1.1fr_0.9fr] gap-2 sm:w-96">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.01"
                    value={row.cgpa}
                    onChange={(event) => handleSemesterCgpaChange(index, 'cgpa', event.target.value)}
                    className="input-field px-3 py-2 text-sm"
                    placeholder="CGPA"
                  />
                  <select
                    value={row.completedMonth}
                    onChange={(event) => handleSemesterCgpaChange(index, 'completedMonth', event.target.value)}
                    className="input-field px-3 py-2 text-sm"
                  >
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    value={row.completedYear}
                    onChange={(event) => handleSemesterCgpaChange(index, 'completedYear', event.target.value)}
                    className="input-field px-3 py-2 text-sm"
                    placeholder="Year"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {message && (
        <div
          className={`flex items-center gap-2.5 rounded-xl border p-3.5 text-sm font-medium ${
            messageType === 'success' ? 'border-brand-200 bg-brand-50 text-brand-700' : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {messageType === 'success' ? <CheckCircle2 size={17} className="shrink-0" /> : <AlertCircle size={17} className="shrink-0" />}
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        <section className="card p-5 sm:p-6">
          <h2 className="font-display text-xl font-bold text-charcoal">Profile details</h2>
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
              <input name="name" value={form.name} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                maxLength={500}
                className="input-field min-h-28"
                placeholder="Write about your skills, interests, branch, projects, or career goal."
              />
              <p className="mt-1 text-xs text-slate-400">{form.bio.length}/500 characters</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Roll number</label>
              <input
                name="rollNumber"
                value={form.rollNumber}
                onChange={handleChange}
                className="input-field disabled:cursor-not-allowed disabled:bg-parchment disabled:text-slate-400"
                disabled={user?.role !== 'admin'}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Degree</label>
                <select name="degree" value={form.degree} onChange={handleChange} className="input-field" required>
                  <option value="" disabled>
                    Select degree
                  </option>
                  {degrees.map((degree) => (
                    <option key={degree} value={degree}>
                      {degree}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Branch</label>
                <select name="branch" value={form.branch} onChange={handleChange} className="input-field" required disabled={!form.degree}>
                  <option value="" disabled>
                    Select branch
                  </option>
                  {(branchesMap[form.degree] || []).map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Year of study</label>
                <select name="yearOfStudy" value={form.yearOfStudy} onChange={handleChange} className="input-field" required>
                  <option value="" disabled>
                    Select
                  </option>
                  {[1, 2, 3, 4, 5].map((year) => (
                    <option key={year} value={year}>
                      Year {year}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Semester</label>
                <select name="semester" value={form.semester} onChange={handleChange} className="input-field" required>
                  <option value="" disabled>
                    Select
                  </option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => (
                    <option key={sem} value={sem}>
                      Sem {sem}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="font-display text-xl font-bold text-charcoal">Social links</h2>
          <p className="mt-1 text-sm text-slate-500">These appear on your shareable profile.</p>
          <div className="mt-5 space-y-3">
            {socialFields.map((field) => {
              const Icon = field.icon;
              return (
                <label key={field.key} className="block">
                  <span className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Icon size={15} /> {field.label}
                  </span>
                  <input
                    type="url"
                    value={form.socialLinks[field.key] || ''}
                    onChange={(event) => handleSocialChange(field.key, event.target.value)}
                    className="input-field"
                    placeholder={field.placeholder}
                  />
                </label>
              );
            })}
          </div>
        </section>

        <div className="lg:col-span-2">
          <button type="submit" disabled={saving} className="btn btn-primary w-full py-3 shadow-lg shadow-brand-500/20">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save profile'}
          </button>
        </div>
      </form>

      <section className="card p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-brand-600" />
          <h2 className="font-display text-xl font-bold text-charcoal">Recent activity</h2>
        </div>
        <div className="space-y-2">
          {(activity.recent || []).length ? (
            activity.recent.map((item) => (
              <div key={item._id} className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{item.title}</span>
                <span className="text-slate-400"> &middot; {item.subjectName || item.company || item.type}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Open PDFs, complete PDFs, or apply to internships to start filling your activity graph.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Profile;
