import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from './AdminContext';
import { useTheme } from '../context/ThemeContext';
import './admin.css';

// Premium SVG icons — no emoji, no unicode chars
const Icon = ({ name, size = 16 }) => {
  const icons = {
    dashboard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    courses: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    workshops: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    enrollments: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    trainers: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    comments: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    categories: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
    banner: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    seo: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    contact: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    messages: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="12" y1="7" x2="12" y2="13"/></svg>,
    coupon: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
    bundle: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    viewsite: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
    logout: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    chevron: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
    journey: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
    team: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    content: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    sun: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
    moon: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3c0.5 0 0.72 0.6 0.38 0.97A7 7 0 0 0 20.03 12.4c0.37-0.33 0.97-0.11 0.97 0.39z"/></svg>,
  };
  return icons[name] || null;
};

// Permission check helper — what nav items a user can see
const canSee = (user, section) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'trainer') return ['courses', 'workshops', 'comments', 'trainers'].includes(section);
  if (user.role === 'semi-admin') {
    const perms = Array.isArray(user.permissions) ? user.permissions : [];
    return perms.includes(section);
  }
  return false;
};

const NAV_GROUPS = [
  {
    label: 'Content',
    items: [
      { icon: 'dashboard',   label: 'Dashboard',      path: '',           section: 'dashboard' },
      { icon: 'courses',     label: 'Courses',         path: 'courses',    section: 'courses' },
      { icon: 'bundle',      label: 'Bundles',         path: 'bundles',    section: 'bundles' },
      { icon: 'workshops',   label: 'Workshops',       path: 'workshops',  section: 'workshops' },
      { icon: 'enrollments', label: 'Enrollments',     path: 'enrollments',section: 'enrollments' },
      { icon: 'trainers',    label: 'Trainers',        path: 'trainers',   section: 'trainers' },
      { icon: 'comments',    label: 'Comments',        path: 'comments',   section: 'comments' },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { icon: 'coupon',      label: 'Coupons',         path: 'coupons',    section: 'coupons' },
      { icon: 'messages',    label: 'Messages',        path: 'contact-messages', section: 'contact-messages' },
    ],
  },
  {
    label: 'Site',
    items: [
      { icon: 'categories',  label: 'Categories',      path: 'categories', section: 'categories' },
      { icon: 'banner',      label: 'Banner',          path: 'banner',     section: 'banner' },
      { icon: 'journey',     label: 'Journey Gallery', path: 'journey',    section: 'journey' },
      { icon: 'team',        label: 'Team Members',    path: 'team',       section: 'team' },
      { icon: 'content',     label: 'Site Content',    path: 'site-content', section: 'site-content' },
    ],
  },
  {
    label: 'Growth',
    items: [
      { icon: 'seo',         label: 'SEO Manager',     path: 'seo',        section: 'seo' },
      { icon: 'contact',     label: 'Contact & Social',path: 'contact',    section: 'contact' },
    ],
  },
  {
    label: 'System',
    items: [
      { icon: 'settings',    label: 'Settings',        path: 'settings',   section: 'settings' },
    ],
  },
];

export default function AdminLayout({ children, adminPath }) {
  const { user, logout } = useAdmin();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const go = (path) => navigate(`/${adminPath}/${path}`);
  const isActive = (path) => {
    const current = location.pathname.replace(`/${adminPath}`, '').replace(/^\//, '');
    return path === '' ? current === '' : current.startsWith(path);
  };

  return (
    <div className="adm-wrap" style={{ '--sidebar-w': collapsed ? '64px' : '240px' }}>
      <div className="adm-aurora">
        <div className="adm-blob adm-b1" />
        <div className="adm-blob adm-b2" />
        <div className="adm-blob adm-b3" />
      </div>
      <div className="adm-mesh" />

      <aside className="adm-sidebar" style={{ width: 'var(--sidebar-w)', transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)' }}>
        {/* Logo + collapse toggle */}
        <div className="adm-logo" style={{ justifyContent: collapsed ? 'center' : 'flex-start', gap: collapsed ? 0 : 12 }}>
          <div className="adm-logo-icon" style={{ flexShrink: 0 }}>P</div>
          {!collapsed && (
            <div>
              <div className="adm-logo-text">Pragni Tech<span className="adm-logo-dot">.</span></div>
              <div className="adm-logo-badge">Admin Panel</div>
            </div>
          )}
          <button
            className="adm-btn adm-btn-ghost adm-btn-sm"
            onClick={toggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{ marginLeft: collapsed ? 0 : 'auto', padding: 'var(--space-2)', borderRadius: 'var(--r-sm)' }}
          >
            <Icon name={isDark ? 'sun' : 'moon'} size={14} />
          </button>
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{
              marginLeft: 6, background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text3)', padding: 4, borderRadius: 6,
              display: 'flex', alignItems: 'center', transform: collapsed ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.25s',
            }}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <Icon name="chevron" />
          </button>
        </div>

        {/* Nav groups */}
        <nav className="adm-nav">
          {NAV_GROUPS.map(group => {
            const visibleItems = group.items.filter(n => {
              if (!user) return false;
              if (user.role === 'admin') return true;
              return canSee(user, n.section);
            });
            if (visibleItems.length === 0) return null;
            return (
              <React.Fragment key={group.label}>
                {!collapsed && <div className="adm-nav-label">{group.label}</div>}
                {visibleItems.map(n => (
                  <button
                    key={n.path}
                    className={`adm-nav-item ${isActive(n.path) ? 'active' : ''}`}
                    onClick={() => go(n.path)}
                    title={collapsed ? n.label : ''}
                    style={{ justifyContent: collapsed ? 'center' : 'flex-start', gap: collapsed ? 0 : 10 }}
                  >
                    <span className="adm-nav-icon" style={{ flexShrink: 0 }}>
                      <Icon name={n.icon} size={16} />
                    </span>
                    {!collapsed && n.label}
                  </button>
                ))}
              </React.Fragment>
            );
          })}

          <div className="adm-divider" />
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="adm-nav-item"
            title={collapsed ? 'View Site' : ''}
            style={{ justifyContent: collapsed ? 'center' : 'flex-start', gap: collapsed ? 0 : 10 }}
          >
            <span className="adm-nav-icon" style={{ flexShrink: 0 }}><Icon name="viewsite" size={16} /></span>
            {!collapsed && 'View Site'}
          </a>
          <button
            className="adm-nav-item"
            onClick={logout}
            style={{ color: 'var(--rose)', justifyContent: collapsed ? 'center' : 'flex-start', gap: collapsed ? 0 : 10 }}
            title={collapsed ? 'Logout' : ''}
          >
            <span className="adm-nav-icon" style={{ flexShrink: 0 }}><Icon name="logout" size={16} /></span>
            {!collapsed && 'Logout'}
          </button>
        </nav>

        {/* User */}
        {!collapsed && (
          <div className="adm-user">
            <div className="adm-avatar">{user?.name?.[0]?.toUpperCase() || 'A'}</div>
            <div style={{ overflow: 'hidden' }}>
              <div className="adm-user-name">{user?.name}</div>
              <div className="adm-user-role">{user?.role}</div>
            </div>
          </div>
        )}
      </aside>

      <div className="adm-content" style={{ marginLeft: 'var(--sidebar-w)', transition: 'margin-left 0.25s cubic-bezier(0.4,0,0.2,1)' }}>
        {children}
      </div>
    </div>
  );
}
