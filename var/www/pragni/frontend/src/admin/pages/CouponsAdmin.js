import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { adminGet, adminPost, adminPut, adminDelete } from '../../utils/api';

const EMPTY = {
  code: '', discountType: 'percent', discountValue: 10,
  maxUses: 0, expiresAt: '', isActive: true, description: '',
};

export default function CouponsAdmin() {
  const { token } = useAdmin();
  const [coupons, setCoupons] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => adminGet('/coupons', token).then(r => setCoupons(r.data.coupons || [])).catch(() => {});
  useEffect(load, [token]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openCreate = () => { setForm(EMPTY); setModal('create'); };
  const openEdit = (c) => {
    setForm({
      ...c,
      expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 10) : '',
    });
    setModal('edit');
  };

  const save = async () => {
    if (!form.code.trim()) return alert('Coupon code is required');
    if (!form.discountValue || form.discountValue <= 0) return alert('Discount value must be > 0');
    if (form.discountType === 'percent' && form.discountValue > 100) return alert('Percent discount cannot exceed 100');
    setSaving(true);
    try {
      if (modal === 'create') await adminPost('/coupons', form, token);
      else await adminPut(`/coupons/${form._id}`, form, token);
      setModal(null); load();
    } catch (err) { alert(err.response?.data?.error || 'Error saving coupon'); }
    setSaving(false);
  };

  const del = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    await adminDelete(`/coupons/${id}`, token);
    load();
  };

  const toggle = async (c) => {
    await adminPut(`/coupons/${c._id}`, { isActive: !c.isActive }, token);
    load();
  };

  return (
    <div>
      <div className="adm-header">
        <div>
          <h1 className="adm-header-title">Coupon Codes</h1>
          <p className="adm-header-sub">Pre-define discount coupons for students. Applied codes are recorded in enrollment leads.</p>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={openCreate}>+ New Coupon</button>
      </div>

      <div className="adm-body">
        {coupons.length === 0 ? (
          <div className="adm-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text3)', marginBottom: 12 }}>
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            <p>No coupons yet. Create your first coupon to offer discounts.</p>
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Uses</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c._id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', background: 'rgba(108,71,255,0.12)', color: 'var(--accent2)', padding: '3px 10px', borderRadius: 6, fontWeight: 700, fontSize: 13, letterSpacing: '0.08em' }}>
                        {c.code}
                      </span>
                      {c.description && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{c.description}</div>}
                    </td>
                    <td>
                      {c.discountType === 'percent'
                        ? <span className="adm-badge adm-badge-purple">{c.discountValue}% off</span>
                        : <span className="adm-badge adm-badge-blue">₹{c.discountValue} off</span>
                      }
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {c.usedCount}{c.maxUses > 0 ? ` / ${c.maxUses}` : ' / ∞'}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text3)' }}>
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <button
                        onClick={() => toggle(c)}
                        className={`adm-badge ${c.isActive ? 'adm-badge-green' : 'adm-badge-red'}`}
                        style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0 }}
                      >
                        {c.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => openEdit(c)}>Edit</button>
                        <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => del(c._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="adm-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="adm-modal" style={{ maxWidth: 500 }}>
            <h2 className="adm-modal-title">{modal === 'create' ? 'New Coupon' : 'Edit Coupon'}</h2>
            <div className="adm-form-group">
              <label className="adm-label">Coupon Code *</label>
              <input className="adm-input" placeholder="e.g. SAVE20" value={form.code} maxLength={50}
                onChange={e => set('code', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                disabled={modal === 'edit'}
                style={{ fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}
              />
            </div>
            <div className="adm-form-row">
              <div className="adm-form-group">
                <label className="adm-label">Discount Type</label>
                <select className="adm-input" value={form.discountType} onChange={e => set('discountType', e.target.value)}>
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Discount Value *</label>
                <input className="adm-input" type="number" min="0" max={form.discountType === 'percent' ? 100 : undefined}
                  value={form.discountValue} onChange={e => set('discountValue', parseFloat(e.target.value) || 0)} />
              </div>
            </div>
            <div className="adm-form-row">
              <div className="adm-form-group">
                <label className="adm-label">Max Uses (0 = unlimited)</label>
                <input className="adm-input" type="number" min="0" value={form.maxUses} onChange={e => set('maxUses', parseInt(e.target.value) || 0)} />
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Expiry Date (optional)</label>
                <input className="adm-input" type="date" value={form.expiresAt} onChange={e => set('expiresAt', e.target.value)} />
              </div>
            </div>
            <div className="adm-form-group">
              <label className="adm-label">Description (internal note)</label>
              <input className="adm-input" placeholder="e.g. Summer sale discount" value={form.description} maxLength={300}
                onChange={e => set('description', e.target.value)} />
            </div>
            <div className="adm-form-group">
              <label className="adm-toggle">
                <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
                <span>Active (students can apply this code)</span>
              </label>
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="adm-btn adm-btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Save Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
