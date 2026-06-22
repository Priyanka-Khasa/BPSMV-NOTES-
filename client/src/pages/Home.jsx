import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, Upload, MessageSquare, Users, ArrowRight, GraduationCap, User } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { guestLogin } = useAuth();

  const handleGuest = async () => {
    try { await guestLogin(); navigate('/dashboard'); }
    catch { navigate('/login'); }
  };

  const features = [
    { icon: Search, title: 'Find Resources', desc: 'Search subject-wise PDFs, notes, and previous year papers.' },
    { icon: Upload, title: 'Upload & Share', desc: 'Upload notes and question papers to help fellow students.' },
    { icon: MessageSquare, title: 'Discuss', desc: 'Join subject-specific discussions and ask questions.' },
    { icon: GraduationCap, title: 'Organized', desc: 'Resources organized by degree, branch, year & semester.' },
  ];

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center py-12 sm:py-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 rounded-full text-sm font-medium mb-6">
          <Users size={16} />
          For BPSMV Students
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-slate-900 mb-6 leading-tight">
          Your Academic Resource <span className="text-brand-600">Hub</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-8">
          Access subject-wise notes, previous year question papers, and external resources — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button onClick={() => navigate('/resources')} className="btn btn-primary text-lg px-8 py-3.5">
            Browse Resources <ArrowRight size={18} />
          </button>
          <button onClick={() => navigate('/login')} className="btn btn-secondary text-lg px-8 py-3.5">
            Get Started
          </button>
          <button onClick={handleGuest} className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-lg font-medium hover:bg-emerald-100 transition-colors">
            <User size={18} /> Enter as Guest
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className="card p-6 text-center hover:-translate-y-1">
              <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon size={24} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm">{f.desc}</p>
            </div>
          );
        })}
      </section>

      {/* Stats / CTA */}
      <section className="card bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 sm:p-12 text-center">
        <h2 className="text-3xl font-display font-bold mb-4">Ready to boost your studies?</h2>
        <p className="text-slate-300 mb-8 max-w-xl mx-auto">
          Join hundreds of BPSMV students who share and discover academic resources every day.
        </p>
        <button onClick={() => navigate('/login?mode=signup')} className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-3 rounded-xl font-semibold transition-colors inline-flex items-center gap-2 mr-3">
          Create Free Account <ArrowRight size={18} />
        </button>
        <button onClick={handleGuest} className="bg-emerald-600 text-white hover:bg-emerald-500 px-8 py-3 rounded-xl font-semibold transition-colors inline-flex items-center gap-2">
          <User size={18} /> Enter as Guest
        </button>
      </section>
    </div>
  );
};

export default Home;
