import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Gift, Send, Loader2, Search, Filter, Package, BookOpen, FileText, PenTool, Beaker, HelpCircle, CheckCircle, Clock, X,
  ChevronLeft, ChevronRight, GraduationCap, User, Mail, Phone, MessageSquare
} from 'lucide-react';

const itemTypes = [
  { value: 'Book', label: 'Book', icon: BookOpen },
  { value: 'Notes', label: 'Notes', icon: FileText },
  { value: 'Question Paper', label: 'Question Paper', icon: FileText },
  { value: 'Stationery', label: 'Stationery', icon: PenTool },
  { value: 'Lab Manual', label: 'Lab Manual', icon: Beaker },
  { value: 'Other', label: 'Other', icon: HelpCircle },
];

const GiftPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState('');

  const [form, setForm] = useState({
    fullName: user?.name || '',
    rollNumber: user?.rollNumber || '',
    degree: user?.degree || '',
    branch: user?.branch || '',
    semester: user?.semester || '',
    requestType: 'Request',
    itemType: 'Book',
    itemName: '',
    itemDescription: '',
    contactEmail: user?.email || '',
    contactPhone: ''
  });

  const limit = 9;

  const fetchGifts = async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', p);
      params.append('limit', limit);
      if (filterType !== 'all') params.append('requestType', filterType);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (search.trim()) params.append('search', search.trim());
      const res = await axios.get(`/gifts?${params.toString()}`);
      setGifts(res.data.gifts || []);
      setTotal(res.data.total || 0);
      setPage(res.data.page || 1);
    } catch (err) {
      console.error('Error fetching gifts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGifts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, filterStatus]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchGifts(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage('');
    setSubmitting(true);
    try {
      await axios.post('/gifts', {
        ...form,
        semester: parseInt(form.semester) || 1
      });
      setFormMessage('success');
      setForm({
        fullName: user?.name || '',
        rollNumber: user?.rollNumber || '',
        degree: user?.degree || '',
        branch: user?.branch || '',
        semester: user?.semester || '',
        requestType: 'Request',
        itemType: 'Book',
        itemName: '',
        itemDescription: '',
        contactEmail: user?.email || '',
        contactPhone: ''
      });
      setTimeout(() => {
        setShowForm(false);
        setFormMessage('');
        fetchGifts(1);
      }, 2000);
    } catch (err) {
      setFormMessage(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status) => {
    if (status === 'Fulfilled') {
      return <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50"><CheckCircle size={12} /> Fulfilled</span>;
    }
    if (status === 'Closed') {
      return <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 ring-1 ring-slate-200/50"><X size={12} /> Closed</span>;
    }
    return <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200/50"><Clock size={12} /> Pending</span>;
  };

  const pages = Math.ceil(total / limit);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 rounded-xl flex items-center justify-center shadow-sm">
            <Gift size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900">Gift & Request</h1>
            <p className="text-sm text-slate-500">Request study materials or offer items to fellow students</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 hover:-translate-y-0.5 transition-all duration-300"
        >
          <Package size={16} /> {showForm ? 'Close Form' : 'Post Request / Donate'}
        </button>
      </div>

      {/* Submit Form */}
      {showForm && (
        <div className="card p-6 sm:p-8 animate-fade-in">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Send size={18} className="text-brand-600" /> Submit a Request or Donation
          </h3>
          {formMessage === 'success' && (
            <div className="mb-4 p-3 rounded-xl text-sm border bg-emerald-50 text-emerald-700 border-emerald-200 animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} />
                Submitted successfully! Your post will appear in the list below.
              </div>
            </div>
          )}
          {formMessage && formMessage !== 'success' && (
            <div className="mb-4 p-3 rounded-xl text-sm border bg-red-50 text-red-700 border-red-200 animate-fade-in">
              {formMessage}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text" required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="input-field pl-9"
                    placeholder="Your name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Roll Number</label>
                <input
                  type="text" required
                  value={form.rollNumber}
                  onChange={(e) => setForm({ ...form, rollNumber: e.target.value })}
                  className="input-field"
                  placeholder="e.g. BPSMV-2024-001"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Degree</label>
                <select
                  value={form.degree}
                  onChange={(e) => setForm({ ...form, degree: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select Degree</option>
                  <option>B.Tech</option>
                  <option>M.Tech</option>
                  <option>BCA</option>
                  <option>MCA</option>
                  <option>BBA</option>
                  <option>MBA</option>
                  <option>B.Sc</option>
                  <option>M.Sc</option>
                  <option>B.A</option>
                  <option>M.A</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Branch</label>
                <input
                  type="text" required
                  value={form.branch}
                  onChange={(e) => setForm({ ...form, branch: e.target.value })}
                  className="input-field"
                  placeholder="e.g. CSE, ECE"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Semester</label>
                <select
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select</option>
                  {[1,2,3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Post Type</label>
                <div className="flex gap-2">
                  {['Request', 'Donate'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm({ ...form, requestType: type })}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border ${
                        form.requestType === type
                          ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {type === 'Request' ? 'Request Item' : 'Donate Item'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Item Type</label>
                <select
                  value={form.itemType}
                  onChange={(e) => setForm({ ...form, itemType: e.target.value })}
                  className="input-field"
                  required
                >
                  {itemTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
              <input
                type="text" required
                value={form.itemName}
                onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                className="input-field"
                placeholder="e.g. Data Structures & Algorithms Book"
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                required
                value={form.itemDescription}
                onChange={(e) => setForm({ ...form, itemDescription: e.target.value })}
                className="input-field min-h-[100px]"
                placeholder={form.requestType === 'Request' ? 'Describe what you need (edition, author, condition, etc.)' : 'Describe the item you are offering (condition, edition, etc.)'}
                maxLength={2000}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email" required
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    className="input-field pl-9"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone (optional)</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    className="input-field pl-9"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
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
                  <Send size={16} /> Submit {form.requestType}
                </span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Filters & Search */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'Request', label: 'Requests' },
            { key: 'Donate', label: 'Donations' }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                filterType === f.key
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:-translate-y-0.5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All Status' },
            { key: 'Pending', label: 'Pending' },
            { key: 'Fulfilled', label: 'Fulfilled' }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                filterStatus === f.key
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:-translate-y-0.5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearch} className="relative flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <button type="submit" className="btn btn-secondary px-4">
            <Search size={16} />
          </button>
        </form>
      </div>

      {/* Gifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-brand-200 border-t-brand-600"></div>
          </div>
        ) : gifts.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <Package size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500 text-lg font-medium">No posts yet</p>
            <p className="text-slate-400 text-sm mt-1">Be the first to request or donate an item!</p>
          </div>
        ) : (
          gifts.map((g) => {
            const ItemIcon = itemTypes.find(t => t.value === g.itemType)?.icon || Package;
            return (
              <div
                key={g._id}
                className="card p-6 hover:-translate-y-2 hover:shadow-xl transition-all duration-500 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    g.requestType === 'Request' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    <ItemIcon size={20} />
                  </div>
                  {statusBadge(g.status)}
                </div>

                <div className="mb-2">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    g.requestType === 'Request' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {g.requestType}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-slate-900 mb-2 group-hover:text-brand-700 transition-colors">{g.itemName}</h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-3 leading-relaxed">{g.itemDescription}</p>

                <div className="space-y-2 text-xs text-slate-500 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={13} className="text-slate-400" />
                    <span>{g.degree} &middot; {g.branch} &middot; Semester {g.semester}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={13} className="text-slate-400" />
                    <span>{g.fullName} ({g.rollNumber})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-slate-400" />
                    <span>{g.contactEmail}</span>
                  </div>
                  {g.contactPhone && (
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-slate-400" />
                      <span>{g.contactPhone}</span>
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-50">
                  Posted on {new Date(g.createdAt).toLocaleDateString()}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => fetchGifts(page - 1)}
            disabled={page <= 1 || loading}
            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50 transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm text-slate-500 font-medium">
            Page {page} of {pages}
          </span>
          <button
            onClick={() => fetchGifts(page + 1)}
            disabled={page >= pages || loading}
            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50 transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default GiftPage;
