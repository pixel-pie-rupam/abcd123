import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCourses, getWorkshops } from '../utils/api';

const CAT_MAP = {
  aws: { label: 'AWS Cloud', icon: '☁️', color: '#ff9900' },
  azure: { label: 'Microsoft Azure', icon: '🔷', color: '#0078d4' },
  cybersecurity: { label: 'Cybersecurity', icon: '🛡️', color: '#ff4757' },
  soc: { label: 'SOC Operations', icon: '🔍', color: '#00d4a1' },
  'pentesting-web': { label: 'Web Pentesting', icon: '🕸️', color: '#ffa502' },
  'pentesting-network': { label: 'Network Pentesting', icon: '🌐', color: '#ff6b35' },
  'pentesting-api': { label: 'API Pentesting', icon: '⚡', color: '#a29bfe' },
  networking: { label: 'Networking', icon: '📡', color: '#6c47ff' },
};

function CourseCard({ course }) {
  const navigate = useNavigate();
  const cat = CAT_MAP[course.category] || {};
  return (
    <div className="card course-card" onClick={() => navigate(`/courses/${course.slug}`)}>
      <div className="course-thumb">
        {course.thumbnail
          ? <img src={course.thumbnail} alt={course.title} />
          : <div className="course-thumb-placeholder">{cat.icon || '📚'}</div>
        }
      </div>
      <div className="course-body">
        <div className="course-meta">
          <span className="tag" style={{ color: cat.color, borderColor: `${cat.color}33`, background: `${cat.color}14` }}>{cat.icon} {cat.label}</span>
          <span className="tag">{course.level}</span>
        </div>
        <div className="course-title">{course.title}</div>
        <div className="course-desc">{course.description}</div>
        <div className="course-footer">
          <div className="course-trainer">
            {course.trainer?.photo
              ? <img src={course.trainer.photo} alt={course.trainer.name} />
              : <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--accent2)', fontWeight: 700 }}>
                  {(course.trainer?.name || 'P')[0]}
                </span>
            }
            {course.trainer?.name || 'Pragni'}
          </div>
          {course.price === 0
            ? <span className="price-free tag free">FREE</span>
            : <span className="price-paid">₹{course.price}</span>
          }
        </div>
      </div>
    </div>
  );
}

function WorkshopBanner({ workshop, onClick }) {
  const d = new Date(workshop.scheduledAt);
  const dateStr = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return (
    <div className="workshop-banner" onClick={onClick}>
      {workshop.bannerImage && <img className="workshop-banner-img" src={workshop.bannerImage} alt={workshop.title} />}
      <div className="workshop-banner-body">
        <div className="workshop-meta">
          <span className="live-badge"><span className="live-dot" />LIVE</span>
          <span className="tag">{dateStr} · {timeStr}</span>
          {workshop.trainer && <span className="tag">👤 {workshop.trainer.name}</span>}
        </div>
        <div className="workshop-title">{workshop.title}</div>
        <div className="workshop-desc">{workshop.description}</div>
        <button className="btn btn-primary btn-sm">Join Now →</button>
      </div>
    </div>
  );
}

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [joinForm, setJoinForm] = useState({ name: '', email: '' });
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinResult, setJoinResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getCourses().then(r => setCourses(r.data.courses || [])).catch(() => {});
    getWorkshops().then(r => setWorkshops(r.data.workshops || [])).catch(() => {});
  }, []);

  const handleJoin = async (e) => {
    e.preventDefault();
    setJoinLoading(true);
    try {
      const { joinWorkshop } = await import('../utils/api');
      const r = await joinWorkshop(selectedWorkshop._id, joinForm);
      setJoinResult(r.data.meetUrl);
    } catch {
      setJoinResult('error');
    }
    setJoinLoading(false);
  };

  return (
    <>
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="container">
          <div className="hero-content">
            <div className="hero-eyebrow animate-fadeUp">
              <span className="dot" />
              Free courses live now — 2 new videos every week
            </div>
            <h1 className="display-xl hero-title animate-fadeUp delay-1">
              Learn <span className="gradient-text">Cybersecurity</span><br />
              &amp; Cloud. For Free.
            </h1>
            <p className="lead hero-desc animate-fadeUp delay-2">
              Pragni is built to make world-class tech skills accessible to everyone.
              AWS, Azure, SOC, Pentesting, Networking — free and affordable, always.
            </p>
            <div className="hero-actions animate-fadeUp delay-3">
              <Link to="/courses" className="btn btn-primary btn-lg">Browse Courses →</Link>
              <Link to="/workshops" className="btn btn-outline btn-lg">Live Workshops</Link>
            </div>
            <div className="hero-stats animate-fadeUp delay-4">
              {[
                { num: '8+', lbl: 'Course tracks' },
                { num: '100%', lbl: 'Free to start' },
                { num: '2/wk', lbl: 'New videos' },
                { num: '0', lbl: 'Hidden fees' },
              ].map(s => (
                <div key={s.lbl} className="hero-stat">
                  <span className="num gradient-text">{s.num}</span>
                  <span className="lbl">{s.lbl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="section-sm" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
            {Object.entries(CAT_MAP).map(([slug, { label, icon, color }]) => (
              <Link key={slug} to={`/courses?category=${slug}`}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '18px 12px', borderRadius: 14, background: 'var(--bg3)', border: '1px solid var(--border)', transition: 'all 0.2s', textAlign: 'center', fontSize: 13, fontWeight: 500, color: 'var(--text2)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = ''; e.currentTarget.style.transform = ''; }}
              >
                <span style={{ fontSize: 28 }}>{icon}</span>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE WORKSHOPS ── */}
      {workshops.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div className="eyebrow">Live Sessions</div>
              <h2>Upcoming Workshops &amp; Classes</h2>
              <p>Join live instructor-led sessions. Interactive, hands-on, free.</p>
            </div>
            <div className="grid-2">
              {workshops.slice(0, 4).map(w => (
                <WorkshopBanner key={w._id} workshop={w} onClick={() => setSelectedWorkshop(w)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURED COURSES ── */}
      <section className="section" style={{ background: 'var(--bg2)' }}>
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Learn Today</div>
            <h2>Free Courses — Start Instantly</h2>
            <p>No signup required. Just click and start learning.</p>
          </div>
          {courses.length === 0
            ? <div className="empty-state"><div className="icon">📚</div><p>Courses coming soon. Check back weekly!</p></div>
            : <div className="grid-3">
                {courses.slice(0, 6).map(c => <CourseCard key={c._id} course={c} />)}
              </div>
          }
          {courses.length > 6 && (
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <Link to="/courses" className="btn btn-outline btn-lg">View All Courses →</Link>
            </div>
          )}
        </div>
      </section>

      {/* ── MISSION STRIP ── */}
      <section className="section-sm" style={{ background: 'var(--accent-bg)', borderTop: '1px solid rgba(108,71,255,0.2)', borderBottom: '1px solid rgba(108,71,255,0.2)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p className="serif" style={{ fontSize: 'clamp(20px,3vw,30px)', color: 'var(--accent3)', marginBottom: 16 }}>
            "Every learner deserves world-class tech education."
          </p>
          <p style={{ fontSize: 15, color: 'var(--text2)', maxWidth: 560, margin: '0 auto 24px' }}>
            Pragni was founded with one mission: break the paywall on cybersecurity and cloud education.
            Whether you're a student, career-changer, or professional — we've got you.
          </p>
          <Link to="/about" className="btn btn-outline">Our Mission →</Link>
        </div>
      </section>

      {/* ── WORKSHOP JOIN MODAL ── */}
      {selectedWorkshop && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedWorkshop(null)}>
          <div className="modal">
            <div className="modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span className="live-badge"><span className="live-dot" />LIVE</span>
                  <span className="tag">{new Date(selectedWorkshop.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 600 }}>{selectedWorkshop.title}</h3>
              </div>
              <button className="modal-close" onClick={() => { setSelectedWorkshop(null); setJoinResult(null); }}>✕</button>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 20 }}>{selectedWorkshop.description}</p>

            {joinResult
              ? joinResult === 'error'
                ? <div className="tag red" style={{ borderRadius: 10, padding: '12px 16px', fontSize: 14 }}>⚠️ Could not retrieve join link. Try again.</div>
                : <div style={{ padding: 16, background: 'var(--green-bg)', borderRadius: 12, border: '1px solid rgba(0,153,112,0.25)' }}>
                    <p style={{ fontSize: 13, color: 'var(--green)', marginBottom: 10, fontWeight: 600 }}>✅ You're registered! Join via Google Meet:</p>
                    <a href={joinResult} target="_blank" rel="noopener noreferrer" className="btn btn-green" style={{ width: '100%' }}>Open Google Meet →</a>
                  </div>
              : <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="input-group">
                    <label className="input-label">Your Name</label>
                    <input className="input" placeholder="John Doe" required value={joinForm.name} onChange={e => setJoinForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Email Address</label>
                    <input type="email" className="input" placeholder="you@email.com" required value={joinForm.email} onChange={e => setJoinForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 4 }} disabled={joinLoading}>
                    {joinLoading ? 'Getting link...' : 'Get Join Link →'}
                  </button>
                </form>
            }
          </div>
        </div>
      )}
    </>
  );
}
