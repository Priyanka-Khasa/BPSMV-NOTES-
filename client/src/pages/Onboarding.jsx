import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, GraduationCap, BookOpen } from 'lucide-react';

const Onboarding = () => {
  const [formData, setFormData] = useState({
    degree: '',
    branch: '',
    yearOfStudy: '',
    semester: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { onboard, user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    } else if (user?.onboarded) {
      navigate('/dashboard', { replace: true });
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onboard(formData);
      navigate('/dashboard');
    } catch (error) {
      alert('Failed to save details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
                  {[1,2,3,4,5].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Semester</label>
                <select name="semester" value={formData.semester} onChange={handleChange} className="input-field" required>
                  <option value="" disabled>Select</option>
                  {[1,2,3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>Sem {s}</option>)}
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
