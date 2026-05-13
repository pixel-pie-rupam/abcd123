// WorkshopsAdmin.js
import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { adminGet, adminPost, adminPut, adminPatch, adminDelete } from '../../utils/api';


const EMPTY_W = { title: '', description: '', bannerImage: '', scheduledAt: '', durationMinutes: 60, meetLink: '', category: 'general', isActive: true };

export function WorkshopsAdmin() {
  const { token } = useAdmin();
  const [workshops, setWorkshops] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_W);
  const [saving, setSaving] = useState(false);

  const load = () => adminGet('/workshops', token).then(r => setWorkshops(r.data.workshops || [])).catch(() => {});
  useEffect(load, [token]);

  const openCreate = () => { setForm(EMPTY_W); setModal('create'); };
  const openEdit = (w) => {
    const d = new Date(w.scheduledAt);
    const local = new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setForm({ ...w, scheduledAt: local, meetLink: '' });
    setModal('edit');
  };

  const save = async () => {
    if (!form.title || !form.scheduledAt) return alert('Title and date are required');
    setSaving(true);
    try {
      if (modal === 'create') await adminPost('/workshops', form, token);
      else await adminPut(`/workshops/${form._id}`, form, token);
      setModal(null); load();
    } catch (err) { alert(err.response?.data?.error || 'Error saving'); }
    setSaving(false);
  };

  const del = async (id) => {
    if (!window.confirm('Delete this workshop?')) return;
    await adminDelete(`/workshops/${id}`, token);
    load();
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="adm-header">
        <div><h1 className="adm-header-title">Workshops & Live Classes</h1><p className="adm-header-sub">{workshops.length} sessions</p></div>
        <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={openCreate}>+ New Workshop</button>
      </div>
      <div className="adm-body">
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Title</th><th>Date & Time</th><th>Duration</th><th>Registrations</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {workshops.length === 0
                ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>No workshops yet.</td></tr>
                : workshops.map(w => (
                  <tr key={w._id}>
                    <td style={{ fontWeight: 500, color: 'var(--text)' }}>{w.title}</td>
                    <td>{new Date(w.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                    <td>{w.durationMinutes} min</td>
                    <td><span className="adm-badge adm-badge-violet">{w.registrationCount || 0}</span></td>
                    <td><span className={`badge ${w.isActive ? 'badge-green' : 'badge-red'}`}>{w.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => openEdit(w)}>Edit</button>
                        <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => del(w._id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="adm-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="adm-modal" style={{ maxWidth: 600 }}>
            <div className="adm-modal-header">
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>{modal === 'create' ? 'Create Workshop' : 'Edit Workshop'}</h2>
              <button className="adm-modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="adm-modal-body" style={{display:"flex",flexDirection:"column",gap:18}}>
              <div className="adm-input-group"><label className="adm-label">Title *</label><input className="adm-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Web Application Pentesting Masterclass" /></div>
              <div className="adm-input-group"><label className="adm-label">Description *</label><textarea className="adm-input" rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="What will learners gain from this session?" /></div>
              <div className="adm-form-row">
                <div className="adm-input-group"><label className="adm-label">Date & Time *</label><input type="datetime-local" className="adm-input" value={form.scheduledAt} onChange={e => set('scheduledAt', e.target.value)} /></div>
                <div className="adm-input-group"><label className="adm-label">Duration (minutes)</label><input type="number" min="15" className="adm-input" value={form.durationMinutes} onChange={e => set('durationMinutes', parseInt(e.target.value) || 60)} /></div>
              </div>
              <div className="adm-input-group"><label className="adm-label">Banner Image URL</label><input className="adm-input" value={form.bannerImage} onChange={e => set('bannerImage', e.target.value)} placeholder="https://..." /></div>
              <div style={{ padding: 14, background: 'var(--accent-bg)', borderRadius: 12, border: '1px solid rgba(108,71,255,0.2)' }}>
                <label className="adm-label" style={{ color: 'var(--accent2)' }}>🔐 Google Meet Link (stored encrypted)</label>
                <input className="adm-input" style={{ marginTop: 6 }} value={form.meetLink} onChange={e => set('meetLink', e.target.value)} placeholder="https://meet.google.com/xxx-xxxx-xxx" />
                {modal === 'edit' && <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>Leave blank to keep existing link.</p>}
              </div>
              <div className="adm-form-row">
                <div className="adm-input-group"><label className="adm-label">Category</label><input className="adm-input" value={form.category} onChange={e => set('category', e.target.value)} placeholder="e.g. pentesting, aws..." /></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, marginTop: 20 }}>
                    <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />Active / Visible
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button className="adm-btn adm-btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button className="adm-btn adm-btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : modal === 'create' ? 'Create Workshop' : 'Save Changes'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// TrainersAdmin.js
export function SettingsAdmin() {
  const { user, token } = useAdmin();
  const [logoPreview, setLogoPreview] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load logo from backend on mount
  React.useEffect(() => {
    fetch('/api/settings/logo')
      .then(r => r.json())
      .then(d => { if (d.logoUrl) { setLogoUrl(d.logoUrl); setLogoPreview(d.logoUrl); } })
      .catch(() => {});
  }, []);

  const handleLogoFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setLogoPreview(ev.target.result); setLogoUrl(ev.target.result); };
    reader.readAsDataURL(file);
  };

  const saveLogo = async () => {
    setSaving(true);
    try {
      const { adminPut } = await import('../../utils/api');
      await adminPut('/settings', { logoUrl }, token);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      window.dispatchEvent(new Event('logo-updated'));
      window.dispatchEvent(new Event('seo-updated'));
    } catch (err) {
      alert('Failed to save logo. Please try again.');
    }
    setSaving(false);
  };

  const clearLogo = async () => {
    try {
      const { adminPut } = await import('../../utils/api');
      await adminPut('/settings', { logoUrl: '' }, token);
      setLogoPreview(''); setLogoUrl('');
      window.dispatchEvent(new Event('logo-updated'));
    } catch {}
  };

  return (
    <div>
      <div className="adm-header">
        <div><h1 className="adm-header-title">Settings</h1><p className="adm-header-sub">Brand, appearance & configuration</p></div>
      </div>
      <div className="adm-body" style={{ maxWidth: 680 }}>

        {/* Logo upload */}
        <div className="adm-card adm-card-inner" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Brand Logo</h3>
          {logoPreview && (
            <div style={{ marginBottom: 16, padding: 16, background: 'var(--bg4)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src={logoPreview} alt="Logo preview" style={{ height: 48, maxWidth: 200, objectFit: 'contain' }} />
              <span className="adm-header-sub">Current logo preview</span>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="adm-input-group">
              <label className="adm-label">Upload logo file (PNG, SVG recommended)</label>
              <input type="file" accept="image/*" className="adm-input" onChange={handleLogoFile} style={{ cursor: 'pointer' }} />
            </div>
            <div className="adm-input-group">
              <label className="adm-label">Or paste logo URL</label>
              <input className="adm-input" value={logoUrl.startsWith('data:') ? '' : logoUrl} onChange={e => { setLogoUrl(e.target.value); setLogoPreview(e.target.value); }} placeholder="https://your-cdn.com/logo.svg" />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={saveLogo}>{saved ? '✓ Saved!' : 'Save Logo'}</button>
              {logoPreview && <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={clearLogo}>Remove Logo</button>}
            </div>
          </div>
        </div>

        {/* Security info */}
        <div className="adm-card adm-card-inner" style={{ background: 'var(--red-bg)', border: '1px solid rgba(217,43,58,0.2)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--red)' }}>Security Configuration</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { k: 'Admin Path', v: 'Set in .env ADMIN_SECRET_PATH — never changes via UI' },
              { k: 'Video Encryption', v: 'AES-256-GCM — YouTube IDs never exposed to clients' },
              { k: 'Resource Encryption', v: 'All Drive/PDF URLs encrypted in database' },
              { k: 'Stream Tokens', v: 'Time-limited (4hr) tokens served per request' },
              { k: 'Your Role', v: user?.role === 'admin' ? 'Admin (full access)' : 'Trainer (limited access)' },
            ].map(item => (
              <li key={item.k} style={{ display: 'flex', gap: 10, fontSize: 13 }}>
                
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>{item.k}:</span>
                  <span style={{ color: 'var(--text2)', marginLeft: 6 }}>{item.v}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
