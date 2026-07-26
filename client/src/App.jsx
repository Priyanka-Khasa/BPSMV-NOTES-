import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Subscribe = lazy(() => import('./pages/Subscribe'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Resources = lazy(() => import('./pages/Resources'));
const PDFViewer = lazy(() => import('./pages/PDFViewer'));
const Chat = lazy(() => import('./pages/Chat'));
const Jobs = lazy(() => import('./pages/Jobs'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const Profile = lazy(() => import('./pages/Profile'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));
const Admin = lazy(() => import('./pages/Admin'));
const Gift = lazy(() => import('./pages/Gift'));

const PageLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600" />
  </div>
);

function App() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={
            <ProtectedRoute subscriptionRequired={false}>
              <Onboarding />
            </ProtectedRoute>
          } />
          <Route path="/subscribe" element={
            <ProtectedRoute subscriptionRequired={false}>
              <Subscribe />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/resources" element={
            <ProtectedRoute>
              <Resources />
            </ProtectedRoute>
          } />
          <Route path="/viewer/:id" element={
            <ProtectedRoute>
              <PDFViewer />
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } />
          <Route path="/jobs" element={
            <ProtectedRoute>
              <Jobs />
            </ProtectedRoute>
          } />
          <Route path="/upload" element={
            <ProtectedRoute>
              <UploadPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/u/:id" element={<PublicProfile />} />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <Admin />
            </ProtectedRoute>
          } />
          <Route path="/gift" element={<Gift />} />
          <Route path="/feedback" element={<Navigate to="/gift" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;
