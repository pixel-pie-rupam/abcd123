import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { adminGet, adminPost, adminPut, adminDelete } from '../../utils/api';

const EMPTY = { title: '', description: '', imageUrl: '', order: 0, isActive: true };

const ImageIcon = () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const EyeIcon  = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOff   = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;

export default function JourneyAdmin() {
  const { token } = useAdmin();
  const [slides, setSlides] = useState([]);
  const [modal,  setModal]  = useState(null);
  const [form,   setForm]   = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);

  const load = () => adminGet('/journey', token).then(r => setSlides(r.data.slides || [])).catch(() => {});
  useEffect(load, [token]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const openCreate = () => { setForm({ ...EMPTY, order: slides.length }); setModal('create'); };
  const openEdit   = (s) => { setForm(s); setModal('edit'); };

  const save = async () => {
    if (!form.imageUrl.trim()) return alert('Image URL is required');
    setSaving(true);
    try {
      if (modal === 'create') await adminPost('/journey', form, token);
      else await adminPut(`/journey/${form._id}`, form, token);
      setModal(null); load();
    } catch (err) { alert(err.response?.data?.error || 'Error saving'); }
    setSaving(false);
  };

  const del = async (id) => {
    if (!window.confirm('Delete this slide?')) return;
    await adminDelete(`/journey/${id}`, token);
    load();
  };

  const toggle = async (s) => {
    await adminPut(`/journey/${s._id}`, { isActive: !s.isActive }, token);
    load();
  };

  return (
    <div>
      <div className="adm-header">
        <div>
          <h1 className="adm-header-title">Journey Gallery</h1>
          <p className="adm-header-sub">Image carousel shown on the Home page. Toggle visibility, reorder, add captions.</p>
        </div>
        <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={openCreate}>+ Add Slide</button>
      </div>

      <div className="adm-body">
        <div className="adm-info adm-info-violet" style={{ marginBottom: 20 }}>
          Slides appear in a full-width auto-rotating carousel on the Home page under "Our Story". Toggle the eye icon to show/hide individual slides without deleting them.
        </div>

        {slides.length === 0 ? (
          <div className="adm-empty">
            <div className="adm-empty-icon"><ImageIcon /></div>
            <p className="adm-empty-title">No slides yet</p>
            <p className="adm-empty-sub">Add image slides to showcase your company journey, events, and milestones.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {slides.map((s, i) => (
              <div key={s._id} className="adm-card" style={{
                overflow: 'hidden', opacity: s.isActive ? 1 : 0.5,
                border: `1px solid ${s.isActive ? 'var(--border-a)' : 'rgba(240,98,146,0.2)'}`,
              }}>
                {/* Image preview */}
                <div style={{ position: 'relative', height: 160, overflow: 'hidden', background: 'var(--bg4)' }}>
                  {s.imageUrl
                    ? <img src={s.imageUrl} alt={s.title || `Slide ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => setPreview(s.imageUrl)} onError={e => e.target.style.opacity = '0.2'} />
                    : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}><ImageIcon /></div>
                  }
                  {/* Order badge */}
                  <span style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,.6)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, backdropFilter: 'blur(6px)' }}>
                    #{i + 1}
                  </span>
                  {/* Active badge */}
                  <span className={`adm-badge ${s.isActive ? 'adm-badge-green' : 'adm-badge-red'}`}
                    style={{ position: 'absolute', top: 8, right: 8 }}>
                    {s.isActive ? 'Visible' : 'Hidden'}
                  </span>
                </div>

                <div style={{ padding: '14px 16px' }}>
                  {s.title && <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{s.title}</div>}
                  {s.description && <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5, marginBottom: 10 }}>{s.description}</div>}

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 10, borderTop: '1px solid var(--border-a)' }}>
                    <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => openEdit(s)}>Edit</button>
                    <button
                      className={`adm-btn adm-btn-sm ${s.isActive ? 'adm-btn-ghost' : 'adm-btn-success'}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                      onClick={() => toggle(s)}
                    >
                      {s.isActive ? <><EyeOff/> Hide</> : <><EyeIcon/> Show</>}
                    </button>
                    <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => del(s._id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit modal */}
      {modal && (
        <div className="adm-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="adm-modal" style={{ maxWidth: 520 }}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">{modal === 'create' ? 'Add Slide' : 'Edit Slide'}</h2>
              <button className="adm-modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-input-group">
                <label className="adm-label">Image URL *</label>
                <input className="adm-input" placeholder="https://… (direct image link)" value={form.imageUrl}
                  onChange={e => set('imageUrl', e.target.value)} />
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="preview" onError={e => e.target.style.display='none'}
                    style={{ marginTop: 10, width: '100%', height: 160, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border-b)' }} />
                )}
              </div>
              <div className="adm-input-group">
                <label className="adm-label">Title (optional — shown over image)</label>
                <input className="adm-input" placeholder="e.g. Our First Bootcamp — 2023" value={form.title} maxLength={200}
                  onChange={e => set('title', e.target.value)} />
              </div>
              <div className="adm-input-group">
                <label className="adm-label">Description (optional)</label>
                <textarea className="adm-input" rows={2} placeholder="Brief caption shown under the title…" value={form.description} maxLength={500}
                  onChange={e => set('description', e.target.value)} />
              </div>
              <div className="adm-form-row">
                <div className="adm-input-group">
                  <label className="adm-label">Order (lower = shown first)</label>
                  <input type="number" className="adm-input" min={0} value={form.order} onChange={e => set('order', parseInt(e.target.value) || 0)} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
                  <label className="adm-toggle">
                    <input type="checkbox" checked={!!form.isActive} onChange={e => set('isActive', e.target.checked)} style={{ accentColor: 'var(--accent)' }} />
                    <span>Visible on site</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="adm-btn adm-btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Slide'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Image lightbox */}
      {preview && (
        <div onClick={() => setPreview(null)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, cursor: 'zoom-out' }}>
          <img src={preview} alt="preview" style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 12 }} />
        </div>
      )}
    </div>
  );
}
