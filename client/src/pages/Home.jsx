import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen, Search, Upload, MessageSquare, Users, ArrowRight,
  GraduationCap, Sparkles, Zap, ShieldCheck, Star, Layers,
  ChevronRight, Award, Clock, FileText, ArrowUpRight
} from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const containerRef = useScrollAnimation('.scroll-reveal');

  useEffect(() => {
    if (isAuthenticated && window.location.pathname === '/') {
      // Optionally redirect authenticated users to dashboard, but let's keep landing accessible
    }
  }, [isAuthenticated]);

  const features = [
    {
      icon: Search,
      title: 'Find Resources',
      desc: 'Search subject-wise PDFs, notes, and previous year papers instantly.',
      color: 'from-brand-50 to-brand-100',
      text: 'text-brand-600'
    },
    {
      icon: Upload,
      title: 'Upload & Share',
      desc: 'Upload notes and question papers to help fellow students succeed.',
      color: 'from-emerald-50 to-emerald-100',
      text: 'text-emerald-600'
    },
    {
      icon: MessageSquare,
      title: 'Discuss',
      desc: 'Join subject-specific discussions and ask questions anytime.',
      color: 'from-sky-50 to-sky-100',
      text: 'text-sky-600'
    },
    {
      icon: GraduationCap,
      title: 'Organized',
      desc: 'Resources organized by degree, branch, year & semester.',
      color: 'from-amber-50 to-amber-100',
      text: 'text-amber-600'
    },
  ];

  const steps = [
    { icon: UserPlus, title: 'Create Account', desc: 'Sign up in seconds with email or continue as guest.' },
    { icon: Layers, title: 'Select Subjects', desc: 'Choose your degree, branch, and semester.' },
    { icon: FileText, title: 'Access Resources', desc: 'Browse notes, papers, and links curated for you.' },
    { icon: Upload, title: 'Contribute', desc: 'Upload your own notes to help the community.' },
  ];

  const testimonials = [
    { name: 'Rahul Sharma', role: 'B.Tech CSE, 3rd Year', text: 'BPSMV Hub helped me find all my semester notes in one place. Game changer!', stars: 5 },
    { name: 'Priya Verma', role: 'BCA, 2nd Year', text: 'The discussion feature is amazing. I got my doubts cleared within hours.', stars: 5 },
    { name: 'Amit Kumar', role: 'BBA, Final Year', text: 'Previous year papers helped me prepare better for exams. Highly recommended.', stars: 4 },
  ];

  return (
    <div ref={containerRef} className="space-y-0 -mx-4 sm:-mx-6 lg:-mx-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-brand-50/30 to-parchment-light min-h-[90vh] flex items-center justify-center hero-pattern">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-300/15 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-400/15 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-200/10 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="text-center lg:text-left">
              <div className="scroll-reveal scroll-reveal-delay-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur text-brand-700 rounded-full text-sm font-medium mb-8 shadow-sm ring-1 ring-brand-200/50 animate-float-y">
                  <Sparkles size={16} className="text-brand-500" />
                  For BPSMV Students
                </div>
              </div>

              <h1 className="scroll-reveal scroll-reveal-delay-2 text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-slate-900 mb-6 leading-tight tracking-tight hero-title">
                Your Academic<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700">
                  Resource Hub
                </span>
              </h1>

              <p className="scroll-reveal scroll-reveal-delay-3 text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                Access subject-wise notes, previous year question papers, and external resources — all in one beautifully organized place.
              </p>

              <div className="scroll-reveal scroll-reveal-delay-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                  className="btn btn-primary text-lg px-8 py-4 shadow-xl shadow-brand-500/25 hover:shadow-2xl hover:shadow-brand-500/30 hover:-translate-y-1 transition-all duration-300 animate-subtle-pulse"
                >
                  {isAuthenticated ? 'Open Dashboard' : 'Get Started'}
                  <ArrowRight size={18} className="animate-bounce-x" />
                </button>
                <button
                  onClick={() => navigate('/resources')}
                  className="btn btn-secondary text-lg px-8 py-4 hover:-translate-y-1 transition-all duration-300 group"
                >
                  Browse Resources
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Quick stats */}
              <div className="scroll-reveal scroll-reveal-delay-5 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 mt-12">
                {[
                  { icon: BookOpen, label: 'Subjects', value: '50+' },
                  { icon: Zap, label: 'Resources', value: '500+' },
                  { icon: ShieldCheck, label: 'Trusted', value: '100%' },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="text-center p-4 rounded-2xl bg-white/70 backdrop-blur border border-slate-200/60 hover:scale-105 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-500"
                  >
                    <s.icon size={22} className="mx-auto mb-2 text-brand-600" />
                    <p className="text-xl font-bold text-slate-900">{s.value}</p>
                    <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Hero Image */}
            <div className="scroll-reveal scroll-reveal-delay-3 hidden lg:flex justify-center items-center relative">
              <div className="relative">
                {/* Decorative rings behind image */}
                <div className="absolute -inset-8 bg-gradient-to-br from-brand-100/40 to-brand-200/30 rounded-[2.5rem] blur-2xl"></div>
                <div className="absolute -inset-4 border-2 border-brand-200/30 rounded-[2rem] animate-pulse-slow"></div>
                <img
                  src="/image1.jpeg"
                  alt="Student studying with laptop and books"
                  className="relative w-[420px] h-auto rounded-[2rem] shadow-2xl shadow-brand-500/10 object-cover ring-1 ring-brand-200/50 animate-float-slow"
                />
                {/* Floating badge */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl px-4 py-3 shadow-lg shadow-brand-500/10 border border-brand-100 animate-float-y">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                      <BookOpen size={16} className="text-brand-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">500+ Resources</p>
                      <p className="text-[10px] text-slate-500">Notes & Papers</p>
                    </div>
                  </div>
                </div>
                {/* Floating badge top right */}
                <div className="absolute -top-4 -right-4 bg-white rounded-xl px-4 py-3 shadow-lg shadow-brand-500/10 border border-brand-100 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <GraduationCap size={16} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">50+ Subjects</p>
                      <p className="text-[10px] text-slate-500">All Branches</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden sm:flex flex-col items-center gap-2 text-slate-400">
          <span className="text-xs font-medium">Scroll to explore</span>
          <div className="w-5 h-8 border-2 border-slate-300 rounded-full flex justify-center pt-1">
            <div className="w-1 h-2 bg-slate-400 rounded-full animate-float-y"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-28 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 scroll-reveal">
            <span className="inline-block px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">Features</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-4 line-decoration inline-block">Everything You Need</h2>
            <p className="text-slate-500 max-w-xl mx-auto mt-6">A complete platform designed to make your academic journey smoother and more productive.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="scroll-reveal group card p-8 text-center hover:-translate-y-3 hover:shadow-2xl hover:shadow-brand-500/5 transition-all duration-500 hover-glow-brand"
                  style={{ transitionDelay: `${0.1 * i}s` }}
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${f.color} ${f.text} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <Icon size={28} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works + Image Section */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 scroll-reveal">
            <span className="inline-block px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-4 line-decoration inline-block">Get Started in Minutes</h2>
            <p className="text-slate-500 max-w-xl mx-auto mt-6">Four simple steps to unlock a world of academic resources.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="scroll-reveal relative text-center group">
                    <div className="w-20 h-20 bg-gradient-to-br from-white to-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-500/10 group-hover:scale-110 group-hover:shadow-brand-500/20 transition-all duration-500 ring-1 ring-brand-100">
                      <Icon size={32} />
                    </div>
                    <div className="absolute top-10 left-1/2 w-full hidden sm:block">
                      {i < steps.length - 1 && i % 2 === 0 && (
                        <div className="w-full h-px bg-gradient-to-r from-brand-200/50 to-brand-300/50 ml-10 mr-10"></div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Right: Study Desk Image */}
            <div className="scroll-reveal relative hidden lg:flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-6 bg-gradient-to-br from-brand-100/50 to-amber-100/40 rounded-[2.5rem] blur-2xl group-hover:scale-105 transition-transform duration-700"></div>
                <img
                  src="/image2.png"
                  alt="Cozy study desk setup with motivational notes"
                  className="relative w-[380px] h-auto rounded-[2rem] shadow-2xl shadow-brand-500/10 object-cover ring-1 ring-brand-200/50 transition-transform duration-700 group-hover:scale-[1.02]"
                />
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-brand-200/40 rounded-full blur-xl animate-float"></div>
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-amber-200/30 rounded-full blur-xl animate-float-slow"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section with Background */}
      <section className="py-20 sm:py-28 bg-white/60 relative overflow-hidden">
        {/* Decorative gradient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl"></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white/60"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 scroll-reveal">
            <span className="inline-block px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-4 line-decoration inline-block">Loved by Students</h2>
            <p className="text-slate-500 max-w-xl mx-auto mt-6">See what your fellow BPSMV students have to say.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="scroll-reveal card p-8 hover:-translate-y-2 hover:shadow-xl transition-all duration-500 bg-white/80 backdrop-blur-sm"
                style={{ transitionDelay: `${0.15 * i}s` }}
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star
                      key={si}
                      size={16}
                      className={si < t.stars ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
                    />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-brand-700 font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA with Image */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600/10 via-transparent to-brand-700/10"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-700/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: CTA Content */}
            <div className="text-center lg:text-left scroll-reveal">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur text-white/80 rounded-full text-sm font-medium mb-8 border border-white/10">
                <Award size={16} />
                Join 500+ students already using BPSMV Hub
              </div>
              <h2 className="text-3xl sm:text-5xl font-display font-bold text-white mb-6 leading-tight">
                Ready to boost your<br />studies?
              </h2>
              <p className="text-slate-300 mb-10 max-w-xl mx-auto lg:mx-0 text-lg leading-relaxed">
                Join hundreds of BPSMV students who share and discover academic resources every day.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                  className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-4 rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-2 hover:-translate-y-1 shadow-lg shadow-white/10 text-lg"
                >
                  <Sparkles size={20} /> {isAuthenticated ? 'Open Dashboard' : 'Get Started Free'}
                </button>
                <button
                  onClick={() => navigate('/upload')}
                  className="bg-brand-600 text-white hover:bg-brand-500 px-8 py-4 rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-2 hover:-translate-y-1 shadow-lg shadow-brand-500/20 text-lg"
                >
                  <Upload size={20} /> Upload Resource
                </button>
              </div>
            </div>

            {/* Right: Motivational Image */}
            <div className="scroll-reveal hidden lg:flex justify-center relative">
              <div className="relative group">
                <div className="absolute -inset-8 bg-brand-500/20 rounded-[2.5rem] blur-2xl group-hover:scale-105 transition-transform duration-700"></div>
                <img
                  src="/image3.png"
                  alt="Be unstoppable motivational study collage"
                  className="relative w-[360px] h-auto rounded-[2rem] shadow-2xl shadow-brand-500/10 object-cover ring-1 ring-white/10 transition-transform duration-700 group-hover:scale-[1.02]"
                />
                {/* Glow orb */}
                <div className="absolute -top-6 -right-6 w-28 h-28 bg-brand-400/20 rounded-full blur-2xl animate-pulse-slow"></div>
                <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-amber-400/20 rounded-full blur-2xl animate-float"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Additional icons needed for steps
function UserPlus({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  );
}

export default Home;
