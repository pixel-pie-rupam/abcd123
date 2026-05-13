import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '../AdminContext';
import { adminGet, adminPost, adminPut, adminDelete } from '../../utils/api';

const RESOURCE_TYPES = ['pdf', 'gdrive', 'notes', 'link'];

const EMPTY_VIDEO = {
  title: '', description: '', youtubeId: '',
  videoType: 'unlisted', // FIX #7 — added
  weekNumber: 1, order: 0, duration: '',
  isPublished: false, resources: [],
};
const EMPTY_RES = { type: 'pdf', title: '', url: '' };

// SVG icons — no emoji
const ResIcon = ({ type }) => {
  const icons = {
    pdf: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    gdrive: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 10.1"/><path d="M22 16.92l-3 3-3-3"/></svg>,
    notes: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    link: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  };
  return icons[type] || icons.link;
};

const LockIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const GlobeIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

export default function VideosAdmin() {
  const { courseId } = useParams();
  const { token } = useAdmin();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_VIDEO);
  const [saving, setSaving] = useState(false);
  const [resInput, setResInput] = useState(EMPTY_RES);
  const navigate = useNavigate();
  const adminPath = window.location.pathname.split('/')[1];

  const load = () => {
    setLoading(true);
    adminGet(`/courses/${courseId}/videos`, token)
      .then(r => setVideos(r.data.videos || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, [courseId, token]);

  const openCreate = () => { setForm({ ...EMPTY_VIDEO, resources: [] }); setModal('create'); };
  const openEdit   = (v) => { setForm({ ...v, resources: v.resources || [] }); setModal('edit'); };

  const save = async () => {
    if (!form.title.trim())    return alert('Video title is required');
    if (!form.youtubeId.trim()) return alert('YouTube video ID is required');
    // Validate YT ID format
    if (!/^[a-zA-Z0-9_-]{7,15}$/.test(form.youtubeId.trim())) {
      return alert('Invalid YouTube video ID. Paste only the ID (e.g. dQw4w9WgXcQ), not the full URL.');
    }
    setSaving(true);
    try {
      if (modal === 'create') await adminPost(`/courses/${courseId}/videos`, form, token);
      else await adminPut(`/videos/${form._id}`, form, token);
      setModal(null);
      load();
    } catch (err) { alert(err.response?.data?.error || 'Error saving video'); }
    setSaving(false);
  };

  const del = async (id) => {
    if (!window.confirm('Delete this video? This cannot be undone.')) return;
    await adminDelete(`/videos/${id}`, token);
    load();
  };

  const addResource = () => {
    if (!resInput.title.trim() || !resInput.url.trim()) {
      return alert('Resource title and URL are both required');
    }
    setForm(f => ({ ...f, resources: [...(f.resources || []), { ...resInput }] }));
    setResInput(EMPTY_RES);
  };

  const removeResource = (i) => setForm(f => ({ ...f, resources: f.resources.filter((_, j) => j !== i) }));
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="adm-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => navigate(`/${adminPath}/courses`)}>
            ← Back
          </button>
          <div>
            <h1 className="adm-header-title">Videos</h1>
            <p className="adm-header-sub">Course ID: {courseId}</p>
          </div>
        </div>
        <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={openCreate}>+ Add Video</button>
      </div>

      <div className="adm-body">
        {/* Security note — SVG icon, no emoji */}
        <div className="adm-info adm-info-amber" style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{ flexShrink: 0, marginTop: 1 }}><LockIcon /></span>
          <span>
            <strong>Security:</strong> YouTube video IDs and resource URLs are AES-256 encrypted in the database.
            Both <strong>unlisted</strong> and <strong>listed</strong> YouTube video IDs are supported — choose the correct type below.
            Resource URLs are served via time-limited authenticated tokens only.
          </span>
        </div>

        {loading ? (
          <div className="adm-skeleton" style={{ height: 200, borderRadius: 14 }} />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Title</th>
                  <th>Week</th>
                  <th>Type</th>
                  <th>Duration</th>
                  <th>Resources</th>
                  <th>Published</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: 48, color: 'var(--text3)' }}>
                      No videos yet. Add your first video.
                    </td>
                  </tr>
                ) : videos.map((v, i) => (
                  <tr key={v._id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text3)' }}>
                      W{v.weekNumber}/{v.order ?? i + 1}
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--text)', maxWidth: 200 }}>
                      {v.title}
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, fontFamily: 'monospace' }}>
                        ID: {v.youtubeId ? '●●●●●●●●●' : '—'}
                      </div>
                    </td>
                    <td>Week {v.weekNumber}</td>
                    <td>
                      {/* FIX #7 — show video type badge */}
                      <span className={`adm-badge ${v.videoType === 'listed' ? 'adm-badge-cyan' : 'adm-badge-amber'}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        {v.videoType === 'listed' ? <GlobeIcon /> : <LockIcon />}
                        {v.videoType === 'listed' ? 'Listed' : 'Unlisted'}
                      </span>
                    </td>
                    <td style={{ fontSize: 13 }}>{v.duration || '—'}</td>
                    <td>
                      <span className="adm-badge adm-badge-violet">{(v.resources || []).length}</span>
                    </td>
                    <td>
                      <span className={`adm-badge ${v.isPublished ? 'adm-badge-green' : 'adm-badge-red'}`}>
                        {v.isPublished ? 'Live' : 'Draft'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => openEdit(v)}>Edit</button>
                        <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => del(v._id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Video Modal */}
      {modal && (
        <div className="adm-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="adm-modal" style={{ maxWidth: 680, maxHeight: '92vh', overflowY: 'auto' }}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">{modal === 'create' ? 'Add Video' : 'Edit Video'}</h2>
              <button className="adm-modal-close" onClick={() => setModal(null)}>✕</button>
            </div>

            <div className="adm-modal-body">
              {/* Basic info */}
              <div className="adm-form-section">Video Info</div>

              <div className="adm-input-group">
                <label className="adm-label">Title *</label>
                <input className="adm-input" value={form.title} maxLength={300}
                  onChange={e => set('title', e.target.value)} placeholder="e.g. Introduction to EC2" />
              </div>

              <div className="adm-input-group">
                <label className="adm-label">Description</label>
                <textarea className="adm-input" rows={2} value={form.description} maxLength={2000}
                  onChange={e => set('description', e.target.value)} placeholder="Brief description of this video..." />
              </div>

              {/* YouTube ID + Video Type — FIX #7 */}
              <div style={{ padding: 16, background: 'rgba(255,202,40,0.06)', borderRadius: 12, border: '1px solid rgba(255,202,40,0.2)' }}>
                <label className="adm-label" style={{ color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LockIcon /> YouTube Video ID * (encrypted in database — never exposed to public)
                </label>
                <input className="adm-input" value={form.youtubeId} style={{ marginTop: 8, fontFamily: 'monospace' }}
                  onChange={e => set('youtubeId', e.target.value.trim())}
                  placeholder="dQw4w9WgXcQ (only the ID part after ?v=)" />

                {/* FIX #7 — Video type selector */}
                <div style={{ marginTop: 14 }}>
                  <label className="adm-label">Video Privacy Type</label>
                  <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    {[
                      { val: 'unlisted', label: 'Unlisted', desc: 'Hidden from public search, accessible via link', Icon: LockIcon, badge: 'adm-badge-amber' },
                      { val: 'listed',   label: 'Listed',   desc: 'Publicly visible on YouTube',                 Icon: GlobeIcon, badge: 'adm-badge-cyan' },
                    ].map(opt => (
                      <label key={opt.val} style={{
                        flex: 1, padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                        border: `1px solid ${form.videoType === opt.val ? 'rgba(157,127,212,0.5)' : 'rgba(255,255,255,0.1)'}`,
                        background: form.videoType === opt.val ? 'rgba(123,94,167,0.1)' : 'rgba(255,255,255,0.02)',
                        transition: 'all 0.2s',
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                      }}>
                        <input type="radio" name="videoType" value={opt.val}
                          checked={form.videoType === opt.val}
                          onChange={e => set('videoType', e.target.value)}
                          style={{ marginTop: 2, accentColor: 'var(--violet)' }} />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 3 }}>
                            <opt.Icon />
                            {opt.label}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{opt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Week / Order / Duration */}
              <div className="adm-form-row">
                <div className="adm-input-group">
                  <label className="adm-label">Week Number</label>
                  <input type="number" min="1" className="adm-input" value={form.weekNumber}
                    onChange={e => set('weekNumber', parseInt(e.target.value) || 1)} />
                </div>
                <div className="adm-input-group">
                  <label className="adm-label">Order in Week</label>
                  <input type="number" min="0" className="adm-input" value={form.order}
                    onChange={e => set('order', parseInt(e.target.value) || 0)} />
                </div>
                <div className="adm-input-group">
                  <label className="adm-label">Duration (e.g. 45:30)</label>
                  <input className="adm-input" value={form.duration} placeholder="45:30"
                    onChange={e => set('duration', e.target.value)} />
                </div>
              </div>

              <label className="adm-toggle">
                <input type="checkbox" checked={form.isPublished} onChange={e => set('isPublished', e.target.checked)} />
                <span>Publish this video (make visible to enrolled learners)</span>
              </label>

              {/* Resources */}
              <div className="adm-form-section" style={{ marginTop: 8 }}>Resources (PDFs, Drive links, Notes)</div>

              {(form.resources || []).map((r, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', background: 'var(--bg4)', borderRadius: 10,
                }}>
                  <span style={{ color: 'var(--text3)' }}><ResIcon type={r.type} /></span>
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}>{r.title}</span>
                  <span style={{
                    fontSize: 11, color: 'var(--text3)', fontFamily: 'monospace',
                    maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{r.url}</span>
                  <button className="adm-btn adm-btn-danger adm-btn-sm" style={{ padding: '4px 10px' }}
                    onClick={() => removeResource(i)}>✕</button>
                </div>
              ))}

              <div style={{ padding: 14, background: 'var(--bg4)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="adm-form-row">
                  <div className="adm-input-group">
                    <label className="adm-label">Type</label>
                    <select className="adm-input" value={resInput.type} onChange={e => setResInput(r => ({ ...r, type: e.target.value }))}>
                      {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div className="adm-input-group">
                    <label className="adm-label">Resource Title</label>
                    <input className="adm-input" value={resInput.title} placeholder="Week 1 Notes"
                      onChange={e => setResInput(r => ({ ...r, title: e.target.value }))} />
                  </div>
                </div>
                <div className="adm-input-group">
                  <label className="adm-label">URL (Drive link, PDF URL, etc.)</label>
                  <input className="adm-input" value={resInput.url} placeholder="https://drive.google.com/..."
                    onChange={e => setResInput(r => ({ ...r, url: e.target.value }))} />
                </div>
                <button className="adm-btn adm-btn-ghost adm-btn-sm" style={{ alignSelf: 'flex-start' }} onClick={addResource}>
                  + Add Resource
                </button>
              </div>

            </div>

            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="adm-btn adm-btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Saving…' : modal === 'create' ? 'Add Video' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
