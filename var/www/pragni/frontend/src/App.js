import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';

const Home              = lazy(() => import('./pages/Home'));
const Courses           = lazy(() => import('./pages/Courses'));
const CourseDetail      = lazy(() => import('./pages/CourseDetail'));
const PremiumCourseDetail = lazy(() => import('./pages/PremiumCourseDetail'));
const VideoPlayer       = lazy(() => import('./pages/VideoPlayer'));
const Workshops         = lazy(() => import('./pages/Workshops'));
const Trainers          = lazy(() => import('./pages/Trainers'));
const About             = lazy(() => import('./pages/About'));
const Contact           = lazy(() => import('./pages/Contact'));
const NotFound          = lazy(() => import('./pages/NotFound'));
const AdminApp          = lazy(() => import('./admin/AdminApp'));

function App() {
  const adminPath = process.env.REACT_APP_ADMIN_PATH || 'xK9mP2qR7nL4wV';

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Admin — separate layout, hidden path */}
          <Route path={`/${adminPath}/*`} element={<AdminApp adminPath={adminPath} />} />

          {/* Public site */}
          <Route path="/*" element={
            <div className="site-wrapper">
              <Navbar />
              <main>
                <Routes>
                  <Route path="/"                              element={<Home />} />
                  <Route path="/courses"                       element={<Courses />} />
                  <Route path="/courses/premium/:slug"         element={<PremiumCourseDetail />} />
                  <Route path="/courses/:slug"                 element={<CourseDetail />} />
                  <Route path="/courses/:slug/watch/:videoId"  element={<VideoPlayer />} />
                  <Route path="/workshops"                     element={<Workshops />} />
                  <Route path="/trainers"                      element={<Trainers />} />
                  <Route path="/about"                         element={<About />} />
                  <Route path="/contact"                       element={<Contact />} />
                  <Route path="*"                              element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
