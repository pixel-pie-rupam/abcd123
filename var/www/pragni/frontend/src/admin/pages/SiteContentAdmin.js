import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { adminGet } from '../../utils/api';
import axios from 'axios';

const ADMIN_BASE = `/api/${process.env.REACT_APP_ADMIN_PATH || 'xK9mP2qR7nL4wV'}`;

const FIELDS = [
  {
    section: 'Brand & Navbar',
    desc: 'Controls the brand name and tagline shown in the header next to the logo.',
    fields: [
      { key: 'brand_name',    label: 'Brand Name',    type: 'text',     placeholder: 'pragni',                       hint: 'Shown in navbar. The last character gets an accent color automatically.' },
      { key: 'brand_tagline', label: 'Brand Tagline', type: 'text',     placeholder: 'Learn Cybersecurity for Free',  hint: 'Tiny line shown below brand name in navbar. Leave blank to hide.' },
    ],
  },
  {
    section: 'Hero Section',
    desc: 'Controls the large text and stats shown in the homepage hero.',
    fields: [
      { key: 'hero_eyebrow',        label: 'Eyebrow Tag',        type: 'text',     placeholder: 'Cybersecurity · Cloud · Pentesting' },
      { key: 'hero_title_line1',    label: 'Title Word 1',       type: 'text',     placeholder: 'Learn',               hint: 'First word before the gradient word.' },
      { key: 'hero_title_gradient', label: 'Gradient Word',      type: 'text',     placeholder: 'Cybersecurity',        hint: 'The animated gradient-colored word.' },
      { key: 'hero_title_line2',    label: 'Title Line 2',       type: 'text',     placeholder: 'Cloud.',               hint: 'Second line, first part (bold).' },
      { key: 'hero_title_line3',    label: 'Title Line 2 (dim)', type: 'text',     placeholder: 'For Free.',            hint: 'Second line, second part (dimmer weight).' },
      { key: 'hero_description',    label: 'Hero Description',   type: 'textarea', placeholder: 'Pragni is built to make world-class tech skills accessible to everyone.' },
      { key: 'stat1_num',  label: 'Stat 1 Number', type: 'text', placeholder: '8+' },
      { key: 'stat1_lbl',  label: 'Stat 1 Label',  type: 'text', placeholder: 'Course tracks' },
      { key: 'stat2_num',  label: 'Stat 2 Number', type: 'text', placeholder: '100%' },
      { key: 'stat2_lbl',  label: 'Stat 2 Label',  type: 'text', placeholder: 'Free to start' },
      { key: 'stat3_num',  label: 'Stat 3 Number', type: 'text', placeholder: 'Live' },
      { key: 'stat3_lbl',  label: 'Stat 3 Label',  type: 'text', placeholder: 'Workshops weekly' },
      { key: 'stat4_num',  label: 'Stat 4 Number', type: 'text', placeholder: '₹0' },
      { key: 'stat4_lbl',  label: 'Stat 4 Label',  type: 'text', placeholder: 'Hidden fees' },
    ],
  },
  {
    section: 'Journey Section',
    desc: 'Controls the heading and subtitle for the image carousel section.',
    fields: [
      { key: 'journey_title',    label: 'Section Title',    type: 'text',     placeholder: 'Our Journey' },
      { key: 'journey_subtitle', label: 'Section Subtitle', type: 'text',     placeholder: 'From a small idea to building world-class cyber educators.' },
    ],
  },
  {
    section: 'Team Section',
    desc: 'Controls the heading and subtitle for the Meet Our Team section.',
    fields: [
      { key: 'team_title',    label: 'Section Title',    type: 'text', placeholder: 'Meet Our Team' },
      { key: 'team_subtitle', label: 'Section Subtitle', type: 'text', placeholder: 'Passionate educators and security professionals building Pragni.' },
    ],
  },
  {
    section: 'Hero Video',
    desc: 'Add a YouTube video or self-hosted MP4 to the Home page. Only shown when at least one of the URL fields is filled.',
    fields: [
      { key: 'hero_video_youtube', label: 'YouTube Video ID', type: 'text', placeholder: 'dQw4w9WgXcQ', hint: 'Paste only the video ID (after ?v=), not the full URL. e.g. dQw4w9WgXcQ' },
      { key: 'hero_video_url',     label: 'Self-hosted MP4 URL (fallback)', type: 'text', placeholder: 'https://yoursite.com/video.mp4', hint: 'Used only if YouTube ID is empty.' },
      { key: 'hero_video_poster',  label: 'Video Poster Image URL', type: 'text', placeholder: 'https://… thumbnail image', hint: 'Shown before the video plays (for self-hosted only).' },
      { key: 'hero_video_kicker',  label: 'Section Kicker', type: 'text', placeholder: 'Watch & Learn' },
      { key: 'hero_video_title',   label: 'Section Title', type: 'text', placeholder: 'See Pragni in Action' },
      { key: 'hero_video_desc',    label: 'Section Subtitle', type: 'text', placeholder: 'Watch a quick overview of what we offer.' },
      { key: 'video_tag1', label: 'Video Tag 1', type: 'text', placeholder: 'Free to watch' },
      { key: 'video_tag2', label: 'Video Tag 2', type: 'text', placeholder: '5 minutes' },
      { key: 'video_tag3', label: 'Video Tag 3', type: 'text', placeholder: 'No signup needed' },
    ],
  },
  {
    section: 'Mission / About',
    desc: 'Controls the mission quote and text shown at the bottom of the Home page.',
    fields: [
      { key: 'mission_quote', label: 'Mission Quote', type: 'textarea', placeholder: 'Every learner deserves world-class tech education.',  hint: 'Shown in large text. No need to add quotes — they are added automatically.' },
      { key: 'mission_text',  label: 'Mission Text',  type: 'textarea', placeholder: 'Pragni was founded to break the paywall on cybersecurity and cloud education.' },
    ],
  },
];

export default function SiteContentAdmin() {
  const { token } = useAdmin();
  const [content, setContent] = useState({});
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    adminGet('/site-content', token).then(r => setContent(r.data.content || {})).catch(() => {});
  }, [token]);

  const set = (k, v) => setContent(c => ({ ...c, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await axios.put(`${ADMIN_BASE}/site-content`, content, { headers: { Authorization: `Bearer ${token}` } });
      window.dispatchEvent(new Event('site-content-updated'));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { alert('Error saving. Please try again.'); }
    setSaving(false);
  };

  return (
    <div>
      <div className="adm-header">
        <div>
          <h1 className="adm-header-title">Site Content</h1>
          <p className="adm-header-sub">Edit text shown on the public website — brand name, hero heading, stats, mission quote.</p>
        </div>
        <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save All Changes'}
        </button>
      </div>

      <div className="adm-body" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="adm-info adm-info-violet">
          Changes here reflect on the public site immediately after saving. No rebuild required — the site fetches content dynamically.
        </div>

        {FIELDS.map(group => (
          <div key={group.section} className="adm-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 22px', background: 'rgba(255,255,255,0.025)', borderBottom: '1px solid var(--border-a)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{group.section}</div>
              {group.desc && <div style={{ fontSize: 12, color: 'var(--text3)' }}>{group.desc}</div>}
            </div>
            <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {group.fields.map(f => (
                <div key={f.key} className="adm-input-group">
                  <label className="adm-label">{f.label}</label>
                  {f.type === 'textarea'
                    ? <textarea className="adm-input" rows={3} placeholder={f.placeholder} value={content[f.key] || ''} onChange={e => set(f.key, e.target.value)} />
                    : <input   className="adm-input"          placeholder={f.placeholder} value={content[f.key] || ''} onChange={e => set(f.key, e.target.value)} />
                  }
                  {f.hint && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{f.hint}</div>}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ textAlign: 'right' }}>
          <button className="adm-btn adm-btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save All Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
