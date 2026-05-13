import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCourses, getWorkshops, joinWorkshop } from '../utils/api';
import { useMeta } from '../context/SeoContext';
import { useTheme } from '../context/ThemeContext';

/* ─────────────────────────────────────────────────────────────────
   DESIGN SYSTEM — EDITORIAL TECH-NOIR
   Typography: Clash Display (bold display) + Cabinet Grotesk (body)
   + JetBrains Mono (code/labels)
   Aesthetic: Precision grid · Dramatic type · Surgical motion
   Dark: Near-black with electric-blue / violet accents
   Light: Warm white with deep ink tones, same accents lifted
──────────────────────────────────────────────────────────────────── */
const HOME_STYLES = `
@import url('https://api.fontshare.com/v2/css?f[]=clash-display@200,300,400,500,600,700&f[]=cabinet-grotesk@100,200,300,400,500,600,700,800,900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&display=swap');

/* ── ROOT TOKENS ── */
:root {
  --h-font: 'Clash Display', sans-serif;
  --b-font: 'Cabinet Grotesk', sans-serif;
  --m-font: 'JetBrains Mono', monospace;
}
[data-theme="dark"] {
  --pg-bg: #080a0e;
  --pg-bg2: #0d0f14;
  --pg-bg3: #12151c;
  --pg-bg4: #181c24;
  --pg-surface: rgba(255,255,255,.03);
  --pg-surface2: rgba(255,255,255,.055);
  --pg-border: rgba(255,255,255,.07);
  --pg-border2: rgba(255,255,255,.12);
  --pg-border3: rgba(255,255,255,.2);
  --pg-text: #f0f2f7;
  --pg-text2: rgba(240,242,247,.55);
  --pg-text3: rgba(240,242,247,.3);
  --pg-text4: rgba(240,242,247,.15);
  --pg-accent: #4f8bff;
  --pg-accent2: #7c5cfc;
  --pg-accent3: #00e5c3;
  --pg-accent-bg: rgba(79,139,255,.08);
  --pg-accent-glow: rgba(79,139,255,.18);
  --pg-accent2-glow: rgba(124,92,252,.15);
  --pg-green: #00e5c3;
  --pg-green-bg: rgba(0,229,195,.08);
  --pg-red: #ff4d6a;
  --pg-red-bg: rgba(255,77,106,.08);
  --pg-amber: #f5a623;
  --pg-amber-bg: rgba(245,166,35,.08);
  --pg-shadow: 0 4px 24px rgba(0,0,0,.4);
  --pg-shadow-lg: 0 20px 80px rgba(0,0,0,.6);
  --pg-shadow-accent: 0 8px 40px rgba(79,139,255,.2);
  --pg-grid-line: rgba(255,255,255,.024);
  --pg-input: #0d0f14;
}
[data-theme="light"] {
  --pg-bg: #fafbfc;
  --pg-bg2: #f2f4f8;
  --pg-bg3: #e8eaf0;
  --pg-bg4: #dde0e9;
  --pg-surface: rgba(0,0,0,.025);
  --pg-surface2: rgba(0,0,0,.045);
  --pg-border: rgba(0,0,0,.08);
  --pg-border2: rgba(0,0,0,.13);
  --pg-border3: rgba(0,0,0,.22);
  --pg-text: #0d0f14;
  --pg-text2: rgba(13,15,20,.58);
  --pg-text3: rgba(13,15,20,.36);
  --pg-text4: rgba(13,15,20,.18);
  --pg-accent: #2563eb;
  --pg-accent2: #6d28d9;
  --pg-accent3: #059669;
  --pg-accent-bg: rgba(37,99,235,.07);
  --pg-accent-glow: rgba(37,99,235,.12);
  --pg-accent2-glow: rgba(109,40,217,.1);
  --pg-green: #059669;
  --pg-green-bg: rgba(5,150,105,.07);
  --pg-red: #dc2626;
  --pg-red-bg: rgba(220,38,38,.07);
  --pg-amber: #d97706;
  --pg-amber-bg: rgba(217,119,6,.08);
  --pg-shadow: 0 2px 16px rgba(0,0,0,.08);
  --pg-shadow-lg: 0 16px 60px rgba(0,0,0,.14);
  --pg-shadow-accent: 0 6px 30px rgba(37,99,235,.15);
  --pg-grid-line: rgba(0,0,0,.04);
  --pg-input: #fff;
}

/* ── BASE ── */
.h-pg { font-family:var(--b-font); background:var(--pg-bg); color:var(--pg-text); overflow-x:hidden; min-height:100vh; position:relative; transition:background .35s,color .35s; }

/* ── CANVAS + GRAIN ── */
#h-canvas { position:fixed; inset:0; z-index:0; pointer-events:none; opacity:.5; }
[data-theme="light"] #h-canvas { opacity:.15; }
.h-grain { position:fixed; inset:0; z-index:1; pointer-events:none; opacity:.022; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E"); animation:hGrain .3s steps(1) infinite; }
@keyframes hGrain { 0%{transform:translate(0,0)} 25%{transform:translate(-2%,3%)} 50%{transform:translate(3%,-2%)} 75%{transform:translate(-1%,-3%)} 100%{transform:translate(2%,2%)} }

/* ── PRECISION GRID ── */
.h-grid { position:fixed; inset:0; z-index:0; pointer-events:none; background-image:linear-gradient(var(--pg-grid-line) 1px,transparent 1px),linear-gradient(90deg,var(--pg-grid-line) 1px,transparent 1px); background-size:80px 80px; }

/* ── INNER + WRAP ── */
.h-inner { position:relative; z-index:2; }
.h-wrap { max-width:1280px; margin:0 auto; padding:0 48px; }
@media(max-width:640px){.h-wrap{padding:0 20px;}}

/* ══════════════════════════════════════════════
   HERO
══════════════════════════════════════════════ */
.h-hero { min-height:100vh; display:flex; align-items:center; padding:140px 0 80px; position:relative; overflow:hidden; }

/* Atmospheric glow blobs */
.h-hero-blob1 { position:absolute; top:-10%; right:-5%; width:60vw; max-width:900px; height:60vw; max-height:900px; border-radius:50%; background:radial-gradient(circle,var(--pg-accent2-glow) 0%,transparent 68%); pointer-events:none; animation:blobDrift 14s ease-in-out infinite; }
.h-hero-blob2 { position:absolute; bottom:-15%; left:-10%; width:50vw; max-width:700px; height:50vw; max-height:700px; border-radius:50%; background:radial-gradient(circle,var(--pg-accent-glow) 0%,transparent 68%); pointer-events:none; animation:blobDrift 18s ease-in-out infinite reverse; }
@keyframes blobDrift { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(2%,-3%) scale(1.04)} 66%{transform:translate(-2%,2%) scale(.97)} }

/* Layout: two-column, left=content right=panel */
.h-hero-grid { display:grid; grid-template-columns:1fr 500px; gap:80px; align-items:center; position:relative; z-index:2; }

/* ── Badge / eyebrow ── */
.h-badge { display:inline-flex; align-items:center; gap:8px; margin-bottom:28px; font-family:var(--m-font); font-size:10px; font-weight:400; letter-spacing:.18em; text-transform:uppercase; color:var(--pg-accent); border:1px solid var(--pg-border2); border-radius:4px; padding:7px 14px; background:var(--pg-accent-bg); backdrop-filter:blur(12px); }
.h-badge-dot { width:6px; height:6px; border-radius:50%; background:var(--pg-green); box-shadow:0 0 8px var(--pg-green); animation:bDot 2s ease-in-out infinite; }
@keyframes bDot { 0%,100%{opacity:1;box-shadow:0 0 8px var(--pg-green)} 50%{opacity:.4;box-shadow:0 0 3px var(--pg-green)} }

/* ── Hero heading ── */
.h-h1 { font-family:var(--h-font); font-weight:700; line-height:.92; letter-spacing:-.04em; margin-bottom:28px; font-size:clamp(48px,7.5vw,96px); }
.h-h1-line { display:block; }
.h-h1-plain { color:var(--pg-text); }
.h-h1-accent { background:linear-gradient(120deg,var(--pg-accent) 0%,var(--pg-accent2) 45%,var(--pg-accent3) 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; background-size:200%; animation:hGradShift 6s linear infinite; }
@keyframes hGradShift { 0%{background-position:0%} 100%{background-position:200%} }
.h-h1-ghost { color:var(--pg-text3); font-weight:300; }

/* ── Hero description ── */
.h-desc { font-size:17px; line-height:1.85; color:var(--pg-text2); max-width:520px; margin-bottom:44px; font-weight:300; }

/* ── CTA row ── */
.h-ctas { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:56px; }
.h-btn-primary { display:inline-flex; align-items:center; gap:8px; font-family:var(--h-font); font-size:14px; font-weight:600; letter-spacing:.01em; padding:14px 32px; border-radius:6px; cursor:pointer; border:none; text-decoration:none; background:var(--pg-accent); color:#fff; box-shadow:var(--pg-shadow-accent); transition:all .22s; position:relative; overflow:hidden; }
.h-btn-primary::before { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent); transition:left .35s; }
.h-btn-primary:hover::before { left:100%; }
.h-btn-primary:hover { transform:translateY(-2px); background:var(--pg-accent2); box-shadow:0 12px 50px var(--pg-accent2-glow); }
.h-btn-ghost { display:inline-flex; align-items:center; gap:8px; font-family:var(--h-font); font-size:14px; font-weight:500; padding:14px 28px; border-radius:6px; cursor:pointer; text-decoration:none; background:var(--pg-surface); color:var(--pg-text); border:1px solid var(--pg-border2); transition:all .22s; backdrop-filter:blur(12px); }
.h-btn-ghost:hover { border-color:var(--pg-accent); color:var(--pg-accent); background:var(--pg-accent-bg); }

/* ── Stats strip ── */
.h-stats { display:grid; grid-template-columns:repeat(4,1fr); border:1px solid var(--pg-border); border-radius:8px; overflow:hidden; background:var(--pg-surface); backdrop-filter:blur(20px); }
.h-stat { padding:18px 20px; text-align:center; border-right:1px solid var(--pg-border); position:relative; }
.h-stat:last-child { border-right:none; }
.h-stat::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,var(--pg-accent),transparent); opacity:0; transition:opacity .3s; }
.h-stat:hover::before { opacity:1; }
.h-sn { display:block; font-family:var(--h-font); font-size:24px; font-weight:700; color:var(--pg-accent); letter-spacing:-.03em; margin-bottom:4px; }
.h-sl { font-family:var(--m-font); font-size:9px; letter-spacing:.16em; text-transform:uppercase; color:var(--pg-text3); }

/* ══════════════════════════════════════════════
   HERO PANEL — Terminal card
══════════════════════════════════════════════ */
.h-panel { position:relative; border-radius:12px; overflow:visible; background:var(--pg-surface); border:1px solid var(--pg-border); box-shadow:var(--pg-shadow-lg); min-height:520px; display:flex; flex-direction:column; }
/* top accent bar */
.h-panel::before { content:''; position:absolute; top:-1px; left:8%; right:8%; height:1px; background:linear-gradient(90deg,transparent,var(--pg-accent),transparent); border-radius:4px; }

/* floating stat chips */
.h-float { position:absolute; background:var(--pg-bg2); border:1px solid var(--pg-border2); border-radius:8px; padding:10px 14px; backdrop-filter:blur(24px); box-shadow:var(--pg-shadow); font-size:11px; animation:hFloat ease-in-out infinite; z-index:10; }
[data-theme="light"] .h-float { background:var(--pg-bg); box-shadow:0 4px 24px rgba(0,0,0,.1); }
.h-float::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; border-radius:8px 8px 0 0; background:linear-gradient(90deg,transparent,currentColor,transparent); opacity:.35; }
.hf1 { top:14%; right:-12%; animation-duration:6s; color:var(--pg-green); }
.hf2 { bottom:26%; left:-14%; animation-duration:9s; animation-delay:2s; color:var(--pg-accent); }
.hf3 { bottom:6%; right:6%; animation-duration:7.5s; animation-delay:4s; color:var(--pg-amber); }
@keyframes hFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
.hf-lbl { font-family:var(--m-font); font-size:8px; letter-spacing:.18em; text-transform:uppercase; opacity:.5; margin-bottom:4px; }
.hf-val { font-family:var(--h-font); font-size:17px; font-weight:700; line-height:1; }
.hf-sub { font-size:9px; opacity:.5; margin-top:3px; }
.hf-bar { height:2px; border-radius:2px; background:var(--pg-border); margin-top:7px; overflow:hidden; }
.hf-fill { height:100%; border-radius:2px; background:currentColor; animation:hFill 3s ease-in-out infinite; }
@keyframes hFill { 0%,100%{width:30%} 50%{width:88%} }

/* Mac-style title bar */
.h-panel-bar { display:flex; align-items:center; gap:6px; padding:13px 18px; border-bottom:1px solid var(--pg-border); background:var(--pg-surface2); }
.h-pdot { width:9px; height:9px; border-radius:50%; }
.h-panel-title { margin-left:10px; font-family:var(--m-font); font-size:10px; color:var(--pg-text3); letter-spacing:.08em; }

/* Terminal body */
.h-term { flex:1; padding:22px 24px; font-family:var(--m-font); font-size:11.5px; line-height:2; color:var(--pg-text2); overflow:hidden; }
.h-term-prompt { color:var(--pg-green); }
.h-term-cmd { color:var(--pg-text); }
.h-term-out { color:var(--pg-text3); margin-left:14px; }
.h-term-acc { color:var(--pg-accent); margin-left:14px; }
.h-term-cursor { display:inline-block; width:7px; height:13px; background:var(--pg-accent); margin-left:2px; vertical-align:middle; animation:hCursor .85s steps(1) infinite; }
@keyframes hCursor { 0%,49%{opacity:1} 50%,100%{opacity:0} }

/* ══════════════════════════════════════════════
   SECTION CHROME
══════════════════════════════════════════════ */
.h-sec { padding:110px 0; position:relative; }
.h-sec-alt { background:var(--pg-bg2); }
[data-theme="light"] .h-sec-alt { background:var(--pg-bg2); }
.h-div { height:1px; background:var(--pg-border); position:relative; margin:0; }
.h-div::after { content:''; position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:5px; height:5px; border-radius:50%; background:var(--pg-accent); box-shadow:0 0 10px var(--pg-accent); }

/* Section header */
.h-sec-head { text-align:center; margin-bottom:72px; }
.h-kicker { display:inline-flex; align-items:center; gap:8px; font-family:var(--m-font); font-size:9px; letter-spacing:.22em; text-transform:uppercase; color:var(--pg-accent); margin-bottom:20px; }
.h-kicker::before,.h-kicker::after { content:''; width:28px; height:1px; background:currentColor; opacity:.4; }
.h-sec-h2 { font-family:var(--h-font); font-weight:700; font-size:clamp(28px,4vw,50px); letter-spacing:-.04em; line-height:1.05; color:var(--pg-text); margin-bottom:16px; }
.h-sec-sub { font-size:16px; color:var(--pg-text2); max-width:480px; margin:0 auto; line-height:1.85; font-weight:300; }

/* ══════════════════════════════════════════════
   WHY — FEATURES GRID (4-col ruled)
══════════════════════════════════════════════ */
.h-feats { display:grid; grid-template-columns:repeat(4,1fr); border:1px solid var(--pg-border); border-radius:10px; overflow:hidden; background:var(--pg-border); gap:1px; }
.h-feat { padding:38px 30px; background:var(--pg-bg); transition:background .25s; position:relative; overflow:hidden; }
[data-theme="light"] .h-feat { background:var(--pg-bg); }
.h-feat-line { position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,var(--pg-accent),var(--pg-accent2)); transform:scaleX(0); transform-origin:left; transition:transform .4s cubic-bezier(.16,1,.3,1); }
.h-feat:hover .h-feat-line { transform:scaleX(1); }
.h-feat:hover { background:var(--pg-bg2); }
.h-feat-icon { width:44px; height:44px; border-radius:10px; background:var(--pg-accent-bg); border:1px solid var(--pg-border2); display:flex; align-items:center; justify-content:center; font-size:20px; margin-bottom:20px; }
.h-feat-title { font-family:var(--h-font); font-size:16px; font-weight:600; letter-spacing:-.02em; color:var(--pg-text); margin-bottom:10px; line-height:1.3; }
.h-feat-text { font-size:13.5px; color:var(--pg-text2); line-height:1.8; font-weight:300; margin-bottom:16px; }
.h-feat-chip { display:inline-flex; align-items:center; gap:5px; font-family:var(--m-font); font-size:9px; letter-spacing:.1em; color:var(--pg-accent); padding:4px 10px; border-radius:4px; background:var(--pg-accent-bg); border:1px solid var(--pg-border2); }
.h-feat-chip::before { content:'→'; opacity:.5; }

/* ══════════════════════════════════════════════
   CATEGORIES
══════════════════════════════════════════════ */
.h-cats { display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:10px; }
.h-cat { display:flex; flex-direction:column; align-items:center; gap:10px; padding:26px 14px 20px; border-radius:8px; text-align:center; text-decoration:none; font-family:var(--m-font); font-size:9px; letter-spacing:.12em; text-transform:uppercase; color:var(--pg-text2); background:var(--pg-surface); border:1px solid var(--pg-border); transition:all .28s cubic-bezier(.16,1,.3,1); position:relative; overflow:hidden; }
.h-cat::after { content:''; position:absolute; inset:0; background:radial-gradient(circle at 50% 0%,var(--pg-accent-bg),transparent 70%); opacity:0; transition:opacity .28s; }
.h-cat:hover { border-color:var(--pg-border2); color:var(--pg-accent); transform:translateY(-5px); box-shadow:0 16px 40px rgba(0,0,0,.15); }
[data-theme="light"] .h-cat:hover { box-shadow:0 10px 30px rgba(0,0,0,.08); }
.h-cat:hover::after { opacity:1; }
.h-cat:hover .h-cat-img,.h-cat:hover .h-cat-icon { transform:scale(1.1) translateY(-2px); }
.h-cat-img { width:42px; height:42px; border-radius:8px; object-fit:cover; border:1px solid var(--pg-border); transition:transform .28s; position:relative; z-index:1; }
.h-cat-icon { font-size:28px; transition:transform .28s; position:relative; z-index:1; }
.h-cat-lbl { position:relative; z-index:1; }

/* ══════════════════════════════════════════════
   JOURNEY CAROUSEL
══════════════════════════════════════════════ */
.h-carousel { position:relative; overflow:hidden; border-radius:12px; border:1px solid var(--pg-border); background:var(--pg-surface); }
.h-carousel::before,.h-carousel::after { content:''; position:absolute; top:0; bottom:0; width:120px; z-index:5; pointer-events:none; }
.h-carousel::before { left:0; background:linear-gradient(90deg,var(--pg-bg),transparent); }
.h-carousel::after { right:0; background:linear-gradient(-90deg,var(--pg-bg),transparent); }
.h-c-track { display:flex; transition:transform .65s cubic-bezier(.16,1,.3,1); }
.h-c-slide { flex-shrink:0; width:100%; height:480px; position:relative; overflow:hidden; }
.h-c-slide img { width:100%; height:100%; object-fit:cover; transition:transform .65s cubic-bezier(.16,1,.3,1); transform:scale(1.04); }
.h-c-slide.active img { transform:scale(1); }
.h-c-overlay { position:absolute; inset:0; background:linear-gradient(to top,var(--pg-bg) 0%,rgba(0,0,0,.25) 50%,transparent 100%); }
.h-c-info { position:absolute; bottom:40px; left:52px; right:52px; }
.h-c-title { font-family:var(--h-font); font-size:22px; font-weight:700; letter-spacing:-.03em; margin-bottom:8px; color:var(--pg-text); }
.h-c-desc { font-size:14px; color:var(--pg-text2); line-height:1.65; }
.h-c-nav { display:flex; gap:8px; margin-top:14px; }
.h-c-arr { width:36px; height:36px; border-radius:6px; border:1px solid var(--pg-border2); background:var(--pg-surface); color:var(--pg-text); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:14px; transition:all .2s; backdrop-filter:blur(12px); }
.h-c-arr:hover { border-color:var(--pg-accent); color:var(--pg-accent); background:var(--pg-accent-bg); }
.h-c-dots { display:flex; gap:7px; justify-content:center; margin-top:18px; }
.h-c-dot { height:2px; border-radius:2px; background:var(--pg-border2); cursor:pointer; transition:all .4s cubic-bezier(.16,1,.3,1); }
.h-c-dot.active { background:var(--pg-accent); box-shadow:0 0 8px var(--pg-accent); width:26px; }
.h-c-dot:not(.active) { width:12px; }

/* ══════════════════════════════════════════════
   WORKSHOPS
══════════════════════════════════════════════ */
.h-wss { display:grid; grid-template-columns:repeat(auto-fill,minmax(360px,1fr)); gap:20px; }
.h-ws { border-radius:10px; overflow:hidden; background:var(--pg-surface); border:1px solid var(--pg-border); cursor:pointer; transition:all .32s cubic-bezier(.16,1,.3,1); position:relative; }
.h-ws::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,var(--pg-accent),transparent); opacity:0; transition:opacity .3s; z-index:1; }
.h-ws:hover { transform:translateY(-6px); border-color:var(--pg-border2); box-shadow:0 24px 60px rgba(0,0,0,.22); }
[data-theme="light"] .h-ws:hover { box-shadow:0 16px 40px rgba(0,0,0,.1); }
.h-ws:hover::before { opacity:1; }
.h-ws-img { width:100%; height:180px; object-fit:cover; display:block; transition:transform .4s; }
.h-ws:hover .h-ws-img { transform:scale(1.03); }
.h-ws-ph { height:180px; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,var(--pg-bg3),var(--pg-bg4)); position:relative; overflow:hidden; }
.h-ws-ph::after { content:''; position:absolute; inset:0; background:radial-gradient(circle at 30% 40%,var(--pg-accent-bg),transparent 65%); }
.h-ws-body { padding:22px; }
.h-ws-meta { display:flex; align-items:center; gap:10px; margin-bottom:12px; flex-wrap:wrap; }
.h-live { display:inline-flex; align-items:center; gap:5px; font-family:var(--m-font); font-size:8px; letter-spacing:.18em; text-transform:uppercase; color:#fff; background:var(--pg-green); padding:4px 10px; border-radius:4px; }
.h-live-dot { width:5px; height:5px; border-radius:50%; background:#fff; animation:hLdot 1.4s ease-in-out infinite; }
@keyframes hLdot { 0%,100%{opacity:1} 50%{opacity:.15} }
.h-ws-date { font-family:var(--m-font); font-size:10px; color:var(--pg-text3); letter-spacing:.04em; }
.h-ws-title { font-family:var(--h-font); font-size:17px; font-weight:600; letter-spacing:-.02em; margin-bottom:8px; line-height:1.3; }
.h-ws-desc { font-size:13px; color:var(--pg-text2); line-height:1.75; margin-bottom:18px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; font-weight:300; }

/* ══════════════════════════════════════════════
   COURSES
══════════════════════════════════════════════ */
.h-courses { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:18px; }
.h-course { border-radius:10px; overflow:hidden; background:var(--pg-surface); border:1px solid var(--pg-border); cursor:pointer; display:flex; flex-direction:column; transition:all .32s cubic-bezier(.16,1,.3,1); position:relative; }
.h-course::after { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,var(--pg-accent),transparent); opacity:0; transition:opacity .3s; }
.h-course:hover { transform:translateY(-5px); border-color:var(--pg-border2); box-shadow:0 20px 50px rgba(0,0,0,.2); }
[data-theme="light"] .h-course:hover { box-shadow:0 12px 36px rgba(0,0,0,.09); }
.h-course:hover::after { opacity:1; }
.h-c-thumb { height:175px; position:relative; overflow:hidden; background:var(--pg-bg3); }
.h-c-thumb img { width:100%; height:100%; object-fit:cover; transition:transform .4s; }
.h-course:hover .h-c-thumb img { transform:scale(1.05); }
.h-c-ph { height:100%; display:flex; align-items:center; justify-content:center; font-size:44px; background:linear-gradient(135deg,var(--pg-bg3),var(--pg-bg4)); position:relative; overflow:hidden; }
.h-c-ph::after { content:''; position:absolute; inset:0; background:radial-gradient(circle at 40% 30%,var(--pg-accent-bg),transparent 65%); }
.h-share-btn { position:absolute; top:9px; right:9px; width:30px; height:30px; border-radius:6px; background:var(--pg-bg); border:1px solid var(--pg-border2); color:var(--pg-accent); display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:3; opacity:0; transition:all .22s; backdrop-filter:blur(10px); }
.h-course:hover .h-share-btn { opacity:1; }
.h-share-btn:hover { background:var(--pg-accent-bg); }
.h-c-body { padding:18px; flex:1; display:flex; flex-direction:column; }
.h-c-meta { display:flex; align-items:center; gap:6px; margin-bottom:10px; flex-wrap:wrap; }
.h-badge-cat { font-family:var(--m-font); font-size:8px; letter-spacing:.1em; text-transform:uppercase; padding:3px 8px; border-radius:4px; border:1px solid var(--pg-border2); color:var(--pg-accent); background:var(--pg-accent-bg); }
.h-badge-lvl { font-family:var(--m-font); font-size:8px; letter-spacing:.1em; text-transform:uppercase; padding:3px 8px; border-radius:4px; border:1px solid var(--pg-border); color:var(--pg-text3); }
.h-c-title { font-family:var(--h-font); font-size:15px; font-weight:600; letter-spacing:-.02em; margin-bottom:7px; line-height:1.4; }
.h-c-desc { font-size:12.5px; color:var(--pg-text2); line-height:1.75; flex:1; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; margin-bottom:14px; font-weight:300; }
.h-c-foot { display:flex; align-items:center; justify-content:space-between; padding-top:12px; border-top:1px solid var(--pg-border); }
.h-trainer { display:flex; align-items:center; gap:7px; font-family:var(--m-font); font-size:10px; color:var(--pg-text2); }
.h-trainer img,.h-trainer-ph { width:22px; height:22px; border-radius:50%; object-fit:cover; }
.h-trainer-ph { background:linear-gradient(135deg,var(--pg-accent),var(--pg-green)); display:flex; align-items:center; justify-content:center; font-size:8px; font-weight:700; color:#fff; font-family:var(--h-font); }
.h-free-tag { font-family:var(--m-font); font-size:9px; letter-spacing:.14em; text-transform:uppercase; color:var(--pg-green); padding:3px 9px; border-radius:4px; background:var(--pg-green-bg); border:1px solid rgba(0,229,195,.2); }
.h-price { font-family:var(--h-font); font-size:16px; font-weight:700; letter-spacing:-.03em; color:var(--pg-text); }

/* ══════════════════════════════════════════════
   TEAM
══════════════════════════════════════════════ */
.h-team { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:14px; }
.h-tm { background:var(--pg-surface); border:1px solid var(--pg-border); border-radius:10px; padding:28px 18px 20px; text-align:center; transition:all .32s cubic-bezier(.16,1,.3,1); position:relative; overflow:hidden; }
.h-tm::before { content:''; position:absolute; top:0; left:0; right:0; height:60px; background:linear-gradient(to bottom,var(--pg-accent-bg),transparent); opacity:.7; }
.h-tm:hover { transform:translateY(-4px); border-color:var(--pg-border2); box-shadow:0 18px 40px rgba(0,0,0,.15); }
[data-theme="light"] .h-tm:hover { box-shadow:0 10px 28px rgba(0,0,0,.08); }
.h-tm-photo { width:68px; height:68px; border-radius:50%; object-fit:cover; border:2px solid var(--pg-border2); margin:0 auto 14px; display:block; position:relative; z-index:1; }
.h-tm-ph { width:68px; height:68px; border-radius:50%; background:linear-gradient(135deg,var(--pg-accent),var(--pg-accent2)); display:flex; align-items:center; justify-content:center; font-family:var(--h-font); font-size:24px; font-weight:700; color:#fff; margin:0 auto 14px; border:2px solid var(--pg-border2); position:relative; z-index:1; }
.h-tm-name { font-family:var(--h-font); font-size:14px; font-weight:600; letter-spacing:-.02em; margin-bottom:3px; position:relative; z-index:1; }
.h-tm-role { font-family:var(--m-font); font-size:8px; letter-spacing:.16em; text-transform:uppercase; color:var(--pg-accent); margin-bottom:10px; position:relative; z-index:1; }
.h-tm-bio { font-size:12.5px; color:var(--pg-text2); line-height:1.65; margin-bottom:14px; font-weight:300; position:relative; z-index:1; }
.h-tm-links { display:flex; justify-content:center; gap:7px; position:relative; z-index:1; }
.h-tm-link { width:28px; height:28px; border-radius:6px; border:1px solid var(--pg-border); display:flex; align-items:center; justify-content:center; color:var(--pg-text3); text-decoration:none; transition:all .2s; background:var(--pg-surface); }
.h-tm-link:hover { border-color:var(--pg-accent); color:var(--pg-accent); background:var(--pg-accent-bg); }

/* ══════════════════════════════════════════════
   VIDEO
══════════════════════════════════════════════ */
.h-video-wrap { position:relative; border-radius:12px; overflow:hidden; border:1px solid var(--pg-border2); max-width:900px; margin:0 auto; aspect-ratio:16/9; background:var(--pg-bg3); box-shadow:var(--pg-shadow-lg); }
.h-video-wrap video,.h-video-wrap iframe { width:100%; height:100%; object-fit:cover; display:block; }
.h-video-over { position:absolute; inset:0; z-index:3; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.45); cursor:pointer; transition:opacity .28s; }
.h-video-over.hidden { opacity:0; pointer-events:none; }
.h-play { width:68px; height:68px; border-radius:50%; background:var(--pg-accent); border:3px solid rgba(255,255,255,.2); display:flex; align-items:center; justify-content:center; color:#fff; transition:all .28s; box-shadow:0 0 40px var(--pg-accent-glow); }
.h-play:hover { transform:scale(1.1); box-shadow:0 0 60px var(--pg-accent-glow); }
.h-video-tags { display:flex; gap:10px; justify-content:center; margin-top:18px; flex-wrap:wrap; }
.h-video-tag { display:inline-flex; align-items:center; gap:5px; font-family:var(--m-font); font-size:9px; letter-spacing:.12em; text-transform:uppercase; color:var(--pg-text2); padding:5px 12px; border-radius:6px; background:var(--pg-surface); border:1px solid var(--pg-border); }

/* ══════════════════════════════════════════════
   ROADMAP — Two column
══════════════════════════════════════════════ */
.h-roadmap { display:grid; grid-template-columns:1.3fr .7fr; gap:20px; align-items:start; }
.h-roadmap-main { background:var(--pg-surface); border:1px solid var(--pg-border); border-radius:12px; padding:40px; position:relative; overflow:hidden; }
.h-roadmap-main::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at top left,var(--pg-accent-bg) 0%,transparent 55%); pointer-events:none; }
.h-roadmap-main>* { position:relative; z-index:1; }
.h-roadmap-h { font-family:var(--h-font); font-size:clamp(22px,2.8vw,32px); font-weight:700; letter-spacing:-.04em; line-height:1.1; margin-bottom:12px; }
.h-roadmap-p { color:var(--pg-text2); font-size:14.5px; line-height:1.85; margin-bottom:28px; font-weight:300; }
.h-roadmap-steps { display:flex; flex-direction:column; gap:12px; }
.h-step { display:flex; gap:14px; align-items:flex-start; padding:14px 16px; background:var(--pg-bg); border:1px solid var(--pg-border); border-radius:8px; transition:border-color .2s; }
[data-theme="light"] .h-step { background:var(--pg-bg); }
.h-step:hover { border-color:var(--pg-border2); }
.h-step-num { width:32px; height:32px; border-radius:8px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-family:var(--m-font); font-size:11px; font-weight:500; background:var(--pg-accent-bg); border:1px solid var(--pg-border2); color:var(--pg-accent); }
.h-step-title { font-family:var(--h-font); font-size:13.5px; font-weight:600; margin-bottom:4px; letter-spacing:-.01em; }
.h-step-text { font-size:12.5px; color:var(--pg-text2); line-height:1.65; font-weight:300; }
.h-roadmap-side { display:flex; flex-direction:column; gap:12px; }
.h-side-card { padding:18px 20px; border-radius:10px; background:var(--pg-surface); border:1px solid var(--pg-border); transition:border-color .22s,transform .22s; }
.h-side-card:hover { border-color:var(--pg-border2); transform:translateX(4px); }
.h-side-card small { display:block; margin-bottom:7px; font-family:var(--m-font); font-size:8px; letter-spacing:.18em; text-transform:uppercase; color:var(--pg-text3); }
.h-side-card strong { display:block; font-family:var(--h-font); font-size:14px; font-weight:600; letter-spacing:-.02em; margin-bottom:5px; }
.h-side-card p { font-size:12.5px; color:var(--pg-text2); line-height:1.65; font-weight:300; }

/* ══════════════════════════════════════════════
   MISSION — Statement section
══════════════════════════════════════════════ */
.h-mission { padding:140px 0; text-align:center; position:relative; overflow:hidden; }
.h-mission-deco { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:700px; height:500px; border-radius:50%; background:radial-gradient(ellipse,var(--pg-accent-glow) 0%,transparent 70%); pointer-events:none; opacity:.35; }
[data-theme="light"] .h-mission-deco { opacity:.12; }
/* Big quote mark watermark */
.h-mission::before { content:'"'; font-family:var(--h-font); font-weight:700; position:absolute; top:-60px; left:50%; transform:translateX(-50%); font-size:320px; line-height:1; color:var(--pg-accent); opacity:.03; pointer-events:none; user-select:none; }
.h-mission-q { font-family:var(--h-font); font-size:clamp(24px,4vw,46px); font-weight:700; letter-spacing:-.04em; line-height:1.15; max-width:780px; margin:0 auto 18px; background:linear-gradient(135deg,var(--pg-text) 0%,var(--pg-accent) 40%,var(--pg-accent3) 80%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; position:relative; z-index:1; }
.h-mission-sub { font-size:15px; color:var(--pg-text2); max-width:460px; margin:0 auto 44px; line-height:1.85; font-weight:300; position:relative; z-index:1; }

/* ══════════════════════════════════════════════
   MODAL
══════════════════════════════════════════════ */
.h-overlay { position:fixed; inset:0; background:rgba(0,0,0,.78); backdrop-filter:blur(20px); z-index:500; display:flex; align-items:center; justify-content:center; padding:24px; animation:hFadeIn .2s; }
[data-theme="light"] .h-overlay { background:rgba(13,15,20,.55); }
@keyframes hFadeIn { from{opacity:0} to{opacity:1} }
.h-modal { background:var(--pg-bg2); border:1px solid var(--pg-border2); border-radius:12px; max-width:460px; width:100%; padding:28px; box-shadow:var(--pg-shadow-lg); animation:hSlideUp .28s cubic-bezier(.16,1,.3,1); max-height:90vh; overflow-y:auto; position:relative; }
.h-modal::before { content:''; position:absolute; top:0; left:12%; right:12%; height:1px; border-radius:12px 12px 0 0; background:linear-gradient(90deg,transparent,var(--pg-accent),transparent); }
@keyframes hSlideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
.h-modal-hd { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px; gap:14px; }
.h-modal-title { font-family:var(--h-font); font-size:17px; font-weight:700; letter-spacing:-.03em; line-height:1.3; }
.h-mclose { width:30px; height:30px; border-radius:6px; background:var(--pg-surface2); border:1px solid var(--pg-border); color:var(--pg-text2); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:12px; transition:all .2s; flex-shrink:0; }
.h-mclose:hover { background:var(--pg-red-bg); border-color:var(--pg-red); color:var(--pg-red); }
.h-modal-desc { font-size:13.5px; color:var(--pg-text2); line-height:1.75; margin-bottom:20px; font-weight:300; }
.h-input-g { display:flex; flex-direction:column; gap:6px; margin-bottom:12px; }
.h-label { font-family:var(--m-font); font-size:8px; letter-spacing:.22em; text-transform:uppercase; color:var(--pg-text3); }
.h-input { background:var(--pg-input); border:1px solid var(--pg-border); border-radius:7px; padding:11px 13px; color:var(--pg-text); font-family:var(--b-font); font-size:14px; outline:none; width:100%; transition:border-color .2s,box-shadow .2s; }
.h-input::placeholder { color:var(--pg-text4); }
.h-input:focus { border-color:var(--pg-accent); box-shadow:0 0 0 3px var(--pg-accent-glow); }
.h-err { background:var(--pg-red-bg); border:1px solid var(--pg-red); border-radius:7px; padding:10px 13px; font-size:12.5px; color:var(--pg-red); margin-bottom:12px; }
.h-ok { background:var(--pg-green-bg); border:1px solid rgba(0,229,195,.25); border-radius:10px; padding:16px; }
.h-ok-lbl { font-family:var(--m-font); font-size:10px; letter-spacing:.1em; color:var(--pg-green); font-weight:500; margin-bottom:12px; display:flex; align-items:center; gap:8px; }

/* ══════════════════════════════════════════════
   BANNER
══════════════════════════════════════════════ */
.h-banner { position:fixed; top:0; left:0; right:0; z-index:9999; background:var(--pg-bg2); color:var(--pg-text); padding:10px 52px 10px 20px; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:500; min-height:44px; border-bottom:1px solid var(--pg-border2); backdrop-filter:blur(14px); }

/* ══════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════ */
.h-toast { position:fixed; bottom:26px; right:26px; z-index:600; background:var(--pg-bg2); border:1px solid rgba(0,229,195,.35); border-radius:8px; padding:11px 18px; font-family:var(--m-font); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--pg-green); backdrop-filter:blur(20px); box-shadow:var(--pg-shadow-lg); animation:hSlideUp .28s cubic-bezier(.16,1,.3,1); display:flex; align-items:center; gap:8px; }

/* ══════════════════════════════════════════════
   ENTRANCE ANIMATIONS
══════════════════════════════════════════════ */
.h-fade { opacity:0; transform:translateY(22px); animation:hFadeUp .7s cubic-bezier(.16,1,.3,1) forwards; }
.hd1{animation-delay:.05s}.hd2{animation-delay:.14s}.hd3{animation-delay:.24s}.hd4{animation-delay:.34s}.hd5{animation-delay:.46s}.hd6{animation-delay:.58s}
@keyframes hFadeUp { to{opacity:1;transform:translateY(0)} }

/* ══════════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════════ */
@media(max-width:980px){
  .h-hero-grid,.h-roadmap{grid-template-columns:1fr;}
  .h-panel{display:none;}
  .h-feats{grid-template-columns:1fr 1fr;}
}
@media(max-width:640px){
  .h-hero{padding:90px 0 60px;}
  .h-sec{padding:64px 0;}
  .h-feats,.h-courses,.h-wss,.h-team{grid-template-columns:1fr;}
  .h-stats{grid-template-columns:1fr 1fr;}
  .h-cats{grid-template-columns:repeat(auto-fill,minmax(110px,1fr));}
  .h-roadmap-main{padding:22px;}
}
`;

/* ─────────────────────────────────────────────────────────────
   PARTICLE SYSTEM (unchanged logic, updated for new canvas id)
───────────────────────────────────────────────────────────────── */
function useParticles(canvasRef, isDark) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf, particles = [], scrollY = 0, mouseX = 0, mouseY = 0, w, h;
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const onScroll = () => { scrollY = window.scrollY; };
    const onMouse = (e) => { mouseX = e.clientX; mouseY = e.clientY; };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouse, { passive: true });
    const COLORS = isDark
      ? ['rgba(79,139,255','rgba(124,92,252','rgba(0,229,195','rgba(59,130,246','rgba(245,166,35']
      : ['rgba(37,99,235','rgba(109,40,217','rgba(5,150,105','rgba(37,99,235','rgba(217,119,6'];
    class P {
      reset(init = false) {
        this.x = Math.random() * w; this.y = init ? Math.random() * h : h + 20;
        this.vx = (Math.random() - .5) * .35; this.vy = -(Math.random() * .55 + .15);
        this.size = Math.random() * 2 + .5; this.life = 0; this.maxLife = Math.random() * 400 + 200;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.rotation = Math.random() * Math.PI * 2; this.rotSpeed = (Math.random() - .5) * .015;
        this.layer = Math.random();
        this.shape = ['dot', 'dot', 'diamond', 'ring', 'cross'][Math.floor(Math.random() * 5)];
      }
      constructor() { this.reset(true); }
      draw() {
        const alpha = Math.sin((this.life / this.maxLife) * Math.PI) * .7;
        const py = this.y - scrollY * this.layer * .06;
        ctx.save(); ctx.translate(this.x, py); ctx.rotate(this.rotation);
        ctx.strokeStyle = `${this.color},${alpha})`; ctx.fillStyle = `${this.color},${alpha * .1})`; ctx.lineWidth = .6;
        const s = this.size;
        switch (this.shape) {
          case 'dot': ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI * 2); ctx.fillStyle = `${this.color},${alpha})`; ctx.fill(); break;
          case 'diamond': ctx.beginPath(); ctx.moveTo(0, -s * 2.5); ctx.lineTo(s * 1.6, 0); ctx.lineTo(0, s * 2.5); ctx.lineTo(-s * 1.6, 0); ctx.closePath(); ctx.stroke(); ctx.fill(); break;
          case 'ring': ctx.beginPath(); ctx.arc(0, 0, s * 2, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, s * .8, 0, Math.PI * 2); ctx.stroke(); break;
          case 'cross': ctx.beginPath(); ctx.moveTo(-s * 2, 0); ctx.lineTo(s * 2, 0); ctx.moveTo(0, -s * 2); ctx.lineTo(0, s * 2); ctx.stroke(); break;
          default: ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI * 2); ctx.fillStyle = `${this.color},${alpha})`; ctx.fill();
        }
        ctx.restore();
      }
      update() {
        this.x += this.vx; this.y += this.vy; this.life++; this.rotation += this.rotSpeed;
        const dx = this.x - mouseX, dy = this.y - (mouseY + scrollY), d = Math.sqrt(dx * dx + dy * dy);
        if (d < 80) { this.vx += dx / d * .01; this.vy += dy / d * .01; }
        if (this.life > this.maxLife || this.y < -20) this.reset();
      }
    }
    for (let i = 0; i < 80; i++) particles.push(new P());
    const drawLines = () => {
      const n = Math.min(particles.length, 35);
      for (let i = 0; i < n; i++) { for (let j = i + 1; j < n; j++) {
        const dx = particles[i].x - particles[j].x;
        const pyi = particles[i].y - scrollY * particles[i].layer * .06;
        const pyj = particles[j].y - scrollY * particles[j].layer * .06;
        const dy = pyi - pyj, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 90) {
          ctx.strokeStyle = isDark ? `rgba(79,139,255,${(1 - d / 90) * .05})` : `rgba(37,99,235,${(1 - d / 90) * .04})`;
          ctx.lineWidth = .4; ctx.beginPath(); ctx.moveTo(particles[i].x, pyi); ctx.lineTo(particles[j].x, pyj); ctx.stroke();
        }
      }}
    };
    const loop = () => { ctx.clearRect(0, 0, w, h); drawLines(); particles.forEach(p => { p.update(); p.draw(); }); raf = requestAnimationFrame(loop); };
    loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); window.removeEventListener('scroll', onScroll); window.removeEventListener('mousemove', onMouse); };
  }, [isDark]);
}

/* ─────────────────────────────────────────────────────────────
   TERMINAL LINES (unchanged)
───────────────────────────────────────────────────────────────── */
const TERMINAL_LINES = [
  { type: 'prompt', text: 'pragni-cli init learning-path' },
  { type: 'out', text: '→ Scanning available tracks…' },
  { type: 'acc', text: '✓ AWS Cloud  ✓ Azure  ✓ SOC' },
  { type: 'acc', text: '✓ Pentesting  ✓ Networking' },
  { type: 'out', text: '→ Fetching live sessions…' },
  { type: 'acc', text: '✓ 3 workshops available this week' },
  { type: 'prompt', text: 'pragni-cli enroll --free' },
  { type: 'out', text: '→ Zero paywall. Zero hidden fees.' },
  { type: 'acc', text: '✓ Access granted. Start learning.' },
];

/* ─────────────────────────────────────────────────────────────
   HeroPanel (unchanged logic, new class names)
───────────────────────────────────────────────────────────────── */
function HeroPanel() {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown < TERMINAL_LINES.length) {
      const t = setTimeout(() => setShown(s => s + 1), 340);
      return () => clearTimeout(t);
    }
  }, [shown]);
  return (
    <div className="h-panel">
      {/* Floating stat chips */}
      <div className="h-float hf1">
        <div className="hf-lbl">Active Learners</div>
        <div className="hf-val">2,847</div>
        <div className="hf-bar"><div className="hf-fill" /></div>
      </div>
      <div className="h-float hf2">
        <div className="hf-lbl">Uptime</div>
        <div className="hf-val">99.97%</div>
        <div className="hf-sub">All systems normal</div>
      </div>
      <div className="h-float hf3">
        <div className="hf-lbl">Next Workshop</div>
        <div className="hf-val">Live Soon</div>
        <div className="hf-bar"><div className="hf-fill" /></div>
      </div>
      {/* Mac title bar */}
      <div className="h-panel-bar">
        <div className="h-pdot" style={{ background: '#ff5f57' }} />
        <div className="h-pdot" style={{ background: '#febc2e' }} />
        <div className="h-pdot" style={{ background: '#28c840' }} />
        <span className="h-panel-title">pragni — terminal</span>
      </div>
      {/* Terminal output */}
      <div className="h-term">
        {TERMINAL_LINES.slice(0, shown).map((line, i) => (
          <div key={i}>
            {line.type === 'prompt' && <span><span className="h-term-prompt">›</span> <span className="h-term-cmd">{line.text}</span></span>}
            {line.type === 'out' && <span className="h-term-out">{line.text}</span>}
            {line.type === 'acc' && <span className="h-term-acc">{line.text}</span>}
            <br />
          </div>
        ))}
        {shown < TERMINAL_LINES.length && <span className="h-term-cursor" />}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   JourneyCarousel (unchanged logic, new class names)
───────────────────────────────────────────────────────────────── */
function JourneyCarousel({ slides }) {
  const [cur, setCur] = useState(0);
  const timer = useRef(null);
  const n = slides.length;
  const go = useCallback(i => setCur((i + n) % n), [n]);
  useEffect(() => {
    if (n <= 1) return;
    timer.current = setInterval(() => setCur(c => (c + 1) % n), 5000);
    return () => clearInterval(timer.current);
  }, [n]);
  if (!n) return null;
  return (
    <div>
      <div className="h-carousel">
        <div className="h-c-track" style={{ transform: `translateX(-${cur * 100}%)` }}>
          {slides.map((s, i) => (
            <div key={s._id || i} className={`h-c-slide${i === cur ? ' active' : ''}`}>
              <img src={s.imageUrl} alt={s.title || ''} loading="lazy" />
              <div className="h-c-overlay" />
              {(s.title || s.description || n > 1) && (
                <div className="h-c-info">
                  {s.title && <div className="h-c-title">{s.title}</div>}
                  {s.description && <div className="h-c-desc">{s.description}</div>}
                  {n > 1 && <div className="h-c-nav"><button className="h-c-arr" onClick={() => go(cur - 1)}>←</button><button className="h-c-arr" onClick={() => go(cur + 1)}>→</button></div>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {n > 1 && <div className="h-c-dots">{slides.map((_, i) => <div key={i} className={`h-c-dot${i === cur ? ' active' : ''}`} onClick={() => go(i)} />)}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CourseCard (unchanged logic, new class names)
───────────────────────────────────────────────────────────────── */
function CourseCard({ course, delay = 0, onShare }) {
  const navigate = useNavigate();
  return (
    <div className={`h-course h-fade hd${delay}`} onClick={() => navigate(course.price > 0 ? `/courses/premium/${course.slug}` : `/courses/${course.slug}`)}>
      <div className="h-c-thumb">
        {course.thumbnail ? <img src={course.thumbnail} alt={course.title} /> : <div className="h-c-ph">{course.categoryIcon || ''}</div>}
        {course.price > 0 && (
          <button className="h-share-btn" onClick={e => onShare(course, e)} title="Copy link">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
        )}
      </div>
      <div className="h-c-body">
        <div className="h-c-meta">
          {course.categoryLabel && <span className="h-badge-cat">{course.categoryLabel}</span>}
          {course.level && <span className="h-badge-lvl">{course.level}</span>}
        </div>
        <div className="h-c-title">{course.title}</div>
        <div className="h-c-desc">{course.description}</div>
        <div className="h-c-foot">
          <div className="h-trainer">
            {course.trainer?.photo ? <img src={course.trainer.photo} alt={course.trainer.name} /> : course.trainer?.name ? <div className="h-trainer-ph">{course.trainer.name[0]}</div> : null}
            {course.trainer?.name || ''}
          </div>
          {course.price === 0 ? <span className="h-free-tag">FREE</span> : <span className="h-price">₹{course.price?.toLocaleString('en-IN')}</span>}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   WorkshopCard (unchanged logic, new class names)
───────────────────────────────────────────────────────────────── */
function WorkshopCard({ w, onClick }) {
  const d = new Date(w.scheduledAt);
  return (
    <div className="h-ws" onClick={onClick}>
      {w.bannerImage ? <img className="h-ws-img" src={w.bannerImage} alt={w.title} /> : <div className="h-ws-ph"><svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="var(--pg-accent)" strokeWidth="1.5" opacity=".35"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg></div>}
      <div className="h-ws-body">
        <div className="h-ws-meta">
          <span className="h-live"><span className="h-live-dot" />LIVE</span>
          <span className="h-ws-date">{d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="h-ws-title">{w.title}</div>
        <div className="h-ws-desc">{w.description}</div>
        <button className="h-btn-ghost" style={{ fontSize: 13, padding: '9px 20px', borderRadius: 7 }}>Join Session →</button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   BannerCTA helper (unchanged)
───────────────────────────────────────────────────────────────── */
function BannerCTA({ href, label, style }) {
  if (!href || !label) return null;
  return <a href={href} target="_blank" rel="noopener noreferrer" style={style}>{label}</a>;
}

/* ─────────────────────────────────────────────────────────────
   ActiveBanner (unchanged logic, new class names)
───────────────────────────────────────────────────────────────── */
function ActiveBanner({ banner, dismissed, onDismiss }) {
  if (!banner || dismissed) return null;
  const primaryHref = banner.ctaUrl || banner.linkUrl || '';
  const primaryLabel = banner.ctaText || banner.linkText || '';
  if (banner.type === 'popup') {
    return (
      <div onClick={onDismiss} style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(18px)' }}>
        <div onClick={e => e.stopPropagation()} style={{ width: 'min(680px,100%)', background: 'var(--pg-bg2)', color: 'var(--pg-text)', border: '1px solid var(--pg-border2)', borderRadius: 16, boxShadow: 'var(--pg-shadow-lg)', overflow: 'hidden', position: 'relative' }}>
          <button onClick={onDismiss} style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--pg-border)', background: 'var(--pg-surface2)', color: 'var(--pg-text)', cursor: 'pointer', fontSize: 14, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          {banner.imageUrl && <img src={banner.imageUrl} alt={banner.headline || 'Banner'} style={{ width: '100%', maxHeight: 240, objectFit: 'cover', display: 'block' }} />}
          <div style={{ padding: '26px 26px 28px' }}>
            <div style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--pg-text3)', marginBottom: 10, fontFamily: 'var(--m-font)' }}>Featured update</div>
            <h2 style={{ fontSize: 'clamp(22px,4vw,36px)', lineHeight: 1.08, marginBottom: 12, fontFamily: 'var(--h-font)', fontWeight: 700, letterSpacing: '-.04em' }}>{banner.headline || banner.message || 'Latest from Pragni'}</h2>
            {(banner.subtext || banner.message) && <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--pg-text2)', marginBottom: 20, fontWeight: 300 }}>{banner.subtext || banner.message}</p>}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <BannerCTA href={primaryHref} label={primaryLabel} style={{ display: 'inline-flex', alignItems: 'center', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontFamily: 'var(--h-font)', background: banner.ctaBgColor || 'var(--pg-accent)', color: banner.ctaTextColor || '#fff' }} />
              <BannerCTA href={banner.secondaryUrl} label={banner.secondaryText} style={{ display: 'inline-flex', alignItems: 'center', padding: '12px 18px', borderRadius: 8, textDecoration: 'none', fontWeight: 500, border: '1px solid var(--pg-border2)', color: 'var(--pg-text)', background: 'transparent' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="h-banner" style={{ background: banner.bgColor || undefined, color: banner.textColor || undefined }}>
      <span style={{ textAlign: 'center', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {banner.imageUrl && <img src={banner.imageUrl} alt="" style={{ maxHeight: 24, maxWidth: 140, objectFit: 'contain' }} />}
        <span>{banner.message || banner.headline || ''}</span>
        <BannerCTA href={primaryHref} label={primaryLabel} style={{ padding: '3px 12px', background: banner.ctaBgColor || 'var(--pg-accent-bg)', color: banner.ctaTextColor || 'var(--pg-accent)', borderRadius: 5, fontSize: 10, fontWeight: 700, textDecoration: 'none', fontFamily: 'var(--m-font)', letterSpacing: '.08em', border: '1px solid var(--pg-border2)' }} />
      </span>
      <button onClick={onDismiss} style={{ position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', background: 'var(--pg-surface2)', border: '1px solid var(--pg-border)', color: 'var(--pg-text3)', cursor: 'pointer', width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✕</button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════════════════════ */
export default function Home() {
  useMeta({ pageKey: 'home', description: 'Pragni — Free cybersecurity, cloud and pentesting courses. AWS, Azure, SOC, Pentesting and more.' });
  const { isDark } = useTheme();
  const canvasRef = useRef(null);
  useParticles(canvasRef, isDark);

  const [courses, setCourses] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banner, setBanner] = useState(null);
  const [journey, setJourney] = useState([]);
  const [team, setTeam] = useState([]);
  const [sc, setSc] = useState({});
  const [shareToast, setShareToast] = useState(false);
  const [selWS, setSelWS] = useState(null);
  const [joinForm, setJoinForm] = useState({ name: '', email: '', mobile: '' });
  const [joinLoad, setJoinLoad] = useState(false);
  const [joinResult, setJoinResult] = useState(null);
  const [joinErr, setJoinErr] = useState('');
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [bannerDismissed, _setDismiss] = useState(() => sessionStorage.getItem('banner-dismissed') === '1');
  const setDismiss = v => { if (v) sessionStorage.setItem('banner-dismissed', '1'); else sessionStorage.removeItem('banner-dismissed'); _setDismiss(v); };
  const cv = (key, fallback) => sc[key] || fallback;

  // Inject styles once
  useEffect(() => {
    if (!document.getElementById('h-home-styles')) {
      const el = document.createElement('style');
      el.id = 'h-home-styles';
      el.textContent = HOME_STYLES;
      document.head.appendChild(el);
    }
  }, []);

  const fetchBanner = () => fetch('/api/banner/active', { cache: 'no-store' }).then(r => r.json()).then(d => { setBanner(d.banner || null); if (!d.banner) setDismiss(false); }).catch(() => {});

  useEffect(() => {
    getCourses().then(r => setCourses(r.data.courses || [])).catch(() => {});
    getWorkshops().then(r => setWorkshops(r.data.workshops || [])).catch(() => {});
    fetch('/api/categories/public').then(r => r.json()).then(d => setCategories(d.categories || [])).catch(() => {});
    fetch('/api/journey').then(r => r.json()).then(d => setJourney(d.slides || [])).catch(() => {});
    fetch('/api/team').then(r => r.json()).then(d => setTeam(d.members || [])).catch(() => {});
    fetch('/api/site-content').then(r => r.json()).then(d => setSc(d.content || {})).catch(() => {});
    fetchBanner();
    const onBanner = () => { sessionStorage.removeItem('banner-dismissed'); fetchBanner(); };
    const onContent = () => fetch('/api/site-content').then(r => r.json()).then(d => setSc(d.content || {})).catch(() => {});
    window.addEventListener('banner-updated', onBanner);
    window.addEventListener('site-content-updated', onContent);
    return () => { window.removeEventListener('banner-updated', onBanner); window.removeEventListener('site-content-updated', onContent); };
  }, []); // eslint-disable-line

  const handleJoin = async e => {
    e.preventDefault(); setJoinLoad(true); setJoinErr('');
    try { const r = await joinWorkshop(selWS._id, joinForm); setJoinResult(r.data.meetUrl); }
    catch (err) { setJoinErr(err.response?.data?.error || 'Something went wrong.'); }
    setJoinLoad(false);
  };
  const closeModal = () => { setSelWS(null); setJoinResult(null); setJoinErr(''); setJoinForm({ name: '', email: '', mobile: '' }); };
  const shareCourse = (course, e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/courses/premium/${course.slug}`;
    if (navigator.clipboard) navigator.clipboard.writeText(url);
    setShareToast(true); setTimeout(() => setShareToast(false), 2200);
  };

  const free = courses.filter(c => c.price === 0);
  const premium = courses.filter(c => c.price > 0);

  const featureCards = useMemo(() => [
    { icon: '🎯', title: cv('feat1_title', 'Job-ready learning paths'), text: cv('feat1_text', 'Each track is built so beginners start quickly and grow into hands-on cloud and cyber roles.'), chip: cv('feat1_chip', 'Clear progression') },
    { icon: '🧪', title: cv('feat2_title', 'Real labs, not just theory'), text: cv('feat2_text', 'Learners move from guided lessons to workshops, projects and premium mentorship.'), chip: cv('feat2_chip', 'Hands-on from day one') },
    { icon: '🌐', title: cv('feat3_title', 'Built for serious learners'), text: cv('feat3_text', 'Pragni blends free access with structured support so students keep moving even on tight budgets.'), chip: cv('feat3_chip', 'Affordable + accessible') },
    { icon: '🏆', title: cv('feat4_title', 'Confidence before interviews'), text: cv('feat4_text', 'From foundations to advanced practice, designed to help students explain what they know clearly.'), chip: cv('feat4_chip', 'Portfolio mindset') },
  ], [sc]); // eslint-disable-line

  const roadmapSteps = useMemo(() => [
    { title: cv('step1_title', 'Start with free foundations'), text: cv('step1_text', 'Pick a role path, learn the basics, and build consistency with short lessons you can actually complete.') },
    { title: cv('step2_title', 'Join live sessions'), text: cv('step2_text', 'Use workshops to ask questions, see workflows in action, and stay accountable with the community.') },
    { title: cv('step3_title', 'Go deeper with premium tracks'), text: cv('step3_text', 'Move into structured programs when you want projects, mentorship, certification and guided outcomes.') },
  ], [sc]); // eslint-disable-line

  const hasVideo = cv('hero_video_youtube', '') || cv('hero_video_url', '');
  const ytId = cv('hero_video_youtube', '');
  const ytSrc = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <>
      <ActiveBanner banner={banner} dismissed={bannerDismissed} onDismiss={() => setDismiss(true)} />

      <div className="h-pg">
        <canvas ref={canvasRef} id="h-canvas" />
        <div className="h-grid" />
        <div className="h-grain" />

        <div className="h-inner">

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              HERO
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <section className="h-hero">
            {/* Atmospheric blobs */}
            <div className="h-hero-blob1" />
            <div className="h-hero-blob2" />

            <div className="h-wrap">
              <div className="h-hero-grid">
                {/* Left column */}
                <div>
                  <div className="h-badge h-fade hd1">
                    <span className="h-badge-dot" />
                    {cv('hero_eyebrow', 'Cybersecurity · Cloud · Pentesting')}
                  </div>

                  <h1 className="h-h1 h-fade hd2">
                    <span className={`h-h1-line h-h1-plain`}>{cv('hero_title_line1', 'LEARN')}</span>
                    <span className={`h-h1-line h-h1-accent`}>{cv('hero_title_gradient', 'CYBERSECURITY')}</span>
                    <span className={`h-h1-line h-h1-ghost`}>&amp; {cv('hero_title_line2', 'CLOUD.')}</span>
                  </h1>

                  <p className="h-desc h-fade hd3">
                    {cv('hero_description', 'Pragni is built to make world-class tech skills accessible to everyone. AWS, Azure, SOC, Pentesting, Networking — free and affordable, always.')}
                  </p>

                  <div className="h-ctas h-fade hd4">
                    <Link to="/courses" className="h-btn-primary">Start Learning →</Link>
                    <Link to="/workshops" className="h-btn-ghost">Live Workshops</Link>
                  </div>

                  <div className="h-stats h-fade hd5">
                    {[
                      [cv('stat1_num', '8+'), cv('stat1_lbl', 'Course Tracks')],
                      [cv('stat2_num', '100%'), cv('stat2_lbl', 'Free To Start')],
                      [cv('stat3_num', 'Live'), cv('stat3_lbl', 'Weekly Sessions')],
                      [cv('stat4_num', '₹0'), cv('stat4_lbl', 'Hidden Fees')],
                    ].map(([n, l]) => (
                      <div key={l} className="h-stat">
                        <span className="h-sn">{n}</span>
                        <span className="h-sl">{l}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right column — terminal panel */}
                <div className="h-fade hd6"><HeroPanel /></div>
              </div>
            </div>
          </section>

          <div className="h-div" />

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              WHY PRAGNI
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <section className="h-sec">
            <div className="h-wrap">
              <div className="h-sec-head">
                <div className="h-kicker">Why Pragni Works</div>
                <h2 className="h-sec-h2">A sharper ed-tech experience<br />for focused learners</h2>
                <p className="h-sec-sub">Designed to feel premium, stay simple on mobile, and guide students from curiosity to confident execution.</p>
              </div>
              <div className="h-feats">
                {featureCards.map((card, i) => (
                  <div key={card.title} className="h-feat">
                    <div className="h-feat-line" />
                    <div className="h-feat-icon">{card.icon}</div>
                    <div className="h-feat-title">{card.title}</div>
                    <div className="h-feat-text">{card.text}</div>
                    <div className="h-feat-chip">{card.chip}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="h-div" />

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              CATEGORIES
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {categories.length > 0 && (
            <section className="h-sec h-sec-alt">
              <div className="h-wrap">
                <div className="h-sec-head">
                  <div className="h-kicker">Explore Tracks</div>
                  <h2 className="h-sec-h2">What will you master?</h2>
                  <p className="h-sec-sub">Choose a discipline and follow a structured path from zero to job-ready.</p>
                </div>
                <div className="h-cats">
                  {categories.map((cat, i) => (
                    <Link key={cat.slug} to={`/courses?category=${cat.slug}`} className={`h-cat h-fade hd${Math.min(i + 1, 6)}`}>
                      {cat.imageUrl ? <img src={cat.imageUrl} alt={cat.label} className="h-cat-img" /> : <span className="h-cat-icon">{cat.icon}</span>}
                      <span className="h-cat-lbl">{cat.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {categories.length > 0 && <div className="h-div" />}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              JOURNEY
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {journey.length > 0 && (
            <section className="h-sec">
              <div className="h-wrap">
                <div className="h-sec-head">
                  <div className="h-kicker">Our Story</div>
                  <h2 className="h-sec-h2">{cv('journey_title', 'Our Journey')}</h2>
                  <p className="h-sec-sub">{cv('journey_subtitle', 'From a bold idea to building world-class cyber educators.')}</p>
                </div>
                <JourneyCarousel slides={journey} />
              </div>
            </section>
          )}

          {journey.length > 0 && <div className="h-div" />}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              WORKSHOPS
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {workshops.length > 0 && (
            <section className="h-sec h-sec-alt">
              <div className="h-wrap">
                <div className="h-sec-head">
                  <div className="h-kicker">Live Sessions</div>
                  <h2 className="h-sec-h2">Upcoming Live Workshops</h2>
                  <p className="h-sec-sub">Real-time, hands-on instructor-led training. Join free.</p>
                </div>
                <div className="h-wss">
                  {workshops.slice(0, 4).map((w, i) => (
                    <div key={w._id} className={`h-fade hd${Math.min(i + 1, 4)}`}>
                      <WorkshopCard w={w} onClick={() => { setSelWS(w); setJoinResult(null); }} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {workshops.length > 0 && <div className="h-div" />}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              PREMIUM COURSES
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {premium.length > 0 && (
            <section className="h-sec">
              <div className="h-wrap">
                <div className="h-sec-head">
                  <div className="h-kicker">Premium</div>
                  <h2 className="h-sec-h2">Premium Courses</h2>
                  <p className="h-sec-sub">Structured programs with mentorship, projects and certification. Industry-priced, not Wall Street-priced.</p>
                </div>
                <div className="h-courses">
                  {premium.slice(0, 3).map((c, i) => <CourseCard key={c._id} course={c} delay={Math.min(i + 1, 5)} onShare={shareCourse} />)}
                </div>
                {premium.length > 3 && <div style={{ textAlign: 'center', marginTop: 44 }}><Link to="/courses" className="h-btn-ghost">View All Premium →</Link></div>}
              </div>
            </section>
          )}

          {premium.length > 0 && free.length > 0 && <div className="h-div" />}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              FREE COURSES
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {free.length > 0 && (
            <section className="h-sec h-sec-alt">
              <div className="h-wrap">
                <div className="h-sec-head">
                  <div className="h-kicker">Free Access</div>
                  <h2 className="h-sec-h2">Free Courses — Start Now</h2>
                  <p className="h-sec-sub">No sign-up. No paywall. Just click and learn.</p>
                </div>
                <div className="h-courses">
                  {free.slice(0, 6).map((c, i) => <CourseCard key={c._id} course={c} delay={Math.min(i + 1, 5)} onShare={shareCourse} />)}
                </div>
                {free.length > 6 && <div style={{ textAlign: 'center', marginTop: 44 }}><Link to="/courses" className="h-btn-ghost">View All Free Courses →</Link></div>}
              </div>
            </section>
          )}

          <div className="h-div" />

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              TEAM
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {team.length > 0 && (
            <section className="h-sec">
              <div className="h-wrap">
                <div className="h-sec-head">
                  <div className="h-kicker">The People</div>
                  <h2 className="h-sec-h2">{cv('team_title', 'Meet Our Team')}</h2>
                  <p className="h-sec-sub">{cv('team_subtitle', 'Security professionals and educators building Pragni.')}</p>
                </div>
                <div className="h-team">
                  {team.map((m, i) => (
                    <div key={m._id} className={`h-tm h-fade hd${Math.min(i + 1, 5)}`}>
                      {m.photo ? <img src={m.photo} alt={m.name} className="h-tm-photo" /> : <div className="h-tm-ph">{m.name?.[0]?.toUpperCase()}</div>}
                      <div className="h-tm-name">{m.name}</div>
                      <div className="h-tm-role">{m.role}</div>
                      {m.bio && <div className="h-tm-bio">{m.bio}</div>}
                      {(m.linkedin || m.twitter) && (
                        <div className="h-tm-links">
                          {m.linkedin && <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="h-tm-link" title="LinkedIn"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg></a>}
                          {m.twitter && <a href={m.twitter} target="_blank" rel="noopener noreferrer" className="h-tm-link" title="Twitter/X"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg></a>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {team.length > 0 && <div className="h-div" />}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              VIDEO
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {hasVideo && (
            <>
              <section className="h-sec h-sec-alt">
                <div className="h-wrap">
                  <div className="h-sec-head">
                    <div className="h-kicker">{cv('hero_video_kicker', 'Watch & Learn')}</div>
                    <h2 className="h-sec-h2">{cv('hero_video_title', 'See Pragni in Action')}</h2>
                    <p className="h-sec-sub">{cv('hero_video_desc', 'Watch a quick overview of what we offer.')}</p>
                  </div>
                  <div className="h-video-wrap">
                    {videoPlaying && ytId
                      ? <iframe src={ytSrc} allow="autoplay; fullscreen" allowFullScreen title="Pragni video" />
                      : videoPlaying && cv('hero_video_url', '')
                        ? <video src={cv('hero_video_url', '')} poster={cv('hero_video_poster', '')} autoPlay controls />
                        : <>
                          {cv('hero_video_poster', '') && <img src={cv('hero_video_poster', '')} alt="Video thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                          <div className="h-video-over" onClick={() => setVideoPlaying(true)}>
                            <div className="h-play"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg></div>
                          </div>
                        </>}
                  </div>
                  {(cv('video_tag1', '') || cv('video_tag2', '') || cv('video_tag3', '')) && (
                    <div className="h-video-tags">
                      {cv('video_tag1', '') && <span className="h-video-tag">✓ {cv('video_tag1', '')}</span>}
                      {cv('video_tag2', '') && <span className="h-video-tag">✓ {cv('video_tag2', '')}</span>}
                      {cv('video_tag3', '') && <span className="h-video-tag">✓ {cv('video_tag3', '')}</span>}
                    </div>
                  )}
                </div>
              </section>
              <div className="h-div" />
            </>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              ROADMAP
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <section className="h-sec">
            <div className="h-wrap">
              <div className="h-sec-head">
                <div className="h-kicker">Learning Flow</div>
                <h2 className="h-sec-h2">How students move through Pragni</h2>
                <p className="h-sec-sub">A cleaner journey helps learners know what to do next, from free access to premium mentorship.</p>
              </div>
              <div className="h-roadmap">
                <div className="h-roadmap-main">
                  <div className="h-roadmap-h">From first lesson to real-world confidence</div>
                  <p className="h-roadmap-p">A structured path that takes you from foundations to hands-on practice, with live sessions and premium programs to support every stage of growth.</p>
                  <div className="h-roadmap-steps">
                    {roadmapSteps.map((step, i) => (
                      <div key={step.title} className="h-step">
                        <div className="h-step-num">0{i + 1}</div>
                        <div>
                          <div className="h-step-title">{step.title}</div>
                          <div className="h-step-text">{step.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-roadmap-side">
                  <div className="h-side-card"><small>For beginners</small><strong>Low-friction starting point</strong><p>Free courses, visible categories and short next-step choices reduce confusion on the first visit.</p></div>
                  <div className="h-side-card"><small>For active learners</small><strong>Live momentum loops</strong><p>Workshops and premium programs sit closer to the core discovery flow, so students know how to progress.</p></div>
                  <div className="h-side-card"><small>For mobile users</small><strong>Cleaner hierarchy</strong><p>Important actions stay text-first and scannable, making the experience lighter on smaller screens.</p></div>
                </div>
              </div>
            </div>
          </section>

          <div className="h-div" />

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              MISSION STATEMENT
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <section className="h-mission">
            <div className="h-mission-deco" />
            <div className="h-wrap">
              <div className="h-mission-q">"{cv('mission_quote', 'Every learner deserves world-class tech education. Period.')}"</div>
              <p className="h-mission-sub">{cv('mission_text', 'Pragni was founded to break the paywall on cybersecurity and cloud education. Free for everyone, always.')}</p>
              <Link to="/about" className="h-btn-ghost">Read Our Story →</Link>
            </div>
          </section>

        </div>{/* end h-inner */}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            WORKSHOP MODAL
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {selWS && (
          <div className="h-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
            <div className="h-modal">
              <div className="h-modal-hd">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span className="h-live"><span className="h-live-dot" />LIVE</span>
                    <span style={{ fontFamily: 'var(--m-font)', fontSize: 10, color: 'var(--pg-text3)', letterSpacing: '.06em' }}>{new Date(selWS.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                  <div className="h-modal-title">{selWS.title}</div>
                </div>
                <button className="h-mclose" onClick={closeModal}>✕</button>
              </div>
              <p className="h-modal-desc">{selWS.description}</p>
              {joinResult ? (
                <div className="h-ok">
                  <div className="h-ok-lbl">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                    REGISTERED — JOIN VIA GOOGLE MEET
                  </div>
                  <a href={joinResult} target="_blank" rel="noopener noreferrer" className="h-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>Open Google Meet →</a>
                </div>
              ) : (
                <form onSubmit={handleJoin}>
                  {joinErr && <div className="h-err">{joinErr}</div>}
                  {[['name', 'Full Name', 'John Doe'], ['email', 'Email', 'you@email.com'], ['mobile', 'Mobile', '+91 98765 43210']].map(([k, lbl, ph]) => (
                    <div key={k} className="h-input-g">
                      <label className="h-label">{lbl} *</label>
                      <input type={k === 'email' ? 'email' : k === 'mobile' ? 'tel' : 'text'} className="h-input" placeholder={ph} required value={joinForm[k]} onChange={e => setJoinForm(f => ({ ...f, [k]: e.target.value }))} />
                    </div>
                  ))}
                  <button type="submit" className="h-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 10 }} disabled={joinLoad}>{joinLoad ? 'Getting link…' : 'Get Join Link →'}</button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>{/* end h-pg */}

      {/* Share toast */}
      {shareToast && (
        <div className="h-toast">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          LINK COPIED
        </div>
      )}
    </>
  );
}
