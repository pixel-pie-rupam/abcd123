import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { adminGet, adminPut } from '../../utils/api';

// Proper SVG icons for each social platform
const SocialSVG = {
  youtube:   <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
  instagram: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
  twitter:   <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  linkedin:  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  facebook:  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  telegram:  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>,
  discord:   <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.132 18.11a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>,
  github:    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>,
};

const SOCIALS = [
  { key:'youtube',   label:'YouTube',   color:'#ff0000', placeholder:'https://youtube.com/@pragni' },
  { key:'instagram', label:'Instagram', color:'#e1306c', placeholder:'https://instagram.com/pragni' },
  { key:'twitter',   label:'Twitter/X', color:'#1da1f2', placeholder:'https://x.com/pragni' },
  { key:'linkedin',  label:'LinkedIn',  color:'#0077b5', placeholder:'https://linkedin.com/company/pragni' },
  { key:'facebook',  label:'Facebook',  color:'#1877f2', placeholder:'https://facebook.com/pragni' },
  { key:'telegram',  label:'Telegram',  color:'#2ca5e0', placeholder:'https://t.me/pragni' },
  { key:'discord',   label:'Discord',   color:'#5865f2', placeholder:'https://discord.gg/pragni' },
  { key:'github',    label:'GitHub',    color:'#f0f6fc', placeholder:'https://github.com/pragni' },
];

// FIX #1 — Ensure social URLs always have https://
function ensureUrl(raw) {
  if (!raw) return '';
  const t = raw.trim();
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  return 'https://' + t;
}

// SVG icons for tabs — no emoji
const InfoIcon  = () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const LinkIcon  = () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const EyeIcon   = () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const MailIcon  = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const PhoneIcon = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 10.1a19.79 19.79 0 0 1-3.07-8.7A2 2 0 0 1 2 .18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L6.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const MapIcon   = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;

export default function ContactAdmin() {
  const { token } = useAdmin();
  const [contact, setContact] = useState(null);
  const [saving, setSaving]   = useState(false);
  const [activeTab, setActiveTab] = useState('contact');
  const [toast, setToast]     = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    adminGet('/contact', token)
      .then(r => setContact(r.data.contact || {}))
      .catch(() => setContact({}));
  }, [token]);

  const set = (k, v) => setContact(c => ({ ...c, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      // FIX #1 — ensure all social URLs have proper https:// before saving
      const payload = { ...contact };
      SOCIALS.forEach(s => {
        if (payload[s.key]) payload[s.key] = ensureUrl(payload[s.key]);
      });
      await adminPut('/contact', payload, token);
      setContact(payload); // update local state with cleaned URLs
      window.dispatchEvent(new Event('contact-updated')); // notify public site
      showToast('Contact info saved!');
    } catch {
      showToast('Error saving', 'error');
    }
    setSaving(false);
  };

  if (!contact) return (
    <div>
      <div className="adm-header"><div className="adm-header-title">Contact &amp; Social</div></div>
      <div className="adm-body">
        {[1, 2, 3].map(i => (
          <div key={i} className="adm-skeleton" style={{ height: 70, borderRadius: 12, marginBottom: 12 }} />
        ))}
      </div>
    </div>
  );

  const TABS = [
    { id: 'contact', label: 'Contact Info', Icon: InfoIcon },
    { id: 'social',  label: 'Social Links',  Icon: LinkIcon },
    { id: 'preview', label: 'Preview',       Icon: EyeIcon },
  ];

  const activeSocials   = SOCIALS.filter(s => contact[s.key]);
  const inactiveSocials = SOCIALS.filter(s => !contact[s.key]);

  return (
    <div>
      <div className="adm-header">
        <div>
          <div className="adm-header-title">Contact &amp; Social</div>
          <div className="adm-header-sub">{activeSocials.length} social link{activeSocials.length !== 1 ? 's' : ''} configured</div>
        </div>
        <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save All'}
        </button>
      </div>

      <div className="adm-body">
        <div className="adm-card" style={{ overflow: 'hidden' }}>

          {/* Tabs — SVG icons */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-a)', background: 'rgba(255,255,255,0.02)', overflowX: 'auto' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                padding: '13px 20px', border: 'none', background: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7,
                color: activeTab === t.id ? 'var(--violet3)' : 'var(--text3)',
                borderBottom: `2px solid ${activeTab === t.id ? 'var(--violet3)' : 'transparent'}`,
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}>
                <t.Icon /> {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* ── CONTACT INFO ── */}
            {activeTab === 'contact' && <>
              <div className="adm-info adm-info-violet">
                This info appears on your Contact page and in the footer.
              </div>
              <div className="adm-form-section">Primary Contact</div>
              <div className="adm-form-row">
                <div className="adm-input-group">
                  <label className="adm-label">Email Address</label>
                  <input className="adm-input" type="email" value={contact.email || ''}
                    onChange={e => set('email', e.target.value)} placeholder="hello@pragni.com" />
                </div>
                <div className="adm-input-group">
                  <label className="adm-label">Phone Number</label>
                  <input className="adm-input" value={contact.phone || ''}
                    onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
                </div>
              </div>
              <div className="adm-form-row">
                <div className="adm-input-group">
                  <label className="adm-label">WhatsApp Number</label>
                  <input className="adm-input" value={contact.whatsapp || ''}
                    onChange={e => set('whatsapp', e.target.value)} placeholder="+919876543210" />
                  <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 5 }}>Include country code, no spaces.</p>
                </div>
                <div className="adm-input-group">
                  <label className="adm-label">Form Recipient Email</label>
                  <input className="adm-input" type="email" value={contact.formRecipientEmail || ''}
                    onChange={e => set('formRecipientEmail', e.target.value)} placeholder="admin@pragni.com" />
                </div>
              </div>
              <div className="adm-form-section">Location</div>
              <div className="adm-input-group">
                <label className="adm-label">Address</label>
                <textarea className="adm-input" value={contact.address || ''} rows={2}
                  onChange={e => set('address', e.target.value)} placeholder="123 Cyber Lane, Bengaluru..." />
              </div>
              <div className="adm-input-group">
                <label className="adm-label">Google Maps Embed URL</label>
                <input className="adm-input" value={contact.mapEmbedUrl || ''}
                  onChange={e => set('mapEmbedUrl', e.target.value)} placeholder="https://www.google.com/maps/embed?pb=..." />
                <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 5 }}>
                  Google Maps → Share → Embed a map → copy the src="…" URL only.
                </p>
              </div>
              <div className="adm-form-section">Contact Form</div>
              <label className="adm-toggle">
                <input type="checkbox" checked={!!contact.formEnabled} onChange={e => set('formEnabled', e.target.checked)} />
                <span>Enable contact form on the Contact page</span>
              </label>
            </>}

            {/* ── SOCIAL LINKS ── */}
            {activeTab === 'social' && <>
              <div className="adm-info adm-info-violet">
                Paste full URLs (e.g. <code>https://linkedin.com/in/your-profile</code>). Links are auto-prefixed with https:// if missing.
                Leave blank to hide that platform.
              </div>
              {activeSocials.length > 0 && <>
                <div className="adm-form-section">Connected Platforms</div>
                {activeSocials.map(s => (
                  <SocialRow key={s.key} s={s} value={contact[s.key]} onChange={v => set(s.key, v)} />
                ))}
              </>}
              {inactiveSocials.length > 0 && <>
                <div className="adm-form-section" style={{ marginTop: 8 }}>Add Platform</div>
                {inactiveSocials.map(s => (
                  <SocialRow key={s.key} s={s} value={contact[s.key]} onChange={v => set(s.key, v)} inactive />
                ))}
              </>}
            </>}

            {/* ── PREVIEW ── */}
            {activeTab === 'preview' && <>
              <div className="adm-info adm-info-violet">How social links appear in your footer and contact page.</div>

              <div className="adm-form-section">Social Icons Preview</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', padding: '12px 0' }}>
                {SOCIALS.filter(s => contact[s.key]).map(s => (
                  <a key={s.key} href={ensureUrl(contact[s.key])} target="_blank" rel="noopener noreferrer"
                    title={s.label}
                    style={{
                      width: 42, height: 42, borderRadius: 10,
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: s.color, textDecoration: 'none', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = s.color + '22'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = ''; }}
                  >
                    {SocialSVG[s.key]}
                  </a>
                ))}
                {SOCIALS.filter(s => contact[s.key]).length === 0 && (
                  <span style={{ color: 'var(--text3)', fontSize: 13 }}>No social links added yet.</span>
                )}
              </div>

              <div className="adm-form-section">Contact Card Preview</div>
              <div className="adm-card adm-card-inner" style={{ maxWidth: 420 }}>
                {[
                  { cond: contact.email,    icon: <MailIcon />,  label: 'Email',    val: contact.email,    color: 'rgba(123,94,167,0.15)' },
                  { cond: contact.phone,    icon: <PhoneIcon />, label: 'Phone',    val: contact.phone,    color: 'rgba(38,208,161,0.12)' },
                  { cond: contact.address,  icon: <MapIcon />,   label: 'Address',  val: contact.address,  color: 'rgba(79,195,247,0.12)' },
                ].filter(i => i.cond).map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, background: item.color,
                      border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text2)', flexShrink: 0,
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</div>
                      <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>{item.val}</div>
                    </div>
                  </div>
                ))}
                {!contact.email && !contact.phone && !contact.address && (
                  <div style={{ color: 'var(--text3)', fontSize: 13 }}>Fill in the Contact Info tab to see a preview.</div>
                )}
              </div>
            </>}

          </div>
        </div>
      </div>

      {toast && <div className={`adm-toast adm-toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

function SocialRow({ s, value, onChange }) {
  const url = value ? ensureUrl(value) : '';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 14px',
      background: value ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
      border: `1px solid ${value ? 'rgba(255,255,255,0.1)' : 'var(--border-a)'}`,
      borderLeft: `3px solid ${value ? s.color : 'var(--border-a)'}`,
      borderRadius: 10,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 8, flexShrink: 0,
        background: value ? s.color + '22' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${value ? s.color + '44' : 'var(--border-a)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: value ? s.color : 'var(--text3)',
      }}>
        {SocialSVG[s.key]}
      </div>
      <div style={{ fontWeight: 600, fontSize: 13, minWidth: 80, color: value ? 'var(--text)' : 'var(--text3)' }}>
        {s.label}
      </div>
      <input className="adm-input" value={value || ''} onChange={e => onChange(e.target.value)}
        placeholder={s.placeholder} style={{ flex: 1 }} />
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-ghost adm-btn-xs">
          ↗
        </a>
      )}
    </div>
  );
}
