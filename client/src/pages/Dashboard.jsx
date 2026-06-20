import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/me', { withCredentials: true });
      setUser(res.data);
      fetchSubjects(res.data.degree, res.data.branch);
    } catch (error) {
      console.log('Auth disabled for testing, using mock user profile.');
      const mockUser = {
        name: 'Demo Student',
        degree: 'B.Tech',
        branch: 'CSE',
        avatar: 'https://via.placeholder.com/150'
      };
      setUser(mockUser);
      fetchSubjects(mockUser.degree, mockUser.branch);
    }
  };

  const fetchSubjects = async (degree, branch) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/resources/subjects?degree=${degree}&branch=${branch}`, { withCredentials: true });
      setSubjects(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setLoading(false);
    }
  };

  const fetchResources = async (subjectId) => {
    setSelectedSubject(subjectId);
    try {
      const res = await axios.get(`http://localhost:5000/api/resources/subject/${subjectId}`, { withCredentials: true });
      setResources(res.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout', {}, { withCredentials: true });
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading your personalized dashboard...</div>;
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar glass-panel">
        <div className="sidebar-header">
          <div className="logo-icon small">B</div>
          <h2>Resource Hub</h2>
        </div>
        
        <div className="user-profile">
          <img src={user?.avatar || 'https://via.placeholder.com/150'} alt="Profile" className="avatar" />
          <div className="user-info">
            <h3>{user?.name}</h3>
            <p>{user?.degree} - {user?.branch}</p>
          </div>
        </div>

        <nav className="subject-list">
          <h4 className="nav-title">Your Subjects</h4>
          {subjects.length === 0 ? (
            <p className="no-subjects">No subjects found for your branch yet.</p>
          ) : (
            <ul>
              {subjects.map(subject => (
                <li 
                  key={subject._id} 
                  className={selectedSubject === subject._id ? 'active' : ''}
                  onClick={() => fetchResources(subject._id)}
                >
                  {subject.name}
                </li>
              ))}
            </ul>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="btn btn-secondary logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="content-header glass-panel">
          <h1>{selectedSubject ? subjects.find(s => s._id === selectedSubject)?.name : 'Dashboard Overview'}</h1>
        </header>

        <div className="resources-grid">
          {!selectedSubject ? (
            <div className="welcome-state">
              <div className="illustration-placeholder"></div>
              <h2>Welcome back, {user?.name.split(' ')[0]}!</h2>
              <p>Select a subject from the sidebar to view previous year question papers and notes.</p>
            </div>
          ) : resources.length === 0 ? (
            <div className="empty-state">
              <p>No resources uploaded for this subject yet.</p>
              <button className="btn btn-primary mt-4">+ Upload Resource</button>
            </div>
          ) : (
            resources.map(res => (
              <div key={res._id} className="resource-card glass-panel animate-fade-in">
                <div className={`resource-badge ${res.resourceType.toLowerCase().replace(' ', '-')}`}>
                  {res.resourceType}
                </div>
                <h3>{res.title}</h3>
                {res.year && <p className="resource-year">Year: {res.year}</p>}
                <p className="resource-uploader">Uploaded by: {res.uploadedBy.name}</p>
                <a href={res.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary download-btn">
                  View Document
                </a>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
