import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { adminGet, adminPost, adminPut, adminDelete } from '../../utils/api';

const EMPTY = { title: '', description: '', thumbnail: '', courses: [], bundlePrice: 0, isActive: true, isFeatured: false };

export default function BundlesAdmin() {
  const { token } = useAdmin();
  const [bundles, setBundles] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    adminGet('/bundles', token).then(r => setBundles(r.data.bundles || [])).catch(() => {});
    adminGet('/courses', token).then(r => setAllCourses((r.data.courses || []).filter(c => c.price > 0))).catch(() => {});
  };
  useEffect(load, [token]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleCourse = (id) => {
    setForm(f => ({
      ...f,
      courses: f.courses.includes(id) ? f.courses.filter(c => c !== id) : [...f.courses, id],
    }));
  };

  const openCreate = () => { setForm(EMPTY); setModal('create'); };
  const openEdit = (b) => {
    setForm({ ...b, courses: (b.courses || []).map(c => c._id || c) });
    setModal('edit');
  };

  const bundleTotal = () => {
    return allCourses
      .filter(c => form.courses.includes(c._id))
      .reduce((sum, c) => sum + (c.price || 0), 0);
  };

  const save = async () => {
    if (!form.title.trim()) return alert('Bundle title required');
    if (form.courses.length < 2) return alert('Please select at least 2 courses');
    if (!form.bundlePrice || form.bundlePrice <= 0) return alert('Bundle price required');
    setSaving(true);
    try {
      if (modal === 'create') await adminPost('/bundles', form, token);
      else await adminPut(`/bundles/${form._id}`, form, token);
      setModal(null); load();
    } catch (err) { alert(err.response?.data?.error || 'Error saving bundle'); }
    setSaving(false);
  };

  const del = async (id) => {
    if (!window.confirm('Delete this bundle?')) return;
    await adminDelete(`/bundles/${id}`, token);
    load();
  };

  const individualTotal = (b) => (b.courses || []).reduce((s, c) => s + (c.price || 0), 0);
  const savings = (b) => Math.max(0, individualTotal(b) - b.bundlePrice);

  return (
    <div>
      <div className="adm-header">
        <div>
          <h1 className="adm-header-title">Premium Bundles</h1>
          <p className="adm-header-sub">Group multiple paid courses into a bundle with a discounted price.</p>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={openCreate}>+ New Bundle</button>
      </div>

      <div className="adm-body">
        {bundles.length === 0 ? (
          <div className="adm-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text3)', marginBottom: 12 }}>
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            <p>No bundles yet. Bundle courses together for a discounted price.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {bundles.map(b => (
              <div key={b._id} className="adm-card adm-card-inner" style={{ position: 'relative' }}>
                {b.isFeatured && <span className="adm-badge adm-badge-purple" style={{ position: 'absolute', top: 14, right: 14 }}>Featured</span>}
                {b.thumbnail && (
                  <img src={b.thumbnail} alt={b.title} style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 10, marginBottom: 14 }} />
                )}
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{b.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>{(b.courses || []).length} courses</div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Bundle Price</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent2)' }}>₹{b.bundlePrice}</div>
                  </div>
                  {savings(b) > 0 && (
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>You Save</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#26d0a1' }}>₹{savings(b)}</div>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14 }}>
                  {(b.courses || []).map(c => c.title).join(', ')}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className={`adm-badge ${b.isActive ? 'adm-badge-green' : 'adm-badge-red'}`}>{b.isActive ? 'Active' : 'Hidden'}</span>
                  <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => openEdit(b)}>Edit</button>
                  <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => del(b._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="adm-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="adm-modal" style={{ maxWidth: 620, maxHeight: '92vh', overflowY: 'auto' }}>
            <h2 className="adm-modal-title">{modal === 'create' ? 'New Bundle' : 'Edit Bundle'}</h2>

            <div className="adm-form-group">
              <label className="adm-label">Bundle Title *</label>
              <input className="adm-input" placeholder="e.g. Full-Stack Security Mastery Bundle" value={form.title} maxLength={300}
                onChange={e => set('title', e.target.value)} />
            </div>
            <div className="adm-form-group">
              <label className="adm-label">Description</label>
              <textarea className="adm-input" rows={3} placeholder="What's included, who it's for…" value={form.description} maxLength={3000}
                onChange={e => set('description', e.target.value)} />
            </div>
            <div className="adm-form-group">
              <label className="adm-label">Thumbnail URL</label>
              <input className="adm-input" placeholder="https://…" value={form.thumbnail} onChange={e => set('thumbnail', e.target.value)} />
            </div>

            <div className="adm-form-group">
              <label className="adm-label">Select Courses * (min 2)</label>
              <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border2)', borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {allCourses.length === 0 && <span style={{ color: 'var(--text3)', fontSize: 13 }}>No paid courses available</span>}
                {allCourses.map(c => (
                  <label key={c._id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                    <input type="checkbox" checked={form.courses.includes(c._id)} onChange={() => toggleCourse(c._id)} />
                    <span>{c.title}</span>
                    <span style={{ marginLeft: 'auto', color: 'var(--accent2)', fontWeight: 700 }}>₹{c.price}</span>
                  </label>
                ))}
              </div>
              {form.courses.length >= 2 && (
                <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text2)' }}>
                  Individual total: <strong>₹{bundleTotal()}</strong>
                  {form.bundlePrice > 0 && bundleTotal() > form.bundlePrice && (
                    <span style={{ color: '#26d0a1', marginLeft: 12 }}>
                      Saving: ₹{bundleTotal() - form.bundlePrice} ({Math.round((1 - form.bundlePrice / bundleTotal()) * 100)}% off)
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="adm-form-group">
              <label className="adm-label">Bundle Price (₹) *</label>
              <input className="adm-input" type="number" min="0" placeholder="0"
                value={form.bundlePrice} onChange={e => set('bundlePrice', parseFloat(e.target.value) || 0)} />
            </div>

            <div style={{ display: 'flex', gap: 20 }}>
              <label className="adm-toggle"><input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} /><span>Active</span></label>
              <label className="adm-toggle"><input type="checkbox" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} /><span>Featured</span></label>
            </div>

            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="adm-btn adm-btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Save Bundle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
