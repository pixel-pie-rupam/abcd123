import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { adminGet, adminPatch, adminDelete } from '../../utils/api';

export default function CommentsAdmin() {
  const { token } = useAdmin();
  const [comments, setComments] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const approved = filter === 'pending' ? 'false' : filter === 'approved' ? 'true' : undefined;
      const url = approved !== undefined ? `/comments?approved=${approved}` : '/comments';
      const r = await adminGet(url, token);
      setComments(r.data.comments || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter, token]);

  const approve = async (id) => {
    try { await adminPatch(`/comments/${id}`, { isApproved: true }, token); load(); } catch {}
  };

  const unapprove = async (id) => {
    try { await adminPatch(`/comments/${id}`, { isApproved: false }, token); load(); } catch {}
  };

  const submitReply = async () => {
    if (!replyText.trim()) return;
    setSaving(true);
    try {
      await adminPatch(`/comments/${replyModal._id}`, {
        reply: replyText.trim(),
        isResolved: true,
        isApproved: true,
      }, token);
      setReplyModal(null);
      setReplyText('');
      load();
    } catch {}
    setSaving(false);
  };

  const clearReply = async (id) => {
    if (!window.confirm('Remove this reply?')) return;
    try { await adminPatch(`/comments/${id}`, { reply: '', isResolved: false }, token); load(); } catch {}
  };

  const del = async (id) => {
    if (!window.confirm('Delete this comment permanently?')) return;
    try { await adminDelete(`/comments/${id}`, token); load(); } catch {}
  };

  return (
    <div>
      <div className="adm-header">
        <div>
          <h1 className="adm-header-title">Comments &amp; Doubts</h1>
          <p className="adm-header-sub">{comments.length} shown</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['pending', 'approved', 'all'].map(f => (
            <button key={f} className={`cat-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)} style={{ fontSize: 12 }}>
              {f === 'pending' ? 'Pending' : f === 'approved' ? 'Approved' : 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="adm-body">
        {loading
          ? <div style={{ textAlign: 'center', padding: 60 }}><div className="adm-spinner" style={{ margin: '0 auto' }} /></div>
          : comments.length === 0
            ? <div className="adm-empty"><div className="icon">💬</div><p>No comments in this category.</p></div>
            : comments.map(c => (
              <div key={c._id} style={{
                background: 'var(--card-bg)', border: '1px solid var(--border)',
                borderRadius: 12, padding: 18, marginBottom: 12
              }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{c.userName}</span>
                    <span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 8 }}>{c.userEmail}</span>
                    <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 8 }}>
                      {new Date(c.createdAt).toLocaleString('en-IN')}
                    </span>
                    {c.video?.title && (
                      <span style={{ fontSize: 11, color: 'var(--accent2)', marginLeft: 8 }}>
                        📹 {c.video.title}
                      </span>
                    )}
                    {c.course?.title && (
                      <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 8 }}>
                        📚 {c.course.title}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {c.isDoubt && <span className="adm-badge adm-badge-amber">❓ Doubt</span>}
                    {c.isApproved
                      ? <span className="adm-badge adm-badge-green">Approved</span>
                      : <span className="adm-badge adm-badge-red">Pending</span>}
                    {c.isResolved && <span className="adm-badge adm-badge-green">✅ Resolved</span>}
                  </div>
                </div>

                {/* Comment */}
                <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 12 }}>
                  {c.content}
                </p>

                {/* Existing reply */}
                {c.reply && (
                  <div style={{
                    background: 'var(--accent-bg)', borderLeft: '3px solid var(--accent)',
                    borderRadius: 8, padding: '10px 14px', marginBottom: 12,
                    fontSize: 13, color: 'var(--text2)'
                  }}>
                    <span style={{ fontWeight: 600, color: 'var(--accent2)', marginRight: 8 }}>Trainer replied:</span>
                    {c.reply}
                    <button onClick={() => clearReply(c._id)} style={{
                      marginLeft: 12, fontSize: 11, color: 'var(--red)',
                      background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline'
                    }}>Remove</button>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {!c.isApproved
                    ? <button className="adm-btn adm-btn-success adm-btn-sm" onClick={() => approve(c._id)}>Approve</button>
                    : <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => unapprove(c._id)}>Unapprove</button>
                  }
                  <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => { setReplyModal(c); setReplyText(c.reply || ''); }}>
                    {c.reply ? '✏️ Edit Reply' : 'Reply'}
                  </button>
                  <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => del(c._id)}>Delete</button>
                </div>
              </div>
            ))
        }
      </div>

      {/* Reply Modal */}
      {replyModal && (
        <div className="adm-overlay" onClick={e => e.target === e.currentTarget && setReplyModal(null)}>
          <div className="adm-modal" style={{ maxWidth: 520 }}>
            <div className="adm-modal-header">
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Reply to Comment</h2>
                <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>By {replyModal.userName}</p>
              </div>
              <button className="adm-modal-close" onClick={() => setReplyModal(null)}>✕</button>
            </div>
            <div style={{ background: 'var(--bg4)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--text2)' }}>
              {replyModal.content}
            </div>
            <div className="adm-input-group" style={{ marginBottom: 12 }}>
              <label className="adm-label">Your Reply</label>
              <textarea className="adm-input" rows={4} value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Type your reply... This will show on the video page."
                autoFocus
              />
            </div>
            <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>
              ✅ Submitting auto-approves this comment and marks it resolved.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="adm-btn adm-btn-ghost" onClick={() => setReplyModal(null)}>Cancel</button>
              <button className="adm-btn adm-btn-primary" onClick={submitReply} disabled={saving || !replyText.trim()}>
                {saving ? 'Saving...' : 'Send Reply →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
