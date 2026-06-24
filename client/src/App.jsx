import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Resources from './pages/Resources';
import UploadPage from './pages/UploadPage';
import PDFViewer from './pages/PDFViewer';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="/onboarding" element={<Navigate to="/dashboard" replace />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/viewer/:id" element={<PDFViewer />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
