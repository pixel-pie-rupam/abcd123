import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { adminGet, ADMIN_SECRET } from '../../utils/api';
import axios from 'axios';

const ADMIN_BASE = `/api/${process.env.REACT_APP_ADMIN_PATH || ADMIN_SECRET || 'xK9mP2qR7nL4wV'}`;
const apiPatch  = (url, data, token) => axios.patch(`${ADMIN_BASE}${url}`, data, { headers: { Authorization: `Bearer ${token}` } });
const apiDelete = (url, token)       => axios.delete(`${ADMIN_BASE}${url}`,        { headers: { Authorization: `Bearer ${token}` } });

const STATUS_OPTIONS = [
  { val: 'pending',        label: 'Pending',         color: '#ffca28' },
  { val: 'contacted',      label: 'Contacted',        color: '#4fc3f7' },
  { val: 'enrolled',       label: 'Enrolled',         color: '#26d0a1' },
  { val: 'followup',       label: 'Follow Up',        color: '#c4a8ff' },
  { val: 'not_interested', label: 'Not Interested',   color: '#f06292' },
];

// Icons
const MailIcon      = () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const WhatsAppIcon  = () => <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;
const EditIcon      = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon     = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const DownloadIcon  = () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;

function StatusBadge({ val }) {
  const s = STATUS_OPTIONS.find(o => o.val === val) || STATUS_OPTIONS[0];
  return <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: s.color + '18', border: `1px solid ${s.color}44`, color: s.color }}>{s.label}</span>;
}

export default function EnrollmentsAdmin() {
  const { token } = useAdmin();
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editModal, setEditModal]     = useState(null); // enrollment being edited
  const [editForm, setEditForm]       = useState({});
  const [saving, setSaving]           = useState(false);
  const [search, setSearch]           = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [eRes, cRes] = await Promise.all([
        adminGet('/enrollments', token),
        adminGet('/courses', token),
      ]);
      setEnrollments(eRes.data.enrollments || []);
      setCourses(cRes.data.courses?.filter(c => c.price > 0) || []);
    } catch { setEnrollments([]); }
    setLoading(false);
  };
  useEffect(load, [token]);

  const openEdit = (e) => { setEditForm({ ...e, courseId: e.courseId?._id || e.courseId }); setEditModal(e._id); };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await apiPatch(`/enrollments/${editModal}`, {
        name:          editForm.name,
        email:         editForm.email,
        mobile:        editForm.mobile,
        altEmail:      editForm.altEmail || '',
        altPhone:      editForm.altPhone || '',
        notes:         editForm.notes   || '',
        contacted:     !!editForm.contacted,
        contactStatus: editForm.contactStatus || 'pending',
      }, token);
      setEditModal(null);
      load();
    } catch { alert('Error saving'); }
    setSaving(false);
  };

  const toggleContacted = async (e) => {
    try {
      await apiPatch(`/enrollments/${e._id}`, { contacted: !e.contacted }, token);
      setEnrollments(prev => prev.map(en => en._id === e._id ? { ...en, contacted: !e.contacted } : en));
    } catch {}
  };

  const setStatus = async (e, status) => {
    try {
      await apiPatch(`/enrollments/${e._id}`, { contactStatus: status }, token);
      setEnrollments(prev => prev.map(en => en._id === e._id ? { ...en, contactStatus: status } : en));
    } catch {}
  };

  const deleteEnrollment = async (id) => {
    if (!window.confirm('Delete this enrollment lead?')) return;
    try { await apiDelete(`/enrollments/${id}`, token); load(); } catch { alert('Error deleting'); }
  };

  const exportCSV = async () => {
    try {
      const url = filterCourse !== 'all'
        ? `/api/${ADMIN_SECRET}/enrollments/export?courseId=${filterCourse}`
        : `/api/${ADMIN_SECRET}/enrollments/export`;
      const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) throw new Error();
      const blob = await r.blob();
      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = `enrollments-${Date.now()}.csv`;
      document.body.appendChild(a); a.click(); a.remove();
    } catch { alert('Export failed.'); }
  };

  const whatsappUrl = (mobile, name, course) => {
    const num = (mobile || '').replace(/\D/g, '');
    const msg = encodeURIComponent(`Hi ${name}, this is from Pragni regarding your interest in ${course}. Are you still interested?`);
    return `https://wa.me/${num}?text=${msg}`;
  };

  let filtered = enrollments;
  if (filterCourse !== 'all') filtered = filtered.filter(e => (e.courseId?._id || e.courseId) === filterCourse);
  if (filterStatus !== 'all') filtered = filtered.filter(e => (e.contactStatus || 'pending') === filterStatus);
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(e => e.name?.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q) || e.mobile?.includes(q));
  }

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s.val] = enrollments.filter(e => (e.contactStatus || 'pending') === s.val).length;
    return acc;
  }, {});
  const contactedCount = enrollments.filter(e => e.contacted).length;
  const couponLeadCount = enrollments.filter(e => e.couponCode).length;

  return (
    <div>
      <div className="adm-header">
        <div>
          <h1 className="adm-header-title">Enrollment Leads</h1>
          <p className="adm-header-sub">{filtered.length} leads · {couponLeadCount} coupon leads · {contactedCount} contacted · {enrollments.length} total</p>
        </div>
        <button className="adm-btn adm-btn-ghost adm-btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={exportCSV}>
          <DownloadIcon /> Export CSV
        </button>
      </div>

      <div className="adm-body">
        {/* Status summary pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {STATUS_OPTIONS.map(s => (
            <button key={s.val} onClick={() => setFilterStatus(filterStatus === s.val ? 'all' : s.val)}
              style={{
                padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                border: `1px solid ${filterStatus === s.val ? s.color : s.color + '44'}`,
                background: filterStatus === s.val ? s.color + '22' : 'transparent',
                color: s.color, cursor: 'pointer',
              }}>
              {s.label} <span style={{ opacity: 0.7 }}>{counts[s.val] || 0}</span>
            </button>
          ))}
          {filterStatus !== 'all' && (
            <button onClick={() => setFilterStatus('all')} style={{ padding: '5px 12px', borderRadius: 100, fontSize: 11, border: '1px solid var(--border-b)', background: 'transparent', color: 'var(--text3)', cursor: 'pointer' }}>
              Clear
            </button>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <input className="adm-input" style={{ flex: 1, minWidth: 180, padding: '8px 12px', fontSize: 13 }}
            placeholder="Search name, email, phone…" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="adm-input" style={{ width: 'auto', minWidth: 200, padding: '8px 12px', fontSize: 13 }}
            value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
            <option value="all">All Courses</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="adm-skeleton" style={{ height: 200, borderRadius: 14 }} />
        ) : filtered.length === 0 ? (
          <div className="adm-empty">
            <div className="adm-empty-icon">
              <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text3)' }}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              </svg>
            </div>
            <p className="adm-empty-title">No leads found</p>
            <p className="adm-empty-sub">They appear when students fill the interest form on a premium course page.</p>
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 10.5 }}>
                      Contacted
                    </label>
                  </th>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Coupon</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => {
                  const courseName = e.courseId?.title || e.courseName || '—';
                  const waUrl = whatsappUrl(e.mobile || e.altPhone, e.name, courseName);
                  return (
                    <tr key={e._id} style={{ opacity: e.contactStatus === 'not_interested' ? 0.55 : 1 }}>
                      {/* Contacted checkbox */}
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={!!e.contacted}
                          onChange={() => toggleContacted(e)}
                          title={e.contacted ? 'Mark as not contacted' : 'Mark as contacted'}
                          style={{ width: 16, height: 16, accentColor: 'var(--teal)', cursor: 'pointer' }}
                        />
                      </td>

                      {/* Student info */}
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13, marginBottom: 2 }}>{e.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text3)' }}>{e.email}</div>
                        {e.altEmail && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{e.altEmail}</div>}
                        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{e.mobile}</div>
                        {e.altPhone && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{e.altPhone}</div>}
                        {e.notes && (
                          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: 'italic' }}>
                            {e.notes}
                          </div>
                        )}
                      </td>

                      {/* Course */}
                      <td>
                        <span className="adm-badge adm-badge-violet" style={{ fontSize: 11 }}>{courseName}</span>
                      </td>

                      {/* Coupon */}
                      <td>
                        {e.couponCode
                          ? <div>
                              <span style={{ fontFamily: 'monospace', fontSize: 12, background: 'rgba(108,71,255,0.12)', color: 'var(--violet3)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>{e.couponCode}</span>
                              {e.couponDiscount > 0 && <div style={{ fontSize: 11, color: 'var(--teal)', marginTop: 2 }}>
                                -{e.couponDiscountType === 'fixed' ? `₹${e.couponDiscount}` : `${e.couponDiscount}%`}
                              </div>}
                            </div>
                          : <span style={{ color: 'var(--text3)', fontSize: 12 }}>—</span>
                        }
                      </td>

                      {/* Status dropdown */}
                      <td>
                        <select
                          value={e.contactStatus || 'pending'}
                          onChange={ev => setStatus(e, ev.target.value)}
                          style={{
                            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-b)',
                            borderRadius: 8, padding: '4px 8px', fontSize: 11, fontWeight: 600,
                            color: (STATUS_OPTIONS.find(o => o.val === (e.contactStatus || 'pending')) || {}).color || 'var(--text2)',
                            cursor: 'pointer', outline: 'none',
                          }}
                        >
                          {STATUS_OPTIONS.map(s => <option key={s.val} value={s.val}>{s.label}</option>)}
                        </select>
                      </td>

                      {/* Date */}
                      <td style={{ fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                        {new Date(e.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </td>

                      {/* Actions */}
                      <td>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          {/* Email */}
                          <a href={`mailto:${e.email}`} title={`Email ${e.name}`}
                            style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(79,195,247,0.1)', border: '1px solid rgba(79,195,247,0.2)', color: 'var(--cyan)', textDecoration: 'none', flexShrink: 0 }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,195,247,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(79,195,247,0.1)'}>
                            <MailIcon />
                          </a>
                          {/* WhatsApp */}
                          {(e.mobile || e.altPhone) && (
                            <a href={waUrl} target="_blank" rel="noopener noreferrer" title={`WhatsApp ${e.name}`}
                              style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)', color: '#25d366', textDecoration: 'none', flexShrink: 0 }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,211,102,0.2)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'rgba(37,211,102,0.1)'}>
                              <WhatsAppIcon />
                            </a>
                          )}
                          {/* Edit */}
                          <button onClick={() => openEdit(e)} title="Edit details"
                            style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-b)', color: 'var(--text2)', cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}>
                            <EditIcon />
                          </button>
                          {/* Delete */}
                          <button onClick={() => deleteEnrollment(e._id)} title="Delete lead"
                            style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(240,98,146,0.06)', border: '1px solid rgba(240,98,146,0.15)', color: 'var(--rose)', cursor: 'pointer' }}
                            onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(240,98,146,0.15)'}
                            onMouseLeave={ev => ev.currentTarget.style.background = 'rgba(240,98,146,0.06)'}>
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editModal && (
        <div className="adm-overlay" onClick={e => e.target === e.currentTarget && setEditModal(null)}>
          <div className="adm-modal" style={{ maxWidth: 520 }}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">Edit Student Details</h2>
              <button className="adm-modal-close" onClick={() => setEditModal(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-info adm-info-violet" style={{ fontSize: 12, marginBottom: 4 }}>
                Add alternate contact info, notes, and update connection status for this student.
              </div>
              <div className="adm-form-section">Primary Contact</div>
              <div className="adm-form-row">
                <div className="adm-input-group">
                  <label className="adm-label">Name</label>
                  <input className="adm-input" value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="adm-input-group">
                  <label className="adm-label">Primary Mobile</label>
                  <input className="adm-input" value={editForm.mobile || ''} onChange={e => setEditForm(f => ({ ...f, mobile: e.target.value }))} />
                </div>
              </div>
              <div className="adm-input-group">
                <label className="adm-label">Primary Email</label>
                <input className="adm-input" type="email" value={editForm.email || ''} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="adm-form-section">Alternate Contact</div>
              <div className="adm-form-row">
                <div className="adm-input-group">
                  <label className="adm-label">Alternate Email</label>
                  <input className="adm-input" type="email" placeholder="alt@email.com" value={editForm.altEmail || ''} onChange={e => setEditForm(f => ({ ...f, altEmail: e.target.value }))} />
                </div>
                <div className="adm-input-group">
                  <label className="adm-label">Alternate Phone</label>
                  <input className="adm-input" placeholder="+91…" value={editForm.altPhone || ''} onChange={e => setEditForm(f => ({ ...f, altPhone: e.target.value }))} />
                </div>
              </div>
              <div className="adm-form-section">Tracking</div>
              {editForm.couponCode && (
                <div className="adm-info adm-info-violet" style={{ fontSize: 12, marginBottom: 12 }}>
                  Coupon applied: <strong>{editForm.couponCode}</strong> · Discount: <strong>{editForm.couponDiscountType === 'fixed' ? `₹${editForm.couponDiscount || 0}` : `${editForm.couponDiscount || 0}%`}</strong>
                </div>
              )}
              <div className="adm-input-group">
                <label className="adm-label">Contact Status</label>
                <select className="adm-input" value={editForm.contactStatus || 'pending'} onChange={e => setEditForm(f => ({ ...f, contactStatus: e.target.value }))}>
                  {STATUS_OPTIONS.map(s => <option key={s.val} value={s.val}>{s.label}</option>)}
                </select>
              </div>
              <div className="adm-input-group">
                <label className="adm-label">Internal Notes</label>
                <textarea className="adm-input" rows={3} placeholder="Call attempts, student queries, follow-up notes…" maxLength={1000}
                  value={editForm.notes || ''} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <label className="adm-toggle">
                <input type="checkbox" checked={!!editForm.contacted} onChange={e => setEditForm(f => ({ ...f, contacted: e.target.checked }))} style={{ accentColor: 'var(--teal)' }} />
                <span>Marked as contacted</span>
              </label>
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn-ghost" onClick={() => setEditModal(null)}>Cancel</button>
              <button className="adm-btn adm-btn-primary" onClick={saveEdit} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
