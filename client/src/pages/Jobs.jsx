import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  AlertCircle,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
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
} from 'lucide-react';

const categories = ['Internship', 'Job', 'Hiring Challenge', 'Scholarship', 'Career News'];

const portals = [
  { label: 'AICTE Internships', text: 'Government and industry internship listings.', href: 'https://internship.aicte-india.org/', icon: GraduationCap },
  { label: 'NCS Jobs', text: 'Fresher jobs, apprenticeships, and job fairs.', href: 'https://www.ncs.gov.in/', icon: BriefcaseBusiness },
  { label: 'Internshala', text: 'Remote and office internships for students.', href: 'https://internshala.com/internships/', icon: Laptop },
  { label: 'Unstop', text: 'Hackathons, hiring challenges, and competitions.', href: 'https://unstop.com/', icon: Code2 },
  { label: 'LinkedIn Fresher Jobs', text: 'Search fresher and graduate roles.', href: 'https://www.linkedin.com/jobs/search/?keywords=fresher%20software%20engineer%20india', icon: Building2 },
  { label: 'TCS NextStep', text: 'TCS fresher registration and hiring portal.', href: 'https://nextstep.tcs.com/', icon: ShieldCheck },
];

const emptyForm = {
  title: '',
  company: '',
  category: 'Internship',
  location: '',
  deadline: '',
  applyUrl: '',
  summary: '',
};

const formatDate = (value) => {
  if (!value) return 'Rolling';
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const deadlineBadge = (deadline) => {
  if (!deadline) return { text: 'Rolling', className: 'bg-slate-100 text-slate-700' };
  const days = Math.ceil((new Date(deadline) - new Date()) / 86400000);
  if (days < 0) return { text: 'Expired', className: 'bg-red-50 text-red-700' };
  if (days <= 3) return { text: `${days} day${days === 1 ? '' : 's'} left`, className: 'bg-red-50 text-red-700' };
  if (days <= 10) return { text: `${days} days left`, className: 'bg-amber-50 text-amber-700' };
  return { text: `${days} days left`, className: 'bg-emerald-50 text-emerald-700' };
};

const Jobs = () => {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/job-updates', { params: { limit: 50 } });
      setPosts(res.data.updates || []);
      setMessage('');
    } catch (error) {
      setPosts([]);
      setMessage(error.response?.status === 401
        ? 'Please log in again to view shared openings.'
        : 'Backend is not connected. Start/restart the server so posts can be shared with all students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const visiblePosts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return posts
      .filter((post) => category === 'All' || post.category === category)
      .filter((post) => {
        if (!term) return true;
        return [post.title, post.company, post.location, post.summary, post.category]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(term);
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [posts, search, category]);

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await axios.post('/job-updates', {
        ...form,
        mode: 'Online',
        stipend: 'Not disclosed',
        eligibility: 'BTech students',
        sourceName: 'Campus post',
      });
      setPosts((current) => [res.data, ...current]);
      setForm(emptyForm);
      setMessage('Posted successfully. This opening is saved in the database and visible to all students.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not post. Please make sure the backend server is running.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (post) => {
    if (!confirm('Delete this opening for all students?')) return;
    try {
      await axios.delete(`/job-updates/${post._id}`);
      setPosts((current) => current.filter((item) => item._id !== post._id));
      setMessage('Deleted successfully.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not delete this opening.');
    }
  };

  return (
    <div className="relative -mx-4 -my-6 min-h-[calc(100vh-4rem)] bg-[#f7f3ec] sm:-mx-6 lg:-mx-8">
      <section className="border-b border-slate-200 bg-white px-4 py-7 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold text-brand-700">Jobs & Internships</p>
          <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-950 sm:text-4xl">Career updates for BTech students</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Post once, and every student can see it. Common portals are kept separate below.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
              {visiblePosts.length} shared update{visiblePosts.length === 1 ? '' : 's'}
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {message && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            <AlertCircle size={17} />
            {message}
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:sticky lg:top-20 lg:self-start">
            <div className="mb-4 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-white">
                <Plus size={18} />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-slate-950">Add opening</h2>
                <p className="text-xs text-slate-500">Saved to the shared database.</p>
              </div>
            </div>

            <div className="space-y-3">
              <input className="input-field" value={form.title} onChange={(e) => updateForm('title', e.target.value)} placeholder="Role title" required />
              <input className="input-field" value={form.company} onChange={(e) => updateForm('company', e.target.value)} placeholder="Company / source" required />
              <select className="input-field" value={form.category} onChange={(e) => updateForm('category', e.target.value)}>
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
              <input className="input-field" value={form.location} onChange={(e) => updateForm('location', e.target.value)} placeholder="Location or Remote" />
              <input className="input-field" type="date" value={form.deadline} onChange={(e) => updateForm('deadline', e.target.value)} />
              <input className="input-field" type="url" value={form.applyUrl} onChange={(e) => updateForm('applyUrl', e.target.value)} placeholder="Apply link" required />
              <textarea className="input-field min-h-24" value={form.summary} onChange={(e) => updateForm('summary', e.target.value)} placeholder="Short note for students" required />
            </div>

            <button disabled={saving} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-700 disabled:opacity-60">
              {saving ? <Loader2 size={17} className="animate-spin" /> : <Plus size={17} />}
              {saving ? 'Posting...' : 'Post update'}
            </button>
          </form>

          <section className="space-y-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                  <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
                    placeholder="Search opening..."
                  />
                </div>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field md:w-52">
                  <option>All</option>
                  {categories.map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="rounded-2xl bg-white p-10 text-center text-slate-500">
                <Loader2 className="mx-auto mb-3 animate-spin" />
                Loading shared openings
              </div>
            ) : visiblePosts.length ? (
              <div className="space-y-3">
                {visiblePosts.map((post) => {
                  const badge = deadlineBadge(post.deadline);
                  return (
                    <article key={post._id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-brand-200 hover:shadow-md">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">{post.category}</span>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${badge.className}`}>{badge.text}</span>
                          </div>
                          <h2 className="mt-3 text-xl font-display font-bold text-slate-950">{post.title}</h2>
                          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                            <Building2 size={15} />
                            {post.company}
                          </p>
                        </div>
                        <button onClick={() => handleDelete(post)} title="Delete opening" className="rounded-xl border border-red-100 bg-red-50 p-2 text-red-600 transition-all hover:bg-red-100">
                          <Trash2 size={17} />
                        </button>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-600">{post.summary}</p>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
                        <span className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2">
                          <MapPin size={14} />
                          {post.location || 'Location not added'}
                        </span>
                        <span className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2">
                          <CalendarDays size={14} />
                          {formatDate(post.deadline)}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                        <p className="text-xs text-slate-400">Posted {formatDate(post.createdAt)}</p>
                        <a href={post.applyUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3.5 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-700">
                          Apply
                          <ArrowUpRight size={15} />
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-10 text-center">
                <BriefcaseBusiness size={36} className="mx-auto mb-3 text-slate-300" />
                <h2 className="text-lg font-semibold text-slate-900">No shared openings yet</h2>
                <p className="mt-1 text-sm text-slate-500">Use the form to add the first update for everyone.</p>
              </div>
            )}
          </section>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <h2 className="font-display text-xl font-bold text-slate-950">Common portals</h2>
          <p className="mt-1 text-sm text-slate-500">Fixed links students can check anytime. These are separate from posted openings.</p>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {portals.map((portal) => {
              const Icon = portal.icon;
              return (
                <a key={portal.label} href={portal.href} target="_blank" rel="noreferrer" className="group rounded-xl border border-slate-200 p-4 transition-all hover:border-brand-200 hover:bg-brand-50/40">
                  <div className="flex gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                      <Icon size={19} />
                    </span>
                    <span>
                      <span className="flex items-center gap-2 font-semibold text-slate-950">
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
      </main>
    </div>
  );
};

export default Jobs;
