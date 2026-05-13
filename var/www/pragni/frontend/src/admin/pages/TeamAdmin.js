import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { adminGet, adminPost, adminPut, adminDelete } from '../../utils/api';

const EMPTY = { name: '', role: '', photo: '', bio: '', linkedin: '', twitter: '', order: 0, showOnAboutPage: true };

const EyeIcon = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOff  = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const LinkedInIcon = () => <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;

export default function TeamAdmin() {
  const { token } = useAdmin();
  const [members, setMembers] = useState([]);
  const [modal,   setModal]   = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  setSaving]  = useState(false);

  const load = () => adminGet('/team', token).then(r => setMembers(r.data.members || [])).catch(() => {});
  useEffect(load, [token]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const openCreate = () => { setForm({ ...EMPTY, order: members.length }); setModal('create'); };
  const openEdit   = (m) => { setForm(m); setModal('edit'); };

  const save = async () => {
    if (!form.name.trim()) return alert('Name is required');
    setSaving(true);
    try {
      if (modal === 'create') await adminPost('/team', form, token);
      else await adminPut(`/team/${form._id}`, form, token);
      setModal(null); load();
    } catch (err) { alert(err.response?.data?.error || 'Error saving'); }
    setSaving(false);
  };

  const del = async (id) => {
    if (!window.confirm('Delete this team member?')) return;
    await adminDelete(`/team/${id}`, token);
    load();
  };

  const toggle = async (m) => {
    await adminPut(`/team/${m._id}`, { showOnAboutPage: !m.showOnAboutPage }, token);
    load();
  };

  const Avatar = ({ m, size = 52 }) => m.photo
    ? <img src={m.photo} alt={m.name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-b)', flexShrink: 0 }} onError={e => e.target.style.opacity = '0'} />
    : <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #4a00e0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: size * 0.38, color: '#fff', flexShrink: 0 }}>{m.name?.[0]?.toUpperCase() || '?'}</div>;

  return (
    <div>
      <div className="adm-header">
        <div>
          <h1 className="adm-header-title">Team Members</h1>
          <p className="adm-header-sub">Founders, CEO, and team shown on the Home &amp; About pages. Toggle visibility per member.</p>
        </div>
        <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={openCreate}>+ Add Member</button>
      </div>

      <div className="adm-body">
        <div className="adm-info adm-info-violet" style={{ marginBottom: 20 }}>
          These team members appear in the <strong>Meet Our Team</strong> section on the Home page. Toggle the eye icon to show/hide without deleting.
        </div>

        {members.length === 0 ? (
          <div className="adm-empty">
            <p className="adm-empty-title">No team members yet</p>
            <p className="adm-empty-sub">Add founders, CEO, trainers and mentors to showcase your team.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {members.map(m => (
              <div key={m._id} className="adm-card adm-card-inner" style={{
                opacity: m.showOnAboutPage ? 1 : 0.5,
                border: `1px solid ${m.showOnAboutPage ? 'var(--border-a)' : 'rgba(240,98,146,0.2)'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                  <Avatar m={m} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--accent2, #c4a8ff)', fontWeight: 600, marginBottom: 4, letterSpacing: '0.03em' }}>{m.role}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span className={`adm-badge ${m.showOnAboutPage ? 'adm-badge-green' : 'adm-badge-red'}`} style={{ fontSize: 10 }}>
                        {m.showOnAboutPage ? 'Visible' : 'Hidden'}
                      </span>
                    </div>
                  </div>
                </div>
                {m.bio && <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.6, marginBottom: 12 }}>{m.bio}</p>}
                {(m.linkedin || m.twitter) && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    {m.linkedin && <a href={m.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#0077b5', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}><LinkedInIcon /> LinkedIn</a>}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid var(--border-a)' }}>
                  <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => openEdit(m)}>Edit</button>
                  <button
                    className={`adm-btn adm-btn-sm ${m.showOnAboutPage ? 'adm-btn-ghost' : 'adm-btn-success'}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                    onClick={() => toggle(m)}
                  >
                    {m.showOnAboutPage ? <><EyeOff/> Hide</> : <><EyeIcon/> Show</>}
                  </button>
                  <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => del(m._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="adm-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="adm-modal" style={{ maxWidth: 540, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">{modal === 'create' ? 'Add Team Member' : 'Edit Member'}</h2>
              <button className="adm-modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-form-row">
                <div className="adm-input-group">
                  <label className="adm-label">Full Name *</label>
                  <input className="adm-input" value={form.name} maxLength={100} onChange={e => set('name', e.target.value)} placeholder="e.g. Rupam Sharma" />
                </div>
                <div className="adm-input-group">
                  <label className="adm-label">Role / Title</label>
                  <input className="adm-input" value={form.role} maxLength={100} onChange={e => set('role', e.target.value)} placeholder="e.g. Founder & CEO" />
                </div>
              </div>
              <div className="adm-input-group">
                <label className="adm-label">Photo URL</label>
                <input className="adm-input" placeholder="https://…" value={form.photo} onChange={e => set('photo', e.target.value)} />
                {form.photo && (
                  <img src={form.photo} alt="preview" onError={e => e.target.style.display='none'}
                    style={{ marginTop: 8, width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-b)' }} />
                )}
              </div>
              <div className="adm-input-group">
                <label className="adm-label">Bio (shown under name)</label>
                <textarea className="adm-input" rows={3} maxLength={1000} value={form.bio} onChange={e => set('bio', e.target.value)}
                  placeholder="Brief description — passion, experience, what they do at Pragni…" />
              </div>
              <div className="adm-form-row">
                <div className="adm-input-group">
                  <label className="adm-label">LinkedIn URL</label>
                  <input className="adm-input" placeholder="https://linkedin.com/in/…" value={form.linkedin} onChange={e => set('linkedin', e.target.value)} />
                </div>
                <div className="adm-input-group">
                  <label className="adm-label">Twitter/X URL</label>
                  <input className="adm-input" placeholder="https://x.com/…" value={form.twitter} onChange={e => set('twitter', e.target.value)} />
                </div>
              </div>
              <div className="adm-form-row">
                <div className="adm-input-group">
                  <label className="adm-label">Order (lower = first)</label>
                  <input type="number" className="adm-input" min={0} value={form.order} onChange={e => set('order', parseInt(e.target.value) || 0)} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
                  <label className="adm-toggle">
                    <input type="checkbox" checked={!!form.showOnAboutPage} onChange={e => set('showOnAboutPage', e.target.checked)} style={{ accentColor: 'var(--accent)' }} />
                    <span>Visible on Home &amp; About</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="adm-btn adm-btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
