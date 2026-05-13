import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { adminGet, adminPost, adminPut, adminDelete } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

const LEVELS = ['beginner','intermediate','advanced'];

const EMPTY = {
  title:'', slug:'', category:'', description:'', level:'beginner', price:0, thumbnail:'',
  isFeatured:false, isPublished:false, isComing:false, syllabus:[], trainerId:'',
  // Premium course fields
  duration:'', prerequisites:'', certificationOnCompletion:false,
  premiumContent:'', hasProject:false, benefits:'',
};

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function CoursesAdmin() {
  const { token, isAdmin } = useAdmin();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trainers, setTrainers] = useState([]);
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [weekInput, setWeekInput] = useState({ weekNumber:'', title:'', topics:'' });
  const navigate = useNavigate();
  const adminPath = window.location.pathname.split('/')[1];

  const load = () => {
    setLoading(true);
    adminGet('/courses', token).then(r => setCourses(r.data.courses || [])).finally(() => setLoading(false));
    if (isAdmin) adminGet('/trainers', token).then(r => setTrainers(r.data.trainers || [])).catch(() => {});
  };

  const loadCategories = () => {
    // Use authenticated admin endpoint so it always works inside admin panel
    adminGet('/categories', token)
      .then(r => {
        const cats = r.data.categories || [];
        setCategories(cats);
      })
      .catch(() => {
        // fallback to public endpoint
        fetch('/api/categories/public')
          .then(r => r.json())
          .then(d => setCategories(d.categories || []))
          .catch(() => {});
      });
  };

  useEffect(() => {
    load();
    loadCategories();
  }, [token]);

  // Once categories load, set default category in form if not set
  useEffect(() => {
    if (categories.length > 0 && !form.category) {
      setForm(f => ({ ...f, category: categories[0].slug }));
    }
  }, [categories]);

  const openCreate = () => {
    // Reload categories fresh every time modal opens
    loadCategories();
    const firstCat = categories.length > 0 ? categories[0].slug : '';
    setForm({ ...EMPTY, category: firstCat });
    setModal('create');
  };
  const openEdit = (c) => { setForm({ ...c, price: c.price || 0, syllabus: c.syllabus || [] }); setModal('edit'); };

  const save = async () => {
    setSaving(true);
    try {
      if (modal === 'create') await adminPost('/courses', form, token);
      else await adminPut(`/courses/${form._id}`, form, token);
      setModal(null); load();
    } catch (err) { alert(err.response?.data?.error || 'Error saving'); }
    setSaving(false);
  };

  const del = async (id) => {
    if (!window.confirm('Delete this course? This cannot be undone.')) return;
    await adminDelete(`/courses/${id}`, token);
    load();
  };

  const addWeek = () => {
    if (!weekInput.weekNumber || !weekInput.title) return;
    const topics = weekInput.topics.split('\n').map(t => t.trim()).filter(Boolean);
    setForm(f => ({ ...f, syllabus: [...(f.syllabus || []), { weekNumber: parseInt(weekInput.weekNumber), title: weekInput.title, topics }] }));
    setWeekInput({ weekNumber:'', title:'', topics:'' });
  };

  const removeWeek = (i) => setForm(f => ({ ...f, syllabus: f.syllabus.filter((_, j) => j !== i) }));

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="adm-header">
        <div>
          <h1 className="adm-header-title">Courses</h1>
          <p className="adm-header-sub">{courses.length} total courses</p>
        </div>
        <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={openCreate}>+ New Course</button>
      </div>

      <div className="adm-body">
        {loading
          ? <div className="adm-skeleton" style={{ height: 200, borderRadius: 14 }} />
          : <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Title</th><th>Category</th><th>Level</th><th>Price</th>
                    <th>Published</th><th>Coming Soon</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.length === 0
                    ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>No courses yet. Create one!</td></tr>
                    : courses.map(c => (
                      <tr key={c._id}>
                        <td style={{ fontWeight: 500, color: 'var(--text)', maxWidth: 220 }}>{c.title}</td>
                        <td><span className="adm-badge adm-badge-violet">{c.category}</span></td>
                        <td>{c.level}</td>
                        <td>{c.price === 0 ? <span className="adm-badge adm-badge-green">FREE</span> : `₹${c.price}`}</td>
                        <td>
                          <span className={`badge ${c.isPublished ? 'badge-green' : 'badge-red'}`}>
                            {c.isPublished ? '✓ Live' : '✗ Draft'}
                          </span>
                        </td>
                        <td><span className={`badge ${c.isComing ? 'badge-amber' : ''}`}>{c.isComing ? '🔜 Yes' : '—'}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => navigate(`/${adminPath}/courses/${c._id}/videos`)}>Videos</button>
                            <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => openEdit(c)}>Edit</button>
                            {isAdmin && <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => del(c._id)}>Del</button>}
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
        }
      </div>

      {/* Modal */}
      {modal && (
        <div className="adm-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="adm-modal" style={{ maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="adm-modal-header">
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>{modal === 'create' ? 'Create Course' : 'Edit Course'}</h2>
              <button className="adm-modal-close" onClick={() => setModal(null)}>✕</button>
            </div>

            <div className="adm-modal-body" style={{display:"flex",flexDirection:"column",gap:18}}>
              <div className="adm-form-section">Basic Info</div>
              <div className="adm-form-row">
                <div className="adm-input-group">
                  <label className="adm-label">Course Title *</label>
                  <input className="adm-input" value={form.title} onChange={e => { set('title', e.target.value); if (modal === 'create') set('slug', slugify(e.target.value)); }} placeholder="e.g. AWS Cloud Practitioner" />
                </div>
                <div className="adm-input-group">
                  <label className="adm-label">Slug (URL) *</label>
                  <input className="adm-input" value={form.slug} onChange={e => set('slug', slugify(e.target.value))} placeholder="aws-cloud-practitioner" />
                </div>
              </div>

              <div className="adm-form-row">
                <div className="adm-input-group">
                  <label className="adm-label">Category *</label>
                  <select className="adm-input" value={form.category} onChange={e => set('category', e.target.value)}>
                    {categories.length === 0 && <option value="">No categories yet — create in Admin → Categories</option>}
                    {categories.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
                <div className="adm-input-group">
                  <label className="adm-label">Level *</label>
                  <select className="adm-input" value={form.level} onChange={e => set('level', e.target.value)}>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="adm-input-group">
                <label className="adm-label">Description *</label>
                <textarea className="adm-input" rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief course description..." />
              </div>

              {isAdmin && trainers.length > 0 && (
                <div className="adm-input-group">
                  <label className="adm-label">Assign Trainer</label>
                  <select className="adm-input"
                    value={form.trainerId || (typeof form.trainer === 'object' ? form.trainer?._id : form.trainer) || ''}
                    onChange={e => set('trainerId', e.target.value)}>
                    <option value="">— Select Trainer —</option>
                    {trainers.filter(t => t.isActive).map(t => (
                      <option key={t._id} value={t._id}>{t.name} ({t.role})</option>
                    ))}
                  </select>
                  <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
                    Assigned trainer can manage this course, upload videos and reply to comments.
                  </p>
                </div>
              )}

              <div className="adm-form-row">
                <div className="adm-input-group">
                  <label className="adm-label">Price (₹, 0 = Free)</label>
                  <input type="number" min="0" className="adm-input" value={form.price} onChange={e => set('price', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="adm-input-group">
                  <label className="adm-label">Thumbnail URL</label>
                  <input className="adm-input" value={form.thumbnail} onChange={e => set('thumbnail', e.target.value)} placeholder="https://..." />
                </div>
              </div>

              <div className="adm-form-section" style={{ marginTop: 8 }}>Publishing</div>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {[['isPublished','✓ Published'], ['isFeatured','⭐ Featured'], ['isComing','🔜 Coming Soon']].map(([k, lbl]) => (
                  <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                    <input type="checkbox" checked={!!form[k]} onChange={e => set(k, e.target.checked)} />
                    {lbl}
                  </label>
                ))}
              </div>

              {/* Premium Course Details */}
              {form.price > 0 && (
                <>
                  <div className="adm-form-section" style={{ marginTop: 8, color: 'var(--accent2)' }}>💎 Premium Course Details</div>

                  <div className="adm-input-group">
                    <label className="adm-label">Key Benefits (one per line)</label>
                    <textarea className="adm-input" rows={4} value={form.benefits} onChange={e => set('benefits', e.target.value)}
                      placeholder={"Master real-world attack techniques\nGet hands-on labs\nIndustry-recognised certification"} />
                    <p style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>Shown as bullet points on the course page.</p>
                  </div>

                  <div className="adm-form-row">
                    <div className="adm-input-group">
                      <label className="adm-label">Duration</label>
                      <input className="adm-input" value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="e.g. 40 hours · 8 weeks" />
                    </div>
                    <div className="adm-input-group">
                      <label className="adm-label">Prerequisites</label>
                      <input className="adm-input" value={form.prerequisites} onChange={e => set('prerequisites', e.target.value)} placeholder="e.g. Basic networking knowledge" />
                    </div>
                  </div>

                  <div className="adm-input-group">
                    <label className="adm-label">Premium Content Description</label>
                    <textarea className="adm-input" rows={3} value={form.premiumContent} onChange={e => set('premiumContent', e.target.value)}
                      placeholder="Describe what exclusive content is included (live sessions, tools, private repo, etc.)" />
                  </div>

                  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                      <input type="checkbox" checked={!!form.certificationOnCompletion} onChange={e => set('certificationOnCompletion', e.target.checked)} />
                      🏆 Certificate on Completion
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                      <input type="checkbox" checked={!!form.hasProject} onChange={e => set('hasProject', e.target.checked)} />
                      🛠️ Includes a Project
                    </label>
                  </div>
                </>
              )}

              <div className="adm-form-section" style={{ marginTop: 8 }}>Syllabus</div>
              {(form.syllabus || []).map((w, i) => (
                <div key={i} style={{ padding: '12px 14px', background: 'var(--bg4)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Week {w.weekNumber}: {w.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{(w.topics || []).join(' · ')}</div>
                  </div>
                  <button className="adm-btn adm-btn-danger adm-btn-sm" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => removeWeek(i)}>✕</button>
                </div>
              ))}
              <div style={{ padding: 16, background: 'var(--bg4)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="adm-form-row">
                  <div className="adm-input-group">
                    <label className="adm-label">Week #</label>
                    <input type="number" className="adm-input" placeholder="1" value={weekInput.weekNumber} onChange={e => setWeekInput(w => ({ ...w, weekNumber: e.target.value }))} />
                  </div>
                  <div className="adm-input-group">
                    <label className="adm-label">Week Title</label>
                    <input className="adm-input" placeholder="Introduction to AWS" value={weekInput.title} onChange={e => setWeekInput(w => ({ ...w, title: e.target.value }))} />
                  </div>
                </div>
                <div className="adm-input-group">
                  <label className="adm-label">Topics (one per line)</label>
                  <textarea className="adm-input" rows={3} placeholder="EC2 Basics&#10;S3 Storage&#10;IAM Roles" value={weekInput.topics} onChange={e => setWeekInput(w => ({ ...w, topics: e.target.value }))} />
                </div>
                <button className="adm-btn adm-btn-ghost adm-btn-sm" style={{ alignSelf: 'flex-start' }} onClick={addWeek}>+ Add Week</button>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button className="adm-btn adm-btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button className="adm-btn adm-btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : modal === 'create' ? 'Create Course' : 'Save Changes'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
