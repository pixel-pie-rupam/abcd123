import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

// Logo cache
let _logoCache = { url: '', fetchedAt: 0 };
const LOGO_TTL = 30000;

// Site content cache (brand name)
let _contentCache = { data: {}, fetchedAt: 0 };
const CONTENT_TTL = 60000;

function fetchLogo(force = false) {
  const now = Date.now();
  if (!force && _logoCache.url && now - _logoCache.fetchedAt < LOGO_TTL) return Promise.resolve(_logoCache.url);
  return fetch('/api/settings/logo', { cache: 'no-store' })
    .then(r => r.json())
    .then(d => { _logoCache = { url: d.logoUrl || '', fetchedAt: Date.now() }; return _logoCache.url; })
    .catch(() => '');
}

function fetchContent(force = false) {
  const now = Date.now();
  if (!force && _contentCache.fetchedAt && now - _contentCache.fetchedAt < CONTENT_TTL) return Promise.resolve(_contentCache.data);
  return fetch('/api/site-content', { cache: 'no-store' })
    .then(r => r.json())
    .then(d => { _contentCache = { data: d.content || {}, fetchedAt: Date.now() }; return _contentCache.data; })
    .catch(() => ({}));
}

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoUrl,  setLogoUrl]  = useState(_logoCache.url || '');
  const [brandName, setBrandName] = useState(_contentCache.data['brand_name'] || 'Pragni Tech');
  const [brandTagline, setBrandTagline] = useState(_contentCache.data['brand_tagline'] || '');
  const [hidden,   setHidden]   = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    fetchLogo().then(setLogoUrl);
    fetchContent().then(c => {
      if (c['brand_name'])    setBrandName(c['brand_name']);
      if (c['brand_tagline']) setBrandTagline(c['brand_tagline']);
    });

    const onLogoUpdate = () => { _logoCache.fetchedAt = 0; fetchLogo(true).then(setLogoUrl); };
    const onContentUpdate = () => {
      _contentCache.fetchedAt = 0;
      fetchContent(true).then(c => {
        if (c['brand_name'])    setBrandName(c['brand_name']);
        if (c['brand_tagline']) setBrandTagline(c['brand_tagline']);
      });
    };
    window.addEventListener('logo-updated',          onLogoUpdate);
    window.addEventListener('site-content-updated',  onContentUpdate);
    return () => {
      window.removeEventListener('logo-updated',         onLogoUpdate);
      window.removeEventListener('site-content-updated', onContentUpdate);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > lastScrollY.current && y > 80);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { to: '/',          label: 'Home' },
    { to: '/courses',   label: 'Programs' },
    { to: '/services',  label: 'Services' },
    { to: '/workshops', label: 'Workshops' },
    { to: '/trainers',  label: 'Mentors' },
    { to: '/about',     label: 'About' },
    { to: '/contact',   label: 'Contact' },
  ];

  // Brand name: split last char for accent dot effect
  const bName = brandName || 'Pragni Tech';
  const bMain = bName.slice(0, -1);
  const bLast = bName.slice(-1);

  return (
    <>
      <nav className="navbar" style={{
        transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'transform 0.3s ease',
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>
        <div className="navbar-inner">

          {/* ── LOGO + BRAND ── */}
          <Link to="/" className="navbar-logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            {logoUrl
              ? <img src={logoUrl} alt={bName} onError={() => setLogoUrl('')} style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
              : <span style={{
                  width: 34, height: 34, borderRadius: 9,
                  background: 'linear-gradient(135deg, var(--accent), var(--accent2, #5c6bc0))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: 17, flexShrink: 0,
                  boxShadow: '0 0 20px rgba(123,94,167,0.4)',
                }}>
                  {bName[0]?.toUpperCase()}
                </span>
            }
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, color: 'var(--text)' }}>
                {bMain}<span className="logo-accent">{bLast}</span>
                <span style={{ color: 'var(--accent2, #c4a8ff)' }}>.</span>
              </span>
              {brandTagline && (
                <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', lineHeight: 1 }}>
                  {brandTagline}
                </span>
              )}
            </div>
          </Link>

          {/* ── NAV LINKS ── */}
          <div className="navbar-links">
            {links.map(l => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'}
                className={({ isActive }) => isActive ? 'active' : ''}
              >{l.label}</NavLink>
            ))}
          </div>

          {/* ── ACTIONS ── */}
          <div className="navbar-actions">
            <Link to="/services" className="navbar-cta" style={{
              display: 'none', // shown via CSS on desktop
              alignItems: 'center', gap: 6,
              padding: '8px 18px', borderRadius: 100,
              background: 'linear-gradient(135deg, var(--accent), var(--accent2, #5c6bc0))',
              color: '#fff', fontWeight: 600, fontSize: 13,
              textDecoration: 'none', letterSpacing: '0.01em',
              boxShadow: '0 0 20px rgba(123,94,167,0.35)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 35px rgba(123,94,167,0.6)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(123,94,167,0.35)'}
            >
              Book Consultation
            </Link>
            <button className="theme-toggle" onClick={toggleTheme} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
              {isDark
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3c0.5 0 0.72 0.6 0.38 0.97A7 7 0 0 0 20.03 12.4c0.37-0.33 0.97-0.11 0.97 0.39z"/></svg>
              }
            </button>
            <button className="nav-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
              {menuOpen
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <><span/><span/><span/></>
              }
            </button>
          </div>
        </div>
      </nav>

      {/* ── MOBILE MENU ── */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`} style={{ background: 'var(--bg2)' }}>
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end={l.to === '/'} onClick={() => setMenuOpen(false)}
            className={({ isActive }) => isActive ? 'active' : ''}
          >{l.label}</NavLink>
        ))}
        <Link to="/services" onClick={() => setMenuOpen(false)} style={{
          marginTop: 8, display: 'block', padding: '14px 16px', borderRadius: 10,
          background: 'linear-gradient(135deg, var(--accent), var(--accent2, #5c6bc0))',
          color: '#fff', fontWeight: 600, fontSize: 15, textAlign: 'center', textDecoration: 'none',
        }}>
          Book Consultation →
        </Link>
        <button className="theme-toggle" onClick={toggleTheme} style={{ width: '100%', justifyContent: 'center' }} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
          {isDark ? 'Light mode' : 'Dark mode'}
        </button>
      </div>

      {/* Show CTA button on desktop via injected style */}
      <style>{`@media(min-width:769px){.navbar-cta{display:inline-flex !important}}`}</style>
    </>
  );
}
