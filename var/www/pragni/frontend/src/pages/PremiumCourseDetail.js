import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCourse, submitEnrollmentLead } from '../utils/api';

/* ─── STYLES ─────────────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');

  :root {
    --ink:#08090f; --ink2:#0d0f1a; --ink3:#111420;
    --surface:#1a1d2e; --surface2:#1f2335; --lift:#242840;
    --border:rgba(255,255,255,0.055); --border2:rgba(255,255,255,0.10); --border3:rgba(255,255,255,0.18);
    --text:#eef0ff; --text2:#8b91b8; --text3:#4a4f72;
    --violet:#7b5ea7; --violet2:#9d7fd4; --violet3:#c4a8ff;
    --cyan:#4fc3f7; --teal:#26d0a1; --rose:#f06292; --amber:#ffca28; --indigo:#5c6bc0;
    --font-display:'Clash Display',sans-serif; --font-body:'Plus Jakarta Sans',sans-serif;
    --ease:cubic-bezier(0.16,1,0.3,1);
  }
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  ::selection { background:rgba(157,127,212,0.28); color:#fff; }
  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:var(--ink2); }
  ::-webkit-scrollbar-thumb { background:var(--lift); border-radius:3px; }

  .pcd-root { font-family:var(--font-body); color:var(--text); background:var(--ink); min-height:100vh; position:relative; overflow-x:hidden; }
  .pcd-aurora { position:fixed; inset:0; pointer-events:none; z-index:0; overflow:hidden; }
  .pcd-blob { position:absolute; border-radius:50%; filter:blur(90px); mix-blend-mode:screen; will-change:transform; }
  .pcd-b1 { width:600px; height:600px; background:radial-gradient(circle at 40% 40%,rgba(123,94,167,0.26) 0%,rgba(79,195,247,0.1) 55%,transparent 70%); top:-150px; left:-100px; animation:pcdB1 22s ease-in-out infinite alternate; }
  .pcd-b2 { width:450px; height:450px; background:radial-gradient(circle at 60% 40%,rgba(255,202,40,0.14) 0%,rgba(123,94,167,0.1) 55%,transparent 70%); top:40vh; right:-80px; animation:pcdB2 28s ease-in-out infinite alternate; }
  @keyframes pcdB1 { from{transform:translate(0,0) scale(1)} to{transform:translate(60px,80px) scale(1.1)} }
  @keyframes pcdB2 { from{transform:translate(0,0) scale(1.05)} to{transform:translate(-50px,60px) scale(0.92)} }
  .pcd-mesh { position:fixed; inset:0; pointer-events:none; z-index:0; background-image:linear-gradient(rgba(255,255,255,0.016) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.016) 1px,transparent 1px); background-size:72px 72px; mask-image:radial-gradient(ellipse 90% 70% at 50% 30%,rgba(0,0,0,0.45),transparent); }

  .pcd-inner { position:relative; z-index:3; }
  .pcd-container { max-width:1140px; margin:0 auto; padding:0 28px; }

  /* ── BACK ── */
  .pcd-back { display:inline-flex; align-items:center; gap:8px; padding:28px 0 0; font-size:13px; color:var(--text3); font-weight:500; text-decoration:none; transition:color 0.2s; }
  .pcd-back:hover { color:var(--violet3); }

  /* ── HERO ── */
  .pcd-hero { padding:40px 0 60px; }
  .pcd-hero-grid { display:grid; grid-template-columns:1fr 380px; gap:64px; align-items:flex-start; }

  .pcd-premium-badge {
    display:inline-flex; align-items:center; gap:8px; padding:6px 16px; border-radius:100px;
    background:linear-gradient(135deg,rgba(255,202,40,0.14),rgba(240,98,146,0.08));
    border:1px solid rgba(255,202,40,0.4); font-size:11px; font-weight:700;
    letter-spacing:0.12em; text-transform:uppercase; color:var(--amber); margin-bottom:20px;
  }
  .pcd-premium-dot { width:6px; height:6px; border-radius:50%; background:var(--amber); box-shadow:0 0 8px var(--amber); animation:pcdPulse 2s ease-in-out infinite; }
  @keyframes pcdPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.65)} }

  .pcd-title { font-family:var(--font-display); font-size:clamp(30px,4.5vw,52px); font-weight:700; line-height:1.08; letter-spacing:-0.03em; margin-bottom:18px; }
  .pcd-title-grad { background:linear-gradient(135deg,var(--text) 0%,var(--violet3) 50%,var(--amber) 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }

  .pcd-desc { font-size:16px; color:var(--text2); line-height:1.75; font-weight:300; margin-bottom:28px; }

  /* Meta chips */
  .pcd-meta { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:32px; }
  .pcd-chip { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:100px; border:1px solid var(--border2); background:rgba(255,255,255,0.04); font-size:12px; font-weight:500; color:var(--text2); }

  /* Trainer */
  .pcd-trainer-row { display:flex; align-items:center; gap:12px; padding:14px 16px; border-radius:14px; background:rgba(255,255,255,0.03); border:1px solid var(--border); }
  .pcd-trainer-avatar { width:40px; height:40px; border-radius:50%; object-fit:cover; border:2px solid rgba(157,127,212,0.3); flex-shrink:0; }
  .pcd-trainer-ph { width:40px; height:40px; border-radius:50%; flex-shrink:0; background:linear-gradient(135deg,var(--violet),var(--indigo)); display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:800; color:#fff; border:2px solid rgba(157,127,212,0.3); }
  .pcd-trainer-name { font-size:13px; font-weight:600; color:var(--text); }
  .pcd-trainer-role { font-size:11px; color:var(--text3); margin-top:2px; }

  /* ── STICKY CARD ── */
  .pcd-sticky { position:sticky; top:100px; }
  .pcd-enroll-card { background:rgba(26,29,46,0.92); border:1px solid rgba(255,202,40,0.2); border-radius:24px; padding:28px; backdrop-filter:blur(16px); box-shadow:0 32px 80px rgba(0,0,0,0.5),0 0 0 1px rgba(255,202,40,0.08); }
  .pcd-price-row { display:flex; align-items:baseline; gap:10px; margin-bottom:6px; }
  .pcd-price { font-family:var(--font-display); font-size:38px; font-weight:700; color:var(--text); letter-spacing:-0.03em; }
  .pcd-price-label { font-size:13px; color:var(--text3); }
  .pcd-enroll-note { font-size:12px; color:var(--text3); margin-bottom:20px; }

  .pcd-enroll-btn {
    width:100%; padding:15px; border-radius:14px; border:none; cursor:pointer;
    font-family:var(--font-body); font-size:15px; font-weight:700; letter-spacing:0.01em;
    background:linear-gradient(135deg,var(--amber),#ff9f43);
    color:#0a0700; transition:all 0.3s var(--ease);
    box-shadow:0 8px 32px rgba(255,202,40,0.35);
  }
  .pcd-enroll-btn:hover { transform:translateY(-2px); box-shadow:0 14px 40px rgba(255,202,40,0.45); }

  .pcd-contact-btn {
    width:100%; padding:13px; border-radius:14px; cursor:pointer; margin-top:10px;
    font-family:var(--font-body); font-size:14px; font-weight:600;
    background:transparent; border:1px solid var(--border2); color:var(--text2);
    transition:all 0.3s var(--ease);
  }
  .pcd-contact-btn:hover { border-color:rgba(157,127,212,0.4); color:var(--violet3); background:rgba(123,94,167,0.08); }

  .pcd-card-perks { margin-top:20px; display:flex; flex-direction:column; gap:8px; }
  .pcd-perk { display:flex; align-items:center; gap:8px; font-size:12px; color:var(--text2); }
  .pcd-perk-icon { width:20px; text-align:center; font-size:13px; flex-shrink:0; }

  /* ── CONTENT SECTIONS ── */
  .pcd-sections { margin-top:52px; display:flex; flex-direction:column; gap:40px; }
  .pcd-section { background:rgba(26,29,46,0.6); border:1px solid var(--border); border-radius:20px; padding:28px 32px; }
  .pcd-section-title { font-family:var(--font-display); font-size:19px; font-weight:700; margin-bottom:18px; display:flex; align-items:center; gap:10px; }

  /* Benefits */
  .pcd-benefits { display:flex; flex-direction:column; gap:10px; }
  .pcd-benefit { display:flex; align-items:flex-start; gap:12px; }
  .pcd-benefit-check { width:22px; height:22px; border-radius:50%; background:rgba(38,208,161,0.15); border:1px solid rgba(38,208,161,0.35); display:flex; align-items:center; justify-content:center; font-size:11px; flex-shrink:0; color:var(--teal); margin-top:1px; }
  .pcd-benefit-text { font-size:14px; color:var(--text2); line-height:1.55; }

  /* Syllabus */
  .pcd-syllabus { display:flex; flex-direction:column; gap:10px; }
  .pcd-week { padding:14px 18px; background:rgba(255,255,255,0.025); border-radius:12px; border:1px solid var(--border); }
  .pcd-week-title { font-size:13px; font-weight:700; color:var(--text); margin-bottom:6px; }
  .pcd-week-topics { display:flex; flex-wrap:wrap; gap:6px; }
  .pcd-topic { font-size:11px; padding:3px 10px; border-radius:100px; background:rgba(123,94,167,0.1); border:1px solid rgba(123,94,167,0.2); color:var(--violet3); }

  /* ── FORM OVERLAY ── */
  .pcd-overlay { position:fixed; inset:0; z-index:100; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.7); backdrop-filter:blur(6px); padding:20px; }
  .pcd-form-card { background:var(--surface); border:1px solid var(--border2); border-radius:24px; padding:36px; max-width:460px; width:100%; box-shadow:0 40px 100px rgba(0,0,0,0.6); animation:pcdSlideUp 0.35s var(--ease); }
  @keyframes pcdSlideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  .pcd-form-title { font-family:var(--font-display); font-size:22px; font-weight:700; margin-bottom:6px; }
  .pcd-form-sub { font-size:13px; color:var(--text3); margin-bottom:24px; line-height:1.55; }
  .pcd-field { margin-bottom:16px; }
  .pcd-label { display:block; font-size:12px; font-weight:600; color:var(--text3); letter-spacing:0.04em; text-transform:uppercase; margin-bottom:7px; }
  .pcd-input { width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--border2); background:rgba(255,255,255,0.04); color:var(--text); font-family:var(--font-body); font-size:14px; transition:border-color 0.25s; outline:none; }
  .pcd-input:focus { border-color:rgba(255,202,40,0.45); box-shadow:0 0 0 3px rgba(255,202,40,0.08); }
  .pcd-submit { width:100%; padding:14px; border-radius:12px; border:none; cursor:pointer; font-family:var(--font-body); font-size:14px; font-weight:700; background:linear-gradient(135deg,var(--amber),#ff9f43); color:#0a0700; margin-top:4px; transition:all 0.3s var(--ease); box-shadow:0 6px 24px rgba(255,202,40,0.3); }
  .pcd-submit:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 32px rgba(255,202,40,0.4); }
  .pcd-submit:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
  .pcd-cancel { width:100%; padding:11px; border-radius:12px; background:transparent; border:1px solid var(--border); color:var(--text3); font-family:var(--font-body); font-size:13px; cursor:pointer; margin-top:8px; transition:all 0.2s; }
  .pcd-cancel:hover { border-color:var(--border2); color:var(--text2); }
  .pcd-success { text-align:center; padding:16px 0; }
  .pcd-success-icon { font-size:48px; margin-bottom:14px; }
  .pcd-success-title { font-family:var(--font-display); font-size:20px; font-weight:700; margin-bottom:8px; }
  .pcd-success-text { font-size:14px; color:var(--text2); line-height:1.6; }
  .pcd-error { padding:10px 14px; border-radius:10px; background:rgba(240,98,146,0.1); border:1px solid rgba(240,98,146,0.25); color:var(--rose); font-size:13px; margin-bottom:14px; }

  /* Responsive */
  @media(max-width:860px) {
    .pcd-hero-grid { grid-template-columns:1fr; }
    .pcd-sticky { position:static; }
    .pcd-enroll-card { order:-1; }
  }
  @media(max-width:600px) {
    .pcd-container { padding:0 16px; }
    .pcd-section { padding:20px; }
  }
`;

const CAT_MAP = {
  aws:{ label:'AWS Cloud', icon:'', color:'#ff9900' },
  azure:{ label:'Azure', icon:'', color:'#0ea5e9' },
  cybersecurity:{ label:'Cybersecurity', icon:'', color:'#f06292' },
  soc:{ label:'SOC', icon:'', color:'#26d0a1' },
  'pentesting-web':{ label:'Web Pentest', icon:'', color:'#ffca28' },
  'pentesting-network':{ label:'Network Pentest', icon:'', color:'#ff8a65' },
  'pentesting-api':{ label:'API Pentest', icon:'', color:'#c4a8ff' },
  networking:{ label:'Networking', icon:'', color:'#4fc3f7' },
};

/* ─── ENROLL FORM — with coupon support ──────────────────────────────────────── */
function EnrollForm({ course, onClose }) {
  const [form, setForm] = useState({ name:'', email:'', mobile:'' });
  const [couponCode, setCouponCode] = useState('');
  const [couponEnabled, setCouponEnabled] = useState(false);
  const [couponResult, setCouponResult] = useState(null); // {discountType, discountValue, description}
  const [couponErr, setCouponErr] = useState('');
  const [couponChecking, setCouponChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const applyCoupon = async () => {
    if (!couponCode.trim()) { setCouponErr('Enter a coupon code first.'); return; }
    setCouponChecking(true); setCouponErr(''); setCouponResult(null);
    try {
      const r = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim().toUpperCase() }),
      });
      const d = await r.json();
      if (d.success) {
        setCouponResult(d.coupon);
        setCouponErr('');
      } else {
        setCouponErr(d.error || 'Invalid coupon');
      }
    } catch { setCouponErr('Could not verify coupon. Please try again.'); }
    setCouponChecking(false);
  };

  const discountedPrice = () => {
    if (!couponResult) return course.price;
    if (couponResult.discountType === 'percent') return Math.max(0, course.price - (course.price * couponResult.discountValue / 100));
    return Math.max(0, course.price - couponResult.discountValue);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.mobile) { setErr('All fields are required.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setErr('Please enter a valid email.'); return; }
    setSaving(true); setErr('');
    try {
      await submitEnrollmentLead({
        ...form,
        courseId: course._id,
        courseName: course.title,
        couponCode: couponResult ? couponCode.trim().toUpperCase() : '',
        couponDiscount: couponResult?.discountValue || 0,
      });
      setDone(true);
    } catch { setErr('Something went wrong. Please try again.'); }
    setSaving(false);
  };

  return (
    <div className="pcd-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="pcd-form-card">
        {done ? (
          <div className="pcd-success">
            <div className="pcd-success-icon" style={{ fontSize: 32, marginBottom: 12 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#26d0a1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div className="pcd-success-title">You're in the list!</div>
            <p className="pcd-success-text">
              Thanks <strong>{form.name}</strong>! We've received your interest in <strong>{course.title}</strong>.
              {couponResult && <span> Coupon <strong>{couponCode.toUpperCase()}</strong> applied — our team will factor this in when reaching out.</span>}
              {' '}Our team will contact you on <strong>{form.mobile}</strong> to help you enroll.
            </p>
            <button className="pcd-cancel" style={{ marginTop:20 }} onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div className="pcd-form-title">Enroll Interest</div>
            <p className="pcd-form-sub">
              Fill in your details and we'll reach out to confirm your enrollment in <strong>{course.title}</strong>.
            </p>
            {err && <div className="pcd-error">{err}</div>}
            <form onSubmit={submit}>
              <div className="pcd-field">
                <label className="pcd-label">Full Name *</label>
                <input className="pcd-input" placeholder="John Doe" value={form.name} onChange={e => set('name', e.target.value)} required />
              </div>
              <div className="pcd-field">
                <label className="pcd-label">Email Address *</label>
                <input type="email" className="pcd-input" placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)} required />
              </div>
              <div className="pcd-field">
                <label className="pcd-label">Mobile Number *</label>
                <input type="tel" className="pcd-input" placeholder="+91 9876543210" value={form.mobile} onChange={e => set('mobile', e.target.value)} required />
              </div>

              {/* Coupon toggle */}
              <div style={{ margin: '10px 0 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text2)', userSelect: 'none' }}>
                  <input type="checkbox" checked={couponEnabled} onChange={e => { setCouponEnabled(e.target.checked); if (!e.target.checked) { setCouponResult(null); setCouponErr(''); setCouponCode(''); } }}
                    style={{ width: 15, height: 15, accentColor: 'var(--amber)', cursor: 'pointer' }} />
                  I have a coupon code
                </label>
              </div>

              {couponEnabled && (
                <div className="pcd-field">
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="pcd-input" placeholder="ENTER CODE" value={couponCode}
                      style={{ fontFamily: 'monospace', letterSpacing: '0.08em', textTransform: 'uppercase', flex: 1 }}
                      onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null); setCouponErr(''); }} />
                    <button type="button" onClick={applyCoupon} disabled={couponChecking}
                      style={{ padding: '0 16px', borderRadius: 10, border: '1px solid rgba(255,202,40,0.4)', background: 'rgba(255,202,40,0.1)', color: 'var(--amber)', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {couponChecking ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponErr && <div style={{ fontSize: 12, color: 'var(--rose)', marginTop: 6 }}>{couponErr}</div>}
                  {couponResult && (
                    <div style={{ marginTop: 8, padding: '10px 14px', background: 'rgba(38,208,161,0.08)', border: '1px solid rgba(38,208,161,0.25)', borderRadius: 10 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal)', marginBottom: 2 }}>
                        Coupon applied! {couponResult.discountType === 'percent' ? `${couponResult.discountValue}% off` : `₹${couponResult.discountValue} off`}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                        Price after discount: <strong style={{ color: 'var(--teal)' }}>₹{discountedPrice().toLocaleString('en-IN')}</strong>
                        <span style={{ marginLeft: 8, textDecoration: 'line-through', opacity: 0.5 }}>₹{course.price?.toLocaleString('en-IN')}</span>
                      </div>
                      {couponResult.description && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{couponResult.description}</div>}
                    </div>
                  )}
                </div>
              )}

              <button type="submit" className="pcd-submit" disabled={saving}>{saving ? 'Submitting...' : 'Submit Interest →'}</button>
              <button type="button" className="pcd-cancel" onClick={onClose}>Cancel</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ───────────────────────────────────────────────────────────────── */
export default function PremiumCourseDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!document.getElementById('pcd-styles')) {
      const el = document.createElement('style');
      el.id = 'pcd-styles';
      el.textContent = STYLES;
      document.head.appendChild(el);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    getCourse(slug)
      .then(r => {
        const c = r.data.course;
        // If it's a free course redirect to the free detail page
        if (c && c.price === 0) { navigate(`/courses/${slug}`, { replace: true }); return; }
        setCourse(c);
      })
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  if (loading) return (
    <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'sans-serif', color:'#8b91b8' }}>
      <div>Loading course…</div>
    </div>
  );

  if (!course) return (
    <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', fontFamily:'sans-serif' }}>
      <div>
        <div style={{ fontSize:48, marginBottom:16 }}></div>
        <p style={{ color:'#8b91b8' }}>Course not found.</p>
        <Link to="/courses" style={{ color:'#c4a8ff', display:'block', marginTop:12 }}>← Browse courses</Link>
      </div>
    </div>
  );

  const cat = CAT_MAP[course.category] || {};
  const benefits = (course.benefits || '').split('\n').map(b => b.trim()).filter(Boolean);
  const perks = [
    course.duration && { icon:'⏱', text: course.duration },
    course.level    && { icon:'', text: `${course.level.charAt(0).toUpperCase() + course.level.slice(1)} level` },
    course.certificationOnCompletion && { icon:'', text:'Certificate on completion' },
    course.hasProject                && { icon:'', text:'Hands-on project included' },
    course.prerequisites && { icon:'✅', text:`Prerequisites: ${course.prerequisites}` },
  ].filter(Boolean);

  return (
    <div className="pcd-root">
      <div className="pcd-aurora">
        <div className="pcd-blob pcd-b1" />
        <div className="pcd-blob pcd-b2" />
      </div>
      <div className="pcd-mesh" />

      <div className="pcd-inner">
        <div className="pcd-container">
          <Link to="/courses" className="pcd-back">← Back to Courses</Link>

          {/* Hero */}
          <div className="pcd-hero">
            <div className="pcd-hero-grid">
              {/* LEFT */}
              <div>
                <div className="pcd-premium-badge">
                  <span className="pcd-premium-dot" />
                  Premium
                </div>

                <h1 className="pcd-title">
                  <span className="pcd-title-grad">{course.title}</span>
                </h1>

                <p className="pcd-desc">{course.description}</p>

                {/* Meta chips */}
                <div className="pcd-meta">
                  {cat.label && (
                    <span className="pcd-chip" style={{ color: cat.color, borderColor:`${cat.color}30`, background:`${cat.color}0e` }}>
                      {cat.icon} {cat.label}
                    </span>
                  )}
                  {course.level && (
                    <span className="pcd-chip"> {course.level.charAt(0).toUpperCase() + course.level.slice(1)}</span>
                  )}
                  {course.duration && (
                    <span className="pcd-chip">⏱ {course.duration}</span>
                  )}
                  {course.certificationOnCompletion && (
                    <span className="pcd-chip" style={{ color:'var(--amber)', borderColor:'rgba(255,202,40,0.3)', background:'rgba(255,202,40,0.07)' }}> Certificate</span>
                  )}
                  {course.hasProject && (
                    <span className="pcd-chip" style={{ color:'var(--teal)', borderColor:'rgba(38,208,161,0.3)', background:'rgba(38,208,161,0.07)' }}> Project</span>
                  )}
                </div>

                {/* Trainer */}
                {course.trainer && (
                  <div className="pcd-trainer-row">
                    {course.trainer.photo
                      ? <img src={course.trainer.photo} alt={course.trainer.name} className="pcd-trainer-avatar" />
                      : <div className="pcd-trainer-ph">{(course.trainer.name || 'P')[0]}</div>}
                    <div>
                      <div className="pcd-trainer-name">{course.trainer.name}</div>
                      <div className="pcd-trainer-role">{course.trainer.role || 'Instructor'}</div>
                    </div>
                  </div>
                )}

                {/* Content sections */}
                <div className="pcd-sections">
                  {/* Benefits */}
                  {benefits.length > 0 && (
                    <div className="pcd-section">
                      <div className="pcd-section-title"> What You'll Gain</div>
                      <div className="pcd-benefits">
                        {benefits.map((b, i) => (
                          <div key={i} className="pcd-benefit">
                            <div className="pcd-benefit-check">✓</div>
                            <div className="pcd-benefit-text">{b}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prerequisites */}
                  {course.prerequisites && (
                    <div className="pcd-section">
                      <div className="pcd-section-title">✅ Prerequisites</div>
                      <p style={{ fontSize:14, color:'var(--text2)', lineHeight:1.65 }}>{course.prerequisites}</p>
                    </div>
                  )}

                  {/* Premium Content */}
                  {course.premiumContent && (
                    <div className="pcd-section">
                      <div className="pcd-section-title">Premium Content</div>
                      <p style={{ fontSize:14, color:'var(--text2)', lineHeight:1.65 }}>{course.premiumContent}</p>
                    </div>
                  )}

                  {/* Syllabus */}
                  {course.syllabus?.length > 0 && (
                    <div className="pcd-section">
                      <div className="pcd-section-title"> Course Syllabus</div>
                      <div className="pcd-syllabus">
                        {course.syllabus.map((w, i) => (
                          <div key={i} className="pcd-week">
                            <div className="pcd-week-title">Week {w.weekNumber}: {w.title}</div>
                            <div className="pcd-week-topics">
                              {(w.topics || []).map((t, j) => <span key={j} className="pcd-topic">{t}</span>)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT — sticky card */}
              <div className="pcd-sticky">
                <div className="pcd-enroll-card">
                  <div className="pcd-price-row">
                    <span className="pcd-price">₹{course.price?.toLocaleString('en-IN')}</span>
                    <span className="pcd-price-label">one-time</span>
                  </div>
                  <p className="pcd-enroll-note">Contact us to confirm your spot &amp; get payment link.</p>

                  <button className="pcd-enroll-btn" onClick={() => setShowForm(true)}>
                    Enroll Now →
                  </button>
                  <button className="pcd-contact-btn" onClick={() => setShowForm(true)}>
                    Contact Us
                  </button>

                  {perks.length > 0 && (
                    <div className="pcd-card-perks">
                      {perks.map((p, i) => (
                        <div key={i} className="pcd-perk">
                          <span className="pcd-perk-icon">{p.icon}</span>
                          <span>{p.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enroll Form Modal */}
      {showForm && <EnrollForm course={course} onClose={() => setShowForm(false)} />}
    </div>
  );
}
