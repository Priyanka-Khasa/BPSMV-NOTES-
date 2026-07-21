import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import {
  AlertCircle,
  BriefcaseBusiness,
  Camera,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Edit3,
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
  UserRound,
  X,
} from 'lucide-react';
import ActivityCalendar from '../components/ActivityCalendar';
import { useAuth } from '../context/AuthContext';
import { getSemestersForYear, getYearFromSemester, normalizeAcademicSelection } from '../utils/academic';

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

const fallbackAvatar = (name = 'Student') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=c17a5c&color=fff&size=160`;

const normalizeUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
};

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
  const [editorOpen, setEditorOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) return;
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

  const completedCgpaRows = form.semesterCgpa.filter((row) => row.cgpa !== '' && !Number.isNaN(Number(row.cgpa)));
  const averageCgpa = completedCgpaRows.length
    ? (completedCgpaRows.reduce((sum, row) => sum + Number(row.cgpa), 0) / completedCgpaRows.length).toFixed(2)
    : '--';
  const filledSocialLinks = Object.values(form.socialLinks || {}).filter(Boolean).length;
  const availableSemesters = getSemestersForYear(form.yearOfStudy);
  const visibleSocialLinks = socialFields.filter((field) => form.socialLinks?.[field.key]);
  const profileIdentifier = user?._id || user?.id || user?.rollNumber;
  const shareUrl = profileIdentifier ? `${window.location.origin}/u/${profileIdentifier}` : '';

  const stats = [
    { label: 'Applied', value: activity.totals?.internshipsApplied || 0, icon: BriefcaseBusiness },
    { label: 'Opened', value: activity.totals?.pdfOpened || 0, icon: UserRound },
    { label: 'Completed', value: activity.totals?.pdfCompleted || 0, icon: FileCheck2 },
  ];

  const completeness = useMemo(() => {
    const checks = [
      { label: 'Photo', done: Boolean(previewAvatar) },
      { label: 'Bio', done: form.bio.trim().length > 0 },
      { label: 'Roll number', done: Boolean(form.rollNumber) },
      { label: 'Degree and branch', done: Boolean(form.degree && form.branch) },
      { label: 'Social link', done: filledSocialLinks > 0 },
      { label: 'CGPA row', done: completedCgpaRows.length > 0 },
    ];
    const done = checks.filter((item) => item.done).length;
    return { checks, percent: Math.round((done / checks.length) * 100) };
  }, [previewAvatar, form.bio, form.rollNumber, form.degree, form.branch, filledSocialLinks, completedCgpaRows.length]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => {
      if (name === 'degree') return { ...current, degree: value, branch: '' };
      if (name === 'yearOfStudy') return { ...current, ...normalizeAcademicSelection(value, current.semester) };
      return { ...current, [name]: value };
    });
  };

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
      const nextSemester = Math.min(latestCompleted + 1, 8);
      return {
        ...current,
        yearOfStudy: String(getYearFromSemester(nextSemester)),
        semester: String(nextSemester),
        semesterCgpa: rows,
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateProfile(form);
      setMessageType('success');
      setMessage('Profile updated successfully.');
      setEditorOpen(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessageType('error');
      setMessage(error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
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
      setMessage('Photo updated successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessageType('error');
      setMessage(error.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setAvatarUploading(false);
      event.target.value = '';
    }
  };

  const copyShareLink = async () => {
    if (!shareUrl) {
      setMessageType('error');
      setMessage('Profile link is not ready yet.');
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

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl pb-16 animate-fade-in">
      {message && (
        <div
          className={`mb-4 flex items-center gap-2.5 rounded-xl border p-3.5 text-sm font-medium ${
            messageType === 'success' ? 'border-brand-200 bg-brand-50 text-brand-700' : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {messageType === 'success' ? <CheckCircle2 size={17} className="shrink-0" /> : <AlertCircle size={17} className="shrink-0" />}
          {message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <main className="space-y-6">
          <section className="profile-id-card overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-[0_24px_70px_rgba(7,5,15,0.25)] backdrop-blur-xl">
            <div className="grid min-h-[280px] lg:grid-cols-[220px_minmax(0,1fr)]">
              <div className="relative flex items-center justify-center bg-brand-800 p-6">
                <div className="id-photo-edge absolute right-0 top-0 h-full w-8 bg-white/10" />
                <div className="relative z-10">
                  <img
                    src={previewAvatar || user.avatar || fallbackAvatar(user.name)}
                    alt=""
                    className="h-36 w-36 rounded-[18px] border-4 border-white/20 object-cover shadow-xl"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="absolute -bottom-2 -right-2 grid h-10 w-10 place-items-center rounded-xl bg-white text-brand-800 shadow-lg transition-colors hover:bg-brand-50 disabled:opacity-50"
                    title="Change photo"
                  >
                    {avatarUploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
              </div>

              <div className="relative flex flex-col justify-between p-6 sm:p-8">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-display text-3xl font-bold text-slate-50 sm:text-4xl">{user.name}</h1>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      <ShieldCheck size={14} /> Verified
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="font-mono rounded-md border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-800">
                      Roll No. {user.rollNumber || 'Not issued'}
                    </span>
                    <span className="rounded-md border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300">
                      Semester {user.semester || '-'}
                    </span>
                  </div>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
                    {user.bio || 'Academic profile ready for notes, activity, CGPA history, and campus collaboration.'}
                  </p>
                  {visibleSocialLinks.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {visibleSocialLinks.map((field) => {
                        const Icon = field.icon;
                        return (
                          <a
                            key={field.key}
                            href={normalizeUrl(form.socialLinks[field.key])}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-brand-100 bg-parchment-light text-brand-800 transition-colors hover:border-brand-300 hover:bg-brand-50"
                            title={field.label}
                          >
                            <Icon size={15} />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm font-medium text-slate-300">
                    <span>{user.degree || 'Degree'}</span>
                    <span className="text-slate-300">/</span>
                    <span>{user.branch || 'Branch'}</span>
                    <span className="text-slate-300">/</span>
                    <span className="font-mono">Year {user.yearOfStudy || '-'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={copyShareLink} className="btn btn-secondary px-4 py-2 text-sm">
                      {shareCopied ? <Copy size={15} /> : <Share2 size={15} />}
                      {shareCopied ? 'Copied' : 'Share'}
                    </button>
                    <button type="button" onClick={() => setEditorOpen(true)} className="btn btn-primary px-4 py-2 text-sm">
                      <Edit3 size={15} /> Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <ActivityCalendar daily={activity.daily || []} />

          <section className="card overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-center gap-2">
                <GraduationCap size={20} className="text-brand-700" />
                <div>
                  <h2 className="font-display text-xl font-bold text-slate-50">CGPA Transcript</h2>
                  <p className="text-xs text-slate-500">Semester ledger for completed marks.</p>
                </div>
              </div>
              <div className="cgpa-seal font-mono">
                <span>AVG</span>
                <strong>{averageCgpa}</strong>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {form.semesterCgpa.map((row) => {
                const hasCgpa = row.cgpa !== '' && row.cgpa !== null && row.cgpa !== undefined;
                return (
                  <div key={row.semester} className="grid grid-cols-[74px_minmax(0,1fr)_90px] items-center gap-3 px-5 py-3.5 sm:grid-cols-[92px_minmax(0,1fr)_120px_120px] sm:px-6">
                    <span className="font-mono text-xs font-bold text-slate-500">SEM {String(row.semester).padStart(2, '0')}</span>
                    <span className="text-sm font-semibold text-charcoal">{hasCgpa ? 'Completed' : 'Pending'}</span>
                    <span className={`font-mono text-lg font-bold ${hasCgpa ? 'text-brand-800' : 'text-slate-300'}`}>
                      {hasCgpa ? Number(row.cgpa).toFixed(2) : '--'}
                    </span>
                    <span className="hidden font-mono text-xs text-slate-400 sm:block">
                      {hasCgpa ? `${row.completedMonth || '--'} ${row.completedYear || ''}` : '--'}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </main>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-50">Profile Strength</h2>
                <p className="text-xs text-slate-500">Academic record completeness</p>
              </div>
              <div className="relative grid h-16 w-16 place-items-center rounded-full bg-brand-50 ring-1 ring-brand-100">
                <span className="font-mono text-lg font-bold text-brand-800">{completeness.percent}</span>
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-brand-700 transition-all duration-500" style={{ width: `${completeness.percent}%` }} />
            </div>
            <div className="mt-4 grid gap-2">
              {completeness.checks.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-2 text-xs">
                  <span className="font-medium text-slate-600">{item.label}</span>
                  <span className={item.done ? 'text-emerald-600' : 'text-slate-300'}>{item.done ? <Check size={14} /> : '--'}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <h2 className="font-display text-lg font-bold text-slate-50">Student Data</h2>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="rounded-xl bg-white/10 p-3 text-center ring-1 ring-white/15">
                    <Icon size={16} className="mx-auto text-brand-700" />
                    <p className="mt-2 font-mono text-xl font-bold leading-none text-slate-50">{stat.value}</p>
                    <p className="mt-1 text-[11px] font-medium text-slate-500">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="card p-5">
            <h2 className="font-display text-lg font-bold text-slate-50">Links</h2>
            {visibleSocialLinks.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {visibleSocialLinks.map((field) => {
                  const Icon = field.icon;
                  return (
                    <a
                      key={field.key}
                      href={normalizeUrl(form.socialLinks[field.key])}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-400/20 bg-white/10 text-brand-200 transition-colors hover:border-brand-300/40 hover:bg-white/15"
                      title={field.label}
                    >
                      <Icon size={16} />
                    </a>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No links added yet.</p>
            )}
          </section>

          <section className="card p-5">
            <h2 className="font-display text-lg font-bold text-slate-50">Recent Activity</h2>
            <div className="mt-4 space-y-2">
              {(activity.recent || []).length ? (
                activity.recent.slice(0, 8).map((item) => (
                  <div key={item._id} className="rounded-xl border border-white/10 bg-white/10 px-3 py-2.5">
                    <p className="line-clamp-1 text-sm font-semibold text-slate-50">{item.title}</p>
                    <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wide text-slate-400">
                      {item.subjectName || item.company || item.type}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No activity yet.</p>
              )}
            </div>
          </section>
        </aside>
      </div>

      {editorOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/35 backdrop-blur-sm" role="dialog" aria-modal="true">
          <button type="button" className="absolute inset-0 cursor-default" aria-label="Close editor" onClick={() => setEditorOpen(false)} />
          <form onSubmit={handleSubmit} className="relative flex h-full w-full max-w-xl flex-col overflow-hidden bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="font-display text-xl font-bold text-charcoal">Edit Profile</h2>
                <p className="text-xs text-slate-500">Update ID details, links, and transcript rows.</p>
              </div>
              <button type="button" onClick={() => setEditorOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl bg-parchment-light text-slate-600 hover:bg-parchment">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
              <section className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
                  <input name="name" value={form.name} onChange={handleChange} className="input-field" required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Bio</label>
                  <textarea name="bio" value={form.bio} onChange={handleChange} maxLength={500} className="input-field min-h-24" />
                  <p className="mt-1 text-xs text-slate-400">{form.bio.length}/500 characters</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Roll number</label>
                  <input
                    name="rollNumber"
                    value={form.rollNumber}
                    onChange={handleChange}
                    className="input-field font-mono disabled:cursor-not-allowed disabled:bg-parchment disabled:text-slate-400"
                    disabled={user?.role !== 'admin'}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Degree</label>
                    <select name="degree" value={form.degree} onChange={handleChange} className="input-field" required>
                      <option value="" disabled>Select degree</option>
                      {degrees.map((degree) => <option key={degree} value={degree}>{degree}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Branch</label>
                    <select name="branch" value={form.branch} onChange={handleChange} className="input-field" required disabled={!form.degree}>
                      <option value="" disabled>Select branch</option>
                      {(branchesMap[form.degree] || []).map((branch) => <option key={branch} value={branch}>{branch}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Year</label>
                    <select name="yearOfStudy" value={form.yearOfStudy} onChange={handleChange} className="input-field" required>
                      <option value="" disabled>Select</option>
                      {[1, 2, 3, 4].map((year) => <option key={year} value={year}>Year {year}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Semester</label>
                    <select name="semester" value={form.semester} onChange={handleChange} className="input-field" required disabled={!form.yearOfStudy}>
                      <option value="" disabled>Select</option>
                      {availableSemesters.map((sem) => <option key={sem} value={sem}>Sem {sem}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="font-display text-lg font-bold text-charcoal">Social Links</h3>
                <div className="mt-3 space-y-3">
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

              <section>
                <h3 className="font-display text-lg font-bold text-charcoal">Transcript Rows</h3>
                <div className="mt-3 space-y-3">
                  {form.semesterCgpa.map((row, index) => (
                    <div key={row.semester} className="rounded-xl border border-slate-100 bg-parchment-light p-3">
                      <p className="font-mono text-xs font-bold uppercase tracking-wide text-slate-500">Semester {row.semester}</p>
                      <div className="mt-2 grid grid-cols-[1fr_1.1fr_0.9fr] gap-2">
                        <input type="number" min="0" max="10" step="0.01" value={row.cgpa} onChange={(event) => handleSemesterCgpaChange(index, 'cgpa', event.target.value)} className="input-field px-3 py-2 text-sm font-mono" placeholder="CGPA" />
                        <select value={row.completedMonth} onChange={(event) => handleSemesterCgpaChange(index, 'completedMonth', event.target.value)} className="input-field px-3 py-2 text-sm">
                          {months.map((month) => <option key={month} value={month}>{month}</option>)}
                        </select>
                        <input type="number" min="2000" max="2100" value={row.completedYear} onChange={(event) => handleSemesterCgpaChange(index, 'completedYear', event.target.value)} className="input-field px-3 py-2 text-sm font-mono" placeholder="Year" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="border-t border-slate-100 p-5">
              <button type="submit" disabled={saving} className="btn btn-primary w-full py-3">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Saving...' : 'Save profile'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
