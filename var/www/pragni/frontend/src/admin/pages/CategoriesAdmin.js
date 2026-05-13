import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { adminGet, adminPost, adminPut, adminDelete } from '../../utils/api';

const EMPTY = { slug: '', label: '', icon: '📁', imageUrl: '', color: '#7b5ea7', glow: 'rgba(123,94,167,0.2)', order: 0, isActive: true };

export default function CategoriesAdmin() {
  const { token } = useAdmin();
  const [cats, setCats] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const showToast = (msg, type='success') => { setToast({ msg, type }); setTimeout(() => setToast(''), 3000); };

  const load = async () => {
    setLoading(true);
    try { const r = await adminGet('/categories', token); setCats(r.data.categories || []); } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, [token]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const openCreate = () => { setForm(EMPTY); setModal('create'); };
  const openEdit = (c) => { setForm(c); setModal('edit'); };
  const closeModal = () => { setModal(null); setForm(EMPTY); };

  const save = async () => {
    if (!form.slug || !form.label) return alert('Slug and label are required');
    setSaving(true);
    try {
      if (modal === 'create') await adminPost('/categories', form, token);
      else await adminPut(`/categories/${form._id}`, form, token);
      showToast(modal === 'create' ? 'Category created!' : 'Category updated!');
      closeModal(); await load();
    } catch (err) { alert(err.response?.data?.error || 'Error saving'); }
    setSaving(false);
  };

  const del = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    await adminDelete(`/categories/${id}`, token);
    showToast('Category deleted', 'error');
    await load();
  };

  const toggle = async (c) => {
    await adminPut(`/categories/${c._id}`, { ...c, isActive: !c.isActive }, token);
    await load();
  };

  return (
    <div>
      <div className="adm-header">
        <div>
          <div className="adm-header-title">Categories</div>
          <div className="adm-header-sub">{cats.length} categor{cats.length !== 1 ? 'ies' : 'y'} · Used in Courses page &amp; footer</div>
        </div>
        <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={openCreate}>+ New Category</button>
      </div>

      <div className="adm-body">
        <div className="adm-info adm-info-violet" style={{ marginBottom: 20 }}>
          Categories created here appear automatically in the Courses page filter buttons and in the "Add Course" form. Order controls display sequence.
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map(i => <div key={i} className="adm-skeleton" style={{ height: 72, borderRadius: 16 }} />)}
          </div>
        ) : cats.length === 0 ? (
          <div className="adm-card">
            <div className="adm-empty">
              <div className="adm-empty-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{color:"var(--text3)"}}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div>
              <div className="adm-empty-title">No categories yet</div>
              <div className="adm-empty-sub">Create your first category to start organizing courses.</div>
              <button className="adm-btn adm-btn-primary" style={{ marginTop: 18 }} onClick={openCreate}>+ Create Category</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cats.map(c => (
              <div key={c._id} className="adm-card" style={{
                padding: '14px 20px',
                display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                borderLeft: `3px solid ${c.color || 'var(--violet)'}`,
              }}>
                {c.imageUrl
                  ? <img src={c.imageUrl} alt={c.label} onError={e => e.target.style.display='none'}
                      style={{ width: 42, height: 42, borderRadius: 10, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }} />
                  : <span style={{ fontSize: 28, minWidth: 36, textAlign: 'center' }}>{c.icon}</span>
                }
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5, fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>{c.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3, display: 'flex', gap: 10, alignItems: 'center' }}>
                    <code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 7px', borderRadius: 5, fontFamily: 'monospace' }}>{c.slug}</code>
                    <span>Order: {c.order}</span>
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: c.color, border: '1px solid rgba(255,255,255,0.2)', display: 'inline-block' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className={`adm-badge ${c.isActive ? 'adm-badge-green' : 'adm-badge-red'}`}>
                    <span className="adm-badge-dot" />
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button className={`adm-btn adm-btn-xs ${c.isActive ? 'adm-btn-ghost' : 'adm-btn-success'}`} onClick={() => toggle(c)}>
                    {c.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button className="adm-btn adm-btn-ghost adm-btn-xs" onClick={() => openEdit(c)}>Edit</button>
                  <button className="adm-btn adm-btn-danger adm-btn-xs" onClick={() => del(c._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="adm-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="adm-modal">
            <div className="adm-modal-header">
              <div className="adm-modal-title">{modal === 'create' ? 'New Category' : 'Edit Category'}</div>
              <button className="adm-modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-form-section">Basic Info</div>
              <div className="adm-form-row">
                <div className="adm-input-group">
                  <label className="adm-label">Slug * <span style={{ textTransform: 'none', letterSpacing: 0 }}>(e.g. aws)</span></label>
                  <input className="adm-input" value={form.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="aws" />
                </div>
                <div className="adm-input-group">
                  <label className="adm-label">Label *</label>
                  <input className="adm-input" value={form.label} onChange={e => set('label', e.target.value)} placeholder="AWS Cloud" />
                </div>
              </div>
              <div className="adm-form-row">
                <div className="adm-input-group">
                  <label className="adm-label">Icon (emoji)</label>
                  <input className="adm-input" value={form.icon} onChange={e => set('icon', e.target.value)} placeholder="☁️" style={{ fontSize: 22 }} />
                </div>
                <div className="adm-input-group">
                  <label className="adm-label">Display Order</label>
                  <input type="number" className="adm-input" value={form.order} onChange={e => set('order', +e.target.value)} />
                </div>
              </div>
              <div className="adm-input-group">
                <label className="adm-label">Category Image URL <span style={{ textTransform:'none', letterSpacing:0, color:'var(--text3)', fontWeight:400 }}>(replaces emoji if set)</span></label>
                <input className="adm-input" value={form.imageUrl || ''} onChange={e => set('imageUrl', e.target.value)} placeholder="https://… (PNG/SVG/WebP recommended)" />
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="preview" onError={e => e.target.style.display='none'}
                    style={{ marginTop: 8, width: 48, height: 48, borderRadius: 10, objectFit: 'cover', border: '1px solid var(--border-b)' }} />
                )}
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                  If an image URL is set it appears instead of the emoji on the Home &amp; Courses pages.
                </div>
              </div>

              <div className="adm-form-section">Style</div>
              <div className="adm-form-row">
                <div className="adm-input-group">
                  <label className="adm-label">Color</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="color" value={form.color} onChange={e => set('color', e.target.value)}
                      style={{ width: 44, height: 42, border: '1px solid var(--border-b)', borderRadius: 10, cursor: 'pointer', padding: 3, background: 'rgba(255,255,255,0.04)' }} />
                    <input className="adm-input" value={form.color} onChange={e => set('color', e.target.value)} style={{ fontFamily: 'monospace' }} />
                  </div>
                </div>
                <div className="adm-input-group">
                  <label className="adm-label">Glow (rgba)</label>
                  <input className="adm-input" value={form.glow} onChange={e => set('glow', e.target.value)} placeholder="rgba(123,94,167,0.2)" style={{ fontFamily: 'monospace', fontSize: 12 }} />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13.5, color: 'var(--text2)' }}>
                <input type="checkbox" checked={!!form.isActive} onChange={e => set('isActive', e.target.checked)} />
                Active — visible on site
              </label>
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="adm-btn adm-btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Saving…' : modal === 'create' ? 'Create Category' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`adm-toast adm-toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
