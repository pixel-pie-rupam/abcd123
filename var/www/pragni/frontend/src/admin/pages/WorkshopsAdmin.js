import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { adminGet, adminPost, adminPut, adminDelete, ADMIN_SECRET } from '../../utils/api';

const EMPTY = {
  title: '', description: '', bannerImage: '',
  scheduledAt: '', durationMinutes: 60,
  meetLink: '', category: 'general', isActive: true,
};

// SVG Icons — no emoji
const UsersIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const DownloadIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const LockIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

export default function WorkshopsAdmin() {
  const { token } = useAdmin();
  const [workshops, setWorkshops]   = useState([]);
  const [modal, setModal]           = useState(null);
  const [form, setForm]             = useState(EMPTY);
  const [saving, setSaving]         = useState(false);
  const [regsModal, setRegsModal]   = useState(null);
  const [regsLoading, setRegsLoading] = useState(false);

  // Admin endpoint returns ALL workshops (no date filter) — Fix #5
  const load = () => adminGet('/workshops', token)
    .then(r => setWorkshops(r.data.workshops || []))
    .catch(() => {});
  useEffect(load, [token]);

  const openCreate = () => { setForm(EMPTY); setModal('create'); };
  const openEdit = (w) => {
    const d = new Date(w.scheduledAt);
    // Convert UTC → local for datetime-local input
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString().slice(0, 16);
    setForm({ ...w, scheduledAt: local, meetLink: '' });
    setModal('edit');
  };

  const save = async () => {
    if (!form.title.trim() || !form.scheduledAt) return alert('Title and date are required');
    setSaving(true);
    try {
      // datetime-local → UTC ISO
      const scheduledAtUTC = new Date(form.scheduledAt).toISOString();
      const payload = { ...form, scheduledAt: scheduledAtUTC };
      if (modal === 'create') await adminPost('/workshops', payload, token);
      else await adminPut(`/workshops/${form._id}`, payload, token);
      setModal(null);
      load();
    } catch (err) { alert(err.response?.data?.error || 'Error saving'); }
    setSaving(false);
  };

  const del = async (id) => {
    if (!window.confirm('Delete this workshop?')) return;
    await adminDelete(`/workshops/${id}`, token);
    load();
  };

  const viewRegistrations = async (w) => {
    setRegsModal({ workshop: w, registrations: [] });
    setRegsLoading(true);
    try {
      const r = await adminGet(`/workshops/${w._id}/registrations`, token);
      setRegsModal({ workshop: w, registrations: r.data.registrations || [] });
    } catch { setRegsModal({ workshop: w, registrations: [] }); }
    setRegsLoading(false);
  };

  const exportCSV = async (workshopId) => {
    try {
      const r = await fetch(`/api/${ADMIN_SECRET}/registrations/export/${workshopId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error('Export failed');
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `registrations-${workshopId}.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch { alert('Unable to export. Please try again.'); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const upcoming = workshops.filter(w => new Date(w.scheduledAt) >= new Date());
  const past     = workshops.filter(w => new Date(w.scheduledAt) <  new Date());

  return (
    <div>
      <div className="adm-header">
        <div>
          <h1 className="adm-header-title">Workshops &amp; Live Classes</h1>
          <p className="adm-header-sub">{upcoming.length} upcoming · {past.length} past</p>
        </div>
        <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={openCreate}>+ New Workshop</button>
      </div>

      <div className="adm-body">
        {/* FIX #5 notice */}
        {workshops.length === 0 && (
          <div className="adm-empty">
            <div className="adm-empty-icon">
              <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text3)' }}>
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <p className="adm-empty-title">No workshops yet</p>
            <p className="adm-empty-sub">Create your first live workshop session</p>
          </div>
        )}

        {workshops.length > 0 && (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date &amp; Time</th>
                  <th>Duration</th>
                  <th>Registrations</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workshops.map(w => (
                  <tr key={w._id}>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text)' }}>{w.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{w.category}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>
                        {new Date(w.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                        {new Date(w.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{w.durationMinutes} min</td>
                    <td>
                      <button className="adm-btn adm-btn-ghost adm-btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        onClick={() => viewRegistrations(w)}>
                        <UsersIcon /> {w.registrationCount || 0}
                      </button>
                    </td>
                    <td>
                      <span className={`adm-badge ${w.isActive ? 'adm-badge-green' : 'adm-badge-red'}`}>
                        {w.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {new Date(w.scheduledAt) < new Date() && (
                        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>Past</div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => openEdit(w)}>Edit</button>
                        <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => del(w._id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modal && (
        <div className="adm-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="adm-modal" style={{ maxWidth: 600 }}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">{modal === 'create' ? 'Create Workshop' : 'Edit Workshop'}</h2>
              <button className="adm-modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-input-group">
                <label className="adm-label">Title *</label>
                <input className="adm-input" value={form.title} maxLength={300}
                  onChange={e => set('title', e.target.value)} placeholder="e.g. Web Pentesting Masterclass" />
              </div>
              <div className="adm-input-group">
                <label className="adm-label">Description</label>
                <textarea className="adm-input" rows={3} value={form.description} maxLength={3000}
                  onChange={e => set('description', e.target.value)} placeholder="What will learners gain from this session?" />
              </div>
              <div className="adm-form-row">
                <div className="adm-input-group">
                  <label className="adm-label">Date &amp; Time *</label>
                  <input type="datetime-local" className="adm-input" value={form.scheduledAt}
                    onChange={e => set('scheduledAt', e.target.value)} />
                </div>
                <div className="adm-input-group">
                  <label className="adm-label">Duration (minutes)</label>
                  <input type="number" min="15" className="adm-input" value={form.durationMinutes}
                    onChange={e => set('durationMinutes', parseInt(e.target.value) || 60)} />
                </div>
              </div>
              <div className="adm-input-group">
                <label className="adm-label">Banner Image URL</label>
                <input className="adm-input" value={form.bannerImage}
                  onChange={e => set('bannerImage', e.target.value)} placeholder="https://..." />
              </div>

              {/* Meet link — SVG icon instead of emoji */}
              <div style={{ padding: 14, background: 'var(--accent-bg)', borderRadius: 12, border: '1px solid rgba(123,94,167,0.25)' }}>
                <label className="adm-label" style={{ color: 'var(--accent2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LockIcon /> Google Meet Link (stored encrypted)
                </label>
                <input className="adm-input" style={{ marginTop: 8 }} value={form.meetLink}
                  onChange={e => set('meetLink', e.target.value)}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx" />
                {modal === 'edit' && (
                  <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>
                    Leave blank to keep the existing encrypted link.
                  </p>
                )}
              </div>

              <div className="adm-form-row">
                <div className="adm-input-group">
                  <label className="adm-label">Category</label>
                  <input className="adm-input" value={form.category}
                    onChange={e => set('category', e.target.value)} placeholder="e.g. pentesting, aws..." />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
                  <label className="adm-toggle">
                    <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
                    <span>Active &amp; Visible</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="adm-btn adm-btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Saving…' : modal === 'create' ? 'Create Workshop' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registrations Modal */}
      {regsModal && (
        <div className="adm-overlay" onClick={e => e.target === e.currentTarget && setRegsModal(null)}>
          <div className="adm-modal" style={{ maxWidth: 720, maxHeight: '85vh', overflowY: 'auto' }}>
            <div className="adm-modal-header">
              <div>
                <h2 className="adm-modal-title">Registrations</h2>
                <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 3 }}>{regsModal.workshop.title}</p>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className="adm-btn adm-btn-ghost adm-btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  onClick={() => exportCSV(regsModal.workshop._id)}>
                  <DownloadIcon /> Export CSV
                </button>
                <button className="adm-modal-close" onClick={() => setRegsModal(null)}>✕</button>
              </div>
            </div>

            {regsLoading ? (
              <div style={{ textAlign: 'center', padding: 48 }}>
                <div className="adm-spinner" style={{ margin: '0 auto' }} />
              </div>
            ) : regsModal.registrations.length === 0 ? (
              <div className="adm-empty">
                <div className="adm-empty-icon"><UsersIcon /></div>
                <p className="adm-empty-title">No registrations yet</p>
              </div>
            ) : (
              <div className="adm-table-wrap" style={{ margin: 12 }}>
                <table className="adm-table">
                  <thead>
                    <tr><th>#</th><th>Name</th><th>Email</th><th>Mobile</th><th>Registered At</th></tr>
                  </thead>
                  <tbody>
                    {regsModal.registrations.map((r, i) => (
                      <tr key={r._id}>
                        <td style={{ color: 'var(--text3)', fontSize: 12 }}>{i + 1}</td>
                        <td style={{ fontWeight: 500, color: 'var(--text)' }}>{r.name}</td>
                        <td style={{ fontSize: 13 }}>{r.email}</td>
                        <td style={{ fontSize: 13 }}>{r.mobile || '—'}</td>
                        <td style={{ fontSize: 12, color: 'var(--text3)' }}>
                          {new Date(r.createdAt).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
