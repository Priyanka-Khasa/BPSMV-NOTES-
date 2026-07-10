import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BookOpen,
  BriefcaseBusiness,
  Check,
  CreditCard,
  Gift,
  GraduationCap,
  Loader2,
  LockKeyhole,
  MessageSquareText,
  Newspaper,
  ShieldCheck,
  Trophy,
  UploadCloud
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const loadRazorpay = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

const fallbackPlans = [
  { id: 'monthly', label: 'Monthly Access', amount: 1000, currency: 'INR' },
  { id: 'yearly', label: 'Yearly Access', amount: 5000, currency: 'INR' }
];

const featureGroups = [
  {
    icon: BookOpen,
    title: 'Notes and Papers',
    text: 'Access notes, previous year papers, syllabi, PDFs, and subject material.'
  },
  {
    icon: BriefcaseBusiness,
    title: 'Jobs and Internships',
    text: 'Browse student-shared jobs, internships, scholarships, and career links.'
  },
  {
    icon: Trophy,
    title: 'Hackathons',
    text: 'Stay updated with competitions, hiring challenges, and growth opportunities.'
  },
  {
    icon: Newspaper,
    title: 'Campus Updates',
    text: 'Follow useful academic, placement, and resource updates in one place.'
  },
  {
    icon: Gift,
    title: 'Gift Feature',
    text: 'Report genuine issues with screenshots and keep the platform improving.'
  },
  {
    icon: UploadCloud,
    title: 'Upload Resources',
    text: 'Share notes, links, question papers, images, and PDFs with your batch.'
  },
  {
    icon: MessageSquareText,
    title: 'Subject Chat',
    text: 'Discuss doubts, send messages, and collaborate inside subject rooms.'
  },
  {
    icon: GraduationCap,
    title: 'Student Dashboard',
    text: 'Get a personalized dashboard for your degree, branch, year, and semester.'
  }
];

const Subscribe = () => {
  const { user, fetchUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [plans, setPlans] = useState(fallbackPlans);
  const [selected, setSelected] = useState('yearly');
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const fromPath = location.state?.from?.pathname;
  const redirectAfterPayment = fromPath && fromPath !== '/subscribe' ? fromPath : '/dashboard';

  useEffect(() => {
    axios.get('/payments/config')
      .then(({ data }) => {
        if (data.plans?.length) setPlans(data.plans);
      })
      .catch(() => setError('Payment service is not configured yet.'));
  }, []);

  useEffect(() => {
    if (user?.subscription?.active || user?.role === 'admin') {
      navigate(redirectAfterPayment, { replace: true });
    }
  }, [navigate, redirectAfterPayment, user]);

  const selectedPlan = plans.find((plan) => plan.id === selected) || fallbackPlans[0];

  const startPayment = async () => {
    setPaying(true);
    setError('');
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error('Razorpay checkout could not load. Check your connection.');

      const { data: order } = await axios.post('/payments/order', { plan: selected });

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: order.name,
        description: order.description,
        order_id: order.orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || ''
        },
        theme: { color: '#a85f45' },
        modal: {
          ondismiss: () => setPaying(false)
        },
        handler: async (response) => {
          try {
            await axios.post('/payments/verify', response);
            await fetchUser();
            navigate(redirectAfterPayment, { replace: true });
          } catch (verifyError) {
            setError(verifyError.response?.data?.message || 'Payment verification failed.');
            setPaying(false);
          }
        }
      });
      checkout.on('payment.failed', (response) => {
        setError(response.error?.description || 'Payment failed. No access was activated.');
        setPaying(false);
      });
      checkout.open();
    } catch (paymentError) {
      setError(paymentError.response?.data?.message || paymentError.message || 'Could not start payment.');
      setPaying(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-10">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <section className="bg-slate-950 p-6 text-white sm:p-8 lg:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-100">
              <ShieldCheck size={14} /> Secure student access
            </div>
            <h1 className="mt-5 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Unlock BPSMV Resource Hub for serious study.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              One low student contribution opens notes, papers, jobs, internships, hackathons, uploads, chat, updates, and issue rewards in one protected account.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {featureGroups.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
                  <div className="mb-3 grid h-9 w-9 place-items-center rounded-lg bg-emerald-400/15 text-emerald-200">
                    <Icon size={18} />
                  </div>
                  <h2 className="text-sm font-semibold text-white">{title}</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="p-5 sm:p-7 lg:p-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Choose access</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">Simple pricing for students</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Payment activates access only for your logged-in account. Dashboard opens after successful verification.
            </p>

            <div className="mt-6 grid gap-3">
              {plans.map((plan) => {
                const active = selected === plan.id;
                const yearly = plan.id === 'yearly';
                const monthlyEquivalent = yearly ? Math.round((plan.amount / 100) / 12) : null;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelected(plan.id)}
                    className={`relative w-full rounded-xl border p-5 text-left transition-all ${
                      active
                        ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-100 shadow-lg shadow-brand-100/70'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{plan.label}</p>
                        <p className="mt-2 text-3xl font-bold text-slate-950">
                          Rs. {plan.amount / 100}
                          <span className="text-sm font-medium text-slate-500"> / {yearly ? 'year' : 'month'}</span>
                        </p>
                        {yearly && (
                          <p className="mt-1 text-xs font-medium text-emerald-700">
                            Around Rs. {monthlyEquivalent}/month with yearly access
                          </p>
                        )}
                      </div>
                      <span className={`mt-1 h-5 w-5 rounded-full border ${active ? 'border-brand-600 bg-brand-600 shadow-inner' : 'border-slate-300'}`}>
                        {active && <span className="mx-auto mt-1 block h-2.5 w-2.5 rounded-full bg-white" />}
                      </span>
                    </div>
                    {yearly && (
                      <span className="mt-4 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                        Best value
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                <p className="flex items-center gap-2"><Check size={16} className="text-emerald-600" /> Notes and papers</p>
                <p className="flex items-center gap-2"><Check size={16} className="text-emerald-600" /> Upload resources</p>
                <p className="flex items-center gap-2"><Check size={16} className="text-emerald-600" /> Jobs and internships</p>
                <p className="flex items-center gap-2"><Check size={16} className="text-emerald-600" /> Chat and updates</p>
              </div>
            </div>

            <div className="mt-5">
              {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
              <button
                type="button"
                onClick={startPayment}
                disabled={paying}
                className="btn btn-primary w-full py-3.5 text-base disabled:cursor-not-allowed disabled:opacity-60"
              >
                {paying ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
                {paying ? 'Opening secure checkout...' : `Pay Rs. ${selectedPlan.amount / 100}`}
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <LockKeyhole size={13} /> Payment is processed securely by Razorpay.
              </p>
            </div>

            <div className="mt-5 text-center">
              <button type="button" onClick={logout} className="text-sm font-medium text-slate-500 hover:text-slate-800">
                Sign out
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Subscribe;
