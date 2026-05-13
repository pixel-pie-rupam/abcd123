import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCourses } from '../utils/api';
import { Link } from 'react-router-dom';
import { useMeta } from '../context/SeoContext';


/* ─── STYLES ─────────────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Cabinet+Grotesk:wght@300;400;500;700;800&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');

  :root {
    --ink:        #08090f;
    --ink2:       #0d0f1a;
    --ink3:       #111420;
    --surface:    #1a1d2e;
    --surface2:   #1f2335;
    --lift:       #242840;
    --border:     rgba(255,255,255,0.055);
    --border2:    rgba(255,255,255,0.10);
    --border3:    rgba(255,255,255,0.18);
    --text:       #eef0ff;
    --text2:      #8b91b8;
    --text3:      #4a4f72;
    --violet:     #7b5ea7;
    --violet2:    #9d7fd4;
    --violet3:    #c4a8ff;
    --cyan:       #4fc3f7;
    --teal:       #26d0a1;
    --rose:       #f06292;
    --amber:      #ffca28;
    --indigo:     #5c6bc0;
    --font-display: 'Clash Display', 'Cabinet Grotesk', sans-serif;
    --font-body:    'Plus Jakarta Sans', sans-serif;
    --ease:       cubic-bezier(0.16, 1, 0.3, 1);
    --ease2:      cubic-bezier(0.4, 0, 0.2, 1);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  ::selection { background: rgba(157,127,212,0.28); color: #fff; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: var(--ink2); }
  ::-webkit-scrollbar-thumb { background: var(--lift); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--violet); }

  /* ══ AURORA ══ */
  .cs-aurora {
    position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
  }
  .cs-blob {
    position: absolute; border-radius: 50%;
    filter: blur(90px); mix-blend-mode: screen; will-change: transform;
  }
  .cs-b1 {
    width: 650px; height: 650px;
    background: radial-gradient(circle at 40% 40%, rgba(123,94,167,0.24) 0%, rgba(79,195,247,0.09) 55%, transparent 70%);
    top: -200px; left: -120px;
    animation: csBlob1 24s ease-in-out infinite alternate;
  }
  .cs-b2 {
    width: 500px; height: 500px;
    background: radial-gradient(circle at 60% 40%, rgba(38,208,161,0.18) 0%, rgba(123,94,167,0.12) 55%, transparent 70%);
    top: 40vh; right: -100px;
    animation: csBlob2 30s ease-in-out infinite alternate;
  }
  .cs-b3 {
    width: 400px; height: 400px;
    background: radial-gradient(circle at 50% 50%, rgba(79,195,247,0.14) 0%, rgba(240,98,146,0.07) 55%, transparent 70%);
    bottom: 10vh; left: 20%;
    animation: csBlob3 20s ease-in-out infinite alternate;
  }
  @keyframes csBlob1 { from{transform:translate(0,0) scale(1)} to{transform:translate(70px,100px) scale(1.1)} }
  @keyframes csBlob2 { from{transform:translate(0,0) scale(1.05)} to{transform:translate(-60px,70px) scale(0.93)} }
  @keyframes csBlob3 { from{transform:translate(0,0) scale(1)} to{transform:translate(50px,-60px) scale(1.08)} }

  .cs-mesh {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.016) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.016) 1px, transparent 1px);
    background-size: 72px 72px;
    mask-image: radial-gradient(ellipse 90% 70% at 50% 30%, rgba(0,0,0,0.45), transparent);
  }
  .cs-noise {
    position: fixed; inset: 0; pointer-events: none; z-index: 1; opacity: 0.028;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  /* ══ ROOT ══ */
  .cs-root {
    font-family: var(--font-body);
    color: var(--text);
    background: var(--ink);
    min-height: 100vh;
    overflow-x: hidden;
    position: relative;
  }
  .cs-inner { position: relative; z-index: 3; }
  .cs-container { max-width: 1240px; margin: 0 auto; padding: 0 28px; }

  /* ══ PAGE HEADER ══ */
  .cs-header {
    padding: 80px 0 56px;
    text-align: center;
    position: relative;
  }
  .cs-eyebrow {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 7px 18px; border-radius: 100px;
    background: rgba(79,195,247,0.07);
    border: 1px solid rgba(79,195,247,0.2);
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--cyan); margin-bottom: 28px;
  }
  .cs-eyebrow-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--cyan); box-shadow: 0 0 10px var(--cyan);
    animation: eyebrowPulse 2.5s ease-in-out infinite;
  }
  @keyframes eyebrowPulse {
    0%,100% { transform: scale(1); box-shadow: 0 0 10px var(--cyan); }
    50% { transform: scale(1.35); box-shadow: 0 0 22px var(--cyan), 0 0 38px rgba(79,195,247,0.35); }
  }

  .cs-title {
    font-family: var(--font-display);
    font-size: clamp(38px, 5.5vw, 68px);
    font-weight: 700; line-height: 1.04;
    letter-spacing: -0.03em; margin-bottom: 18px;
  }
  .cs-title-grad {
    background: linear-gradient(135deg, var(--text) 0%, var(--violet3) 50%, var(--cyan) 100%);
    background-size: 300% 300%;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    animation: gradShift 8s ease-in-out infinite;
  }
  @keyframes gradShift {
    0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%}
  }
  .cs-subtitle {
    font-size: 17px; color: var(--text2); font-weight: 300;
    line-height: 1.75; max-width: 520px; margin: 0 auto 0;
  }

  /* ══ FILTER AREA ══ */
  .cs-filters {
    padding: 0 0 52px;
    position: relative;
  }

  /* Category pills */
  .cs-cat-wrap {
    display: flex; flex-wrap: wrap; gap: 10px;
    justify-content: center; margin-bottom: 18px;
  }
  .cs-cat-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 20px; border-radius: 100px;
    font-family: var(--font-body);
    font-size: 13px; font-weight: 600; letter-spacing: 0.01em;
    cursor: pointer; border: 1px solid var(--border2);
    background: rgba(255,255,255,0.04);
    color: var(--text2);
    transition: all 0.3s var(--ease);
    position: relative; overflow: hidden;
  }
  .cs-cat-btn::before {
    content: '';
    position: absolute; inset: 0;
    background: rgba(255,255,255,0);
    transition: background 0.3s;
  }
  .cs-cat-btn:hover::before { background: rgba(255,255,255,0.04); }
  .cs-cat-btn:hover {
    border-color: var(--border3);
    color: var(--text);
    transform: translateY(-2px);
  }
  .cs-cat-btn.active {
    background: linear-gradient(135deg, rgba(123,94,167,0.3), rgba(92,107,192,0.3));
    border-color: rgba(157,127,212,0.5);
    color: var(--violet3);
    box-shadow: 0 0 24px rgba(123,94,167,0.2), 0 4px 16px rgba(0,0,0,0.3);
  }
  .cs-cat-btn.active[data-color] {
    background: linear-gradient(135deg,
      color-mix(in srgb, var(--cat-c) 20%, transparent),
      color-mix(in srgb, var(--cat-c) 10%, transparent));
    border-color: var(--cat-c);
    color: var(--cat-c);
    box-shadow: 0 0 24px color-mix(in srgb, var(--cat-c) 25%, transparent);
  }

  /* Level pills */
  .cs-level-wrap {
    display: flex; gap: 8px; justify-content: center;
  }
  .cs-level-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 16px; border-radius: 100px;
    font-family: var(--font-body);
    font-size: 12px; font-weight: 600;
    cursor: pointer; border: 1px solid var(--border);
    background: transparent; color: var(--text3);
    transition: all 0.25s var(--ease2);
  }
  .cs-level-btn:hover { color: var(--text2); border-color: var(--border2); }
  .cs-level-btn.active {
    background: rgba(255,202,40,0.1);
    border-color: rgba(255,202,40,0.35);
    color: var(--amber);
  }

  /* Result count */
  .cs-result-bar {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 28px; padding: 0 2px;
  }
  .cs-result-count {
    font-size: 13px; color: var(--text3); font-weight: 400;
  }
  .cs-result-count strong { color: var(--text2); font-weight: 700; }
  .cs-divider-line {
    flex: 1; height: 1px; margin: 0 16px;
    background: linear-gradient(90deg, rgba(255,255,255,0.06), transparent);
  }

  /* ══ COURSE GRID ══ */
  .cs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 24px;
  }

  /* ══ COURSE CARD ══ */
  .cs-card {
    background: rgba(26,29,46,0.82);
    border: 1px solid var(--border);
    border-radius: 22px; overflow: hidden;
    cursor: pointer;
    display: flex; flex-direction: column;
    transition: all 0.4s var(--ease);
    backdrop-filter: blur(12px);
    position: relative;
    animation: csFadeUp 0.6s var(--ease) both;
  }
  .cs-card::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(123,94,167,0.06) 0%, transparent 55%);
    opacity: 0; transition: opacity 0.4s;
    pointer-events: none; border-radius: inherit;
  }
  .cs-card:hover {
    transform: translateY(-8px);
    border-color: rgba(157,127,212,0.38);
    box-shadow:
      0 32px 80px rgba(0,0,0,0.55),
      0 0 0 1px rgba(157,127,212,0.14),
      0 0 60px rgba(123,94,167,0.12);
  }
  .cs-card:hover::before { opacity: 1; }
  @keyframes csFadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Thumb */
  .cs-thumb {
    height: 192px; position: relative; overflow: hidden;
    background: var(--ink3); flex-shrink: 0;
  }
  .cs-thumb img {
    width: 100%; height: 100%; object-fit: cover;
    transition: transform 0.6s var(--ease);
    display: block;
  }
  .cs-card:hover .cs-thumb img { transform: scale(1.07); }
  .cs-thumb-ph {
    height: 100%; display: flex; align-items: center; justify-content: center;
    font-size: 60px;
    background: linear-gradient(135deg, var(--surface2) 0%, var(--ink3) 100%);
    position: relative; overflow: hidden;
    transition: transform 0.6s var(--ease);
  }
  .cs-card:hover .cs-thumb-ph { transform: scale(1.04); }
  .cs-thumb-ph::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(circle at 35% 35%, rgba(123,94,167,0.2), transparent 65%);
  }

  /* Shimmer on thumb hover */
  .cs-thumb::after {
    content: '';
    position: absolute; top: 0; left: -100%; width: 55%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
    transition: left 0.65s var(--ease);
  }
  .cs-card:hover .cs-thumb::after { left: 150%; }

  /* Free ribbon */
  .cs-free-ribbon {
    position: absolute; top: 14px; right: 14px;
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 12px; border-radius: 100px;
    font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--teal);
    background: rgba(38,208,161,0.15);
    border: 1px solid rgba(38,208,161,0.35);
    box-shadow: 0 0 16px rgba(38,208,161,0.2);
    backdrop-filter: blur(10px);
  }
  .cs-free-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--teal); box-shadow: 0 0 6px var(--teal);
    animation: freeDotPulse 2s ease-in-out infinite;
  }
  @keyframes freeDotPulse {
    0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(0.6);opacity:0.5}
  }

  /* Body */
  .cs-body {
    padding: 22px 24px 20px;
    flex: 1; display: flex; flex-direction: column;
    position: relative; z-index: 1;
  }

  /* Meta row */
  .cs-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 13px; flex-wrap: wrap; }
  .cs-tag {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 600; letter-spacing: 0.03em;
    padding: 4px 11px; border-radius: 100px;
    border: 1px solid var(--border2);
    color: var(--text2);
    background: rgba(255,255,255,0.04);
  }
  .cs-tag-level {
    font-size: 10px; text-transform: capitalize;
    color: var(--text3); border-color: var(--border);
    background: transparent;
  }

  /* Title */
  .cs-card-title {
    font-family: var(--font-display);
    font-size: 17px; font-weight: 700;
    line-height: 1.32; letter-spacing: -0.015em;
    margin-bottom: 10px; color: var(--text);
    transition: color 0.25s;
  }
  .cs-card:hover .cs-card-title { color: #fff; }

  /* Desc */
  .cs-card-desc {
    font-size: 13px; color: var(--text2); line-height: 1.68;
    font-weight: 300; flex: 1; margin-bottom: 18px;
    display: -webkit-box; -webkit-line-clamp: 2;
    -webkit-box-orient: vertical; overflow: hidden;
  }

  /* Footer */
  .cs-card-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 16px; border-top: 1px solid var(--border);
    margin-top: auto;
  }
  .cs-trainer {
    display: flex; align-items: center; gap: 9px;
    font-size: 12px; font-weight: 500; color: var(--text2);
  }
  .cs-trainer img {
    width: 28px; height: 28px; border-radius: 50%; object-fit: cover;
    border: 1.5px solid rgba(157,127,212,0.3);
  }
  .cs-trainer-ph {
    width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, var(--violet), var(--indigo));
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 800; color: #fff;
    border: 1.5px solid rgba(157,127,212,0.3);
  }
  .cs-price-free {
    font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--teal); padding: 4px 13px; border-radius: 100px;
    background: rgba(38,208,161,0.1); border: 1px solid rgba(38,208,161,0.28);
    box-shadow: 0 0 14px rgba(38,208,161,0.12);
  }
  .cs-price-paid {
    font-family: var(--font-display);
    font-size: 17px; font-weight: 700; color: var(--text);
    letter-spacing: -0.01em;
  }

  /* ══ SKELETON ══ */
  .cs-skeleton-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 24px;
  }
  .cs-skel {
    border-radius: 22px; overflow: hidden;
    background: rgba(26,29,46,0.7);
    border: 1px solid var(--border);
    height: 360px;
    position: relative;
  }
  .cs-skel::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(90deg,
      transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%);
    background-size: 200% 100%;
    animation: skelShimmer 1.8s ease-in-out infinite;
  }
  @keyframes skelShimmer {
    0%{background-position:200% 0} 100%{background-position:-200% 0}
  }

  /* ══ EMPTY STATE ══ */
  .cs-empty {
    text-align: center; padding: 90px 24px;
    border: 1px dashed rgba(255,255,255,0.08);
    border-radius: 24px;
    background: rgba(255,255,255,0.01);
  }
  .cs-empty-icon { font-size: 48px; margin-bottom: 18px; opacity: 0.45; }
  .cs-empty-text {
    font-size: 16px; color: var(--text3); font-weight: 300;
    margin-bottom: 28px;
  }
  .cs-empty-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 28px; border-radius: 100px;
    font-family: var(--font-body); font-size: 13px; font-weight: 700;
    cursor: pointer; border: 1px solid var(--border2);
    background: rgba(255,255,255,0.04); color: var(--text2);
    transition: all 0.3s var(--ease);
  }
  .cs-empty-btn:hover {
    border-color: rgba(157,127,212,0.4); color: var(--violet3);
    background: rgba(123,94,167,0.1);
  }

  /* ══ RESPONSIVE ══ */
  @media (max-width: 700px) {
    .cs-container { padding: 0 16px; }
    .cs-grid { grid-template-columns: 1fr; }
    .cs-skeleton-grid { grid-template-columns: 1fr; }
    .cs-header { padding: 60px 0 40px; }
    .cs-cat-wrap { gap: 7px; }
    .cs-cat-btn { padding: 7px 14px; font-size: 12px; }
  }
`;

/* ─── CAT MAP ─────────────────────────────────────────────────────────────────── */
const CAT_MAP = {
  all:                  { label: 'All Courses',    icon: '',   color: null },
  aws:                  { label: 'AWS Cloud',       icon: '',  color: '#ff9900' },
  azure:                { label: 'Azure',           icon: '',  color: '#0ea5e9' },
  cybersecurity:        { label: 'Cybersecurity',   icon: '',  color: '#f06292' },
  soc:                  { label: 'SOC',             icon: '',  color: '#26d0a1' },
  'pentesting-web':     { label: 'Web Pentest',     icon: '',  color: '#ffca28' },
  'pentesting-network': { label: 'Network Pentest', icon: '',  color: '#ff8a65' },
  'pentesting-api':     { label: 'API Pentest',     icon: '',  color: '#c4a8ff' },
  networking:           { label: 'Networking',      icon: '',  color: '#4fc3f7' },
};

const LEVELS = ['all', 'beginner', 'intermediate', 'advanced'];
const LEVEL_ICONS = { all: '', beginner: '', intermediate: '', advanced: '' };

/* ─── COURSE CARD ─────────────────────────────────────────────────────────────── */
function CourseCard({ course, index }) {
  const navigate = useNavigate();
  const cat = (window.__pragniCatMap && window.__pragniCatMap[course.category]) || {};
  const color = cat.color;

  return (
    <div
      className="cs-card"
      style={{ animationDelay: `${(index % 6) * 0.07}s` }}
      onClick={() => navigate(course.price > 0 ? `/courses/premium/${course.slug}` : `/courses/${course.slug}`)}
    >
      {/* Thumbnail */}
      <div className="cs-thumb">
        {course.thumbnail
          ? <img src={course.thumbnail} alt={course.title} />
          : <div className="cs-thumb-ph">{cat.icon || ''}</div>
        }
        {course.price === 0 && (
          <div className="cs-free-ribbon">
            <span className="cs-free-dot" /> Free
          </div>
        )}
      </div>

      {/* Body */}
      <div className="cs-body">
        {/* Meta */}
        <div className="cs-meta">
          <span
            className="cs-tag"
            style={color ? {
              color,
              borderColor: `${color}30`,
              background: `${color}0e`,
            } : {}}
          >
            {cat.icon} {cat.label}
          </span>
          {course.level && (
            <span className="cs-tag cs-tag-level">
              {LEVEL_ICONS[course.level] || ''} {course.level}
            </span>
          )}
        </div>

        {/* Title */}
        <div className="cs-card-title">{course.title}</div>

        {/* Desc */}
        <div className="cs-card-desc">{course.description}</div>

        {/* Footer */}
        <div className="cs-card-footer">
          <div className="cs-trainer">
            {course.trainer?.photo
              ? <img src={course.trainer.photo} alt={course.trainer.name} />
              : (
                <div className="cs-trainer-ph">
                  {(course.trainer?.name || 'P')[0]}
                </div>
              )
            }
            <span>{course.trainer?.name || 'Pragni'}</span>
          </div>
          {course.price === 0
            ? <span className="cs-price-free">FREE</span>
            : <span className="cs-price-paid">₹{course.price}</span>
          }
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ───────────────────────────────────────────────────────────────── */
export default function Courses() {
  useMeta({ pageKey: 'courses', title: 'All Courses', description: 'Browse all free and premium cybersecurity, cloud and networking courses on Pragni.', keywords: 'online courses, cybersecurity certification, AWS certification, cloud training, pentesting' });

  const [courses, setCourses]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [categories, setCategories] = useState([]);
  const [bundles, setBundles]     = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCategory = searchParams.get('category') || 'all';
  const activeLevel    = searchParams.get('level')    || 'all';
  const activeType     = searchParams.get('type')     || 'all'; // 'free' | 'paid' | 'all'

  /* Inject styles once */
  useEffect(() => {
    if (!document.getElementById('pragni-cs-styles')) {
      const el = document.createElement('style');
      el.id = 'pragni-cs-styles';
      el.textContent = STYLES;
      document.head.appendChild(el);
    }
  }, []);

  /* Fetch categories from backend */
  useEffect(() => {
    fetch('/api/bundles', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setBundles(d.bundles || []))
      .catch(() => {});
    fetch('/api/categories/public')
      .then(r => r.json())
      .then(d => {
        if (d.categories && d.categories.length > 0) {
          setCategories(d.categories);
        }
      })
      .catch(() => {});
  }, []);

  /* Fetch — split into premium + free */
  useEffect(() => {
    setLoading(true);
    const params = {};
    if (activeCategory !== 'all') params.category = activeCategory;
    if (activeLevel !== 'all')    params.level    = activeLevel;
    if (activeType === 'free')    params.price    = '0';
    if (activeType === 'paid')    params.paid     = '1';
    getCourses(params)
      .then(r => setCourses(r.data.courses || []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [activeCategory, activeLevel, activeType]);

  const premiumCourses = courses.filter(c => c.price > 0);
  const freeCourses    = courses.filter(c => c.price === 0);

  const setCategory = (cat) => {
    const p = new URLSearchParams(searchParams);
    if (cat === 'all') p.delete('category'); else p.set('category', cat);
    setSearchParams(p);
  };

  const setLevel = (lv) => {
    const p = new URLSearchParams(searchParams);
    if (lv === 'all') p.delete('level'); else p.set('level', lv);
    setSearchParams(p);
  };

  const resetFilters = () => setSearchParams({});

  // Build dynamic catMap ONLY from DB categories — never fall back to hardcoded list
  const effectiveCatMap = { all: { label: 'All Courses', icon: '', color: null } };
  categories.forEach(c => { effectiveCatMap[c.slug] = { label: c.label, icon: c.icon || '', color: c.color || null }; });
  const activeCat = effectiveCatMap[activeCategory] || effectiveCatMap.all;

  // Expose catMap globally so CourseCard can use it without prop drilling
  React.useEffect(() => {
    window.__pragniCatMap = effectiveCatMap;
  }, [categories]);

  return (
    <div className="cs-root">

      {/* ── AURORA ── */}
      <div className="cs-aurora">
        <div className="cs-blob cs-b1" />
        <div className="cs-blob cs-b2" />
        <div className="cs-blob cs-b3" />
      </div>
      <div className="cs-mesh" />
      <div className="cs-noise" />

      <div className="cs-inner">

        {/* ══ PAGE HEADER ══ */}
        <div className="cs-header">
          <div className="cs-container">
            <div className="cs-eyebrow">
              <span className="cs-eyebrow-dot" />
              All Courses
            </div>
            <h1 className="cs-title">
              Learn{' '}
              <span className="cs-title-grad">
                {activeCategory !== 'all' ? activeCat.label : 'at Your Own Pace'}
              </span>
            </h1>
            <p className="cs-subtitle">
              Free and affordable courses in Cloud, Cybersecurity, Networking &amp; more.
              No hidden fees. Start instantly.
            </p>
          </div>
        </div>

        {/* ══ FILTERS ══ */}
        <div className="cs-filters">
          <div className="cs-container">

            {/* Category buttons */}
            <div className="cs-cat-wrap">
              {Object.entries(effectiveCatMap).map(([slug, { label, icon, color }]) => (
                <button
                  key={slug}
                  className={`cs-cat-btn ${activeCategory === slug ? 'active' : ''}`}
                  onClick={() => setCategory(slug)}
                  style={activeCategory === slug && color ? {
                    color,
                    borderColor: `${color}50`,
                    background: `${color}14`,
                    boxShadow: `0 0 24px ${color}22`,
                  } : {}}
                >
                  {icon} {label}
                </button>
              ))}
            </div>

            {/* Level buttons */}
            <div className="cs-level-wrap">
              {LEVELS.map(lv => (
                <button
                  key={lv}
                  className={`cs-level-btn ${activeLevel === lv ? 'active' : ''}`}
                  onClick={() => setLevel(lv)}
                >
                  {LEVEL_ICONS[lv]}{' '}
                  {lv === 'all' ? 'All Levels' : lv.charAt(0).toUpperCase() + lv.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>


        {/* ══ BUNDLES SECTION — show only if active bundles exist ══ */}
        {bundles.length > 0 && (
          <div className="cs-container" style={{ paddingBottom: 0, marginBottom: 48 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,rgba(255,202,40,0.2),rgba(240,98,146,0.1))', border:'1px solid rgba(255,202,40,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffca28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              </div>
              <div>
                <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(20px,3vw,28px)', fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.1 }}>Bundle Offers</h2>
                <p style={{ fontSize:13, color:'var(--text3)', marginTop:4 }}>Get multiple premium courses together at a special discounted price.</p>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:20 }}>
              {bundles.map(b => {
                const individualTotal = (b.courses || []).reduce((s, c) => s + (c.price || 0), 0);
                const saving = Math.max(0, individualTotal - b.bundlePrice);
                const savingPct = individualTotal > 0 ? Math.round((saving / individualTotal) * 100) : 0;
                return (
                  <div key={b._id} style={{
                    background:'rgba(26,29,46,0.8)', border:'1px solid rgba(255,202,40,0.2)',
                    borderRadius:20, padding:24, position:'relative', overflow:'hidden',
                    backdropFilter:'blur(16px)',
                    boxShadow:'0 0 40px rgba(255,202,40,0.06)',
                    transition:'transform 0.25s, box-shadow 0.25s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 8px 50px rgba(255,202,40,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 0 40px rgba(255,202,40,0.06)'; }}>
                    {/* Save badge */}
                    {savingPct > 0 && (
                      <div style={{ position:'absolute', top:16, right:16, background:'linear-gradient(135deg,#ffca28,#ff9f43)', color:'#0a0700', fontSize:11, fontWeight:800, padding:'4px 12px', borderRadius:100, letterSpacing:'0.04em' }}>
                        SAVE {savingPct}%
                      </div>
                    )}
                    {b.isFeatured && (
                      <div style={{ position:'absolute', top:16, left:16, background:'rgba(108,71,255,0.2)', border:'1px solid rgba(157,127,212,0.4)', color:'#c4a8ff', fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:100, letterSpacing:'0.06em' }}>
                        FEATURED
                      </div>
                    )}

                    {b.thumbnail && <img src={b.thumbnail} alt={b.title} style={{ width:'100%', height:140, objectFit:'cover', borderRadius:12, marginBottom:16 }} />}

                    <h3 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, letterSpacing:'-0.02em', marginBottom:8, marginTop: b.isFeatured ? 28 : 0 }}>{b.title}</h3>
                    {b.description && <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6, marginBottom:14 }}>{b.description}</p>}

                    {/* Included courses */}
                    <div style={{ marginBottom:18 }}>
                      <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text3)', marginBottom:8 }}>Includes</div>
                      {(b.courses || []).map(c => (
                        <div key={c._id} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#26d0a1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          <span style={{ fontSize:13, color:'var(--text)', flex:1 }}>{c.title}</span>
                          <span style={{ fontSize:11, color:'var(--text3)', textDecoration:'line-through' }}>₹{c.price?.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>

                    {/* Price */}
                    <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:16 }}>
                      <span style={{ fontFamily:'var(--font-display)', fontSize:32, fontWeight:700, color:'var(--amber)', letterSpacing:'-0.03em' }}>₹{b.bundlePrice?.toLocaleString('en-IN')}</span>
                      {individualTotal > 0 && individualTotal !== b.bundlePrice && (
                        <span style={{ fontSize:15, color:'var(--text3)', textDecoration:'line-through' }}>₹{individualTotal?.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                    {saving > 0 && <div style={{ fontSize:12, color:'#26d0a1', fontWeight:600, marginBottom:16 }}>You save ₹{saving.toLocaleString('en-IN')}</div>}

                    {/* CTA — open enrollment form for first course in bundle */}
                    {(b.courses || []).length > 0 && (
                      <a href={`/courses/premium/${b.courses[0].slug}`}
                        style={{ display:'block', width:'100%', padding:'13px', borderRadius:12, textAlign:'center', fontWeight:700, fontSize:14, background:'linear-gradient(135deg,rgba(255,202,40,0.9),rgba(255,159,67,0.9))', color:'#0a0700', textDecoration:'none', transition:'opacity 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.opacity='0.88'}
                        onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                        Get Bundle Offer →
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ PREMIUM SECTION ══ */}
        <div className="cs-container" style={{ paddingBottom: 0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
            
            <div>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(20px,3vw,28px)', fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.1 }}>Premium Courses</h2>
              <p style={{ fontSize:13, color:'var(--text3)', marginTop:4 }}>Expert-led, structured programs with certification &amp; mentorship.</p>
            </div>
          </div>

          {loading ? (
            <div className="cs-skeleton-grid">
              {[1,2,3].map(i => <div key={i} className="cs-skel" style={{ height:260 }} />)}
            </div>
          ) : premiumCourses.length === 0 ? (
            /* Coming Soon placeholder */
            <div style={{ padding:'60px 0', textAlign:'center', border:'1px dashed rgba(255,202,40,0.15)', borderRadius:20, background:'rgba(255,202,40,0.03)' }}>
              
              <div style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color:'var(--amber)', marginBottom:8 }}>Coming Soon</div>
              <p style={{ fontSize:14, color:'var(--text3)', maxWidth:380, margin:'0 auto' }}>Premium courses are launching soon. Check back — or explore our free courses below while you wait.</p>
            </div>
          ) : (
            <div className="cs-grid">
              {premiumCourses.map((c, i) => <CourseCard key={c._id} course={c} index={i} />)}
            </div>
          )}
        </div>

        <div style={{ height:1, background:'rgba(255,255,255,0.06)', margin:'52px 28px' }} />

        {/* ══ FREE SECTION ══ */}
        <div className="cs-container" style={{ paddingBottom: 90 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
            
            <div>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(20px,3vw,28px)', fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.1 }}>Free Courses</h2>
              <p style={{ fontSize:13, color:'var(--text3)', marginTop:4 }}>No signup needed. Start learning instantly — always free.</p>
            </div>
          </div>

          {/* Result bar */}
          {!loading && (
            <div className="cs-result-bar">
              <span className="cs-result-count">
                <strong>{freeCourses.length}</strong> free course{freeCourses.length !== 1 ? 's' : ''} found
              </span>
              <div className="cs-divider-line" />
              {(activeCategory !== 'all' || activeLevel !== 'all') && (
                <button
                  onClick={resetFilters}
                  style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, color:'var(--text3)', fontFamily:'var(--font-body)', transition:'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--rose)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text3)'}
                >
                  ✕ Clear filters
                </button>
              )}
            </div>
          )}

          {loading && (
            <div className="cs-skeleton-grid">
              {[1,2,3,4,5,6].map(i => <div key={i} className="cs-skel" style={{ animationDelay:`${i * 0.1}s` }} />)}
            </div>
          )}

          {!loading && freeCourses.length === 0 && (
            <div className="cs-empty">
              <div className="cs-empty-icon"></div>
              <p className="cs-empty-text">No free courses found for this filter.</p>
              <button className="cs-empty-btn" onClick={resetFilters}> Show all courses</button>
            </div>
          )}

          {!loading && freeCourses.length > 0 && (
            <div className="cs-grid">
              {freeCourses.map((c, i) => <CourseCard key={c._id} course={c} index={i} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
