import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ArrowRight, AlertCircle, Sparkles, Mail, KeyRound, CheckCircle2 } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

const Login = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, googleLogin, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('session') === 'ended') {
      setError('Your account was logged in on another device, so this device was signed out.');
    }
    if (searchParams.get('error') === 'google_auth_failed') {
      setError('Google sign-in failed. Please check the Google OAuth redirect URI and try again.');
    }
    if (searchParams.get('error') === 'session_failed') {
      setError('Google sign-in succeeded, but the login session could not be saved. Please try again.');
    }

    if (isAuthenticated && user?.onboarded) {
      navigate(user?.subscription?.active || user?.role === 'admin' ? '/dashboard' : '/subscribe', { replace: true });
    } else if (isAuthenticated && !user?.onboarded) {
      navigate('/onboarding', { replace: true });
    }
  }, [isAuthenticated, user, navigate, searchParams]);

  const [form, setForm] = useState({ name: '', email: '', password: '', rollNumber: '' });
  const [resetForm, setResetForm] = useState({ email: '', otp: '', password: '', confirmPassword: '' });
  const [resetStep, setResetStep] = useState('email');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleResetChange = (e) => setResetForm({ ...resetForm, [e.target.name]: e.target.value });

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setSuccess('');
    setLoading(false);
    if (nextMode === 'reset') {
      setResetStep('email');
      setResetForm({ email: form.email, otp: '', password: '', confirmPassword: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        if (!form.name || !form.email || !form.password || !form.rollNumber) {
          throw new Error('All fields are required');
        }
        if (form.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        if (!form.rollNumber.trim()) {
          throw new Error('Roll number is required');
        }
        await register(form.name, form.email, form.password, form.rollNumber.trim());
        navigate('/onboarding');
      } else {
        const userData = await login(form.email, form.password);
        if (!userData.onboarded) {
          navigate('/onboarding');
        } else {
          navigate(userData.subscription?.active || userData.role === 'admin' ? '/dashboard' : '/subscribe');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (resetStep === 'email') {
        const res = await axios.post('/auth/forgot-password', { email: resetForm.email });
        setSuccess(res.data.devOtp
          ? `Development OTP: ${res.data.devOtp}`
          : 'OTP sent to your registered email if the account exists.');
        setResetStep('otp');
      } else if (resetStep === 'otp') {
        await axios.post('/auth/verify-reset-otp', { email: resetForm.email, otp: resetForm.otp });
        setSuccess('OTP verified. Set your new password.');
        setResetStep('password');
      } else {
        if (resetForm.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        if (resetForm.password !== resetForm.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await axios.post('/auth/reset-password', {
          email: resetForm.email,
          otp: resetForm.otp,
          password: resetForm.password,
        });
        setSuccess('Password updated successfully. Please log in with your new password.');
        setForm((current) => ({ ...current, email: resetForm.email, password: '' }));
        setResetForm({ email: '', otp: '', password: '', confirmPassword: '' });
        setResetStep('email');
        setMode('login');
      }
    } catch (err) {
      const errorCode = err.response?.data?.code;
      if (errorCode === 'OTP_EMAIL_DELIVERY_FAILED' || errorCode === 'OTP_EMAIL_NOT_CONFIGURED') {
        setError('OTP email service is temporarily unavailable. Please contact the admin.');
      } else {
        setError(err.response?.data?.message || err.message || 'Could not reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-[82vh] overflow-hidden">
      <div className="orb -left-24 top-12 w-72 h-72 bg-amber-300/20 animate-drift"></div>
      <div className="orb -right-24 bottom-8 w-80 h-80 bg-emerald-300/16 animate-spotlight"></div>
      <div className="w-full max-w-md relative z-10">
        <div className="cinematic-card p-8 sm:p-10 animate-cinematic-rise">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-5">
              <BrandLogo size="md" showText={false} className="scale-125" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-semibold mb-4 ring-1 ring-brand-100">
              <Sparkles size={13} /> BPSMV Resource Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mb-2">
              {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Reset password'}
            </h1>
            <p className="text-slate-500 text-sm">
              {mode === 'login'
                ? 'Sign in to access your resources'
                : mode === 'signup'
                  ? 'Join BPSMV Resource Hub today'
                  : 'Use the OTP sent to your registered email'}
            </p>
          </div>

          {/* Toggle */}
          {mode !== 'reset' && (
          <div className="flex bg-white/65 rounded-xl p-1 mb-6 ring-1 ring-white/80 shadow-inner">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm shadow-brand-500/10' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Log in
            </button>
            <button
              onClick={() => switchMode('signup')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'signup' ? 'bg-white text-slate-900 shadow-sm shadow-brand-500/10' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Sign up
            </button>
          </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200 flex items-start gap-2 animate-shake">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-5 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm border border-emerald-200 flex items-start gap-2">
              <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          {mode === 'reset' ? (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-800">
              Step {resetStep === 'email' ? '1' : resetStep === 'otp' ? '2' : '3'} of 3
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Registered Email</label>
              <div className="relative">
                <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={resetForm.email}
                  onChange={handleResetChange}
                  className="input-field pl-10"
                  required
                  disabled={resetStep !== 'email'}
                />
              </div>
            </div>

            {resetStep !== 'email' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">6-digit OTP</label>
                <div className="relative">
                  <KeyRound size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    name="otp"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter OTP"
                    value={resetForm.otp}
                    onChange={handleResetChange}
                    className="input-field pl-10 font-mono tracking-[0.3em]"
                    required
                    disabled={resetStep === 'password'}
                  />
                </div>
              </div>
            )}

            {resetStep === 'password' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showResetPassword ? 'text' : 'password'}
                      placeholder="New password"
                      value={resetForm.password}
                      onChange={handleResetChange}
                      className="input-field pr-10"
                      required
                      minLength={6}
                    />
                    <button type="button" onClick={() => setShowResetPassword(!showResetPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showResetPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                  <input
                    name="confirmPassword"
                    type={showResetPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={resetForm.confirmPassword}
                    onChange={handleResetChange}
                    className="input-field"
                    required
                    minLength={6}
                  />
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary w-full py-3.5 shadow-lg shadow-brand-500/20">
              {loading ? 'Please wait...' : resetStep === 'email' ? 'Send OTP' : resetStep === 'otp' ? 'Verify OTP' : 'Update password'}
              <ArrowRight size={16} />
            </button>

            <button type="button" onClick={() => switchMode('login')} className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700">
              Back to login
            </button>
          </form>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div className="animate-fade-in">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                  <input
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div className="animate-fade-in">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Roll Number</label>
                  <input
                    name="rollNumber"
                    type="text"
                    placeholder="e.g., BTECH2024001"
                    value={form.rollNumber}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1.5">Your university roll number</p>
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                {mode === 'login' && (
                  <button type="button" onClick={() => switchMode('reset')} className="text-xs font-semibold text-brand-700 hover:text-brand-800">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  className="input-field pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Must be at least 6 characters</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3.5 shadow-lg shadow-brand-500/20 hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Please wait...
                </span>
              ) : (
                <>
                  {mode === 'login' ? 'Log in' : 'Create account'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
          )}

          {mode !== 'reset' && (
            <>
              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Google */}
              <button
                onClick={googleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 hover:-translate-y-0.5"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
