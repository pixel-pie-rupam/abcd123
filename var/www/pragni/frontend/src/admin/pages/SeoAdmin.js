import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { adminGet, adminPut } from '../../utils/api';

const TABS = [
  { id: 'basic',    label: 'Basic SEO' },
  { id: 'social',   label: 'Social / OG' },
  { id: 'verify',   label: 'Verification' },
  { id: 'robots',   label: 'robots.txt' },
  { id: 'sitemap',  label: 'Sitemap' },
  { id: 'schema',   label: 'Schema / JSON-LD' },
  { id: 'pages',    label: 'Page Overrides' },
];

const PAGE_KEYS = [
  { key: 'home',      label: 'Home Page' },
  { key: 'courses',   label: 'Courses Page' },
  { key: 'workshops', label: 'Workshops Page' },
  { key: 'about',     label: 'About Page' },
  { key: 'contact',   label: 'Contact Page' },
];

export default function SeoAdmin() {
  const { token } = useAdmin();
  const [seo, setSeo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [toast, setToast] = useState('');
  const [pageOverrides, setPageOverrides] = useState({});
  const [sitemapXml, setSitemapXml] = useState('');
  const [robotsLive, setRobotsLive] = useState('');

  const showToast = (msg, type='success') => { setToast({ msg, type }); setTimeout(() => setToast(''), 3500); };

  useEffect(() => {
    adminGet('/seo', token).then(r => {
      setSeo(r.data.seo);
      try { setPageOverrides(JSON.parse(r.data.seo.pageOverrides || '{}')); } catch { setPageOverrides({}); }
    }).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (activeTab === 'sitemap') {
      fetch('/sitemap.xml').then(r => r.text()).then(setSitemapXml).catch(() => setSitemapXml('Error loading sitemap'));
    }
    if (activeTab === 'robots') {
      fetch('/robots.txt').then(r => r.text()).then(setRobotsLive).catch(() => setRobotsLive('Error loading robots.txt'));
    }
  }, [activeTab]);

  const set = (k, v) => setSeo(s => ({ ...s, [k]: v }));
  const setPage = (page, field, val) => setPageOverrides(p => ({ ...p, [page]: { ...(p[page] || {}), [field]: val } }));

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...seo, pageOverrides: JSON.stringify(pageOverrides) };
      await adminPut('/seo', payload, token);
      showToast('SEO settings saved!');
    } catch { showToast('Error saving', 'error'); }
    setSaving(false);
  };

  if (!seo) return (
    <div>
      <div className="adm-header"><div className="adm-header-title">SEO Manager</div></div>
      <div className="adm-body"><div style={{ display:'flex', gap:12, flexDirection:'column' }}>{[1,2,3,4].map(i => <div key={i} className="adm-skeleton" style={{ height:60, borderRadius:12 }} />)}</div></div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="adm-header">
        <div>
          <div className="adm-header-title">SEO Manager</div>
          <div className="adm-header-sub">Control every SEO signal — meta, sitemap, robots, schema, social</div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-ghost adm-btn-sm">View Sitemap ↗</a>
          <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-ghost adm-btn-sm">robots.txt ↗</a>
          <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save All'}
          </button>
        </div>
      </div>

      <div className="adm-body">
        {/* SEO Health indicators */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12, marginBottom:24 }}>
          {[
            { label:'Site Name',         ok: !!seo.siteName,            tip: 'Required' },
            { label:'Meta Description',  ok: seo.siteDescription?.length > 50, tip: '>50 chars' },
            { label:'Keywords',          ok: !!seo.siteKeywords,        tip: 'Add keywords' },
            { label:'Canonical URL',     ok: !!seo.canonicalUrl,        tip: 'Add domain' },
            { label:'OG Image',          ok: !!seo.defaultOgImage,      tip: 'Social sharing' },
            { label:'Google Verified',   ok: !!seo.googleVerification,  tip: 'Verification tag' },
            { label:'Schema.org',        ok: !!seo.schemaOrg,           tip: 'Structured data' },
            { label:'Sitemap Active',    ok: true,                      tip: 'Auto-generated' },
          ].map((item, i) => (
            <div key={i} className="adm-card" style={{ padding:'12px 14px', display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background: item.ok ? 'var(--teal)' : 'var(--rose)', boxShadow: `0 0 8px ${item.ok ? 'var(--teal)' : 'var(--rose)'}`, flexShrink:0 }} />
              <div>
                <div style={{ fontSize:12, fontWeight:700, color: item.ok ? 'var(--text)' : 'var(--text2)' }}>{item.label}</div>
                <div style={{ fontSize:10, color:'var(--text3)' }}>{item.ok ? 'Set' : item.tip}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs + Content */}
        <div className="adm-card" style={{ overflow:'hidden' }}>
          {/* Tab bar */}
          <div style={{ display:'flex', gap:0, borderBottom:'1px solid var(--border-a)', overflowX:'auto', background:'rgba(255,255,255,0.02)' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                padding:'13px 18px', border:'none', background:'none', cursor:'pointer',
                fontSize:13, fontWeight:600, whiteSpace:'nowrap',
                color: activeTab===t.id ? 'var(--violet3)' : 'var(--text3)',
                borderBottom: activeTab===t.id ? '2px solid var(--violet3)' : '2px solid transparent',
                transition:'all 0.2s',
              }}>{t.icon} {t.label}</button>
            ))}
          </div>

          <div style={{ padding:'24px 28px', display:'flex', flexDirection:'column', gap:20 }}>

            {/* ── BASIC SEO ── */}
            {activeTab==='basic' && <>
              <div className="adm-info adm-info-violet">
                These fields inject <code style={{background:'rgba(255,255,255,0.07)',padding:'1px 6px',borderRadius:4}}>&lt;meta&gt;</code> tags into every page.
                The <strong>Canonical URL</strong> is your domain (e.g. <code style={{background:'rgba(255,255,255,0.07)',padding:'1px 6px',borderRadius:4}}>https://pragni.com</code>).
              </div>
              <div className="adm-form-row">
                <Field label="Site Name" value={seo.siteName} onChange={v=>set('siteName',v)} placeholder="Pragni" hint="Used in title tags: Page · Site Name" />
                <Field label="Canonical / Domain URL" value={seo.canonicalUrl} onChange={v=>set('canonicalUrl',v)} placeholder="https://pragni.com" hint="Your full domain, no trailing slash" />
              </div>
              <Field label="Meta Description (50–160 chars)" value={seo.siteDescription} onChange={v=>set('siteDescription',v)} placeholder="Learn cloud, cybersecurity and pentesting — free and affordable courses for everyone." hint={`${seo.siteDescription?.length||0} / 160 chars · This appears under your site name in Google search results`} multiline />
              <Field label="Focus Keywords (comma-separated)" value={seo.siteKeywords} onChange={v=>set('siteKeywords',v)} placeholder="cybersecurity courses, AWS training, pentesting, ethical hacking, cloud certification" hint="List your most important keywords. Don't keyword-stuff — 5 to 15 is ideal." />
              <div className="adm-form-row">
                <Field label="Default OG / Social Image URL" value={seo.defaultOgImage} onChange={v=>set('defaultOgImage',v)} placeholder="https://pragni.com/og-cover.jpg" hint="1200×630px recommended. Shown when sharing links on WhatsApp, Twitter, LinkedIn." />
                <Field label="Favicon URL" value={seo.faviconUrl} onChange={v=>set('faviconUrl',v)} placeholder="https://pragni.com/favicon.ico" hint="32×32px .ico or 192×192px .png" />
              </div>
              <Field label="Google Analytics ID" value={seo.googleAnalyticsId} onChange={v=>set('googleAnalyticsId',v)} placeholder="G-XXXXXXXXXX or UA-XXXXXXX-X" hint="Paste your Measurement ID from Google Analytics 4. Leave blank to disable." />
            </>}

            {/* ── SOCIAL / OG ── */}
            {activeTab==='social' && <>
              <div className="adm-info adm-info-violet">
                Open Graph tags control how your pages look when shared on WhatsApp, Twitter, LinkedIn, Facebook etc.
              </div>
              <div className="adm-form-row">
                <div className="adm-input-group">
                  <label className="adm-label">OG Type</label>
                  <select className="adm-input" value={seo.ogType} onChange={e=>set('ogType',e.target.value)}>
                    <option value="website">website (recommended for homepage)</option>
                    <option value="article">article (for blog/course pages)</option>
                  </select>
                </div>
                <Field label="Twitter / X Handle" value={seo.twitterHandle} onChange={v=>set('twitterHandle',v)} placeholder="@pragni" hint="Used for Twitter Card meta tags" />
              </div>
              <Field label="Default OG Image URL" value={seo.defaultOgImage} onChange={v=>set('defaultOgImage',v)} placeholder="https://pragni.com/og-cover.jpg" hint="1200×630px. This image shows when someone shares your link." />
              {seo.defaultOgImage && (
                <div style={{ borderRadius:10, overflow:'hidden', border:'1px solid var(--border-b)', maxWidth:400 }}>
                  <img src={seo.defaultOgImage} alt="OG Preview" style={{ width:'100%', maxHeight:200, objectFit:'cover', display:'block' }}
                    onError={e=>e.target.style.display='none'} />
                  <div style={{ padding:'8px 12px', background:'rgba(255,255,255,0.03)', fontSize:12, color:'var(--text3)' }}>OG image preview</div>
                </div>
              )}
            </>}

            {/* ── VERIFICATION ── */}
            {activeTab==='verify' && <>
              <div className="adm-info adm-info-violet">
                Paste only the <strong>content value</strong> of the meta tag — not the full HTML tag.
                For Google: add your domain to <strong>Google Search Console</strong>, choose "HTML tag" method, and copy only the content="..." value.
              </div>
              <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid var(--border-a)', borderRadius:12, padding:'14px 18px', fontFamily:'monospace', fontSize:12, color:'var(--text2)' }}>
                <div style={{ color:'var(--text3)', marginBottom:8, fontFamily:'var(--font-body)', fontSize:11 }}>What gets injected into &lt;head&gt;:</div>
                {seo.googleVerification && <div style={{ marginBottom:4 }}>{`<meta name="google-site-verification" content="${seo.googleVerification}" />`}</div>}
                {seo.bingVerification   && <div>{`<meta name="msvalidate.01" content="${seo.bingVerification}" />`}</div>}
                {!seo.googleVerification && !seo.bingVerification && <div style={{ color:'var(--text3)' }}>No verification tags yet.</div>}
              </div>
              <div className="adm-form-row">
                <Field label="Google Search Console Verification" value={seo.googleVerification} onChange={v=>set('googleVerification',v)} placeholder="abc123XYZ..." hint="From Search Console → Add Property → HTML tag → content value only" />
                <Field label="Bing Webmaster Verification" value={seo.bingVerification} onChange={v=>set('bingVerification',v)} placeholder="ABC123..." hint="From Bing Webmaster Tools → Add Site → Meta tag → content value only" />
              </div>
            </>}

            {/* ── ROBOTS.TXT ── */}
            {activeTab==='robots' && <>
              <div className="adm-info adm-info-violet">
                <strong>robots.txt</strong> tells search engine crawlers which pages to index. Your file is live at <a href="/robots.txt" target="_blank" rel="noopener noreferrer" style={{ color:'var(--violet3)' }}>/robots.txt</a>.
                The sitemap URL is automatically appended.
              </div>
              <div className="adm-form-row" style={{ alignItems:'flex-start' }}>
                <div className="adm-input-group" style={{ flex:1 }}>
                  <label className="adm-label">Edit robots.txt</label>
                  <textarea className="adm-input" value={seo.robotsTxt} onChange={e=>set('robotsTxt',e.target.value)} rows={12}
                    style={{ fontFamily:'monospace', fontSize:13, lineHeight:1.7 }} />
                </div>
                <div style={{ flex:1 }}>
                  <label className="adm-label">Current live file</label>
                  <div style={{ background:'rgba(0,0,0,0.3)', borderRadius:10, padding:'14px 16px', fontFamily:'monospace', fontSize:12, color:'var(--teal)', lineHeight:1.7, minHeight:200, border:'1px solid var(--border-a)', whiteSpace:'pre-wrap' }}>
                    {robotsLive || 'Loading…'}
                  </div>
                </div>
              </div>
              <div className="adm-info">
                <strong>Recommended defaults:</strong><br/>
                <code style={{ fontSize:12 }}>{'User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: https://yourdomain.com/sitemap.xml'}</code>
              </div>
            </>}

            {/* ── SITEMAP ── */}
            {activeTab==='sitemap' && <>
              <div className="adm-info adm-info-violet">
                Your sitemap is <strong>auto-generated</strong> from all published courses + static pages. It updates instantly when you publish new courses.
                Submit this URL to <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" style={{ color:'var(--violet3)' }}>Google Search Console</a> and <a href="https://www.bing.com/webmasters" target="_blank" rel="noopener noreferrer" style={{ color:'var(--violet3)' }}>Bing Webmaster Tools</a>.
              </div>
              <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
                <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid var(--border-b)', borderRadius:10, padding:'12px 18px', fontFamily:'monospace', fontSize:14, color:'var(--violet3)', flex:1 }}>
                  {seo.canonicalUrl || window.location.origin}/sitemap.xml
                </div>
                <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-ghost adm-btn-sm">Open ↗</a>
                <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => navigator.clipboard.writeText((seo.canonicalUrl || window.location.origin)+'/sitemap.xml')}>Copy URL</button>
              </div>
              <div style={{ background:'rgba(0,0,0,0.3)', borderRadius:10, padding:'14px 16px', fontFamily:'monospace', fontSize:11, color:'var(--text2)', lineHeight:1.8, maxHeight:360, overflow:'auto', border:'1px solid var(--border-a)', whiteSpace:'pre-wrap' }}>
                {sitemapXml || 'Loading sitemap…'}
              </div>
            </>}

            {/* ── SCHEMA / JSON-LD ── */}
            {activeTab==='schema' && <>
              <div className="adm-info adm-info-violet">
                <strong>Schema.org JSON-LD</strong> is structured data that helps Google understand your site and show rich results (star ratings, breadcrumbs, etc).
                Paste a valid JSON-LD block. Use <a href="https://schema.org/EducationalOrganization" target="_blank" rel="noopener noreferrer" style={{ color:'var(--violet3)' }}>EducationalOrganization</a> schema for a training platform.
              </div>
              <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid var(--border-a)', borderRadius:10, padding:'12px 16px', fontSize:12, color:'var(--text3)', fontFamily:'monospace', marginBottom:4 }}>
                {`// Recommended starter schema for Pragni:`}
              </div>
              <button className="adm-btn adm-btn-ghost adm-btn-sm" style={{ alignSelf:'flex-start' }} onClick={() => {
                const starter = JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "EducationalOrganization",
                  "name": seo.siteName || "Pragni",
                  "url": seo.canonicalUrl || "",
                  "description": seo.siteDescription || "",
                  "sameAs": [],
                  "offers": { "@type": "Offer", "priceCurrency": "INR" }
                }, null, 2);
                set('schemaOrg', starter);
              }}>Auto-fill starter schema</button>
              <div className="adm-input-group">
                <label className="adm-label">JSON-LD Schema</label>
                <textarea className="adm-input" value={seo.schemaOrg} onChange={e=>set('schemaOrg',e.target.value)} rows={14}
                  style={{ fontFamily:'monospace', fontSize:12, lineHeight:1.7 }} placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "EducationalOrganization",\n  ...\n}'} />
              </div>
              <button className="adm-btn adm-btn-ghost adm-btn-sm" style={{ alignSelf:'flex-start' }} onClick={() => {
                try { JSON.parse(seo.schemaOrg); showToast('Valid JSON!'); } catch(e) { showToast('Invalid JSON: '+e.message, 'error'); }
              }}>Validate JSON</button>
            </>}

            {/* ── PAGE OVERRIDES ── */}
            {activeTab==='pages' && <>
              <div className="adm-info adm-info-violet">
                Override the default meta title and description for specific pages. Leave blank to inherit the global settings.
              </div>
              {PAGE_KEYS.map(p => (
                <div key={p.key} className="adm-card adm-card-inner" style={{ gap:14, display:'flex', flexDirection:'column' }}>
                  <div style={{ fontWeight:700, fontSize:14, color:'var(--violet3)', borderBottom:'1px solid var(--border-a)', paddingBottom:10 }}>{p.label}</div>
                  <div className="adm-form-row">
                    <Field label="Page Title" value={pageOverrides[p.key]?.title||''} onChange={v=>setPage(p.key,'title',v)} placeholder={`${p.label} · ${seo.siteName||'Pragni'}`} hint="60 chars max" />
                    <Field label="Meta Description" value={pageOverrides[p.key]?.description||''} onChange={v=>setPage(p.key,'description',v)} placeholder="Short description for this page…" hint="160 chars max" />
                  </div>
                  <Field label="Page Keywords (optional)" value={pageOverrides[p.key]?.keywords||''} onChange={v=>setPage(p.key,'keywords',v)} placeholder="comma, separated, keywords" />
                </div>
              ))}
            </>}

          </div>
        </div>
      </div>

      {toast && <div className={`adm-toast adm-toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, hint, multiline }) {
  return (
    <div className="adm-input-group">
      <label className="adm-label">{label}</label>
      {multiline
        ? <textarea className="adm-input" value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={3} />
        : <input className="adm-input" value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} />
      }
      {hint && <p style={{ fontSize:11, color:'var(--text3)', marginTop:5, lineHeight:1.5 }}>{hint}</p>}
    </div>
  );
}
