import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { adminGet, adminPost, adminPut } from '../../utils/api';
import axios from 'axios';

const ADMIN_BASE = `/api/${process.env.REACT_APP_ADMIN_PATH || 'xK9mP2qR7nL4wV'}`;
const apiCall = (method, url, data, token) =>
  axios({ method, url: `${ADMIN_BASE}${url}`, data, headers: { Authorization: `Bearer ${token}` } });

const ALL_PERMISSIONS = [
  { key: 'courses',           label: 'Courses' },
  { key: 'workshops',         label: 'Workshops' },
  { key: 'comments',          label: 'Comments' },
  { key: 'trainers',          label: 'Trainers' },
  { key: 'seo',               label: 'SEO Manager' },
  { key: 'contact',           label: 'Contact & Social' },
  { key: 'enrollments',       label: 'Enrollments' },
  { key: 'categories',        label: 'Categories' },
  { key: 'banner',            label: 'Banner' },
  { key: 'coupons',           label: 'Coupons' },
  { key: 'bundles',           label: 'Bundles' },
  { key: 'contact-messages',  label: 'Contact Messages' },
];

const EMPTY_FORM = {
  name: '', email: '', password: '', bio: '', photo: '', specializations: '',
  role: 'trainer', permissions: [], showOnPublicPage: true,
  socialLinks: { linkedin: '', github: '', twitter: '' },
};

// Icons
const EyeIcon    = () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIcon = () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const EditIcon   = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon  = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;

export default function TrainersAdmin() {
  const { token, user, isAdmin } = useAdmin();
  const [trainers, setTrainers]   = useState([]);
  const [modal, setModal]         = useState(null);
  const [profileModal, setProfileModal] = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [profileForm, setProfileForm] = useState({ name: '', bio: '', photo: '', specializations: '', socialLinks: { linkedin: '', github: '', twitter: '' } });
  const [saving, setSaving]       = useState(false);
  const [filter, setFilter]       = useState('active');

  const load = () => {
    if (!isAdmin) return;
    adminGet('/trainers', token).then(r => setTrainers(r.data.trainers || [])).catch(() => {});
  };
  useEffect(load, [token, isAdmin]);

  const set  = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setSocial = (k, v) => setForm(f => ({ ...f, socialLinks: { ...(f.socialLinks || {}), [k]: v } }));
  const setPS = (k, v) => setProfileForm(f => ({ ...f, [k]: v }));
  const setPSocial = (k, v) => setProfileForm(f => ({ ...f, socialLinks: { ...(f.socialLinks || {}), [k]: v } }));
  const togglePerm = (perm) => setForm(f => ({
    ...f,
    permissions: f.permissions.includes(perm)
      ? f.permissions.filter(p => p !== perm)
      : [...f.permissions, perm],
  }));

  const openCreate = () => { setForm(EMPTY_FORM); setModal('create'); };
  const openEdit   = (t) => {
    setForm({
      ...t,
      password: '',
      photo: t.photo || '',
      specializations: (t.specializations || []).join(', '),
      permissions: t.permissions || [],
      showOnPublicPage: t.showOnPublicPage !== false,
      socialLinks: t.socialLinks || { linkedin: '', github: '', twitter: '' },
    });
    setModal('edit');
  };
  const openProfile = () => {
    setProfileForm({ name: user.name || '', bio: '', photo: user.photo || '', specializations: '', socialLinks: { linkedin: '', github: '', twitter: '' } });
    setProfileModal(true);
  };

  const save = async () => {
    if (!form.name || !form.email) return alert('Name and email required');
    if (modal === 'create' && !form.password) return alert('Password required');
    if (form.password && form.password.length < 8) return alert('Password must be at least 8 characters');
    setSaving(true);
    try {
      const payload = {
        ...form,
        specializations: form.specializations.split(',').map(s => s.trim()).filter(Boolean),
        permissions: form.role === 'semi-admin' ? form.permissions : [],
      };
      if (modal === 'create') await adminPost('/trainers', payload, token);
      else await adminPut(`/trainers/${form._id}`, payload, token);
      setModal(null); load();
    } catch (err) { alert(err.response?.data?.error || 'Error saving'); }
    setSaving(false);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const payload = { ...profileForm, specializations: profileForm.specializations.split(',').map(s => s.trim()).filter(Boolean) };
      await apiCall('put', '/profile', payload, token);
      setProfileModal(false);
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
    setSaving(false);
  };

  const deactivate  = async (id) => { if (!window.confirm('Deactivate this trainer?')) return; await apiCall('patch', `/trainers/${id}/deactivate`, {}, token); load(); };
  const reactivate  = async (id) => { if (!window.confirm('Reactivate this trainer?')) return; await apiCall('patch', `/trainers/${id}/reactivate`, {}, token); load(); };
  const hardDelete  = async (id) => { if (!window.confirm('Permanently delete? Cannot be undone.')) return; await apiCall('delete', `/trainers/${id}`, {}, token); load(); };

  // Toggle public visibility without opening the full edit modal
  const toggleVisibility = async (t) => {
    try {
      await adminPut(`/trainers/${t._id}`, { showOnPublicPage: !t.showOnPublicPage }, token);
      load();
    } catch { alert('Error updating visibility'); }
  };

  const Avatar = ({ url, name, size = 44 }) => url
    ? <img src={url} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-b)', flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />
    : <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.38, color: 'var(--accent2)', flexShrink: 0, border: '2px solid var(--border-b)' }}>{(name || '?')[0].toUpperCase()}</div>;

  const roleColor = { admin: 'adm-badge-purple', trainer: 'adm-badge-blue', 'semi-admin': 'adm-badge-orange' };

  // ── Trainer self-profile view ──────────────────────────────────────────
  if (!isAdmin) return (
    <div>
      <div className="adm-header">
        <div><h1 className="adm-header-title">My Profile</h1><p className="adm-header-sub">Your public trainer profile</p></div>
        <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={openProfile}>Edit Profile</button>
      </div>
      <div className="adm-body">
        <div className="adm-card adm-card-inner" style={{ maxWidth: 480 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <Avatar url={user.photo} name={user.name} size={64} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{user.name}</div>
              <div className="adm-header-sub">{user.email}</div>
              <span className="adm-badge adm-badge-blue" style={{ marginTop: 6, display: 'inline-flex' }}>Instructor</span>
            </div>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>
            Update your photo, bio, specializations and social links. These show publicly on the Trainers page.
          </p>
        </div>
      </div>
      {profileModal && (
        <div className="adm-overlay" onClick={e => e.target === e.currentTarget && setProfileModal(false)}>
          <div className="adm-modal" style={{ maxWidth: 540, maxHeight: '92vh', overflowY: 'auto' }}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">Edit My Profile</h2>
              <button className="adm-modal-close" onClick={() => setProfileModal(false)}>✕</button>
            </div>
            <div className="adm-modal-body">
              {[['name','Name'],['photo','Photo URL']].map(([k, lbl]) => (
                <div className="adm-input-group" key={k}>
                  <label className="adm-label">{lbl}</label>
                  <input className="adm-input" value={profileForm[k] || ''} onChange={e => setPS(k, e.target.value)} />
                </div>
              ))}
              {profileForm.photo && <Avatar url={profileForm.photo} name={profileForm.name} size={52} />}
              <div className="adm-input-group">
                <label className="adm-label">Bio</label>
                <textarea className="adm-input" rows={4} value={profileForm.bio} onChange={e => setPS('bio', e.target.value)} />
              </div>
              <div className="adm-input-group">
                <label className="adm-label">Specializations (comma-separated)</label>
                <input className="adm-input" value={profileForm.specializations} onChange={e => setPS('specializations', e.target.value)} />
              </div>
              {['linkedin','github','twitter'].map(k => (
                <div className="adm-input-group" key={k}>
                  <label className="adm-label">{k.charAt(0).toUpperCase() + k.slice(1)}</label>
                  <input className="adm-input" placeholder={`https://${k}.com/…`} value={profileForm.socialLinks?.[k] || ''} onChange={e => setPSocial(k, e.target.value)} />
                </div>
              ))}
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn-ghost" onClick={() => setProfileModal(false)}>Cancel</button>
              <button className="adm-btn adm-btn-primary" onClick={saveProfile} disabled={saving}>{saving ? 'Saving…' : 'Save Profile'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const filtered = trainers.filter(t =>
    filter === 'active' ? t.isActive : filter === 'inactive' ? !t.isActive : true
  );
  const visibleCount = trainers.filter(t => t.isActive && t.showOnPublicPage !== false).length;

  return (
    <div>
      <div className="adm-header">
        <div>
          <h1 className="adm-header-title">Team Members</h1>
          <p className="adm-header-sub">{visibleCount} showing publicly · {trainers.filter(t => t.isActive).length} total active</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select className="adm-input adm-input-sm" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="all">All</option>
          </select>
          <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={openCreate}>+ Add Member</button>
        </div>
      </div>

      <div className="adm-body">
        <div className="adm-info adm-info-violet" style={{ marginBottom: 20, fontSize: 13 }}>
          Use the <strong>eye icon</strong> to instantly show or hide a trainer from the public /trainers page without deactivating their portal access.
        </div>

        {filtered.length === 0 ? (
          <div className="adm-empty"><p>No team members found.</p></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {filtered.map(t => (
              <div key={t._id} className="adm-card" style={{
                padding: 20,
                opacity: t.isActive ? 1 : 0.5,
                border: `1px solid ${t.showOnPublicPage !== false ? 'var(--border-a)' : 'rgba(240,98,146,0.2)'}`,
              }}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                  <Avatar url={t.photo} name={t.name} size={50} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 3 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.email}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span className={`adm-badge ${roleColor[t.role] || 'adm-badge-blue'}`}>{t.role}</span>
                      <span className={`adm-badge ${t.isActive ? 'adm-badge-green' : 'adm-badge-red'}`}>{t.isActive ? 'Active' : 'Inactive'}</span>
                      {/* Public visibility badge */}
                      <span className={`adm-badge ${t.showOnPublicPage !== false ? 'adm-badge-teal' : 'adm-badge-red'}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {t.showOnPublicPage !== false ? <EyeIcon /> : <EyeOffIcon />}
                        {t.showOnPublicPage !== false ? 'Public' : 'Hidden'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Specializations */}
                {(t.specializations || []).length > 0 && (
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14, lineHeight: 1.5 }}>
                    {t.specializations.slice(0, 3).join(' · ')}{t.specializations.length > 3 && ' · …'}
                  </div>
                )}

                {/* Permissions for semi-admin */}
                {t.role === 'semi-admin' && (t.permissions || []).length > 0 && (
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10, padding: '6px 10px', background: 'rgba(255,167,38,0.08)', borderRadius: 6, lineHeight: 1.6 }}>
                    Access: {t.permissions.join(', ')}
                  </div>
                )}

                {/* Action row */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 14, borderTop: '1px solid var(--border-a)' }}>
                  <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => openEdit(t)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <EditIcon /> Edit
                  </button>

                  {/* Toggle public visibility */}
                  <button
                    className={`adm-btn adm-btn-sm ${t.showOnPublicPage !== false ? 'adm-btn-ghost' : 'adm-btn-success'}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                    onClick={() => toggleVisibility(t)}
                    title={t.showOnPublicPage !== false ? 'Click to hide from public page' : 'Click to show on public page'}
                  >
                    {t.showOnPublicPage !== false ? <><EyeOffIcon /> Hide</> : <><EyeIcon /> Show</>}
                  </button>

                  {t.isActive
                    ? <button className="adm-btn adm-btn-ghost adm-btn-sm" style={{ color: 'var(--amber)' }} onClick={() => deactivate(t._id)}>Deactivate</button>
                    : <button className="adm-btn adm-btn-success adm-btn-sm" onClick={() => reactivate(t._id)}>Reactivate</button>
                  }
                  {t.role !== 'admin' && (
                    <button className="adm-btn adm-btn-danger adm-btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                      onClick={() => hardDelete(t._id)}>
                      <TrashIcon /> Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit modal */}
      {modal && (
        <div className="adm-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="adm-modal" style={{ maxWidth: 580, maxHeight: '92vh', overflowY: 'auto' }}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">{modal === 'create' ? 'Add Team Member' : 'Edit Member'}</h2>
              <button className="adm-modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              {[['name','Name *'],['email','Email *']].map(([k, lbl]) => (
                <div className="adm-input-group" key={k}>
                  <label className="adm-label">{lbl}</label>
                  <input className="adm-input" type={k === 'email' ? 'email' : 'text'} value={form[k]} maxLength={k === 'name' ? 100 : 200}
                    onChange={e => set(k, e.target.value)} />
                </div>
              ))}
              <div className="adm-input-group">
                <label className="adm-label">Password {modal === 'edit' ? '(leave blank to keep current)' : '*'}</label>
                <input className="adm-input" type="password" placeholder={modal === 'edit' ? 'Leave blank to keep' : 'Min 8 chars'} value={form.password}
                  onChange={e => set('password', e.target.value)} />
              </div>
              <div className="adm-input-group">
                <label className="adm-label">Role</label>
                <select className="adm-input" value={form.role} onChange={e => set('role', e.target.value)}>
                  <option value="trainer">Trainer (own profile + assigned content only)</option>
                  <option value="semi-admin">Semi-Admin (custom permissions)</option>
                </select>
              </div>
              {form.role === 'semi-admin' && (
                <div className="adm-input-group">
                  <label className="adm-label">Permissions</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-b)', borderRadius: 10 }}>
                    {ALL_PERMISSIONS.map(p => (
                      <label key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                        <input type="checkbox" checked={form.permissions.includes(p.key)} onChange={() => togglePerm(p.key)} style={{ accentColor: 'var(--accent)' }} />
                        {p.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Public visibility toggle */}
              <div style={{ padding: '14px 16px', background: form.showOnPublicPage ? 'rgba(38,208,161,0.06)' : 'rgba(240,98,146,0.06)', borderRadius: 10, border: `1px solid ${form.showOnPublicPage ? 'rgba(38,208,161,0.2)' : 'rgba(240,98,146,0.2)'}` }}>
                <label className="adm-toggle" style={{ gap: 12 }}>
                  <input type="checkbox" checked={!!form.showOnPublicPage} onChange={e => set('showOnPublicPage', e.target.checked)} style={{ accentColor: 'var(--accent)' }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                      {form.showOnPublicPage ? 'Visible on public Trainers page' : 'Hidden from public Trainers page'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                      {form.showOnPublicPage
                        ? 'Profile shows on the /trainers page. Uncheck to hide without deactivating portal access.'
                        : 'Profile is hidden from visitors. Portal login still works normally.'}
                    </div>
                  </div>
                </label>
              </div>

              <div className="adm-input-group">
                <label className="adm-label">Photo URL</label>
                <input className="adm-input" placeholder="https://…" value={form.photo} onChange={e => set('photo', e.target.value)} />
                {form.photo && <div style={{ marginTop: 8 }}><Avatar url={form.photo} name={form.name} size={48} /></div>}
              </div>
              <div className="adm-input-group">
                <label className="adm-label">Bio</label>
                <textarea className="adm-input" rows={3} value={form.bio} maxLength={2000} onChange={e => set('bio', e.target.value)} />
              </div>
              <div className="adm-input-group">
                <label className="adm-label">Specializations (comma-separated)</label>
                <input className="adm-input" value={form.specializations} onChange={e => set('specializations', e.target.value)} />
              </div>
              {['linkedin','github','twitter'].map(k => (
                <div className="adm-input-group" key={k}>
                  <label className="adm-label">{k.charAt(0).toUpperCase() + k.slice(1)}</label>
                  <input className="adm-input" placeholder={`https://${k}.com/…`} value={form.socialLinks?.[k] || ''} onChange={e => setSocial(k, e.target.value)} />
                </div>
              ))}
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
