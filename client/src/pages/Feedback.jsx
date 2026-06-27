import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Send, AlertCircle, Bug, FileImage, CheckCircle, ArrowLeft,
  MessageSquare, Loader2, ImagePlus
} from 'lucide-react';

const issueTypes = ['Bug', 'Feature Request', 'Content Issue', 'Other'];

const Feedback = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    issueType: 'Bug',
    description: '',
    additionalComments: ''
  });
  const [screenshot, setScreenshot] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleScreenshot = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, WebP, GIF).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB.');
      return;
    }
    setScreenshot(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target.result);
    reader.readAsDataURL(file);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!form.fullName.trim() || !form.email.trim() || !form.description.trim()) {
      setError('Full name, email, and description are required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!screenshot) {
      setError('Please upload a screenshot.');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('fullName', form.fullName.trim());
      data.append('email', form.email.trim());
      data.append('phone', form.phone.trim());
      data.append('issueType', form.issueType);
      data.append('description', form.description.trim());
      data.append('additionalComments', form.additionalComments.trim());
      data.append('screenshot', screenshot);

      await axios.post('/feedback', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage('Thank you! Your feedback has been submitted successfully.');
      setForm({ fullName: '', email: '', phone: '', issueType: 'Bug', description: '', additionalComments: '' });
      setScreenshot(null);
      setPreviewUrl('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="card p-8 sm:p-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={24} />
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900 mb-1">Feedback & Bug Report</h1>
          <p className="text-slate-500 text-sm">Help us improve BPSMV Resource Hub.</p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-brand-50 text-brand-700 rounded-xl border border-brand-200 flex items-start gap-3 animate-fade-in">
            <CheckCircle size={18} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{message}</p>
              <p className="text-sm mt-1 opacity-80">We will get back to you shortly.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-start gap-3 animate-shake">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                name="fullName"
                type="text"
                placeholder="Your name"
                value={form.fullName}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone <span className="text-slate-400 font-normal">(optional)</span></label>
              <input
                name="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Issue Type</label>
              <select
                name="issueType"
                value={form.issueType}
                onChange={handleChange}
                className="input-field"
                required
              >
                {issueTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              name="description"
              placeholder="Describe the issue or suggestion in detail..."
              value={form.description}
              onChange={handleChange}
              className="input-field min-h-[120px]"
              required
              maxLength={5000}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Screenshot <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-brand-300 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleScreenshot}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <ImagePlus size={32} className="text-slate-400" />
                  <p className="text-sm text-slate-500">Click to upload a screenshot</p>
                  <p className="text-xs text-slate-400">JPEG, PNG, WebP, GIF — max 5MB</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Additional Comments <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea
              name="additionalComments"
              placeholder="Anything else you'd like to add..."
              value={form.additionalComments}
              onChange={handleChange}
              className="input-field min-h-[80px]"
              maxLength={2000}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Submitting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send size={16} /> Submit Feedback
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
