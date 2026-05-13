import React, { useState } from 'react';
import { useSeo, useMeta } from '../context/SeoContext';

// Same SVG social icons as footer — Fix #1
const SocialIcons = {
  youtube: (<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>),
  instagram: (<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>),
  twitter: (<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>),
  linkedin: (<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>),
  facebook: (<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>),
  telegram: (<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>),
  discord: (<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.132 18.11a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>),
  github: (<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>),
};

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

function ensureUrl(raw) {
  if (!raw) return '';
  const t = raw.trim();
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  return 'https://' + t;
}

const STYLES = `
.contact-wrap { min-height:100vh; background:var(--bg); padding:80px 24px 64px; }
.contact-inner { max-width:1000px; margin:0 auto; }
.contact-hero { text-align:center; margin-bottom:56px; }
.contact-hero h1 {
  font-family:'Clash Display',sans-serif;
  font-size:clamp(32px,5vw,54px); font-weight:700; letter-spacing:-0.03em;
  background:linear-gradient(135deg,#eef0ff 0%,#c4a8ff 50%,#4fc3f7 100%);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  margin-bottom:16px;
}
.contact-hero p { color:var(--text2); font-size:17px; max-width:520px; margin:0 auto; line-height:1.7; }
.contact-grid { display:grid; grid-template-columns:1fr 1fr; gap:28px; }
@media(max-width:700px){ .contact-grid { grid-template-columns:1fr; } }

.c-card {
  background:rgba(26,29,46,0.7); border:1px solid rgba(255,255,255,0.07);
  border-radius:22px; backdrop-filter:blur(16px);
  padding:28px;
}
.c-card h2 { font-family:'Clash Display',sans-serif; font-size:18px; font-weight:700; letter-spacing:-0.02em; margin-bottom:20px; color:var(--text); }

.c-item { display:flex; align-items:flex-start; gap:14px; margin-bottom:18px; }
.c-item-icon {
  width:40px; height:40px; border-radius:12px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center; font-size:18px;
  background:rgba(123,94,167,0.15); border:1px solid rgba(157,127,212,0.25);
}
.c-item-label { font-size:11px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:rgba(255,255,255,0.35); margin-bottom:3px; }
.c-item-val { font-size:15px; color:var(--text); font-weight:500; line-height:1.5; }
.c-item-val a { color:var(--text); text-decoration:none; }
.c-item-val a:hover { color:var(--accent2,#c4a8ff); }

.c-socials { display:flex; gap:10px; flex-wrap:wrap; margin-top:8px; }
.c-social-btn {
  width:44px; height:44px; border-radius:12px;
  display:flex; align-items:center; justify-content:center;
  background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08);
  font-size:15px; font-weight:700; text-decoration:none;
  transition:all 0.25s; cursor:pointer;
}
.c-social-btn:hover { transform:translateY(-3px); }

.c-form { display:flex; flex-direction:column; gap:14px; }
.c-input {
  width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1);
  border-radius:10px; padding:12px 16px; color:var(--text);
  font-family:'Plus Jakarta Sans',sans-serif; font-size:14px; outline:none;
  transition:border-color 0.2s, box-shadow 0.2s; box-sizing:border-box;
}
.c-input:focus { border-color:rgba(157,127,212,0.5); box-shadow:0 0 0 3px rgba(123,94,167,0.12); }
.c-input::placeholder { color:rgba(255,255,255,0.25); }
textarea.c-input { resize:vertical; min-height:110px; }
.c-send {
  background:linear-gradient(135deg,#7b5ea7,#5c6bc0);
  color:#fff; border:none; border-radius:100px; padding:13px 32px;
  font-family:'Plus Jakarta Sans',sans-serif; font-weight:700; font-size:15px;
  cursor:pointer; letter-spacing:0.01em;
  box-shadow:0 0 30px rgba(123,94,167,0.4);
  transition:all 0.28s cubic-bezier(0.16,1,0.3,1);
}
.c-send:hover { transform:translateY(-2px); box-shadow:0 0 50px rgba(123,94,167,0.6); }
.c-send:disabled { opacity:0.5; cursor:not-allowed; transform:none; }

.c-success {
  background:rgba(38,208,161,0.08); border:1px solid rgba(38,208,161,0.25);
  border-radius:12px; padding:16px 20px; color:#26d0a1; font-size:15px; font-weight:600; text-align:center;
}
.c-error {
  background:rgba(255,90,90,0.08); border:1px solid rgba(255,90,90,0.25);
  border-radius:12px; padding:12px 16px; color:#ff7070; font-size:13px;
}
`;

export default function Contact() {
  useMeta({ pageKey: 'contact', title: 'Contact Us', description: 'Get in touch with Pragni.', keywords: 'contact, support, cybersecurity training' });
  const { contact } = useSeo();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const activeSocials = SOCIALS.filter(s => contact?.[s.key]);

  const send = async () => {
    const name    = form.name.trim();
    const email   = form.email.trim();
    const message = form.message.trim();

    // Fix #3 — client-side validation
    if (!name || name.length < 2)    { setError('Please enter your name (min 2 chars)'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address'); return; }
    if (!message || message.length < 10) { setError('Message must be at least 10 characters'); return; }
    setError('');
    setSending(true);
    try {
      const r = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      const d = await r.json();
      if (d.success) {
        setSent(true);
        setForm({ name: '', email: '', message: '' });
      } else {
        setError(d.error || 'Failed to send. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setSending(false);
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="contact-wrap">
        <div className="contact-inner">
          <div className="contact-hero">
            <h1>Get in Touch</h1>
            <p>Have a question, feedback, or just want to say hello? We'd love to hear from you.</p>
          </div>

          <div className="contact-grid">
            {/* Contact Info */}
            <div className="c-card">
              <h2>Contact Info</h2>

              {contact?.email && (
                <div className="c-item">
                  <div className="c-item-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" style={{ color: '#c4a8ff' }}>
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div>
                    <div className="c-item-label">Email</div>
                    <div className="c-item-val"><a href={`mailto:${contact.email}`}>{contact.email}</a></div>
                  </div>
                </div>
              )}

              {contact?.phone && (
                <div className="c-item">
                  <div className="c-item-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" style={{ color: '#4fc3f7' }}>
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.1a19.79 19.79 0 01-3.07-8.7A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="c-item-label">Phone</div>
                    <div className="c-item-val"><a href={`tel:${contact.phone}`}>{contact.phone}</a></div>
                  </div>
                </div>
              )}

              {contact?.whatsapp && (
                <div className="c-item">
                  <div className="c-item-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" style={{ color: '#25d366' }}>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="c-item-label">WhatsApp</div>
                    <div className="c-item-val"><a href={`https://wa.me/${contact.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer">{contact.whatsapp}</a></div>
                  </div>
                </div>
              )}

              {contact?.address && (
                <div className="c-item">
                  <div className="c-item-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" style={{ color: '#f59e0b' }}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div>
                    <div className="c-item-label">Address</div>
                    <div className="c-item-val" style={{ whiteSpace: 'pre-line' }}>{contact.address}</div>
                  </div>
                </div>
              )}

              {activeSocials.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <div className="c-item-label" style={{ marginBottom: 12 }}>Follow Us</div>
                  <div className="c-socials">
                    {activeSocials.map(s => (
                      <a
                        key={s.key}
                        href={ensureUrl(contact[s.key])}
                        className="c-social-btn"
                        target="_blank"
                        rel="noopener noreferrer"
                        title={s.label}
                        style={{ color: s.color }}
                        onMouseEnter={e => { e.currentTarget.style.background = s.color + '22'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                      >
                        {SocialIcons[s.key]}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contact Form — Fix #2: messages go to DB only */}
            <div className="c-card">
              <h2>Send a Message</h2>
              {sent ? (
                <div className="c-success">
                  ✓ Message sent! We'll get back to you soon.
                </div>
              ) : (
                <div className="c-form">
                  {error && <div className="c-error">{error}</div>}
                  <input
                    className="c-input"
                    placeholder="Your name"
                    value={form.name}
                    maxLength={100}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                  <input
                    className="c-input"
                    type="email"
                    placeholder="Your email"
                    value={form.email}
                    maxLength={200}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  />
                  <textarea
                    className="c-input"
                    placeholder="Your message…"
                    value={form.message}
                    maxLength={3000}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  />
                  <button className="c-send" onClick={send} disabled={sending}>
                    {sending ? 'Sending…' : 'Send Message'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
