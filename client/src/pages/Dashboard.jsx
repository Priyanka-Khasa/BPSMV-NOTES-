import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  FileText,
  ExternalLink,
  Trash2,
  Upload,
  ArrowRight,
  MessageSquare,
  Search,
  UserRound,
  Sparkles,
  Target,
  ChevronRight,
  CircleCheckBig,
  CalendarDays,
  Layers,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [subjectOverview, setSubjectOverview] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    if (user?.degree && user?.branch && user?.semester) {
      fetchSubjects();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSubjects = async () => {
    setLoading(true);
    setSelectedSubject(null);
    setResources([]);
    try {
      const params = new URLSearchParams({
        degree: user.degree,
        branch: user.branch,
        semester: String(user.semester),
      });
      if (user.yearOfStudy) params.set('year', String(user.yearOfStudy));
      const subjectRes = await axios.get(`/resources/subjects?${params.toString()}`);
      const subjectData = subjectRes.data || [];
      setSubjects(subjectData);
      await fetchSubjectOverview(subjectData);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectOverview = async (subjectData = subjects) => {
    try {
      const params = new URLSearchParams({
        degree: user.degree,
        branch: user.branch,
        semester: String(user.semester),
        limit: '200',
      });
      const overviewRes = await axios.get(`/resources/all?${params.toString()}`);
      const overviewResources = overviewRes.data?.resources || [];
      const overview = (subjectData || []).map((subject) => {
        const matchingResources = overviewResources.filter(
          (resource) => resource.subjectId === subject._id || resource.subjectName === subject.name
        );
        const notes = matchingResources.filter((resource) => resource.resourceType === 'Note').length;
        const papers = matchingResources.filter((resource) => resource.resourceType === 'Question Paper').length;
        return {
          ...subject,
          count: matchingResources.length,
          notes,
          papers,
        };
      });
      setSubjectOverview(overview);
    } catch (error) {
      console.error('Error fetching subject overview:', error);
      setSubjectOverview(subjects);
    }
  };

  const fetchResources = async (subjectId) => {
    setSelectedSubject(subjectId);
    setResources([]);
    try {
      const res = await axios.get(`/resources/subject/${subjectId}`);
      setResources(res.data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this resource?')) return;
    try {
      await axios.delete(`/resources/${id}`);
      fetchResources(selectedSubject);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const selectedSubjectObj = useMemo(
    () => subjectOverview.find((subject) => subject._id === selectedSubject) || subjects.find((subject) => subject._id === selectedSubject),
    [subjectOverview, subjects, selectedSubject]
  );

  const firstName = user?.name?.split(' ')[0] || 'Student';
  const totalSubjectResources = useMemo(
    () => subjectOverview.reduce((total, subject) => total + subject.count, 0),
    [subjectOverview]
  );
  const focusMetric = selectedSubject
    ? `${resources.length} resources ready`
    : `${totalSubjectResources} resources ready`;
  const subjectList = subjectOverview.length > 0 ? subjectOverview : subjects;
  const readySubjects = subjectList.filter((subject) => (subject.count || 0) > 0);
  const pulseSubjects = readySubjects.slice(0, 3);
  const emptySubjectCount = Math.max(subjectList.length - readySubjects.length, 0);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-slate-700" />
      </div>
    );
  }

  return (
    <div className="relative animate-fade-in">
      <style>{`
        :root {
          --dashboard-surface: #ffffff;
          --dashboard-soft: #f8fafc;
          --dashboard-muted: #f5f7fb;
          --dashboard-border: rgba(203, 213, 225, 0.82);
          --dashboard-shadow: 0 18px 48px rgba(15, 23, 42, 0.07);
          --dashboard-accent: #334155;
          --dashboard-accent-soft: #f1f5f9;
          --dashboard-good: #059669;
          --dashboard-empty: #64748b;
        }
        .dashboard-shell {
          background: var(--dashboard-surface);
          border: 1px solid var(--dashboard-border);
          box-shadow: var(--dashboard-shadow);
        }
        .dashboard-card {
          background: var(--dashboard-surface);
          border: 1px solid var(--dashboard-border);
          box-shadow: var(--dashboard-shadow);
        }
        .dashboard-panel {
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid var(--dashboard-border);
        }
        .subject-button {
          min-width: 0;
          border: 1px solid transparent;
          background: #ffffff;
          transition: background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
        }
        .subject-button:hover, .subject-button:focus-visible {
          background: #f8fafc;
          border-color: rgba(51, 65, 85, 0.22);
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.07);
          outline: none;
        }
        .subject-button.active {
          background: var(--dashboard-accent-soft);
          border-color: rgba(51, 65, 85, 0.28);
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
        }
        .metric-pill {
          background: #f8fafc;
          border: 1px solid rgba(226, 232, 240, 0.95);
        }
        .widget-row {
          display: grid;
          gap: 0.7rem;
        }
        .subject-icon {
          width: 2rem;
          height: 2rem;
          background: #f1f5f9;
          color: #475569;
        }
        .subject-button.active .subject-icon {
          background: #334155;
          color: #ffffff;
        }
        .status-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          border-radius: 999px;
          padding: 0.25rem 0.55rem;
          font-size: 0.68rem;
          font-weight: 700;
          line-height: 1;
          white-space: nowrap;
        }
        .status-chip.ready {
          background: #ecfdf5;
          color: #047857;
        }
        .status-chip.empty {
          background: #f1f5f9;
          color: #64748b;
        }
        .dashboard-text-safe {
          overflow-wrap: anywhere;
          word-break: normal;
        }
        .dashboard-line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .dashboard-line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .dashboard-compact-subjects {
          max-height: 27rem;
          overflow-y: auto;
          padding-right: 0.2rem;
        }
        .dashboard-compact-subjects::-webkit-scrollbar {
          width: 0.35rem;
        }
        .dashboard-compact-subjects::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }
        .widget-bar {
          position: relative;
          overflow: hidden;
          height: 0.5rem;
          border-radius: 999px;
          background: #e2e8f0;
        }
        .widget-bar > span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #334155 0%, #0f766e 100%);
        }
        .empty-illustration {
          background:
            radial-gradient(circle at 22% 22%, rgba(51, 65, 85, 0.12), transparent 28%),
            linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
        }
        .dashboard-action-primary {
          background: #334155;
          color: #ffffff;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.16);
        }
        .dashboard-action-primary:hover {
          background: #1f2937;
          color: #ffffff;
        }
        .dashboard-action-secondary {
          background: #ffffff;
          border: 1px solid #dbe3ef;
          color: #334155;
        }
        .dashboard-action-secondary:hover {
          background: #f8fafc;
          color: #0f172a;
        }
        @media (max-width: 640px) {
          .dashboard-shell,
          .dashboard-card {
            box-shadow: 0 10px 26px rgba(15, 23, 42, 0.07);
          }
          .dashboard-mobile-actions {
            display: grid;
            grid-template-columns: 1fr;
            width: 100%;
          }
          .dashboard-mobile-actions > * {
            width: 100%;
          }
          .dashboard-compact-subjects {
            max-height: 22rem;
            overflow-y: auto;
            padding-right: 0.15rem;
          }
          .dashboard-card-list {
            display: grid;
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-3 overflow-x-hidden sm:gap-4">
        <header className="dashboard-shell rounded-2xl p-4 sm:p-5 lg:p-6">
          <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700 sm:text-sm sm:tracking-[0.18em]">B.Tech / ECE study desk</p>
              <h1 className="dashboard-text-safe text-[1.55rem] font-bold leading-tight text-slate-900 sm:text-3xl">All your semester notes and papers in one simple place.</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                Choose a subject, see what is available, and open study material without confusion.
              </p>
            </div>
            <div className="dashboard-mobile-actions flex flex-wrap items-center gap-2 sm:w-auto">
              <button
                type="button"
                onClick={() => setUploadOpen(true)}
                className="btn dashboard-action-primary min-h-11 px-4 py-2.5 text-sm"
              >
                <Upload size={15} /> Upload
              </button>
              <button
                type="button"
                onClick={() => (selectedSubject ? navigate(`/chat?subject=${selectedSubject}`) : navigate('/resources'))}
                className="btn dashboard-action-secondary min-h-11 px-4 py-2.5 text-sm"
              >
                {selectedSubject ? <MessageSquare size={15} /> : <Search size={15} />}
                {selectedSubject ? 'Discussion' : 'Browse'}
              </button>
            </div>
          </div>
        </header>

        <div className="grid min-w-0 gap-3 sm:gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-3 sm:space-y-4 xl:sticky xl:top-24 xl:self-start">
            <section className="dashboard-card rounded-2xl p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="relative shrink-0">
                  <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&background=334155&color=fff`}
                    alt=""
                    className="h-14 w-14 rounded-2xl object-cover ring-2 ring-white shadow-md shadow-slate-200"
                  />
                  <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-brand-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-semibold text-slate-900">Hi, {firstName}</p>
                  <p className="truncate text-sm text-slate-500">
                    {user?.degree || 'B.Tech'} / {user?.branch || 'ECE'} / Sem {user?.semester || '-'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-slate-600 ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  title="Profile"
                  aria-label="Profile"
                >
                  <UserRound size={18} />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="metric-pill rounded-xl px-2 py-3 text-center sm:p-3">
                  <Layers size={16} className="mx-auto mb-1 text-slate-600" />
                  <p className="text-base font-semibold leading-none text-slate-900">{subjectList.length}</p>
                  <p className="mt-1 text-[11px] font-medium text-slate-500">Subjects</p>
                </div>
                <div className="metric-pill rounded-xl px-2 py-3 text-center sm:p-3">
                  <FileText size={16} className="mx-auto mb-1 text-slate-600" />
                  <p className="text-base font-semibold leading-none text-slate-900">{totalSubjectResources}</p>
                  <p className="mt-1 text-[11px] font-medium text-slate-500">Resources</p>
                </div>
                <div className="metric-pill rounded-xl px-2 py-3 text-center sm:p-3">
                  <Sparkles size={16} className="mx-auto mb-1 text-slate-600" />
                  <p className="text-base font-semibold leading-none text-slate-900">{focusMetric.split(' ')[0]}</p>
                  <p className="mt-1 text-[11px] font-medium text-slate-500">Focus</p>
                </div>
              </div>
            </section>

            <section className="dashboard-card rounded-2xl p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <BookOpen size={17} className="text-slate-600" /> Subjects
                </h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                  {user?.semester ? `Sem ${user.semester}` : 'Semester'}
                </span>
              </div>

              <div className="dashboard-compact-subjects space-y-2">
                {subjectList.map((subject) => {
                  const isActive = selectedSubject === subject._id;
                  const hasResources = (subject.count || 0) > 0;
                  const label = hasResources ? `${subject.count} item${subject.count > 1 ? 's' : ''}` : 'Not started';
                  return (
                    <button
                      key={subject._id}
                      type="button"
                      onClick={() => fetchResources(subject._id)}
                      className={`subject-button flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left ${isActive ? 'active' : ''}`}
                    >
                      <div className="subject-icon flex shrink-0 items-center justify-center rounded-lg">
                        <BookOpen size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                          <p className="dashboard-line-clamp-1 text-sm font-semibold leading-5 text-slate-900" title={subject.name}>{subject.name}</p>
                          <ChevronRight size={14} className="shrink-0 text-slate-400" />
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <span className="text-xs text-slate-500">{subject.notes || 0} notes</span>
                          <span className="h-1 w-1 rounded-full bg-slate-300" />
                          <span className="text-xs text-slate-500">{subject.papers || 0} papers</span>
                          <span className={`status-chip ${hasResources ? 'ready' : 'empty'}`}>{label}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
                {subjectList.length === 0 && (
                  <p className="rounded-2xl bg-white/70 p-3 text-sm italic text-slate-500">No subjects are available for your current semester yet.</p>
                )}
              </div>
            </section>
          </aside>

          <main className="min-w-0 space-y-3 sm:space-y-4">
            <section className="dashboard-card rounded-2xl p-4 sm:p-5 lg:p-6">
              <div className="grid min-w-0 gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:items-start">
                <div className="min-w-0">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700 sm:text-sm sm:tracking-[0.18em]">
                    {selectedSubjectObj ? 'Subject selected' : 'Dashboard overview'}
                  </p>
                  <h2 className="dashboard-text-safe text-[1.45rem] font-semibold leading-tight text-slate-900 sm:text-3xl">
                    {selectedSubjectObj ? `${selectedSubjectObj.name} is ready for review.` : 'Choose a subject to start a focused study session.'}
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                    {selectedSubjectObj
                      ? `Your ${selectedSubjectObj.name} workspace now brings the latest notes and papers into one place.`
                      : 'Pick one subject to see notes, papers, and discussion in a single streamlined view.'}
                  </p>
                  <div className="dashboard-mobile-actions mt-4 flex flex-wrap gap-2 sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setUploadOpen(true)}
                      className="btn dashboard-action-primary min-h-11 px-4 py-2.5 text-sm"
                    >
                      <Upload size={15} /> Upload resource
                    </button>
                    <button
                      type="button"
                      onClick={() => (selectedSubject ? navigate(`/chat?subject=${selectedSubject}`) : navigate('/resources'))}
                      className="btn dashboard-action-secondary min-h-11 px-4 py-2.5 text-sm"
                    >
                      {selectedSubject ? <MessageSquare size={15} /> : <ArrowRight size={15} />}
                      {selectedSubject ? 'Open discussion' : 'Explore resources'}
                    </button>
                  </div>
                </div>

                <div className="dashboard-panel min-w-0 rounded-2xl p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Study pulse</p>
                      <p className="text-xs text-slate-500">{readySubjects.length ? 'Subjects with material ready' : 'No uploaded material yet'}</p>
                    </div>
                    <div className="rounded-full bg-slate-100 p-2 text-slate-700">
                      <Target size={16} />
                    </div>
                  </div>
                  {pulseSubjects.length > 0 ? (
                    <div className="widget-row mt-4">
                      {pulseSubjects.map((subject) => {
                        const width = Math.min(100, Math.max(24, subject.count * 16));
                        return (
                          <div key={subject._id} className="min-w-0 rounded-xl bg-white p-3 ring-1 ring-slate-200">
                            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                              <p className="dashboard-line-clamp-2 text-sm font-semibold leading-5 text-slate-900" title={subject.name}>{subject.name}</p>
                              <p className="shrink-0 whitespace-nowrap text-xs font-medium text-slate-500">{subject.count} items</p>
                            </div>
                            <div className="widget-bar mt-2">
                              <span style={{ width: `${width}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl bg-white p-4 ring-1 ring-slate-200">
                      <div className="flex items-start gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500">
                          <FileText size={17} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900">Nothing to track yet</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Upload the first note or question paper and this area will show the most active subjects.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="mt-4 flex min-w-0 items-center gap-2 rounded-xl bg-white p-3 text-sm text-slate-600 ring-1 ring-slate-200">
                    <CalendarDays size={15} className="text-slate-700" />
                    <span className="min-w-0 truncate">{focusMetric}</span>
                  </div>
                </div>
              </div>
            </section>

            {!selectedSubject ? (
              <section className="dashboard-card rounded-2xl p-4 sm:p-5 lg:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700 sm:text-sm sm:tracking-[0.16em]">Start here</p>
                    <h3 className="text-lg font-semibold leading-tight text-slate-900 sm:text-xl">Pick a subject to open its study set.</h3>
                    {emptySubjectCount > 0 && (
                      <p className="mt-1 text-sm text-slate-500">{emptySubjectCount} subject{emptySubjectCount > 1 ? 's' : ''} waiting for first upload.</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/resources')}
                    className="btn dashboard-action-secondary min-h-11 w-full px-4 py-2.5 text-sm sm:w-auto"
                  >
                    Explore all resources <ArrowRight size={15} />
                  </button>
                </div>
                <div className="dashboard-card-list mt-4 grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {subjectList.slice(0, 3).map((subject) => {
                    const hasResources = (subject.count || 0) > 0;
                    return (
                      <button
                        key={subject._id}
                        type="button"
                        onClick={() => fetchResources(subject._id)}
                        className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
                      >
                        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                          <p className="dashboard-line-clamp-2 font-semibold leading-6 text-slate-900" title={subject.name}>{subject.name}</p>
                          <span className={`status-chip ${hasResources ? 'ready' : 'empty'}`}>
                            {hasResources ? `${subject.count} items` : 'Not started'}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                          <CircleCheckBig size={15} className={hasResources ? 'text-brand-600' : 'text-slate-400'} />
                          <span>{subject.notes || 0} notes</span>
                          <span className="h-1 w-1 rounded-full bg-slate-300" />
                          <span>{subject.papers || 0} papers</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : resources.length === 0 ? (
              <section className="dashboard-card rounded-2xl p-5 sm:p-8">
                <div className="grid gap-5 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:p-6">
                  <div className="empty-illustration flex h-16 w-16 items-center justify-center rounded-2xl text-slate-700 ring-1 ring-white">
                    <FileText size={30} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">No material uploaded</p>
                    <h3 className="mt-1 dashboard-text-safe text-xl font-semibold text-slate-900">
                      {selectedSubjectObj?.name || 'This subject'} is ready for its first resource.
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                      Add notes, previous papers, syllabus files, or helpful links. Once something is uploaded, it will appear here instead of an empty panel.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadOpen(true)}
                    className="btn dashboard-action-primary min-h-11 w-full px-4 py-2.5 text-sm sm:w-auto"
                  >
                    <Upload size={15} /> Upload resource
                  </button>
                </div>
              </section>
            ) : (
              <section className="grid min-w-0 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
                {resources.map((resource) => (
                  <article key={resource._id} className="dashboard-card group flex min-w-0 flex-col rounded-2xl p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
                        {resource.resourceType}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelete(resource._id)}
                        className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-red-50 hover:text-red-600 hover:scale-110"
                        aria-label="Delete resource"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <h4 className="dashboard-text-safe text-base font-semibold text-slate-900 transition-colors group-hover:text-slate-700">{resource.title}</h4>
                    {resource.year && <p className="mt-1 text-xs text-slate-500">Year: {resource.year}</p>}
                    <p className="mt-2 text-xs text-slate-400">By {resource.uploaderName || 'student'} / {new Date(resource.createdAt).toLocaleDateString()}</p>
                    <div className="mt-4 flex items-center gap-2">
                      {resource.resourceType === 'Link' ? (
                        <a
                          href={resource.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn dashboard-action-secondary flex-1 justify-center text-sm"
                        >
                          <ExternalLink size={14} /> Open link
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => navigate(`/viewer/${resource._id}`)}
                          className="btn dashboard-action-primary flex-1 justify-center text-sm"
                        >
                          <FileText size={14} /> View
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </section>
            )}
          </main>
        </div>
      </div>

      {uploadOpen && (
        <UploadModal
          isOpen={uploadOpen}
          onClose={() => setUploadOpen(false)}
          subjects={subjects}
          currentSubjectId={selectedSubject}
          onUploadSuccess={() => selectedSubject && fetchResources(selectedSubject)}
        />
      )}
    </div>
  );
};

const UploadModal = ({ isOpen, onClose, subjects, currentSubjectId, onUploadSuccess }) => {
  const [title, setTitle] = useState('');
  const [resourceType, setResourceType] = useState('Note');
  const [year, setYear] = useState('');
  const [subjectId, setSubjectId] = useState(currentSubjectId || '');
  const [file, setFile] = useState(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (resourceType !== 'Link' && !file) {
      setError('Please select a file.');
      return;
    }
    if (resourceType === 'Link' && !linkUrl) {
      setError('Please enter a link URL.');
      return;
    }

    setIsUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('resourceType', resourceType);
    if (year) formData.append('year', year);
    formData.append('subjectId', subjectId);
    if (file) formData.append('file', file);
    if (linkUrl) formData.append('linkUrl', linkUrl);

    try {
      await axios.post('/resources/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      setIsUploading(false);
      onUploadSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl animate-scale-in sm:max-h-[90vh] sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex min-w-0 items-center gap-2 text-base font-semibold text-slate-900 sm:text-lg">
            <Upload size={18} className="text-slate-700" /> Upload Resource
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700 hover:rotate-90"
          >
            &times;
          </button>
        </div>
        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 animate-shake">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Subject</label>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="input-field" required>
              <option value="">Select a Subject</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name} (Sem {subject.semester})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
            <input type="text" placeholder="e.g. Unit 1 Handwritten Notes" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Resource Type</label>
            <select value={resourceType} onChange={(e) => setResourceType(e.target.value)} className="input-field">
              <option value="Note">Notes</option>
              <option value="Question Paper">Question Paper</option>
              <option value="Link">External Link</option>
              <option value="Syllabus">Syllabus</option>
            </select>
          </div>
          {resourceType === 'Question Paper' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Year</label>
              <input type="number" placeholder="e.g. 2023" value={year} onChange={(e) => setYear(e.target.value)} className="input-field" />
            </div>
          )}
          {resourceType === 'Link' ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Link URL</label>
              <input type="url" placeholder="https://..." value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="input-field" required />
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">File (PDF/Image)</label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files[0])} className="block w-full cursor-pointer text-sm text-slate-500 transition-all file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200" required />
            </div>
          )}
          <button type="submit" disabled={isUploading} className="btn dashboard-action-primary w-full text-sm">
            {isUploading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                Uploading...
              </span>
            ) : (
              'Upload'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;

