import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  AlertCircle,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Code2,
  ExternalLink,
  GraduationCap,
  Laptop,
  Loader2,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const categories = ['Internship', 'Job', 'Hiring Challenge', 'Scholarship', 'Career News'];

const portals = [
  { label: 'AICTE Internships', text: 'Government and industry internship listings.', href: 'https://internship.aicte-india.org/', icon: GraduationCap },
  { label: 'NCS Jobs', text: 'Fresher jobs, apprenticeships, and job fairs.', href: 'https://www.ncs.gov.in/', icon: BriefcaseBusiness },
  { label: 'Internshala', text: 'Remote and office internships for students.', href: 'https://internshala.com/internships/', icon: Laptop },
  { label: 'Unstop', text: 'Hackathons, hiring challenges, and competitions.', href: 'https://unstop.com/', icon: Code2 },
  { label: 'LinkedIn Fresher Jobs', text: 'Search fresher and graduate roles.', href: 'https://www.linkedin.com/jobs/search/?keywords=fresher%20software%20engineer%20india', icon: Building2 },
  { label: 'PM Internship Scheme', text: 'Government internship opportunities for students.', href: 'https://pminternship.mca.gov.in/login/', icon: ShieldCheck },
];

const emptyForm = {
  title: '',
  company: '',
  category: 'Internship',
  mode: 'Remote',
  location: '',
  deadline: '',
  applyUrl: '',
  stipend: '',
  eligibility: '',
  summary: '',
  tags: '',
};

const formatDate = (value) => {
  if (!value) return 'Rolling';
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatDeadline = (deadline) => {
  if (!deadline) return { label: 'ROLLING', date: 'No fixed date', tone: 'neutral' };
  const days = Math.ceil((new Date(deadline) - new Date()) / 86400000);
  if (days < 0) return { label: 'EXPIRED', date: formatDate(deadline), tone: 'danger' };
  if (days <= 3) return { label: `${days}D LEFT`, date: formatDate(deadline), tone: 'danger' };
  if (days <= 10) return { label: `${days}D LEFT`, date: formatDate(deadline), tone: 'warning' };
  return { label: `${days}D LEFT`, date: formatDate(deadline), tone: 'safe' };
};

const deadlineTone = {
  danger: 'border-red-200 bg-red-50 text-red-700',
  warning: 'border-brand-200 bg-brand-50 text-brand-700',
  safe: 'border-brand-200 bg-brand-50 text-brand-700',
  neutral: 'border-slate-200 bg-parchment-light text-slate-600',
};

const categoryTone = {
  Internship: 'bg-brand-50 text-brand-700 border-brand-100',
  Job: 'bg-brand-50 text-brand-700 border-brand-100',
  'Hiring Challenge': 'bg-brand-100 text-brand-800 border-brand-200',
  Scholarship: 'bg-brand-50 text-brand-700 border-brand-100',
  'Career News': 'bg-slate-100 text-slate-700 border-slate-200',
};

const safeUrl = (url) => /^https?:\/\//i.test(String(url || '').trim());

const Jobs = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [message, setMessage] = useState(null);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const loadPosts = async ({ nextPage = 1, append = false } = {}) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const res = await axios.get('/job-updates', {
        params: {
          page: nextPage,
          limit: 12,
          search: search.trim() || undefined,
          category: activeCategory === 'All' ? undefined : activeCategory,
        },
      });
      const updates = res.data.updates || [];
      setPosts((current) => (append ? [...current, ...updates] : updates));
      setPage(res.data.page || nextPage);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || updates.length);
    } catch (error) {
      setPosts([]);
      setPage(1);
      setPages(1);
      setTotal(0);
      showMessage('error', error.response?.status === 401
        ? 'Please log in again to view shared openings.'
        : 'Backend is not connected. Start or restart the server to load shared openings.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadPosts({ nextPage: 1 });
  }, [activeCategory]);

  const urgentCount = useMemo(() => posts.filter((post) => ['danger', 'warning'].includes(formatDeadline(post.deadline).tone)).length, [posts]);
  const canLoadMore = page < pages;

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSearch = (event) => {
    event.preventDefault();
    loadPosts({ nextPage: 1 });
  };

  const canDelete = (post) => {
    const postedById = typeof post.postedBy === 'object' ? post.postedBy?._id : post.postedBy;
    return user?.role === 'admin' || (postedById && postedById === (user?._id || user?.id));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!safeUrl(form.applyUrl)) {
      showMessage('error', 'Apply link must start with http:// or https://');
      return;
    }

    setSaving(true);
    try {
      const res = await axios.post('/job-updates', {
        ...form,
        location: form.location || 'Remote',
        stipend: form.stipend || 'Not disclosed',
        eligibility: form.eligibility || 'BTech students',
        sourceName: 'Campus post',
      });
      setPosts((current) => [res.data, ...current]);
      setTotal((count) => count + 1);
      setForm(emptyForm);
      setComposerOpen(false);
      showMessage('success', 'Opening posted successfully.');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Could not post this opening.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (post) => {
    if (!confirm('Delete this opening for all students?')) return;
    try {
      await axios.delete(`/job-updates/${post._id}`);
      setPosts((current) => current.filter((item) => item._id !== post._id));
      setTotal((count) => Math.max(count - 1, 0));
      showMessage('success', 'Opening deleted.');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Could not delete this opening.');
    }
  };

  const recordApplication = async (post) => {
    try {
      await axios.post(`/activity/job-apply/${post._id}`);
    } catch (error) {
      console.error('Could not record application activity:', error);
    }
  };

  const emptyTitle = posts.length === 0 && (search.trim() || activeCategory !== 'All')
    ? 'No matches for this search'
    : 'No shared openings yet';
  const emptyText = posts.length === 0 && (search.trim() || activeCategory !== 'All')
    ? 'Try another keyword or switch categories.'
    : 'Post the first verified-looking update for everyone.';

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <section className="overflow-hidden rounded-2xl border border-white/70 bg-white/90 shadow-sm">
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-brand-700">Career Board</p>
            <h1 className="mt-1 font-display text-3xl font-bold text-charcoal sm:text-4xl">Jobs, internships, scholarships</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Scan urgency first, check who posted it, then apply. Shared openings stay separate from common career portals.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-100 bg-parchment-light p-2">
            <div className="rounded-lg bg-white px-3 py-3 text-center">
              <p className="font-mono text-xl font-bold text-charcoal">{total}</p>
              <p className="text-[11px] font-semibold uppercase text-slate-400">Live</p>
            </div>
            <div className="rounded-lg bg-white px-3 py-3 text-center">
              <p className="font-mono text-xl font-bold text-red-700">{urgentCount}</p>
              <p className="text-[11px] font-semibold uppercase text-slate-400">Urgent</p>
            </div>
            <button type="button" onClick={() => setComposerOpen(true)} className="rounded-lg bg-brand-700 px-3 py-3 text-center text-white transition-colors hover:bg-brand-800">
              <Plus size={18} className="mx-auto" />
              <span className="mt-1 block text-[11px] font-bold uppercase">Post</span>
            </button>
          </div>
        </div>
      </section>

      {message && (
        <div
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${
            message.type === 'success'
              ? 'border-brand-200 bg-brand-50 text-brand-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
          {message.text}
        </div>
      )}

      <section className="card p-3">
        <form onSubmit={handleSearch} className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="input-field pl-10"
              placeholder="Search role, company, skill, location..."
            />
          </div>
          <button type="submit" className="btn btn-primary px-5 py-3 text-sm">
            <Search size={16} /> Search
          </button>
        </form>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {['All', ...categories].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setActiveCategory(item)}
              className={`shrink-0 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors ${
                activeCategory === item
                  ? 'border-brand-300 bg-brand-50 text-brand-800'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:text-brand-700'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="card flex min-h-64 items-center justify-center p-10 text-slate-500">
          <Loader2 className="mr-2 animate-spin" /> Loading shared openings
        </div>
      ) : posts.length ? (
        <section className="grid gap-4 xl:grid-cols-2">
          {posts.map((post) => {
            const deadline = formatDeadline(post.deadline);
            const posterRole = post.postedBy?.role || '';
            return (
              <article key={post._id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className={`rounded-xl border px-3 py-2 font-mono ${deadlineTone[deadline.tone]}`}>
                    <p className="text-lg font-bold leading-none">{deadline.label}</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide">{deadline.date}</p>
                  </div>
                  {canDelete(post) && (
                    <button
                      type="button"
                      onClick={() => handleDelete(post)}
                      title="Delete opening"
                      className="grid h-9 w-9 place-items-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition-colors hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="mt-4">
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${categoryTone[post.category] || categoryTone.Internship}`}>
                    {post.category}
                  </span>
                  <h2 className="mt-3 font-display text-xl font-bold text-charcoal">{post.title}</h2>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                    <Building2 size={15} /> {post.company}
                  </p>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">{post.summary}</p>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <span className="flex items-center gap-1.5 rounded-lg bg-parchment-light px-3 py-2 text-xs font-medium text-slate-600">
                    <MapPin size={14} /> {post.location || post.mode || 'Location not added'}
                  </span>
                  <span className="flex items-center gap-1.5 rounded-lg bg-parchment-light px-3 py-2 text-xs font-medium text-slate-600">
                    <CalendarDays size={14} /> Posted {formatDate(post.createdAt)}
                  </span>
                </div>

                <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="flex items-center gap-1.5 text-xs text-slate-500">
                    <UserRound size={14} />
                    Posted by <span className="font-semibold text-slate-700">{post.posterName || post.postedBy?.name || 'Student'}</span>
                    {posterRole && <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold capitalize text-slate-600">{posterRole}</span>}
                  </p>
                  <a
                    href={post.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => recordApplication(post)}
                    className="btn btn-primary px-4 py-2 text-sm"
                  >
                    Apply <ArrowUpRight size={15} />
                  </a>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="card p-10 text-center">
          <BriefcaseBusiness size={38} className="mx-auto mb-3 text-slate-300" />
          <h2 className="font-display text-xl font-bold text-charcoal">{emptyTitle}</h2>
          <p className="mt-1 text-sm text-slate-500">{emptyText}</p>
        </section>
      )}

      {canLoadMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => loadPosts({ nextPage: page + 1, append: true })}
            disabled={loadingMore}
            className="btn btn-secondary px-5 py-3 text-sm"
          >
            {loadingMore ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {loadingMore ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}

      <section className="card p-5 sm:p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-charcoal">Common Portals</h2>
            <p className="text-sm text-slate-500">Fixed links students can check anytime.</p>
          </div>
          <span className="font-mono text-xs font-semibold uppercase tracking-wide text-slate-400">{portals.length} verified links</span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <a key={portal.label} href={portal.href} target="_blank" rel="noopener noreferrer" className="group rounded-xl border border-slate-200 bg-parchment-light p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/70">
                <div className="flex gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-brand-700 ring-1 ring-brand-100">
                    <Icon size={19} />
                  </span>
                  <span>
                    <span className="flex items-center gap-2 font-semibold text-charcoal">
                      {portal.label}
                      <ExternalLink size={14} className="text-slate-300 group-hover:text-brand-600" />
                    </span>
                    <span className="mt-1 block text-sm leading-5 text-slate-500">{portal.text}</span>
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {composerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/35 backdrop-blur-sm" role="dialog" aria-modal="true">
          <button type="button" className="absolute inset-0 cursor-default" aria-label="Close composer" onClick={() => setComposerOpen(false)} />
          <form onSubmit={handleSubmit} className="relative flex h-full w-full max-w-xl flex-col overflow-hidden bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="font-display text-xl font-bold text-charcoal">Post Opening</h2>
                <p className="text-xs text-slate-500">Share a real opportunity with students.</p>
              </div>
              <button type="button" onClick={() => setComposerOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl bg-parchment-light text-slate-600 hover:bg-parchment">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              <input className="input-field" value={form.title} onChange={(event) => updateForm('title', event.target.value)} placeholder="Role title" required />
              <input className="input-field" value={form.company} onChange={(event) => updateForm('company', event.target.value)} placeholder="Company / source" required />
              <div className="grid gap-3 sm:grid-cols-2">
                <select className="input-field" value={form.category} onChange={(event) => updateForm('category', event.target.value)}>
                  {categories.map((item) => <option key={item}>{item}</option>)}
                </select>
                <select className="input-field" value={form.mode} onChange={(event) => updateForm('mode', event.target.value)}>
                  {['Remote', 'On-site', 'Hybrid', 'Online'].map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>
              <input className="input-field" value={form.location} onChange={(event) => updateForm('location', event.target.value)} placeholder="Location or Remote" />
              <input className="input-field" type="date" value={form.deadline} onChange={(event) => updateForm('deadline', event.target.value)} />
              <input className="input-field" type="url" value={form.applyUrl} onChange={(event) => updateForm('applyUrl', event.target.value)} placeholder="https://apply-link.com" required />
              <div className="grid gap-3 sm:grid-cols-2">
                <input className="input-field" value={form.stipend} onChange={(event) => updateForm('stipend', event.target.value)} placeholder="Stipend / CTC" />
                <input className="input-field" value={form.eligibility} onChange={(event) => updateForm('eligibility', event.target.value)} placeholder="Eligibility" />
              </div>
              <input className="input-field" value={form.tags} onChange={(event) => updateForm('tags', event.target.value)} placeholder="Tags, comma separated" />
              <textarea className="input-field min-h-28" value={form.summary} onChange={(event) => updateForm('summary', event.target.value)} placeholder="Short note for students" required />
            </div>

            <div className="border-t border-slate-100 p-5">
              <button disabled={saving} className="btn btn-primary w-full py-3">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {saving ? 'Posting...' : 'Post update'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Jobs;
