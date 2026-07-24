import React from 'react';
import Navbar from './Navbar';
import {
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  ExternalLink,
  FileText,
  Github,
  GraduationCap,
  Heart,
  Home,
  LogIn,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from 'lucide-react';
import BrandLogo from './BrandLogo';

const Footer = () => {
  const year = new Date().getFullYear();
  const contactEmail = 'priyankakhasa937@gmail.com';
  const gmailComposeUrl =
    `https://mail.google.com/mail/?view=cm&fs=1&to=${contactEmail}` +
    '&su=BPSMV%20Resource%20Hub%20Feedback' +
    '&body=Hi%20Priyanka,%0A%0AI%20want%20to%20share%20';

  const socialLinks = [
    {
      label: 'Twitter / X',
      href: 'https://x.com/KhasaPriya23994',
      icon: Twitter,
      accent: 'hover:border-slate-900 hover:bg-slate-900 hover:text-white',
    },
    {
      label: 'GitHub',
      href: 'https://github.com/Priyanka-Khasa',
      icon: Github,
      accent: 'hover:border-slate-900 hover:bg-slate-900 hover:text-white',
    },
  ];

  const universityLinks = [
    {
      label: 'Student Results',
      href: 'https://bpsmvapp.digitaluniversity.ac/SearchDuplicateResult.aspx?',
      icon: FileText,
    },
    {
      label: 'Student Portal',
      href: 'https://bpsmvapp.digitaluniversity.ac/',
      icon: LogIn,
    },
    {
      label: 'Digital University Home',
      href: 'https://bpsmv.digitaluniversity.ac/',
      icon: GraduationCap,
    },
    {
      label: 'Official Website',
      href: 'http://www.bpswomenuniversity.ac.in',
      icon: Home,
    },
  ];

  const appLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Resources', href: '/resources', icon: BookOpen },
    { label: 'Jobs & Internships', href: '/jobs', icon: BriefcaseBusiness },
    { label: 'Upload Resource', href: '/upload', icon: ArrowUpRight },
    { label: 'Gift Feedback', href: '/gift', icon: Heart },
  ];

  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-[#fbfaf7] text-slate-800">
      <div className="h-1 bg-gradient-to-r from-brand-700 via-brand-500 to-brand-200" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.85fr_0.75fr_0.9fr]">
          <div>
            <BrandLogo size="sm" />
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
              BPSMV Resource Hub keeps notes, papers, uploads, discussions, and official student links in one place.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <a
                href={gmailComposeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-brand-200 bg-white px-3.5 py-2 text-sm font-semibold text-brand-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50"
              >
                <Mail size={16} />
                Open Gmail
              </a>
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={link.label}
                    title={link.label}
                    className={`grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 ${link.accent}`}
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">Useful BPSMV Links</p>
            <div className="mt-3 grid gap-1.5">
              {universityLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 transition-all duration-300 hover:bg-white hover:text-brand-700 hover:shadow-sm"
                  >
                    <Icon size={16} className="text-slate-400 group-hover:text-brand-600" />
                    <span>{link.label}</span>
                    <ExternalLink size={14} className="ml-auto text-slate-300 transition-colors group-hover:text-brand-500" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">Explore Hub</p>
            <div className="mt-3 grid gap-1.5">
              {appLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    className="group flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 transition-all duration-300 hover:bg-white hover:text-brand-700 hover:shadow-sm"
                  >
                    <Icon size={16} className="text-slate-400 group-hover:text-brand-600" />
                    {link.label}
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">Contact</p>
            <div className="mt-3 space-y-3 text-sm text-slate-600">
              <a
                href="tel:+911263283038"
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 font-medium text-slate-700 transition-all duration-300 hover:bg-white hover:text-brand-700 hover:shadow-sm"
              >
                <Phone size={16} className="text-brand-600" />
                +91 01263-283038
              </a>
              <a
                href={gmailComposeUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 font-medium text-slate-700 transition-all duration-300 hover:bg-white hover:text-brand-700 hover:shadow-sm"
              >
                <Mail size={16} className="text-brand-600" />
                {contactEmail}
              </a>
              <p className="flex items-start gap-2 rounded-lg px-2.5 py-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-brand-600" />
                <span>Khanpur Kalan, Sonepat, Haryana 131305</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright © {year} BPSMV Resource Hub. Built by Priyanka Khasa.</p>
          <p className="flex items-center gap-1.5">
            Made with <Heart size={13} className="fill-brand-500 text-brand-500" /> for BPSMV students
          </p>
        </div>
      </div>
    </footer>
  );
};

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(193,122,92,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(143,82,57,0.10),transparent_32%),linear-gradient(135deg,#faf8f2,#f5f1e8_55%,#fffdf8)] flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
