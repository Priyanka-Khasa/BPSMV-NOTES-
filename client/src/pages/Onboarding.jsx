import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Onboarding.css';

const Onboarding = () => {
  const [formData, setFormData] = useState({
    degree: '',
    branch: '',
    yearOfStudy: ''
  });
  const navigate = useNavigate();

  const degrees = ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'BBA', 'MBA', 'B.Sc', 'M.Sc', 'B.A', 'M.A', 'Other'];
  
  // Dummy branches mapping for UI interaction
  const branchesMap = {
    'B.Tech': ['CSE', 'ECE', 'IT', 'ME', 'CE'],
    'M.Tech': ['CSE', 'ECE', 'IT'],
    'B.Sc': ['Physics', 'Chemistry', 'Maths', 'Computer Science'],
    'Other': ['General']
  };

  const getAvailableBranches = () => {
    return branchesMap[formData.degree] || branchesMap['Other'];
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/onboard', formData, {
        withCredentials: true
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error during onboarding:', error);
      alert('Failed to save details. Please try again.');
    }
  };

  return (
    <div className="container onboarding-container">
      <div className="glass-panel onboarding-card animate-fade-in">
        <h2>Complete Your Profile</h2>
        <p className="subtitle">Let us know what you're studying so we can find the right resources for you.</p>

        <form onSubmit={handleSubmit} className="onboarding-form">
          <div className="input-group">
            <label className="input-label" htmlFor="degree">Degree</label>
            <select 
              id="degree" 
              name="degree" 
              className="input-field" 
              value={formData.degree} 
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select your degree</option>
              {degrees.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="branch">Branch / Specialization</label>
            <select 
              id="branch" 
              name="branch" 
              className="input-field" 
              value={formData.branch} 
              onChange={handleChange}
              required
              disabled={!formData.degree}
            >
              <option value="" disabled>Select your branch</option>
              {formData.degree && getAvailableBranches().map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="yearOfStudy">Year of Study</label>
            <select 
              id="yearOfStudy" 
              name="yearOfStudy" 
              className="input-field" 
              value={formData.yearOfStudy} 
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select your year</option>
              {[1, 2, 3, 4, 5].map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>
          </div>

          <button type="submit" className="btn btn-primary submit-btn">
            Save & Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
