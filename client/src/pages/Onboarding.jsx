import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { getSemestersForYear, normalizeAcademicSelection } from '../utils/academic';

const Onboarding = () => {
  const { onboard, user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    degree: '',
    branch: '',
    yearOfStudy: '',
    semester: '',
    rollNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    } else if (user?.onboarded) {
      navigate(user?.subscription?.active || user?.role === 'admin' ? '/dashboard' : '/subscribe', { replace: true });
    } else if (user?.rollNumber) {
      setFormData(prev => ({ ...prev, rollNumber: user.rollNumber }));
    }
  }, [isAuthenticated, user, navigate]);

  const degrees = ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'BBA', 'MBA', 'B.Sc', 'M.Sc', 'B.A', 'M.A', 'Other'];

  const branchesMap = {
    'B.Tech': ['CSE', 'ECE', 'IT', 'ME', 'CE', 'EE'],
    'M.Tech': ['CSE', 'ECE', 'IT'],
    'B.Sc': ['Physics', 'Chemistry', 'Maths', 'Computer Science', 'Biology'],
    'M.Sc': ['Physics', 'Chemistry', 'Maths', 'Computer Science'],
    'BCA': ['General'],
    'MCA': ['General'],
    'BBA': ['General', 'Marketing', 'Finance'],
    'MBA': ['General', 'Marketing', 'Finance', 'HR'],
    'B.A': ['English', 'Hindi', 'History', 'Political Science'],
    'M.A': ['English', 'Hindi', 'History', 'Political Science'],
    'Other': ['General']
  };

  const getAvailableBranches = () => branchesMap[formData.degree] || branchesMap['Other'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => {
      if (name === 'degree') {
        return { ...current, degree: value, branch: '' };
      }
      if (name === 'yearOfStudy') {
        return { ...current, ...normalizeAcademicSelection(value, current.semester) };
      }
      return { ...current, [name]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onboard(formData);
      navigate('/subscribe');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const availableSemesters = getSemestersForYear(formData.yearOfStudy);

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-lg">
        <div className="card p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <GraduationCap size={24} />
            </div>
            <h1 className="text-2xl font-display font-bold text-slate-900 mb-1">Complete Your Profile</h1>
            <p className="text-slate-500 text-sm">Let us find the right resources for you.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Roll Number</label>
              <input
                name="rollNumber"
                type="text"
                placeholder="e.g., BTECH2024001"
                value={formData.rollNumber}
                onChange={handleChange}
                className="input-field"
                required
                disabled={!!user?.rollNumber}
              />
              <p className="text-xs text-slate-400 mt-1">{user?.rollNumber ? 'Your roll number is already registered' : 'Required for Google sign-up users'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Degree</label>
              <select name="degree" value={formData.degree} onChange={handleChange} className="input-field" required>
                <option value="" disabled>Select your degree</option>
                {degrees.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Branch / Specialization</label>
              <select name="branch" value={formData.branch} onChange={handleChange} className="input-field" required disabled={!formData.degree}>
                <option value="" disabled>Select your branch</option>
                {formData.degree && getAvailableBranches().map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Year of Study</label>
                <select name="yearOfStudy" value={formData.yearOfStudy} onChange={handleChange} className="input-field" required>
                  <option value="" disabled>Select</option>
                  {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Semester</label>
                <select name="semester" value={formData.semester} onChange={handleChange} className="input-field" required disabled={!formData.yearOfStudy}>
                  <option value="" disabled>Select</option>
                  {availableSemesters.map(s => <option key={s} value={s}>Sem {s}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? 'Saving...' : 'Save & Continue'}
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
