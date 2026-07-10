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
  Sparkles,
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
      <div className="cinematic-card overflow-hidden rounded-2xl border border-white/70 bg-white/80">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative overflow-hidden border-b border-parchment-dark/70 bg-gradient-to-br from-parchment-light via-white to-brand-50/55 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-200/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 left-8 h-72 w-72 rounded-full bg-amber-200/35 blur-3xl" />
            <div className="relative inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/75 px-3 py-1 text-xs font-semibold text-brand-800 shadow-sm">
              <ShieldCheck size={14} /> Secure student access
            </div>
            <h1 className="relative mt-5 max-w-2xl text-3xl font-bold leading-tight text-charcoal sm:text-4xl lg:text-5xl">
              Unlock BPSMV Resource Hub for serious study.
            </h1>
            <p className="relative mt-4 max-w-xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
              One low student contribution opens notes, papers, jobs, internships, hackathons, uploads, chat, updates, and issue rewards in one protected account.
            </p>

            <div className="relative mt-8 grid gap-3 sm:grid-cols-2">
              {featureGroups.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-xl border border-brand-100/80 bg-white/72 p-4 shadow-sm shadow-brand-100/30">
                  <div className="mb-3 grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                    <Icon size={18} />
                  </div>
                  <h2 className="text-sm font-semibold text-charcoal">{title}</h2>
                  <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white/86 p-5 sm:p-7 lg:p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-parchment-light px-3 py-1 text-xs font-semibold text-brand-800 ring-1 ring-parchment-dark">
              <Sparkles size={14} /> Choose access
            </div>
            <h2 className="mt-4 text-2xl font-bold text-charcoal">Simple pricing for students</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
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
                        ? 'border-brand-500 bg-brand-50/70 ring-2 ring-brand-100 shadow-lg shadow-brand-100/80'
                        : 'border-parchment-dark bg-white/80 hover:border-brand-200 hover:bg-parchment-light/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-charcoal">{plan.label}</p>
                        <p className="mt-2 text-3xl font-bold text-charcoal">
                          Rs. {plan.amount / 100}
                          <span className="text-sm font-medium text-[var(--text-secondary)]"> / {yearly ? 'year' : 'month'}</span>
                        </p>
                        {yearly && (
                          <p className="mt-1 text-xs font-medium text-brand-800">
                            Around Rs. {monthlyEquivalent}/month with yearly access
                          </p>
                        )}
                      </div>
                      <span className={`mt-1 h-5 w-5 rounded-full border ${active ? 'border-brand-600 bg-brand-600 shadow-inner' : 'border-parchment-dark'}`}>
                        {active && <span className="mx-auto mt-1 block h-2.5 w-2.5 rounded-full bg-white" />}
                      </span>
                    </div>
                    {yearly && (
                      <span className="mt-4 inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">
                        Best value
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-xl border border-parchment-dark bg-parchment-light/70 p-4">
              <div className="grid gap-2 text-sm text-charcoal sm:grid-cols-2">
                <p className="flex items-center gap-2"><Check size={16} className="text-brand-700" /> Notes and papers</p>
                <p className="flex items-center gap-2"><Check size={16} className="text-brand-700" /> Upload resources</p>
                <p className="flex items-center gap-2"><Check size={16} className="text-brand-700" /> Jobs and internships</p>
                <p className="flex items-center gap-2"><Check size={16} className="text-brand-700" /> Chat and updates</p>
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
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <LockKeyhole size={13} /> Payment is processed securely by Razorpay.
              </p>
            </div>

            <div className="mt-5 text-center">
              <button type="button" onClick={logout} className="text-sm font-medium text-[var(--text-secondary)] hover:text-brand-800">
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
