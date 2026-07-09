import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Check, CreditCard, Loader2, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TurnstileWidget from '../components/TurnstileWidget';

const loadRazorpay = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

const fallbackPlans = [
  { id: 'monthly', label: 'Monthly Access', amount: 500, currency: 'INR' },
  { id: 'yearly', label: 'Yearly Access', amount: 5000, currency: 'INR' }
];

const Subscribe = () => {
  const { user, fetchUser, logout } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState(fallbackPlans);
  const [selected, setSelected] = useState('yearly');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [resetKey, setResetKey] = useState(0);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  const handleCaptcha = useCallback((token) => setTurnstileToken(token), []);

  useEffect(() => {
    axios.get('/payments/config')
      .then(({ data }) => {
        if (data.plans?.length) setPlans(data.plans);
      })
      .catch(() => setError('Payment service is not configured yet.'));
  }, []);

  useEffect(() => {
    if (user?.subscription?.active || user?.role === 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, user]);

  const startPayment = async () => {
    if (!turnstileToken) {
      setError('Please complete the security check.');
      return;
    }

    setPaying(true);
    setError('');
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error('Razorpay checkout could not load. Check your connection.');

      const { data: order } = await axios.post('/payments/order', {
        plan: selected,
        turnstileToken
      });

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
            navigate('/dashboard', { replace: true });
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
      setTurnstileToken('');
      setResetKey((value) => value + 1);
    }
  };

  return (
    <div className="mx-auto max-w-4xl py-8 sm:py-12">
      <div className="text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
          <ShieldCheck size={25} />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">Unlock the Resource Hub</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
          One small student contribution keeps notes, papers, discussions, and career resources available in one secure place.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {plans.map((plan) => {
          const active = selected === plan.id;
          const yearly = plan.id === 'yearly';
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelected(plan.id)}
              className={`relative p-6 text-left border bg-white transition-all ${
                active
                  ? 'border-brand-500 ring-2 ring-brand-100 shadow-lg'
                  : 'border-slate-200 hover:border-slate-300'
              } rounded-lg`}
            >
              {yearly && (
                <span className="absolute right-4 top-4 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                  Save ₹10
                </span>
              )}
              <p className="text-sm font-semibold text-slate-600">{plan.label}</p>
              <p className="mt-3 text-4xl font-bold text-slate-900">
                ₹{plan.amount / 100}
                <span className="text-sm font-medium text-slate-500"> / {yearly ? 'year' : 'month'}</span>
              </p>
              <div className="mt-5 space-y-2 text-sm text-slate-600">
                <p className="flex items-center gap-2"><Check size={16} className="text-emerald-600" /> All notes and papers</p>
                <p className="flex items-center gap-2"><Check size={16} className="text-emerald-600" /> Discussions and career updates</p>
                <p className="flex items-center gap-2"><Check size={16} className="text-emerald-600" /> Access on your verified account</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mx-auto mt-6 max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <TurnstileWidget
          action="payment"
          onVerify={handleCaptcha}
          resetKey={resetKey}
        />
        <button
          type="button"
          onClick={startPayment}
          disabled={paying || !turnstileToken}
          className="btn btn-primary mt-3 w-full py-3 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {paying ? <Loader2 size={17} className="animate-spin" /> : <CreditCard size={17} />}
          {paying ? 'Opening secure checkout...' : `Pay ₹${plans.find((plan) => plan.id === selected)?.amount / 100 || 0}`}
        </button>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <LockKeyhole size={13} /> Payment is processed securely by Razorpay.
        </p>
      </div>

      <div className="mt-6 text-center">
        <button type="button" onClick={logout} className="text-sm font-medium text-slate-500 hover:text-slate-800">
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Subscribe;
