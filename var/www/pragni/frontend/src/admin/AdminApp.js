import React, { Suspense, lazy, Component } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AdminProvider, useAdmin } from './AdminContext';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';
import CategoriesAdmin from './pages/CategoriesAdmin';
import BannerAdmin from './pages/BannerAdmin';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(e) { return { hasError: true, error: e }; }
  componentDidUpdate(prevProps) {
    if (prevProps && prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }
  render() {
    if (this.state.hasError) return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>
        <p style={{ marginBottom: 8 }}>Something went wrong loading this page.</p>
        <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>{this.state.error?.message}</p>
        <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}>Reload</button>
      </div>
    );
    return this.props.children;
  }
}

const Spinner = () => (
  <div style={{ padding: 80, display: 'flex', justifyContent: 'center' }}>
    <div className="adm-spinner" />
  </div>
);

const Dashboard        = lazy(() => import('./pages/Dashboard'));
const CoursesAdmin     = lazy(() => import('./pages/CoursesAdmin'));
const VideosAdmin      = lazy(() => import('./pages/VideosAdmin'));
const WorkshopsAdmin   = lazy(() => import('./pages/WorkshopsAdmin'));
const TrainersAdmin    = lazy(() => import('./pages/TrainersAdmin'));
const CommentsAdmin    = lazy(() => import('./pages/CommentsAdmin'));
const SettingsAdmin    = lazy(() => import('./pages/SettingsAdmin'));
const EnrollmentsAdmin = lazy(() => import('./pages/EnrollmentsAdmin'));
const SeoAdmin         = lazy(() => import('./pages/SeoAdmin'));
const ContactAdmin     = lazy(() => import('./pages/ContactAdmin'));
const CouponsAdmin     = lazy(() => import('./pages/CouponsAdmin'));
const BundlesAdmin     = lazy(() => import('./pages/BundlesAdmin'));
const ContactMessages  = lazy(() => import('./pages/ContactMessages'));
const JourneyAdmin     = lazy(() => import('./pages/JourneyAdmin'));
const TeamAdmin        = lazy(() => import('./pages/TeamAdmin'));
const SiteContentAdmin = lazy(() => import('./pages/SiteContentAdmin'));

function AdminRoutes({ adminPath }) {
  const { token } = useAdmin();
  const location = useLocation();
  if (!token) return <AdminLogin />;
  return (
    <AdminLayout adminPath={adminPath}>
      <ErrorBoundary resetKey={location.pathname}>
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route index                           element={<Dashboard />} />
            <Route path="courses"                  element={<CoursesAdmin />} />
            <Route path="courses/:courseId/videos" element={<VideosAdmin />} />
            <Route path="bundles"                  element={<BundlesAdmin />} />
            <Route path="workshops"                element={<WorkshopsAdmin />} />
            <Route path="trainers"                 element={<TrainersAdmin />} />
            <Route path="comments"                 element={<CommentsAdmin />} />
            <Route path="enrollments"              element={<EnrollmentsAdmin />} />
            <Route path="coupons"                  element={<CouponsAdmin />} />
            <Route path="contact-messages"         element={<ContactMessages />} />
            <Route path="categories"               element={<CategoriesAdmin />} />
            <Route path="banner"                   element={<BannerAdmin />} />
            <Route path="journey"                  element={<JourneyAdmin />} />
            <Route path="team"                     element={<TeamAdmin />} />
            <Route path="site-content"             element={<SiteContentAdmin />} />
            <Route path="seo"                      element={<SeoAdmin />} />
            <Route path="contact"                  element={<ContactAdmin />} />
            <Route path="settings"                 element={<SettingsAdmin />} />
            <Route path="*"                        element={<Navigate to="" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </AdminLayout>
  );
}

export default function AdminApp({ adminPath }) {
  return (
    <AdminProvider>
      <AdminRoutes adminPath={adminPath} />
    </AdminProvider>
  );
}
