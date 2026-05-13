// Workshops.js
import React, { useState, useEffect } from 'react';
import { getWorkshops, joinWorkshop } from '../utils/api';

export function Workshops() {
  const [workshops, setWorkshops] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { getWorkshops().then(r => setWorkshops(r.data.workshops || [])).catch(() => {}); }, []);

  const handleJoin = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const r = await joinWorkshop(selected._id, form);
      setResult(r.data.meetUrl);
    } catch { setResult('error'); }
    setLoading(false);
  };

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow">Live Sessions</div>
          <h2>Workshops &amp; Live Classes</h2>
          <p>Instructor-led, hands-on, completely free. Join from anywhere.</p>
        </div>
        {workshops.length === 0
          ? <div className="empty-state"><div className="icon">📅</div><p>No upcoming workshops. Check back soon!</p></div>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {workshops.map(w => {
                const d = new Date(w.scheduledAt);
                return (
                  <div key={w._id} className="workshop-banner" onClick={() => { setSelected(w); setResult(null); }}>
                    {w.bannerImage && <img className="workshop-banner-img" src={w.bannerImage} alt={w.title} />}
                    <div className="workshop-banner-body">
                      <div className="workshop-meta">
                        <span className="live-badge"><span className="live-dot" />UPCOMING</span>
                        <span className="tag">📅 {d.toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                        <span className="tag">🕐 {d.toLocaleTimeString('en-IN', { timeStyle: 'short' })}</span>
                        <span className="tag">⏱ {w.durationMinutes} min</span>
                        {w.trainer && <span className="tag">👤 {w.trainer.name}</span>}
                      </div>
                      <div className="workshop-title">{w.title}</div>
                      <div className="workshop-desc">{w.description}</div>
                      <button className="btn btn-primary btn-sm">Register & Get Link →</button>
                    </div>
                  </div>
                );
              })}
            </div>
        }
      </div>

      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal">
            <div className="modal-header">
              <div>
                <span className="live-badge" style={{ marginBottom: 8, display: 'inline-flex' }}><span className="live-dot" />LIVE SESSION</span>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 8 }}>{selected.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>
                  {new Date(selected.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} · {selected.durationMinutes} min
                </p>
              </div>
              <button className="modal-close" onClick={() => { setSelected(null); setResult(null); }}>✕</button>
            </div>
            {result
              ? result === 'error'
                ? <div className="tag red" style={{ padding: '12px 16px', borderRadius: 10, fontSize: 14 }}>⚠️ Error. Try again.</div>
                : <div style={{ padding: 16, background: 'var(--green-bg)', borderRadius: 12, border: '1px solid rgba(0,153,112,0.25)' }}>
                    <p style={{ fontSize: 13, color: 'var(--green)', marginBottom: 10, fontWeight: 600 }}>✅ Registered! Join the session:</p>
                    <a href={result} target="_blank" rel="noopener noreferrer" className="btn btn-green" style={{ width: '100%' }}>Open Google Meet →</a>
                  </div>
              : <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="input-group"><label className="input-label">Name</label><input className="input" required placeholder="John Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                  <div className="input-group"><label className="input-label">Email</label><input type="email" className="input" required placeholder="you@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 4 }} disabled={loading}>{loading ? 'Getting link...' : 'Get Join Link →'}</button>
                </form>
            }
          </div>
        </div>
      )}
    </section>
  );
}

// Trainers.js
export function Trainers() {
  const [trainers, setTrainers] = useState([]);
  useEffect(() => { import('../utils/api').then(api => api.getTrainers().then(r => setTrainers(r.data.trainers || []))); }, []);
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow">Meet the Team</div>
          <h2>Our Expert Trainers</h2>
          <p>Industry professionals passionate about teaching the next generation of security engineers.</p>
        </div>
        {trainers.length === 0
          ? <div className="empty-state"><div className="icon">👥</div><p>Trainer profiles coming soon.</p></div>
          : <div className="grid-4">
              {trainers.map(t => (
                <div key={t._id} className="card trainer-card">
                  {t.photo
                    ? <img src={t.photo} alt={t.name} className="trainer-avatar" />
                    : <div className="trainer-avatar-placeholder">{t.name[0]}</div>
                  }
                  <div className="trainer-name">{t.name}</div>
                  <div className="trainer-role">{t.role === 'admin' ? 'Lead Instructor' : 'Instructor'}</div>
                  {t.bio && <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12, lineHeight: 1.6 }}>{t.bio.substring(0, 100)}...</p>}
                  <div className="trainer-specs">
                    {(t.specializations || []).slice(0, 3).map((s, i) => <span key={i} className="tag" style={{ fontSize: 11 }}>{s}</span>)}
                  </div>
                  {(t.socialLinks?.linkedin || t.socialLinks?.github || t.socialLinks?.twitter) && (
                    <div className="social-links">
                      {t.socialLinks.linkedin && <a href={t.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="social-link" title="LinkedIn">in</a>}
                      {t.socialLinks.github && <a href={t.socialLinks.github} target="_blank" rel="noopener noreferrer" className="social-link" title="GitHub">gh</a>}
                      {t.socialLinks.twitter && <a href={t.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="social-link" title="Twitter">tw</a>}
                    </div>
                  )}
                </div>
              ))}
            </div>
        }
      </div>
    </section>
  );
}

// About.js
export function About() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="section-head">
          <div className="eyebrow">About Us</div>
          <h2>Our Mission &amp; Story</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div className="card card-inner">
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: 'var(--accent2)' }}>🎯 Why Pragni?</h3>
            <p className="lead" style={{ fontSize: 15 }}>
              We believe cybersecurity and cloud skills should not be locked behind expensive courses and paywalls.
              Pragni was created to bridge the gap between ambition and opportunity.
            </p>
          </div>
          <div className="card card-inner">
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: 'var(--green)' }}>🚀 What We Offer</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Free foundational courses in AWS, Azure, Cybersecurity, SOC, Pentesting & Networking','2 new videos every week','Live workshops and Q&A sessions','Hands-on labs and real-world scenarios','Affordable premium batch programs for deeper learning'].map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, fontSize: 15, color: 'var(--text2)' }}>
                  <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span>{item}
                </li>
              ))}
            </ul>
          </div>
          <div id="mission" className="card card-inner" style={{ background: 'var(--accent-bg)', border: '1px solid rgba(108,71,255,0.2)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: 'var(--accent2)' }}>💡 Our Promise</h3>
            <p className="serif" style={{ fontSize: 22, color: 'var(--accent3)', lineHeight: 1.5 }}>
              "Every learner — regardless of background or budget — deserves access to skills that can change their life."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// NotFound.js
export function NotFound() {
  return (
    <section className="section">
      <div className="container" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 80, marginBottom: 16 }}>🔍</div>
        <h1 style={{ fontSize: 48, fontWeight: 700, marginBottom: 16 }}>404</h1>
        <p className="lead" style={{ marginBottom: 24 }}>Page not found. It may have moved or doesn't exist.</p>
        <a href="/" className="btn btn-primary">← Back to Home</a>
      </div>
    </section>
  );
}
