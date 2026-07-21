import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  BriefcaseBusiness,
  Code2,
  ExternalLink,
  Facebook,
  FileCheck2,
  Github,
  Globe,
  GraduationCap,
  Instagram,
  Linkedin,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import ActivityCalendar from '../components/ActivityCalendar';

const socialFields = [
  { key: 'github', label: 'GitHub', icon: Github },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { key: 'instagram', label: 'Instagram', icon: Instagram },
  { key: 'facebook', label: 'Facebook', icon: Facebook },
  { key: 'leetcode', label: 'LeetCode', icon: Code2 },
  { key: 'portfolio', label: 'Portfolio', icon: Globe },
  { key: 'hackerrank', label: 'HackerRank', icon: Code2 },
  { key: 'website', label: 'Website', icon: ExternalLink },
];

const PublicProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [activity, setActivity] = useState({ totals: {}, daily: [], recent: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await axios.get(`/activity/public/${id}`);
        setProfile(res.data.profile);
        setActivity(res.data.activity);
      } catch (err) {
        setError('This profile could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto mt-16 max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <UserRound size={32} className="mx-auto mb-3 text-slate-300" />
        <h1 className="font-display text-xl font-bold text-slate-950">Profile not found</h1>
        <p className="mt-2 text-sm text-slate-500">{error}</p>
        <Link to="/" className="btn btn-primary mt-5 inline-flex">
          <ArrowLeft size={16} /> Back home
        </Link>
      </div>
    );
  }

  const links = socialFields.filter((field) => profile.socialLinks?.[field.key]);

  const cgpaRows = Array.from({ length: 8 }, (_, index) => {
    const semester = index + 1;
    const saved = (profile.semesterCgpa || []).find((row) => Number(row.semester) === semester);
    return {
      semester,
      cgpa: saved?.cgpa ?? '',
      completedMonth: saved?.completedMonth || (index % 2 === 0 ? 'January' : 'June'),
      completedYear: saved?.completedYear ?? '',
    };
  });
  const completedCgpaRows = cgpaRows.filter(
    (row) => row.cgpa !== '' && row.cgpa !== null && row.cgpa !== undefined
  );
  const averageCgpa = completedCgpaRows.length
    ? (completedCgpaRows.reduce((sum, row) => sum + Number(row.cgpa), 0) / completedCgpaRows.length).toFixed(2)
    : '--';

  const stats = [
    { label: 'Internships applied', value: activity.totals?.internshipsApplied || 0, icon: BriefcaseBusiness },
    { label: 'Resources opened', value: activity.totals?.pdfOpened || 0, icon: UserRound },
    { label: 'Resources completed', value: activity.totals?.pdfCompleted || 0, icon: FileCheck2 },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16 animate-fade-in">
      {/* Identity card */}
      <section className="overflow-hidden rounded-3xl border border-white/15 bg-white/10 shadow-[0_24px_70px_rgba(7,5,15,0.25)] backdrop-blur-xl">
        <div className="relative bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 px-6 py-10 text-white sm:px-10">
          {/* faint ruled texture to nod at the academic-record theme, kept subtle */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(to bottom, transparent, transparent 27px, rgba(255,255,255,0.6) 28px)',
            }}
          />
          <Link
            to="/"
            className="relative mb-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-100 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <ArrowLeft size={16} /> BPSMV Resource Hub
          </Link>

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
            <img
              src={
                profile.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=c17a5c&color=fff&size=128`
              }
              alt=""
              className="h-24 w-24 shrink-0 rounded-2xl border-4 border-white/15 object-cover shadow-xl sm:h-28 sm:w-28"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate font-display text-2xl font-bold sm:text-3xl">{profile.name}</h1>
                <ShieldCheck size={18} className="shrink-0 text-brand-100" aria-label="Verified student" />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-brand-100">
                <span>{profile.degree || 'Degree'}</span>
                <span className="text-brand-300">&middot;</span>
                <span>{profile.branch || 'Branch'}</span>
                <span className="text-brand-300">&middot;</span>
                <span>Semester {profile.semester || '-'}</span>
              </div>
              {profile.bio && (
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-200">{profile.bio}</p>
              )}
            </div>
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
                  <p className="text-2xl font-bold leading-none text-slate-50">{stat.value}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Links */}
      {links.length > 0 && (
        <section className="card p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-slate-50">Links</h2>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {links.map((field) => {
              const Icon = field.icon;
              return (
                <a
                  key={field.key}
                  href={profile.socialLinks[field.key]}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:border-brand-300/40 hover:bg-white/15 hover:text-brand-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                >
                  <Icon size={15} />
                  {field.label}
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* CGPA progress */}
      <section className="card p-5 sm:p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap size={19} className="text-brand-700" />
            <div>
              <h2 className="font-display text-lg font-bold text-slate-50">Academic progress</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {completedCgpaRows.length > 0
                  ? `${completedCgpaRows.length} of 8 semesters recorded`
                  : 'No semesters recorded yet'}
              </p>
            </div>
          </div>
          {completedCgpaRows.length > 0 && (
            <div className="flex items-baseline gap-2 self-start rounded-xl bg-brand-50 px-4 py-2.5 ring-1 ring-brand-100 sm:self-auto">
              <span className="text-xs font-semibold uppercase tracking-wide text-brand-700">Average</span>
              <span className="text-xl font-bold text-brand-800">{averageCgpa}</span>
            </div>
          )}
        </div>

        {completedCgpaRows.length > 0 ? (
          <div className="overflow-x-auto pb-1">
            <div className="flex min-w-[560px] items-start gap-1 sm:min-w-0">
              {cgpaRows.map((row, index) => {
                const isCompleted = row.cgpa !== '' && row.cgpa !== null && row.cgpa !== undefined;
                const isLast = index === cgpaRows.length - 1;
                return (
                  <div key={row.semester} className="flex flex-1 flex-col items-center">
                    <div className="flex h-7 items-end">
                      {isCompleted ? (
                        <span className="text-sm font-bold text-brand-800">{Number(row.cgpa).toFixed(2)}</span>
                      ) : (
                        <span className="text-sm font-medium text-slate-300">--</span>
                      )}
                    </div>
                    <div className="mt-2 flex w-full items-center">
                      <div className={`h-px flex-1 ${index === 0 ? 'opacity-0' : isCompleted ? 'bg-brand-300' : 'bg-slate-200'}`} />
                      <span
                        title={
                          isCompleted
                            ? `Semester ${row.semester} · completed ${row.completedMonth || ''} ${row.completedYear || ''}`
                            : `Semester ${row.semester} · not completed yet`
                        }
                        className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-full ring-4 ${
                          isCompleted
                            ? 'bg-brand-600 ring-brand-100'
                            : 'bg-white ring-slate-100 border border-dashed border-slate-300'
                        }`}
                      />
                      <div className={`h-px flex-1 ${isLast ? 'opacity-0' : isCompleted ? 'bg-brand-300' : 'bg-slate-200'}`} />
                    </div>
                    <span className={`mt-2 text-xs font-medium ${isCompleted ? 'text-slate-600' : 'text-slate-300'}`}>
                      S{row.semester}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-white/15 bg-white/10 px-4 py-6 text-center text-sm text-slate-400">
            CGPA hasn&apos;t been added for any semester yet.
          </div>
        )}
      </section>

      <ActivityCalendar daily={activity.daily || []} />
    </div>
  );
};

export default PublicProfile;
