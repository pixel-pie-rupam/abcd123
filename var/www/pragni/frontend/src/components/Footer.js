import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSeo } from '../context/SeoContext';

// Fix #1 — Proper SVG social icons (no unicode placeholders)
const SocialIcons = {
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  telegram: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  ),
  discord: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.132 18.11a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
    </svg>
  ),
};

// Fix #1 — Ensure social link URLs are proper (prepend https:// if missing)
function ensureUrl(raw) {
  if (!raw) return '';
  const t = raw.trim();
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  // looks like just a domain or path like "linkedin.com/in/xyz"
  return 'https://' + t;
}

const SOCIALS = [
  { key: 'youtube',   label: 'YouTube',   color: '#ff0000' },
  { key: 'instagram', label: 'Instagram', color: '#e1306c' },
  { key: 'twitter',   label: 'Twitter/X', color: '#1da1f2' },
  { key: 'linkedin',  label: 'LinkedIn',  color: '#0077b5' },
  { key: 'facebook',  label: 'Facebook',  color: '#1877f2' },
  { key: 'telegram',  label: 'Telegram',  color: '#2ca5e0' },
  { key: 'discord',   label: 'Discord',   color: '#5865f2' },
  { key: 'github',    label: 'GitHub',    color: '#c9d1d9' },
];

export default function Footer() {
  const [logoUrl, setLogoUrl] = useState('');
  const [categories, setCategories] = useState([]);
  const [siteContent, setSiteContent] = useState({});
  const { contact } = useSeo();

  useEffect(() => {
    fetch('/api/settings/logo')
      .then(r => r.json())
      .then(d => { if (d.logoUrl) setLogoUrl(d.logoUrl); })
      .catch(() => {});

    const onLogoUpdate = () => {
      fetch('/api/settings/logo')
        .then(r => r.json())
        .then(d => { if (d.logoUrl) setLogoUrl(d.logoUrl); })
        .catch(() => {});
    };
    window.addEventListener('logo-updated', onLogoUpdate);

    fetch('/api/categories/public')
      .then(r => r.json())
      .then(d => { if (d.categories) setCategories(d.categories); })
      .catch(() => {});

    const loadContent = () => {
      fetch('/api/site-content', { cache: 'no-store' })
        .then(r => r.json())
        .then(d => setSiteContent(d.content || {}))
        .catch(() => {});
    };
    loadContent();
    window.addEventListener('site-content-updated', loadContent);

    return () => {
      window.removeEventListener('logo-updated', onLogoUpdate);
      window.removeEventListener('site-content-updated', loadContent);
    };
  }, []);

  const activeSocials = SOCIALS.filter(s => contact?.[s.key]);

  const brandName = siteContent.brand_name || 'Pragni Tech';
  const brandDescription = siteContent.footer_description || 'World-class cybersecurity & cloud education — free & affordable for everyone.';
  const footerTagline = siteContent.footer_tagline || 'Skills for all. Free & affordable.';

  const bg = 'var(--bg2)';
  const mutedColor = 'var(--text3)';
  const headColor = 'var(--text)';
  const borderColor = 'var(--border)';

  return (
      <footer style={{
      background: bg,
      borderTop: `1px solid ${borderColor}`,
      color: headColor,
      padding: '48px 0 0',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '36px 40px',
          paddingBottom: 40,
        }}>

          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              {logoUrl
                ? <img src={logoUrl} alt={brandName} style={{ height: 34, width: 'auto', objectFit: 'contain' }} />
                : <span style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: 'var(--accent)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 17,
                  }}>P</span>
              }
              <span style={{ fontSize: 19, fontWeight: 700, color: headColor }}>
                {brandName}<span style={{ color: 'var(--accent2, #6c47ff)' }}>.</span>
              </span>
            </div>
            <p style={{ color: mutedColor, fontSize: 13, lineHeight: 1.7, margin: 0 }}>
              {brandDescription}
            </p>
          </div>

          {/* Courses */}
          <div>
            <h4 style={{ color: headColor, fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
              Courses
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <Link to="/courses?type=free" className="footer-link-inline">Free Courses</Link>
              <Link to="/courses?type=paid" className="footer-link-inline">Paid Courses</Link>
              {categories.map(c => (
                <Link
                  key={c.slug}
                  to={`/courses?category=${c.slug}`}
                  className="footer-link-inline"
                >
                  {c.icon} {c.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: headColor, fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
              Quick Links
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {[
                { to: '/services', label: 'Services' },
                { to: '/workshops', label: 'Live Workshops' },
                { to: '/trainers', label: 'Our Trainers' },
                { to: '/about', label: 'About Us' },
                { to: '/about#mission', label: 'Our Mission' },
                { to: '/contact', label: 'Contact Us' },
              ].map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="footer-link-inline"
                >{l.label}</Link>
              ))}
            </div>
          </div>

        </div>

        {/* Social icons — Fix #1: proper SVG icons + proper URLs */}
        {activeSocials.length > 0 && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingBottom: 24, borderBottom: `1px solid ${borderColor}`, marginBottom: 16 }}>
            {activeSocials.map(s => {
              const href = ensureUrl(contact[s.key]);
              return (
                <a
                  key={s.key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  style={{
                    width: 38, height: 38, borderRadius: 10,
                     background: 'var(--bg4)',
                     border: '1px solid var(--border2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: s.color,
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = s.color + '22';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 4px 20px ${s.color}33`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'var(--bg4)';
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  {SocialIcons[s.key]}
                </a>
              );
            })}
          </div>
        )}

        <div style={{
          borderTop: `1px solid ${borderColor}`,
          padding: '16px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
        }}>
          <p style={{ color: 'var(--text3)', fontSize: 12, margin: 0 }}>
            © {new Date().getFullYear()} {brandName}. All rights reserved.
          </p>
          <p style={{ color: 'var(--accent2, #6c47ff)', fontWeight: 600, fontSize: 12, margin: 0 }}>
            {footerTagline}
          </p>
        </div>
      </div>
    </footer>
  );
}
