import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, Upload, MessageSquare, Users, ArrowRight, GraduationCap, Sparkles, Zap, ShieldCheck } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Search, title: 'Find Resources', desc: 'Search subject-wise PDFs, notes, and previous year papers.' },
    { icon: Upload, title: 'Upload & Share', desc: 'Upload notes and question papers to help fellow students.' },
    { icon: MessageSquare, title: 'Discuss', desc: 'Join subject-specific discussions and ask questions.' },
    { icon: GraduationCap, title: 'Organized', desc: 'Resources organized by degree, branch, year & semester.' },
  ];

  return (
    <div className="space-y-20 animate-fade-in">
      {/* Hero */}
      <section className="text-center py-16 sm:py-24 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-brand-300/20 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-300/10 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50/80 backdrop-blur text-brand-700 rounded-full text-sm font-medium mb-6 shadow-sm ring-1 ring-brand-200/50 animate-slide-down">
          <Users size={16} />
          For BPSMV Students
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-slate-900 mb-6 leading-tight animate-slide-up">
          Your Academic Resource <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-700 animate-shimmer bg-[length:200%_auto]">Hub</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Access subject-wise notes, previous year question papers, and external resources — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary text-lg px-8 py-3.5 shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5 transition-all duration-300">
            Go to Dashboard <ArrowRight size={18} className="animate-bounce-x" />
          </button>
          <button onClick={() => navigate('/resources')} className="btn btn-secondary text-lg px-8 py-3.5 hover:-translate-y-0.5 transition-all duration-300">
            Browse Resources
          </button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-14 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          {[
            { icon: BookOpen, label: 'Subjects', value: '50+' },
            { icon: Zap, label: 'Resources', value: '500+' },
            { icon: ShieldCheck, label: 'Trusted', value: '100%' },
          ].map((s, i) => (
            <div key={i} className="text-center p-3 rounded-2xl bg-white/60 backdrop-blur border border-slate-200/60 hover:scale-105 transition-transform duration-300">
              <s.icon size={20} className="mx-auto mb-1 text-brand-600" />
              <p className="text-lg font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className="card p-6 text-center hover:-translate-y-2 hover:shadow-xl transition-all duration-500 group animate-slide-up"
              style={{ animationDelay: `${0.1 * i}s` }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Icon size={26} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm">{f.desc}</p>
            </div>
          );
        })}
      </section>

      {/* Stats / CTA */}
      <section className="card bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 sm:p-12 text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600/10 via-transparent to-brand-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-display font-bold mb-4 animate-fade-in">Ready to boost your studies?</h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Join hundreds of BPSMV students who share and discover academic resources every day.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <button onClick={() => navigate('/dashboard')} className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-3 rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-2 hover:-translate-y-0.5 shadow-lg shadow-white/10">
              <Sparkles size={18} /> Open Dashboard
            </button>
            <button onClick={() => navigate('/upload')} className="bg-brand-600 text-white hover:bg-brand-500 px-8 py-3 rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-2 hover:-translate-y-0.5 shadow-lg shadow-brand-500/20">
              <Upload size={18} /> Upload Resource
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
