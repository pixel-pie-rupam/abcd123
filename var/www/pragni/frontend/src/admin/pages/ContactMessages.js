import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { adminGet, adminDelete } from '../../utils/api';
import axios from 'axios';

const ADMIN_BASE = `/api/${process.env.REACT_APP_ADMIN_PATH || 'xK9mP2qR7nL4wV'}`;

export default function ContactMessages() {
  const { token } = useAdmin();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    adminGet('/contact-messages', token)
      .then(r => setMessages(r.data.messages || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, [token]);

  const markRead = async (id) => {
    await axios.patch(`${ADMIN_BASE}/contact-messages/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
    setMessages(ms => ms.map(m => m._id === id ? { ...m, isRead: true } : m));
    if (selected?._id === id) setSelected(s => s ? { ...s, isRead: true } : s);
  };

  const del = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    await adminDelete(`/contact-messages/${id}`, token);
    setMessages(ms => ms.filter(m => m._id !== id));
    if (selected?._id === id) setSelected(null);
  };

  const openMsg = (m) => {
    setSelected(m);
    if (!m.isRead) markRead(m._id);
  };

  const unread = messages.filter(m => !m.isRead).length;

  return (
    <div>
      <div className="adm-header">
        <div>
          <h1 className="adm-header-title">
            Contact Messages
            {unread > 0 && <span className="adm-badge adm-badge-red" style={{ marginLeft: 10, verticalAlign: 'middle' }}>{unread} new</span>}
          </h1>
          <p className="adm-header-sub">Messages submitted via the Contact Us form on your website.</p>
        </div>
      </div>

      <div className="adm-body">
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}><div className="adm-spinner" /></div>
        ) : messages.length === 0 ? (
          <div className="adm-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text3)', marginBottom: 12 }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p>No messages yet. They'll appear here when someone fills the contact form.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1.2fr' : '1fr', gap: 20 }}>
            {/* Message list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map(m => (
                <div
                  key={m._id}
                  onClick={() => openMsg(m)}
                  className="adm-card adm-card-inner"
                  style={{
                    cursor: 'pointer',
                    borderColor: selected?._id === m._id ? 'var(--accent2)' : !m.isRead ? 'rgba(108,71,255,0.4)' : 'var(--border2)',
                    background: !m.isRead ? 'rgba(108,71,255,0.06)' : 'var(--card-bg)',
                    transition: 'all 0.2s',
                    padding: '14px 18px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: m.isRead ? 600 : 800, fontSize: 14, marginBottom: 2 }}>
                        {!m.isRead && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent2)', display: 'inline-block', marginRight: 8, flexShrink: 0 }} />}
                        {m.name}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text3)' }}>{m.email}</div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0 }}>
                      {new Date(m.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.message}
                  </div>
                </div>
              ))}
            </div>

            {/* Message detail panel */}
            {selected && (
              <div className="adm-card adm-card-inner" style={{ position: 'sticky', top: 20, height: 'fit-content' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{selected.name}</div>
                    <a href={`mailto:${selected.email}`} style={{ fontSize: 13, color: 'var(--accent2)', textDecoration: 'none' }}>{selected.email}</a>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{new Date(selected.createdAt).toLocaleString()}</div>
                  </div>
                  <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => setSelected(null)}>✕ Close</button>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border2)', borderRadius: 10, padding: 18, fontSize: 14, lineHeight: 1.8, color: 'var(--text)', whiteSpace: 'pre-wrap', marginBottom: 16 }}>
                  {selected.message}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <a href={`mailto:${selected.email}?subject=Re: Your message on Pragni`} className="adm-btn adm-btn-primary adm-btn-sm" style={{ textDecoration: 'none' }}>
                    Reply via Email
                  </a>
                  <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => del(selected._id)}>Delete</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
