import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourse, getVideoToken, getStreamUrl, getVideoResources, getComments, postComment } from '../utils/api';

const CAT_MAP = {
  aws: { label: 'AWS Cloud', icon: '☁️', color: '#ff9900' },
  azure: { label: 'Azure', icon: '🔷', color: '#0078d4' },
  cybersecurity: { label: 'Cybersecurity', icon: '🛡️', color: '#ff4757' },
  soc: { label: 'SOC', icon: '🔍', color: '#00d4a1' },
  'pentesting-web': { label: 'Web Pentest', icon: '🕸️', color: '#ffa502' },
  'pentesting-network': { label: 'Network Pentest', icon: '🌐', color: '#ff6b35' },
  'pentesting-api': { label: 'API Pentest', icon: '⚡', color: '#a29bfe' },
  networking: { label: 'Networking', icon: '📡', color: '#6c47ff' },
};

function CommentSection({ videoId }) {
  const [comments, setComments] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', content: '', isDoubt: false });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!videoId) return;
    getComments(videoId).then(r => setComments(r.data.comments || [])).catch(() => {});
  }, [videoId]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await postComment({ videoId, ...form });
      setSuccess(true);
      setForm({ name: '', email: '', content: '', isDoubt: false });
    } catch {}
    setLoading(false);
  };

  return (
    <div className="comment-section">
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Comments & Doubts</h3>

      <div className="comment-form">
        {success && <div className="tag green" style={{ borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>✅ Submitted! Pending moderation.</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="input-group">
            <label className="input-label">Name</label>
            <input className="input" required placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input type="email" className="input" required placeholder="your@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
        </div>
        <div className="input-group">
          <label className="input-label">Comment / Doubt</label>
          <textarea className="input" rows={3} required placeholder="Ask your question or leave a comment..." value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text2)', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isDoubt} onChange={e => setForm(f => ({ ...f, isDoubt: e.target.checked }))} />
            Mark as a doubt/question
          </label>
          <button className="btn btn-primary btn-sm" onClick={submit} disabled={loading}>
            {loading ? 'Posting...' : 'Post →'}
          </button>
        </div>
      </div>

      {comments.length === 0
        ? <p style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', padding: 24 }}>No approved comments yet. Be the first!</p>
        : comments.map(c => (
          <div key={c._id} className="comment-item">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="comment-author">{c.userName}</div>
                <div className="comment-time">{new Date(c.createdAt).toLocaleDateString()}</div>
              </div>
              {c.isDoubt && <span className="badge badge-amber">❓ Doubt</span>}
              {c.isResolved && <span className="badge badge-green">✅ Resolved</span>}
            </div>
            <div className="comment-text">{c.content}</div>
            {c.reply && <div className="comment-reply">💬 <strong>Trainer:</strong> {c.reply}</div>}
          </div>
        ))
      }
    </div>
  );
}

export default function CourseDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);
  const [streamUrl, setStreamUrl] = useState(null);
  const [resources, setResources] = useState([]);
  const [activeTab, setActiveTab] = useState('videos'); // videos | syllabus | comments

  useEffect(() => {
    getCourse(slug).then(r => {
      setData(r.data);
      if (r.data.videos?.length > 0) loadVideo(r.data.videos[0]);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  const loadVideo = async (video) => {
    setActiveVideo(video);
    setStreamUrl(null);
    setResources([]);
    try {
      const tokenRes = await getVideoToken(video._id);
      setStreamUrl(getStreamUrl(tokenRes.data.token));
      const resRes = await getVideoResources(video._id);
      setResources(resRes.data.resources || []);
    } catch {}
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!data) return <div className="section"><div className="container"><div className="empty-state"><div className="icon">😕</div><p>Course not found.</p></div></div></div>;

  const { course, videos = [] } = data;
  const cat = CAT_MAP[course.category] || {};
  const grouped = videos.reduce((acc, v) => {
    const w = v.weekNumber || 1;
    if (!acc[w]) acc[w] = [];
    acc[w].push(v);
    return acc;
  }, {});

  return (
    <div className="player-layout">
      {/* ── Main ── */}
      <div className="player-main">
        {/* Video frame */}
        <div className="player-frame">
          {streamUrl
            ? <iframe src={streamUrl} title={activeVideo?.title} allowFullScreen allow="autoplay; fullscreen" />
            : <div style={{ width: '100%', height: '100%', background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--text3)' }}>
                <span style={{ fontSize: 48 }}>{cat.icon || '▶️'}</span>
                <span>{videos.length > 0 ? 'Select a video' : 'No videos yet'}</span>
              </div>
          }
        </div>

        {/* Video info */}
        <div className="player-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
            <Link to="/courses" style={{ fontSize: 13, color: 'var(--text3)' }}>← Courses</Link>
            <span style={{ color: 'var(--border2)' }}>/</span>
            <span className="tag" style={cat.color ? { color: cat.color, borderColor: `${cat.color}33`, background: `${cat.color}14` } : {}}>{cat.icon} {cat.label}</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{course.title}</h1>
          {activeVideo && <h2 style={{ fontSize: 15, fontWeight: 500, color: 'var(--text2)', marginBottom: 12 }}>▶ {activeVideo.title}</h2>}

          {/* Resources */}
          {resources.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              {resources.map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                  {r.type === 'pdf' ? '📄' : r.type === 'gdrive' ? '📁' : r.type === 'notes' ? '📝' : '🔗'} {r.title}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 24px', gap: 4 }}>
          {['videos', 'syllabus', 'comments'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: '14px 16px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === tab ? 'var(--accent)' : 'transparent'}`, color: activeTab === tab ? 'var(--accent2)' : 'var(--text3)', fontWeight: 500, fontSize: 14, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s' }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'syllabus' && (
          <div style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Course Syllabus</h3>
            {course.syllabus?.length > 0
              ? course.syllabus.map((week, i) => (
                <div key={i} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Week {week.weekNumber}: {week.title}</div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {week.topics?.map((t, j) => <li key={j} style={{ fontSize: 14, color: 'var(--text2)', paddingLeft: 16, position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 0, color: 'var(--accent2)' }}>▸</span>{t}
                    </li>)}
                  </ul>
                </div>
              ))
              : <p style={{ color: 'var(--text3)', fontSize: 14 }}>Syllabus coming soon.</p>
            }
          </div>
        )}
        {activeTab === 'comments' && <CommentSection videoId={activeVideo?._id} />}
      </div>

      {/* ── Sidebar: video list ── */}
      <div className="player-sidebar">
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{course.title}</span>
          <span className="tag">{videos.length} videos</span>
        </div>
        {Object.entries(grouped).map(([week, vids]) => (
          <div key={week}>
            <div className="sidebar-title">Week {week}</div>
            {vids.map((v, i) => (
              <div key={v._id} className={`video-list-item ${activeVideo?._id === v._id ? 'active' : ''}`} onClick={() => loadVideo(v)}>
                <div className="vli-num">{String(i + 1).padStart(2, '0')}</div>
                <div className="vli-info">
                  <div className="vli-title">{v.title}</div>
                  {v.duration && <div className="vli-dur">⏱ {v.duration}</div>}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
