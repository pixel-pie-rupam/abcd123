import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 15000,
});

// Optional: If enrollCourse requires a token from local storage, 
// you can uncomment this interceptor so ALL API calls send the token automatically.
// API.interceptors.request.use((req) => {
//   if (localStorage.getItem('token')) {
//     req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
//   }
//   return req;
// });

// Public API calls
export const getCourses = (params) => API.get('/courses', { params });
export const getCourse = (slug) => API.get(`/courses/${slug}`);

// --- ADDED MISSING FUNCTIONS HERE ---
// Added this alias so components calling getCourseBySlug won't break
export const getCourseBySlug = (slug) => API.get(`/courses/${slug}`);

// Added enrollCourse
export const enrollCourse = (courseId) => API.post('/courses/enroll', { courseId });
// ------------------------------------

// Premium course enrollment lead (interest form)
export const submitEnrollmentLead = (data) => API.post('/enrollments', data);

export const getComingSoon = () => API.get('/courses/coming-soon');
export const getWorkshops = () => API.get('/workshops');
export const getTrainers = () => API.get('/trainers');
export const getComments = (videoId) => API.get(`/comments/${videoId}`);
export const postComment = (data) => API.post('/comments', data);
export const joinWorkshop = (id, data) => API.post(`/workshops/${id}/join`, data);

// Video token - get ephemeral stream token (never the real YT ID)
export const getVideoToken = (videoId) => API.get(`/videos/${videoId}/token`);
export const getVideoResources = (videoId) => API.get(`/videos/${videoId}/resources`);

// The video stream URL - iframe src points here, backend proxies embed
export const getStreamUrl = (token) => `${process.env.REACT_APP_API_URL || '/api'}/videos/stream/${token}`;

// Admin API (requires JWT)
export const adminAPI = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL || ''}/api`, // unused, admin uses different path
  timeout: 15000,
});

export const ADMIN_SECRET = process.env.REACT_APP_ADMIN_PATH || 'xK9mP2qR7nL4wV';
const ADMIN_BASE   = `/api/${ADMIN_SECRET}`;

export const adminLogin = (email, password) =>
  axios.post(`${ADMIN_BASE}/auth/login`, { email, password });

const adminRequest = (method, url, data, token) =>
  axios({
    method,
    url: `${ADMIN_BASE}${url}`,
    data,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).catch((err) => {
    const code = err?.response?.status;
    if (code === 401 || code === 403) {
      window.dispatchEvent(new CustomEvent('admin-auth-expired'));
    }
    throw err;
  });

export const adminGet    = (path, token)        => adminRequest('get',    path, null, token);
export const adminPost   = (path, data, token)  => adminRequest('post',   path, data, token);
export const adminPut    = (path, data, token)  => adminRequest('put',    path, data, token);
export const adminPatch  = (path, data, token)  => adminRequest('patch',  path, data, token);
export const adminDelete = (path, token)        => adminRequest('delete', path, null, token);
