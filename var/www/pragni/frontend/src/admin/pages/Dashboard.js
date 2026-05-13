import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { adminGet } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

// Premium SVG icon set — no emoji anywhere
const DIcon = ({ name, size = 22 }) => {
  const d = {
    courses: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    videos:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
    workshops: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    trainers: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    comments: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    messages: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="12" y1="7" x2="12" y2="13"/></svg>,
    bundles: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
    coupon:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/><line x1="12" y1="7" x2="12" y2="17"/><line x1="12" y1="10" x2="12.01" y2="10"/><line x1="12" y1="14" x2="12.01" y2="14"/></svg>,
    // checklist icons
    category: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
    book:    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    play:    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
    cal:     <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    check:   <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    image:   <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
    announce:<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 3L2 10l7 4 3 7 10-18z"/></svg>,
    arrow:   <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  };
  return d[name] || null;
};

const STAT_STYLES = [
  { bg: 'rgba(123,94,167,0.15)', border: 'rgba(157,127,212,0.25)', color: 'var(--violet3)', glow: 'rgba(123,94,167,0.18)' },
  { bg: 'rgba(79,195,247,0.12)', border: 'rgba(79,195,247,0.25)',  color: 'var(--cyan)',    glow: 'rgba(79,195,247,0.15)' },
  { bg: 'rgba(38,208,161,0.12)', border: 'rgba(38,208,161,0.25)', color: 'var(--teal)',    glow: 'rgba(38,208,161,0.15)' },
  { bg: 'rgba(255,202,40,0.12)', border: 'rgba(255,202,40,0.25)', color: 'var(--amber)',   glow: 'rgba(255,202,40,0.12)' },
  { bg: 'rgba(240,98,146,0.12)', border: 'rgba(240,98,146,0.25)', color: 'var(--rose)',    glow: 'rgba(240,98,146,0.12)' },
  { bg: 'rgba(108,71,255,0.12)', border: 'rgba(108,71,255,0.25)', color: '#a78bfa',        glow: 'rgba(108,71,255,0.12)' },
  { bg: 'rgba(251,113,133,0.1)', border: 'rgba(251,113,133,0.25)',color: '#fb7185',         glow: 'rgba(251,113,133,0.1)' },
];

export default function Dashboard() {
  const { token, user, isAdmin } = useAdmin();
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();
  const adminPath = window.location.pathname.split('/')[1];

  useEffect(() => {
    if (!isAdmin) return;
    adminGet('/stats', token).then(r => setStats(r.data.stats)).catch(() => {});
  }, [token, isAdmin]);

  const cards = stats ? [
    { icon: 'courses',   label: 'Total Courses',      num: stats.courses,         path: 'courses' },
    { icon: 'videos',    label: 'Total Videos',        num: stats.videos,          path: 'courses' },
    { icon: 'workshops', label: 'Live Workshops',      num: stats.workshops,       path: 'workshops' },
    { icon: 'trainers',  label: 'Team Members',        num: stats.trainers,        path: 'trainers' },
    { icon: 'comments',  label: 'Pending Comments',    num: stats.pendingComments, path: 'comments' },
    { icon: 'messages',  label: 'Unread Messages',     num: stats.unreadMessages,  path: 'contact-messages' },
    { icon: 'bundles',   label: 'Active Bundles',      num: stats.bundles,         path: 'bundles' },
    { icon: 'coupon',    label: 'Coupon Leads',        num: stats.couponLeads,     path: 'enrollments' },
  ] : [];

  const quickActions = [
    { label: 'Add Course',     path: 'courses',    icon: 'book',   primary: true },
    { label: 'Add Workshop',   path: 'workshops',  icon: 'cal',    primary: false },
    { label: 'Add Category',   path: 'categories', icon: 'category', primary: false },
    { label: 'Review Comments',path: 'comments',   icon: 'check',  primary: false },
    { label: 'New Coupon',     path: 'coupons',    icon: 'announce',primary: false },
    { label: 'Create Bundle',  path: 'bundles',    icon: 'bundles', primary: false },
  ];

  const checklist = [
    { icon: 'category', text: 'Create categories — they appear in courses & footer navigation' },
    { icon: 'book',     text: 'Add courses — set category, level, price, thumbnail, syllabus' },
    { icon: 'play',     text: 'Add videos — paste YouTube video IDs (unlisted or listed)' },
    { icon: 'cal',      text: 'Create workshops — set date/time and Google Meet link' },
    { icon: 'check',    text: 'Approve comments in the Comments section' },
    { icon: 'image',    text: 'Upload your logo via Settings — Brand Logo' },
    { icon: 'announce', text: 'Set a site-wide banner via the Banner section' },
    { icon: 'bundles',  text: 'Bundle premium courses together with a discounted price' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="adm-header">
        <div>
          <div className="adm-header-title">Dashboard</div>
          <div className="adm-header-sub">
            Welcome back, <strong style={{ color: 'var(--violet3)' }}>{user?.name}</strong>
          </div>
        </div>
        <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={() => navigate(`/${adminPath}/courses`)}>
          + New Course
        </button>
      </div>

      <div className="adm-body">

        {/* Stat cards */}
        {isAdmin && stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
            {cards.map((c, i) => {
              const s = STAT_STYLES[i % STAT_STYLES.length];
              return (
                <div
                  key={c.label}
                  className="adm-card"
                  onClick={() => navigate(`/${adminPath}/${c.path}`)}
                  style={{
                    padding: '20px 22px',
                    cursor: 'pointer',
                    background: s.bg,
                    border: `1px solid ${s.border}`,
                    boxShadow: `0 0 30px ${s.glow}`,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 40px ${s.glow}`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 0 30px ${s.glow}`; }}
                >
                  <div style={{ color: s.color, marginBottom: 14 }}>
                    <DIcon name={c.icon} size={22} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: s.color, marginBottom: 4, letterSpacing: '-0.03em' }}>
                    {c.num}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600, letterSpacing: '0.04em' }}>
                    {c.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Trainer welcome */}
        {!isAdmin && (
          <div className="adm-card" style={{
            padding: 28, marginBottom: 24,
            background: 'linear-gradient(135deg, rgba(123,94,167,0.1), rgba(79,195,247,0.06))',
            border: '1px solid rgba(157,127,212,0.2)',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 10 }}>
              Welcome back, <span style={{ color: 'var(--violet3)' }}>{user?.name}</span>
            </div>
            <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>
              You have trainer access. Use the sidebar to manage your courses, videos, and workshops.
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {isAdmin && (
          <div className="adm-card" style={{ padding: '20px 22px', marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 16 }}>
              Quick Actions
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {quickActions.map(a => (
                <button
                  key={a.label}
                  className={`adm-btn ${a.primary ? 'adm-btn-primary' : 'adm-btn-ghost'} adm-btn-sm`}
                  onClick={() => navigate(`/${adminPath}/${a.path}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 7 }}
                >
                  <DIcon name={a.icon} size={14} />
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Getting started checklist */}
        <div className="adm-card" style={{ padding: '20px 22px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 16 }}>
            Setup Checklist
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            {checklist.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 13, color: 'var(--text2)', lineHeight: 1.55 }}>
                <span style={{
                  flexShrink: 0, width: 28, height: 28, borderRadius: 8,
                  background: 'rgba(123,94,167,0.12)', border: '1px solid rgba(157,127,212,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--violet3)', marginTop: 1,
                }}>
                  <DIcon name={item.icon} size={14} />
                </span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
