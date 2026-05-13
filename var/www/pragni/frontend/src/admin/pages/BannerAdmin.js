import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { adminGet, adminPost, adminPut, adminDelete } from '../../utils/api';

const EMPTY = {
  type: 'topbar',
  headline: '', subtext: '', message: '',
  imageUrl: '',
  ctaText: '', ctaUrl: '', ctaStyle: 'button',
  secondaryText: '', secondaryUrl: '',
  bgColor: '#7b5ea7', textColor: '#ffffff',
  ctaBgColor: '#2d4fd6', ctaTextColor: '#ffffff',
  overlayOpacity: 0.6,
  isClickable: true, isActive: false,
};

/* ── Live Preview Components ─────────────────────────────────────────── */
function TopbarPreview({ form }) {
  return (
    <div style={{
      width: '100%', minHeight: 44,
      background: form.imageUrl ? '#000' : (form.bgColor || '#7b5ea7'),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '8px 48px 8px 16px',
      position: 'relative',
      borderRadius: 8,
      overflow: 'hidden',
    }}>
      {form.imageUrl ? (
        <img src={form.imageUrl} alt="Banner" style={{ maxHeight: 44, maxWidth: '100%', objectFit: 'contain' }} onError={e => e.target.style.display='none'} />
      ) : (
        <span style={{ color: form.textColor || '#fff', fontSize: 13, fontWeight: 500, textAlign: 'center' }}>
          {form.message || <em style={{ opacity: 0.5 }}>Your banner text here…</em>}
          {form.ctaText && (
            <span style={{
              marginLeft: 14, padding: '4px 14px',
              background: form.ctaBgColor, color: form.ctaTextColor,
              borderRadius: 100, fontSize: 12, fontWeight: 700,
            }}>{form.ctaText}</span>
          )}
        </span>
      )}
      <span style={{
        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
        width: 22, height: 22, borderRadius: '50%',
        background: 'rgba(0,0,0,0.3)', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
      }}>✕</span>
    </div>
  );
}

function PopupPreview({ form }) {
  return (
    <div style={{
      width: '100%',
      background: 'rgba(0,0,0,0.5)',
      borderRadius: 8, padding: 16,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: 200,
    }}>
      <div style={{
        background: '#fff', borderRadius: 12,
        padding: '28px 32px', maxWidth: 380, width: '100%',
        position: 'relative', textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}>
        <span style={{
          position: 'absolute', top: 10, right: 14,
          fontSize: 18, color: '#999', cursor: 'pointer', lineHeight: 1,
        }}>✕</span>

        {form.imageUrl && (
          <img src={form.imageUrl} alt="" style={{ width: '100%', borderRadius: 8, marginBottom: 14, maxHeight: 120, objectFit: 'cover' }}
            onError={e => e.target.style.display='none'} />
        )}

        {form.headline && (
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', lineHeight: 1.2, marginBottom: 10 }}>
            {form.headline}
          </div>
        )}
        {!form.headline && <div style={{ fontSize: 20, fontWeight: 800, color: '#aaa', marginBottom: 10 }}>Your Headline Here</div>}

        {form.subtext && (
          <div style={{ fontSize: 13, color: '#666', marginBottom: 18, lineHeight: 1.6 }}>{form.subtext}</div>
        )}

        {form.ctaText && (
          <div style={{
            display: 'inline-block', width: '100%',
            background: form.ctaBgColor || '#2d4fd6',
            color: form.ctaTextColor || '#fff',
            padding: '13px 24px', borderRadius: 8,
            fontWeight: 700, fontSize: 15, marginBottom: 10,
            cursor: 'pointer',
          }}>{form.ctaText}</div>
        )}

        {form.secondaryText && (
          <div style={{ fontSize: 13, color: '#888', textDecoration: 'underline', cursor: 'pointer' }}>{form.secondaryText}</div>
        )}
      </div>
    </div>
  );
}

/* ── Toolbar Button ─── */
function TB({ active, onClick, title, children }) {
  return (
    <button title={title} onClick={onClick} style={{
      padding: '6px 10px', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13,
      background: active ? 'rgba(157,127,212,0.25)' : 'rgba(255,255,255,0.05)',
      color: active ? 'var(--violet3)' : 'var(--text2)',
      fontWeight: active ? 700 : 400,
      transition: 'all 0.15s',
      minWidth: 32, textAlign: 'center',
    }}>{children}</button>
  );
}

/* ── Rich-style Text Input with formatting helpers ─── */
function RichInput({ label, value, onChange, placeholder, multiline, hint }) {
  const [bold, setBold] = useState(false);
  const [upper, setUpper] = useState(false);

  const apply = (text) => {
    let t = text;
    if (upper) t = t.toUpperCase();
    return t;
  };

  const insertSnippet = (snippet) => {
    const newVal = value ? value + ' ' + snippet : snippet;
    onChange(newVal);
  };

  return (
    <div className="adm-input-group">
      <label className="adm-label">{label}</label>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 7, flexWrap: 'wrap', alignItems: 'center' }}>
        <TB active={bold} onClick={() => setBold(b => !b)} title="Bold preview">B</TB>
        <TB active={upper} onClick={() => setUpper(u => !u)} title="UPPERCASE">AA</TB>
        <div style={{ width: 1, height: 20, background: 'var(--border-b)', margin: '0 4px' }} />
        <TB onClick={() => insertSnippet('🎉')} title="Insert emoji">🎉</TB>
        <TB onClick={() => insertSnippet('→')} title="Arrow">→</TB>
        <TB onClick={() => insertSnippet('|')} title="Divider">|</TB>
        <div style={{ width: 1, height: 20, background: 'var(--border-b)', margin: '0 4px' }} />
        <span style={{ fontSize: 11, color: 'var(--text3)' }}>{value?.length || 0} chars</span>
      </div>

      {multiline ? (
        <textarea
          className="adm-input"
          value={value}
          onChange={e => onChange(apply(e.target.value))}
          placeholder={placeholder}
          rows={3}
          style={{ fontWeight: bold ? 700 : 400 }}
        />
      ) : (
        <input
          className="adm-input"
          value={value}
          onChange={e => onChange(apply(e.target.value))}
          placeholder={placeholder}
          style={{ fontWeight: bold ? 700 : 400 }}
        />
      )}
      {hint && <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 5, lineHeight: 1.5 }}>{hint}</p>}
    </div>
  );
}

/* ── Color Picker Row ─── */
function ColorPicker({ label, value, onChange }) {
  return (
    <div className="adm-input-group">
      <label className="adm-label">{label}</label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 }}>
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          style={{ width: 40, height: 38, border: '1px solid var(--border-b)', borderRadius: 8, cursor: 'pointer', padding: 2, background: 'rgba(255,255,255,0.04)', flexShrink: 0 }} />
        <input className="adm-input" value={value} onChange={e => onChange(e.target.value)} style={{ fontFamily: 'monospace', fontSize: 13 }} />
      </div>
    </div>
  );
}

/* ── Quick color presets ─── */
const PRESETS = [
  { label: 'Ocean',   bg: '#1a237e', cta: '#42a5f5' },
  { label: 'Violet',  bg: '#4a148c', cta: '#ce93d8' },
  { label: 'Teal',    bg: '#004d40', cta: '#80cbc4' },
  { label: 'Crimson', bg: '#b71c1c', cta: '#ef9a9a' },
  { label: 'Midnight',bg: '#0d0d1a', cta: '#7b5ea7' },
  { label: 'Slate',   bg: '#263238', cta: '#4fc3f7' },
];

/* ── Main Component ────────────────────────────────────────────────── */
export default function BannerAdmin() {
  const { token } = useAdmin();
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(false);
  const [activeTab, setActiveTab] = useState('content'); // content | style | behaviour
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const load = () => adminGet('/banner', token).then(r => setBanners(r.data.banners || [])).catch(() => {});
  useEffect(load, [token]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const openCreate = () => { setForm(EMPTY); setEditId(null); setModal(true); setActiveTab('content'); };
  const openEdit   = (b) => { setForm(b); setEditId(b._id); setModal(true); setActiveTab('content'); };
  const closeModal = () => { setModal(false); setForm(EMPTY); setEditId(null); };

  const save = async () => {
    const hasContent = form.message || form.imageUrl || form.headline;
    if (!hasContent) return alert('Add a message, headline, or image URL.');
    setSaving(true);
    try {
      if (editId) await adminPut(`/banner/${editId}`, form, token);
      else        await adminPost('/banner', form, token);
      window.dispatchEvent(new Event('banner-updated'));
      showToast(editId ? 'Banner updated!' : 'Banner created!');
      closeModal(); load();
    } catch (err) { alert(err.response?.data?.error || 'Error saving'); }
    setSaving(false);
  };

  const del = async (id) => {
    if (!window.confirm('Delete?')) return;
    await adminDelete(`/banner/${id}`, token);
    window.dispatchEvent(new Event('banner-updated'));
    load();
  };
  const toggle = async (b) => {
    await adminPut(`/banner/${b._id}`, { ...b, isActive: !b.isActive }, token);
    window.dispatchEvent(new Event('banner-updated'));
    load();
  };

  const applyPreset = (p) => setForm(f => ({ ...f, bgColor: p.bg, ctaBgColor: p.cta }));

  const TAB = ({ id, label }) => (
    <button onClick={() => setActiveTab(id)} style={{
      padding: '8px 18px', border: 'none', borderRadius: 8, cursor: 'pointer',
      fontSize: 13, fontWeight: 600,
      background: activeTab === id ? 'rgba(157,127,212,0.18)' : 'transparent',
      color: activeTab === id ? 'var(--violet3)' : 'var(--text3)',
      borderBottom: activeTab === id ? '2px solid var(--violet3)' : '2px solid transparent',
      transition: 'all 0.2s',
    }}>{label}</button>
  );

  return (
    <div>
      <div className="adm-header">
        <div>
          <div className="adm-header-title">Banner Manager</div>
          <div className="adm-header-sub">{banners.length} banner{banners.length !== 1 ? 's' : ''} · Topbar &amp; Popup styles</div>
        </div>
        <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={openCreate}>+ New Banner</button>
      </div>

      <div className="adm-body">
        <div className="adm-info adm-info-violet" style={{ marginBottom: 20 }}>
          Create a <strong>Topbar</strong> banner (thin fixed bar at top of page) or a <strong>Popup</strong> banner (centred modal like the example above).
          Only one banner can be active at a time. Visitors can close any banner.
        </div>

        {/* Banner list */}
        {banners.length === 0 ? (
          <div className="adm-card">
            <div className="adm-empty">
              <div className="adm-empty-icon" style={{ fontSize: 44, marginBottom: 12 }}>📢</div>
              <div className="adm-empty-title">No banners yet</div>
              <div className="adm-empty-sub">Create a topbar or popup banner to announce workshops, offers, or news.</div>
              <button className="adm-btn adm-btn-primary" style={{ marginTop: 18 }} onClick={openCreate}>+ Create Banner</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {banners.map(b => (
              <div key={b._id} className="adm-card" style={{
                padding: '14px 20px',
                display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                borderLeft: `3px solid ${b.bgColor || 'var(--violet)'}`,
              }}>
                {/* Type badge */}
                <span className={`adm-badge ${b.type === 'popup' ? 'adm-badge-cyan' : 'adm-badge-violet'}`}>
                  <span className="adm-badge-dot" />
                  {b.type === 'popup' ? 'Popup' : 'Topbar'}
                </span>

                {/* Image thumb */}
                {b.imageUrl && (
                  <img src={b.imageUrl} alt="" style={{ height: 40, maxWidth: 100, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border-b)', flexShrink: 0 }}
                    onError={e => e.target.style.display='none'} />
                )}

                {/* Content */}
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-display)' }}>
                    {b.headline || b.message || <em style={{ color: 'var(--text3)', fontStyle: 'italic' }}>Image-only banner</em>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {b.ctaText && <span>CTA: "{b.ctaText}"</span>}
                    {b.ctaUrl && <span>→ {b.ctaUrl.slice(0,40)}</span>}
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: b.bgColor, border: '1px solid rgba(255,255,255,0.2)', display: 'inline-block', verticalAlign: 'middle' }} />
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className={`adm-badge ${b.isActive ? 'adm-badge-green' : 'adm-badge-red'}`}>
                    <span className="adm-badge-dot" />
                    {b.isActive ? 'Live' : 'Draft'}
                  </span>
                  <button className={`adm-btn adm-btn-xs ${b.isActive ? 'adm-btn-ghost' : 'adm-btn-success'}`} onClick={() => toggle(b)}>
                    {b.isActive ? 'Deactivate' : 'Go Live'}
                  </button>
                  <button className="adm-btn adm-btn-ghost adm-btn-xs" onClick={() => openEdit(b)}>Edit</button>
                  <button className="adm-btn adm-btn-danger adm-btn-xs" onClick={() => del(b._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── EDITOR MODAL ── */}
      {modal && (
        <div className="adm-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="adm-modal" style={{ maxWidth: 780, width: '100%' }}>

            {/* Modal header */}
            <div className="adm-modal-header">
              <div className="adm-modal-title">{editId ? 'Edit Banner' : 'Create Banner'}</div>
              <button className="adm-modal-close" onClick={closeModal}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 480 }}>

              {/* ── LEFT: Editor panel ── */}
              <div style={{ borderRight: '1px solid var(--border-a)', display: 'flex', flexDirection: 'column' }}>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 2, padding: '12px 16px 0', borderBottom: '1px solid var(--border-a)' }}>
                  <TAB id="content"   label="Content" />
                  <TAB id="style"     label="Style" />
                  <TAB id="behaviour" label="Behaviour" />
                </div>

                <div style={{ padding: '18px 20px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* ── CONTENT TAB ── */}
                  {activeTab === 'content' && (<>

                    {/* Banner type toggle */}
                    <div>
                      <label className="adm-label">Banner Type</label>
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        {[
                          { id: 'topbar', label: 'Topbar', desc: 'Thin fixed bar at page top' },
                          { id: 'popup',  label: 'Popup',  desc: 'Centred modal overlay' },
                        ].map(t => (
                          <button key={t.id} onClick={() => set('type', t.id)} style={{
                            flex: 1, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', border: 'none',
                            background: form.type === t.id ? 'rgba(157,127,212,0.18)' : 'rgba(255,255,255,0.04)',
                            border: form.type === t.id ? '1.5px solid rgba(157,127,212,0.4)' : '1.5px solid var(--border-a)',
                            color: form.type === t.id ? 'var(--violet3)' : 'var(--text2)',
                            textAlign: 'left', transition: 'all 0.2s',
                          }}>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{t.label}</div>
                            <div style={{ fontSize: 11, opacity: 0.65, marginTop: 2 }}>{t.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Image URL */}
                    <div className="adm-input-group">
                      <label className="adm-label">Image URL <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400, color: 'var(--text3)' }}>(optional)</span></label>
                      <input className="adm-input" value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)}
                        placeholder={form.type === 'popup' ? 'https://… (shown above headline)' : 'https://… (replaces text, 1200×80px recommended)'} />
                      {form.imageUrl && (
                        <div style={{ marginTop: 6, borderRadius: 7, overflow: 'hidden', border: '1px solid var(--border-b)' }}>
                          <img src={form.imageUrl} alt="" style={{ width: '100%', maxHeight: 60, objectFit: 'cover', display: 'block' }}
                            onError={e => e.target.style.display='none'} />
                        </div>
                      )}
                    </div>

                    {form.type === 'popup' ? (<>
                      <RichInput label="Headline *" value={form.headline} onChange={v => set('headline', v)}
                        placeholder="Get 20% Off Your First Order" hint="Main bold text. Keep under 8 words." />
                      <RichInput label="Body Text" value={form.subtext} onChange={v => set('subtext', v)}
                        placeholder="Enter your email. Be the first to know about all things Pragni." multiline
                        hint="Supporting copy. 1-2 sentences max." />
                    </>) : (
                      <RichInput label="Banner Message *" value={form.message} onChange={v => set('message', v)}
                        placeholder="New workshop starting soon — limited seats!" hint="Keep under 100 characters for best display." />
                    )}

                    {/* CTA */}
                    <div className="adm-form-section">Call To Action</div>
                    <div className="adm-form-row" style={{ gap: 12 }}>
                      <div className="adm-input-group">
                        <label className="adm-label">Button / Link Text</label>
                        <input className="adm-input" value={form.ctaText} onChange={e => set('ctaText', e.target.value)}
                          placeholder="Register Now" />
                      </div>
                      <div className="adm-input-group">
                        <label className="adm-label">URL</label>
                        <input className="adm-input" value={form.ctaUrl} onChange={e => set('ctaUrl', e.target.value)}
                          placeholder="https://…" />
                      </div>
                    </div>
                    <div className="adm-input-group">
                      <label className="adm-label">CTA Style</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {['button','link'].map(s => (
                          <button key={s} onClick={() => set('ctaStyle', s)} style={{
                            padding: '7px 18px', borderRadius: 8, cursor: 'pointer', border: 'none',
                            background: form.ctaStyle === s ? 'rgba(157,127,212,0.18)' : 'rgba(255,255,255,0.04)',
                            border: form.ctaStyle === s ? '1px solid rgba(157,127,212,0.35)' : '1px solid var(--border-a)',
                            color: form.ctaStyle === s ? 'var(--violet3)' : 'var(--text2)',
                            fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
                          }}>{s}</button>
                        ))}
                      </div>
                    </div>

                    {form.type === 'popup' && (
                      <div className="adm-form-row" style={{ gap: 12 }}>
                        <div className="adm-input-group">
                          <label className="adm-label">Secondary Link Text</label>
                          <input className="adm-input" value={form.secondaryText} onChange={e => set('secondaryText', e.target.value)}
                            placeholder="Continue Shopping" />
                        </div>
                        <div className="adm-input-group">
                          <label className="adm-label">Secondary URL</label>
                          <input className="adm-input" value={form.secondaryUrl} onChange={e => set('secondaryUrl', e.target.value)}
                            placeholder="https://…" />
                        </div>
                      </div>
                    )}
                  </>)}

                  {/* ── STYLE TAB ── */}
                  {activeTab === 'style' && (<>
                    <div>
                      <label className="adm-label">Quick Presets</label>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                        {PRESETS.map(p => (
                          <button key={p.label} onClick={() => applyPreset(p)} style={{
                            padding: '7px 13px', borderRadius: 20, cursor: 'pointer', border: 'none',
                            background: p.bg, color: '#fff', fontSize: 12, fontWeight: 600,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                            transition: 'transform 0.15s',
                          }}
                            onMouseEnter={e => e.target.style.transform='scale(1.05)'}
                            onMouseLeave={e => e.target.style.transform='scale(1)'}
                          >{p.label}</button>
                        ))}
                      </div>
                    </div>

                    <div className="adm-form-row" style={{ gap: 12 }}>
                      <ColorPicker label="Background Color" value={form.bgColor} onChange={v => set('bgColor', v)} />
                      <ColorPicker label="Text Color" value={form.textColor} onChange={v => set('textColor', v)} />
                    </div>
                    <div className="adm-form-row" style={{ gap: 12 }}>
                      <ColorPicker label="Button Color" value={form.ctaBgColor} onChange={v => set('ctaBgColor', v)} />
                      <ColorPicker label="Button Text Color" value={form.ctaTextColor} onChange={v => set('ctaTextColor', v)} />
                    </div>

                    {form.type === 'popup' && (
                      <div className="adm-input-group">
                        <label className="adm-label">Overlay Darkness: {Math.round(form.overlayOpacity * 100)}%</label>
                        <input type="range" min="0" max="1" step="0.05"
                          value={form.overlayOpacity}
                          onChange={e => set('overlayOpacity', parseFloat(e.target.value))}
                          style={{ width: '100%', accentColor: 'var(--violet)' }} />
                      </div>
                    )}
                  </>)}

                  {/* ── BEHAVIOUR TAB ── */}
                  {activeTab === 'behaviour' && (<>
                    <div className="adm-info adm-info-violet">
                      Only <strong>one banner</strong> can be active at a time. Activating a new banner automatically deactivates the others.
                    </div>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border-a)', background: 'rgba(255,255,255,0.02)' }}>
                      <input type="checkbox" checked={!!form.isActive} onChange={e => set('isActive', e.target.checked)} style={{ marginTop: 2 }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>Show on homepage now</div>
                        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>Banner will appear immediately for all visitors.</div>
                      </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border-a)', background: 'rgba(255,255,255,0.02)' }}>
                      <input type="checkbox" checked={!!form.isClickable} onChange={e => set('isClickable', e.target.checked)} style={{ marginTop: 2 }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>Image is clickable</div>
                        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>Clicking the image opens the CTA URL.</div>
                      </div>
                    </label>
                  </>)}
                </div>
              </div>

              {/* ── RIGHT: Live Preview ── */}
              <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--teal)', boxShadow: '0 0 8px var(--teal)' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Live Preview</span>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {form.type === 'popup'
                    ? <PopupPreview form={form} />
                    : <TopbarPreview form={form} />
                  }
                </div>

                {/* Placement guide */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-a)', borderRadius: 10, padding: '12px 14px', fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
                  {form.type === 'popup' ? (
                    <>
                      <strong style={{ color: 'var(--violet3)' }}>Popup placement:</strong> Appears centred over the page with a dark overlay. Visitors can close it with the ✕ button or click outside to dismiss.
                    </>
                  ) : (
                    <>
                      <strong style={{ color: 'var(--violet3)' }}>Topbar placement:</strong> Fixed bar at the very top of the page, above the navbar. Always visible until the visitor clicks ✕.
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="adm-btn adm-btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Saving…' : editId ? 'Save Changes' : 'Create Banner'}
              </button>
            </div>

          </div>
        </div>
      )}

      {toast && <div className="adm-toast adm-toast-success">{toast}</div>}
    </div>
  );
}
