import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourse, getVideoToken, getStreamUrl, getVideoResources, getComments, postComment } from '../utils/api';

/* ─── STYLES ──────────────────────────────────────────────────────────────────── */
const CD_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Cabinet+Grotesk:wght@300;400;500;700;800&family=Outfit:wght@300;400;500;600&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');

  :root {
    --ink:        #08090f;
    --ink2:       #0d0f1a;
    --ink3:       #111420;
    --ink4:       #161924;
    --surface:    #1a1d2e;
    --surface2:   #1f2335;
    --lift:       #242840;
    --border:     rgba(255,255,255,0.055);
    --border2:    rgba(255,255,255,0.10);
    --border3:    rgba(255,255,255,0.18);
    --text:       #eef0ff;
    --text2:      #8b91b8;
    --text3:      #4a4f72;
    --violet:     #7b5ea7;
    --violet2:    #9d7fd4;
    --violet3:    #c4a8ff;
    --cyan:       #4fc3f7;
    --teal:       #26d0a1;
    --rose:       #f06292;
    --amber:      #ffca28;
    --emerald:    #00e676;
    --indigo:     #5c6bc0;
    --accent:     #7b5ea7;
    --accent2:    #c4a8ff;
    --accent3:    #e0d4ff;
    --green:      #26d0a1;
    --green-bg:   rgba(38,208,161,0.07);
    --bg4:        #0d0f1a;
    --font-display: 'Clash Display', 'Cabinet Grotesk', sans-serif;
    --font-body:    'Plus Jakarta Sans', 'Outfit', sans-serif;
    --ease:       cubic-bezier(0.16, 1, 0.3, 1);
    --r:          18px;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  ::selection { background: rgba(157,127,212,0.28); color: #fff; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: var(--ink2); }
  ::-webkit-scrollbar-thumb { background: var(--lift); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--violet); }

  /* ── Aurora background ── */
  .cd-aurora {
    position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
  }
  .cd-blob {
    position: absolute; border-radius: 50%; filter: blur(90px);
    will-change: transform; mix-blend-mode: screen;
  }
  .cd-b1 {
    width: 600px; height: 600px;
    background: radial-gradient(circle at 40% 40%, rgba(123,94,167,0.22) 0%, rgba(79,195,247,0.08) 50%, transparent 70%);
    top: -150px; left: -100px;
    animation: cdBlob1 22s ease-in-out infinite alternate;
  }
  .cd-b2 {
    width: 500px; height: 500px;
    background: radial-gradient(circle at 60% 40%, rgba(38,208,161,0.15) 0%, rgba(123,94,167,0.1) 55%, transparent 70%);
    bottom: 0; right: -80px;
    animation: cdBlob2 28s ease-in-out infinite alternate;
  }
  @keyframes cdBlob1 { from{transform:translate(0,0) scale(1)} to{transform:translate(60px,80px) scale(1.1)} }
  @keyframes cdBlob2 { from{transform:translate(0,0) scale(1.05)} to{transform:translate(-50px,60px) scale(0.95)} }

  .cd-mesh {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.016) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.016) 1px, transparent 1px);
    background-size: 72px 72px;
    mask-image: radial-gradient(ellipse 90% 70% at 50% 30%, rgba(0,0,0,0.4), transparent);
  }

  .cd-noise {
    position: fixed; inset: 0; pointer-events: none; z-index: 1; opacity: 0.025;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  /* ── Layout ── */
  .player-layout {
    display: grid;
    grid-template-columns: 1fr 340px;
    min-height: 100vh;
    background: var(--ink);
    font-family: var(--font-body);
    color: var(--text);
    position: relative;
  }

  .player-main {
    display: flex; flex-direction: column;
    overflow-y: auto; position: relative; z-index: 3;
    border-right: 1px solid var(--border);
  }

  /* ── Video frame ── */
  .player-frame {
    width: 100%;
    aspect-ratio: 16/9;
    background: var(--ink2);
    position: relative;
    overflow: hidden;
  }
  .player-frame iframe {
    width: 100%; height: 100%; border: none; display: block;
  }
  .player-frame-empty {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    flex-direction: column; gap: 14px; color: var(--text3);
    background: linear-gradient(135deg, var(--ink3) 0%, var(--surface) 100%);
    position: relative;
  }
  .player-frame-empty::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(circle at 50% 50%, rgba(123,94,167,0.12), transparent 60%);
  }
  .player-frame-empty-icon { font-size: 56px; position: relative; z-index: 1; }
  .player-frame-empty-text { font-size: 14px; color: var(--text3); position: relative; z-index: 1; font-weight: 300; }

  /* ── Video info bar ── */
  .player-info {
    padding: 22px 28px;
    border-bottom: 1px solid var(--border);
    background: rgba(26,29,46,0.6);
    backdrop-filter: blur(20px);
  }
  .player-breadcrumb {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 14px; flex-wrap: wrap;
  }
  .player-breadcrumb a {
    font-size: 13px; color: var(--text3);
    text-decoration: none; transition: color 0.2s;
  }
  .player-breadcrumb a:hover { color: var(--violet3); }
  .player-breadcrumb-sep { color: var(--border2); font-size: 12px; }

  .player-course-title {
    font-family: var(--font-display);
    font-size: 22px; font-weight: 700;
    letter-spacing: -0.02em; margin-bottom: 6px;
    line-height: 1.3;
  }
  .player-video-title {
    font-size: 14px; font-weight: 500;
    color: var(--text2); margin-bottom: 14px;
    display: flex; align-items: center; gap: 8px;
  }
  .player-video-title::before {
    content: '▶';
    font-size: 10px; color: var(--violet3);
  }

  .player-resources {
    display: flex; gap: 8px; flex-wrap: wrap;
  }
  .player-resource-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 100px;
    font-size: 12px; font-weight: 600;
    background: rgba(123,94,167,0.1);
    border: 1px solid rgba(157,127,212,0.25);
    color: var(--violet3);
    text-decoration: none;
    transition: all 0.25s var(--ease);
  }
  .player-resource-btn:hover {
    background: rgba(123,94,167,0.2);
    border-color: rgba(157,127,212,0.5);
    transform: translateY(-2px);
  }

  /* ── Tabs ── */
  .player-tabs {
    display: flex;
    border-bottom: 1px solid var(--border);
    padding: 0 28px; gap: 4px;
    background: rgba(13,15,26,0.5);
  }
  .player-tab {
    padding: 14px 18px;
    background: none; border: none;
    border-bottom: 2px solid transparent;
    color: var(--text3);
    font-weight: 500; font-size: 13px;
    cursor: pointer;
    text-transform: capitalize;
    transition: all 0.2s;
    font-family: var(--font-body);
    letter-spacing: 0.02em;
  }
  .player-tab:hover { color: var(--text2); }
  .player-tab.active {
    color: var(--violet3);
    border-bottom-color: var(--violet);
  }

  /* ── Syllabus ── */
  .syllabus-wrap { padding: 28px; }
  .syllabus-title {
    font-family: var(--font-display);
    font-size: 17px; font-weight: 700;
    margin-bottom: 22px; letter-spacing: -0.01em;
  }
  .syllabus-week {
    margin-bottom: 22px;
    padding-bottom: 22px;
    border-bottom: 1px solid var(--border);
  }
  .syllabus-week:last-child { border-bottom: none; }
  .syllabus-week-title {
    font-weight: 700; font-size: 14px;
    margin-bottom: 12px;
    color: var(--text);
    display: flex; align-items: center; gap: 10px;
  }
  .syllabus-week-title::before {
    content: '';
    width: 8px; height: 8px; border-radius: 50%;
    background: linear-gradient(135deg, var(--violet), var(--cyan));
    flex-shrink: 0;
    box-shadow: 0 0 8px rgba(123,94,167,0.6);
  }
  .syllabus-topics { list-style: none; display: flex; flex-direction: column; gap: 8px; }
  .syllabus-topic {
    font-size: 13px; color: var(--text2);
    padding-left: 20px; position: relative;
    line-height: 1.5; font-weight: 300;
  }
  .syllabus-topic::before {
    content: '▸';
    position: absolute; left: 0;
    color: var(--violet3); font-size: 10px;
    top: 2px;
  }

  /* ── Comments ── */
  .comment-section { padding: 28px; }
  .comment-section-title {
    font-family: var(--font-display);
    font-size: 17px; font-weight: 700;
    margin-bottom: 22px; letter-spacing: -0.01em;
  }

  .comment-form {
    background: rgba(26,29,46,0.7);
    border: 1px solid var(--border2);
    border-radius: 16px; padding: 20px;
    margin-bottom: 24px;
    backdrop-filter: blur(16px);
    display: flex; flex-direction: column; gap: 14px;
    position: relative; overflow: hidden;
  }
  .comment-form::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(157,127,212,0.4), transparent);
  }

  .cd-input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .cd-input-group { display: flex; flex-direction: column; gap: 6px; }
  .cd-label {
    font-size: 11px; font-weight: 700;
    color: var(--text3); letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .cd-input {
    background: var(--ink2);
    border: 1px solid var(--border2);
    border-radius: 10px; padding: 10px 14px;
    color: var(--text); font-size: 13px;
    font-family: var(--font-body); outline: none; width: 100%;
    transition: border-color 0.25s, box-shadow 0.25s;
    resize: none;
  }
  .cd-input::placeholder { color: var(--text3); }
  .cd-input:focus {
    border-color: var(--violet);
    box-shadow: 0 0 0 3px rgba(123,94,167,0.15);
  }

  .comment-form-footer {
    display: flex; align-items: center;
    gap: 10px; justify-content: space-between;
  }
  .cd-checkbox-label {
    display: flex; align-items: center; gap: 8px;
    font-size: 12px; color: var(--text2); cursor: pointer;
  }
  .cd-checkbox-label input[type="checkbox"] {
    accent-color: var(--violet);
    width: 14px; height: 14px;
  }

  .cd-submit-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 20px; border-radius: 100px;
    background: linear-gradient(135deg, var(--violet), var(--indigo));
    color: #fff; font-size: 12px; font-weight: 700;
    border: none; cursor: pointer;
    font-family: var(--font-body); letter-spacing: 0.03em;
    transition: all 0.3s var(--ease);
    box-shadow: 0 0 20px rgba(123,94,167,0.4);
  }
  .cd-submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 0 35px rgba(123,94,167,0.6);
  }
  .cd-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .cd-success-note {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 9px 16px; border-radius: 100px;
    background: rgba(38,208,161,0.1);
    border: 1px solid rgba(38,208,161,0.3);
    color: var(--teal); font-size: 12px; font-weight: 600;
  }

  .comment-empty {
    text-align: center; padding: 36px 24px;
    color: var(--text3); font-size: 13px; font-weight: 300;
  }

  .comment-item {
    background: rgba(26,29,46,0.5);
    border: 1px solid var(--border);
    border-radius: 14px; padding: 16px;
    margin-bottom: 12px;
    transition: border-color 0.25s;
  }
  .comment-item:hover { border-color: rgba(157,127,212,0.2); }
  .comment-item-header {
    display: flex; justify-content: space-between;
    align-items: flex-start; margin-bottom: 10px;
  }
  .comment-author {
    font-size: 13px; font-weight: 700; color: var(--text);
    margin-bottom: 2px;
  }
  .comment-time { font-size: 11px; color: var(--text3); }
  .comment-badges { display: flex; gap: 6px; }
  .cd-badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.05em;
    padding: 3px 10px; border-radius: 100px;
  }
  .cd-badge-amber {
    background: rgba(255,202,40,0.1);
    border: 1px solid rgba(255,202,40,0.3);
    color: var(--amber);
  }
  .cd-badge-green {
    background: rgba(38,208,161,0.1);
    border: 1px solid rgba(38,208,161,0.3);
    color: var(--teal);
  }
  .comment-text {
    font-size: 13px; color: var(--text2);
    line-height: 1.65; font-weight: 300;
    margin-bottom: 8px;
  }
  .comment-reply {
    background: rgba(123,94,167,0.08);
    border-left: 2px solid var(--violet);
    border-radius: 0 8px 8px 0;
    padding: 10px 14px;
    font-size: 12px; color: var(--text2);
    line-height: 1.6;
  }

  /* ── Sidebar ── */
  .player-sidebar {
    background: rgba(13,15,26,0.9);
    border-left: 1px solid var(--border);
    overflow-y: auto;
    position: sticky; top: 0; height: 100vh;
    display: flex; flex-direction: column;
    position: relative; z-index: 3;
  }
  .sidebar-header {
    padding: 18px 20px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(26,29,46,0.8);
    backdrop-filter: blur(20px);
    position: sticky; top: 0; z-index: 2;
  }
  .sidebar-course-name {
    font-size: 13px; font-weight: 700;
    color: var(--text); line-height: 1.3;
    max-width: 200px;
  }
  .sidebar-count {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 11px; font-weight: 700;
    padding: 4px 10px; border-radius: 100px;
    background: rgba(123,94,167,0.12);
    border: 1px solid rgba(157,127,212,0.2);
    color: var(--violet3); white-space: nowrap;
  }
  .sidebar-week-label {
    padding: 10px 20px 6px;
    font-size: 10px; font-weight: 800;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--text3);
    background: rgba(8,9,15,0.6);
    border-bottom: 1px solid var(--border);
  }

  .video-list-item {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 13px 20px;
    cursor: pointer; border-bottom: 1px solid var(--border);
    transition: all 0.2s var(--ease);
    position: relative;
  }
  .video-list-item::before {
    content: '';
    position: absolute; left: 0; top: 0; bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, var(--violet), var(--cyan));
    opacity: 0; transition: opacity 0.2s;
  }
  .video-list-item:hover { background: rgba(123,94,167,0.06); }
  .video-list-item:hover::before { opacity: 0.5; }
  .video-list-item.active {
    background: rgba(123,94,167,0.1);
    border-bottom-color: rgba(157,127,212,0.15);
  }
  .video-list-item.active::before { opacity: 1; }

  .vli-num {
    font-family: var(--font-display);
    font-size: 11px; font-weight: 700;
    color: var(--text3); min-width: 22px; margin-top: 1px;
    letter-spacing: 0.02em;
  }
  .video-list-item.active .vli-num { color: var(--violet3); }
  .vli-info { flex: 1; min-width: 0; }
  .vli-title {
    font-size: 13px; font-weight: 500;
    color: var(--text2); line-height: 1.45;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    transition: color 0.2s;
  }
  .video-list-item.active .vli-title,
  .video-list-item:hover .vli-title { color: var(--text); }
  .vli-dur {
    font-size: 11px; color: var(--text3); margin-top: 3px;
  }

  /* ── Category tag ── */
  .cd-cat-tag {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 11px; font-weight: 600; letter-spacing: 0.03em;
    padding: 5px 12px; border-radius: 100px;
    border: 1px solid;
  }

  /* ── Loading ── */
  .loading-screen {
    min-height: 100vh; background: var(--ink);
    display: flex; align-items: center; justify-content: center;
  }
  .spinner {
    width: 36px; height: 36px; border-radius: 50%;
    border: 2px solid var(--border2);
    border-top-color: var(--violet);
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .cd-not-found {
    min-height: 100vh; background: var(--ink);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-body); color: var(--text3); font-size: 15px;
  }

  /* ── Responsive ── */
  @media (max-width: 860px) {
    .player-layout { grid-template-columns: 1fr; }
    .player-sidebar { position: relative; height: auto; border-left: none; border-top: 1px solid var(--border); }
    .cd-input-row { grid-template-columns: 1fr; }
  }
`;

const CAT_MAP = {
  aws: { label: 'AWS Cloud', icon: '', color: '#ff9900' },
  azure: { label: 'Azure', icon: '', color: '#0078d4' },
  cybersecurity: { label: 'Cybersecurity', icon: '', color: '#ff4757' },
  soc: { label: 'SOC', icon: '', color: '#00d4a1' },
  'pentesting-web': { label: 'Web Pentest', icon: '', color: '#ffa502' },
  'pentesting-network': { label: 'Network Pentest', icon: '', color: '#ff6b35' },
  'pentesting-api': { label: 'API Pentest', icon: '', color: '#a29bfe' },
  networking: { label: 'Networking', icon: '', color: '#6c47ff' },
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
      await postComment({
        videoId,
        userName: form.name,
        userEmail: form.email,
        content: form.content,
        isDoubt: form.isDoubt
      });
      setSuccess(true);
      setForm({ name: '', email: '', content: '', isDoubt: false });
    } catch {}
    setLoading(false);
  };

  return (
    <div className="comment-section">
      <div className="comment-section-title">Comments &amp; Doubts</div>

      <div className="comment-form">
        {success && (
          <div className="cd-success-note">✅ Submitted! Pending moderation.</div>
        )}
        <div className="cd-input-row">
          <div className="cd-input-group">
            <label className="cd-label">Name</label>
            <input className="cd-input" required placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="cd-input-group">
            <label className="cd-label">Email</label>
            <input type="email" className="cd-input" required placeholder="your@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
        </div>
        <div className="cd-input-group">
          <label className="cd-label">Comment / Doubt</label>
          <textarea className="cd-input" rows={3} required placeholder="Ask your question or leave a comment..." value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
        </div>
        <div className="comment-form-footer">
          <label className="cd-checkbox-label">
            <input type="checkbox" checked={form.isDoubt} onChange={e => setForm(f => ({ ...f, isDoubt: e.target.checked }))} />
            Mark as a doubt/question
          </label>
          <button className="cd-submit-btn" onClick={submit} disabled={loading}>
            {loading ? 'Posting...' : 'Post →'}
          </button>
        </div>
      </div>

      {comments.length === 0
        ? <div className="comment-empty">No approved comments yet. Be the first!</div>
        : comments.map(c => (
          <div key={c._id} className="comment-item">
            <div className="comment-item-header">
              <div>
                <div className="comment-author">{c.userName}</div>
                <div className="comment-time">{new Date(c.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="comment-badges">
                {c.isDoubt && <span className="cd-badge cd-badge-amber"> Doubt</span>}
                {c.isResolved && <span className="cd-badge cd-badge-green">✅ Resolved</span>}
              </div>
            </div>
            <div className="comment-text">{c.content}</div>
            {c.reply && <div className="comment-reply"> <strong>Trainer:</strong> {c.reply}</div>}
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
  const [activeTab, setActiveTab] = useState('videos');

  useEffect(() => {
    if (!document.getElementById('pragni-cd-styles')) {
      const el = document.createElement('style');
      el.id = 'pragni-cd-styles';
      el.textContent = CD_STYLES;
      document.head.appendChild(el);
    }
  }, []);

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

  if (loading) return (
    <div className="loading-screen">
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" />
      </div>
    </div>
  );

  if (!data) return (
    <div className="cd-not-found">Course not found.</div>
  );

  const { course, videos = [] } = data;
  const cat = CAT_MAP[course.category] || {};
  const grouped = videos.reduce((acc, v) => {
    const w = v.weekNumber || 1;
    if (!acc[w]) acc[w] = [];
    acc[w].push(v);
    return acc;
  }, {});

  return (
    <>
      {/* Aurora background */}
      <div className="cd-aurora">
        <div className="cd-blob cd-b1" />
        <div className="cd-blob cd-b2" />
      </div>
      <div className="cd-mesh" />
      <div className="cd-noise" />

      <div className="player-layout">
        {/* ── Main ── */}
        <div className="player-main">
          {/* Video frame */}
          <div className="player-frame">
            {streamUrl
              ? <iframe src={streamUrl} title={activeVideo?.title} allowFullScreen allow="autoplay; fullscreen" />
              : (
                <div className="player-frame-empty">
                  <div className="player-frame-empty-icon">{cat.icon || '▶️'}</div>
                  <div className="player-frame-empty-text">
                    {videos.length > 0 ? 'Select a video to start' : 'No videos yet'}
                  </div>
                </div>
              )
            }
          </div>

          {/* Video info */}
          <div className="player-info">
            <div className="player-breadcrumb">
              <Link to="/courses">← Courses</Link>
              <span className="player-breadcrumb-sep">/</span>
              {cat.color && (
                <span
                  className="cd-cat-tag"
                  style={{ color: cat.color, borderColor: `${cat.color}33`, background: `${cat.color}12` }}
                >
                  {cat.icon} {cat.label}
                </span>
              )}
            </div>
            <div className="player-course-title">{course.title}</div>
            {activeVideo && (
              <div className="player-video-title">{activeVideo.title}</div>
            )}
            {resources.length > 0 && (
              <div className="player-resources">
                {resources.map((r, i) => (
                  <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="player-resource-btn">
                    {r.type === 'pdf' ? '' : r.type === 'gdrive' ? '' : r.type === 'notes' ? '' : '↗'} {r.title}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="player-tabs">
            {['videos', 'syllabus', 'comments'].map(tab => (
              <button
                key={tab}
                className={`player-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'syllabus' && (
            <div className="syllabus-wrap">
              <div className="syllabus-title">Course Syllabus</div>
              {course.syllabus?.length > 0
                ? course.syllabus.map((week, i) => (
                  <div key={i} className="syllabus-week">
                    <div className="syllabus-week-title">Week {week.weekNumber}: {week.title}</div>
                    <ul className="syllabus-topics">
                      {week.topics?.map((t, j) => (
                        <li key={j} className="syllabus-topic">{t}</li>
                      ))}
                    </ul>
                  </div>
                ))
                : <p style={{ color: 'var(--text3)', fontSize: 14, fontWeight: 300 }}>Syllabus coming soon.</p>
              }
            </div>
          )}

          {activeTab === 'comments' && <CommentSection videoId={activeVideo?._id} />}
        </div>

        {/* ── Sidebar ── */}
        <div className="player-sidebar">
          <div className="sidebar-header">
            <div className="sidebar-course-name">{course.title}</div>
            <span className="sidebar-count">{videos.length} videos</span>
          </div>
          {Object.entries(grouped).map(([week, vids]) => (
            <div key={week}>
              <div className="sidebar-week-label">Week {week}</div>
              {vids.map((v, i) => (
                <div
                  key={v._id}
                  className={`video-list-item ${activeVideo?._id === v._id ? 'active' : ''}`}
                  onClick={() => loadVideo(v)}
                >
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
    </>
  );
}
