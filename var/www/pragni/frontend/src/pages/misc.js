import { useMeta } from '../context/SeoContext';
import React, { useState, useEffect } from 'react';
import { getWorkshops, joinWorkshop } from '../utils/api';
import { Link } from 'react-router-dom';

/* ─── SHARED MISC STYLES ─────────────────────────────────────────────────────── */
const MISC_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Cabinet+Grotesk:wght@300;400;500;700;800&family=Outfit:wght@300;400;500;600&display=swap');
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
    --green:      #26d0a1;
    --green-bg:   rgba(38,208,161,0.07);
    --font-display: 'Clash Display', 'Cabinet Grotesk', sans-serif;
    --font-body:    'Plus Jakarta Sans', 'Outfit', sans-serif;
    --ease:       cubic-bezier(0.16, 1, 0.3, 1);
    --r:          18px;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  ::selection { background: rgba(157,127,212,0.28); color: #fff; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: var(--ink2); }
  ::-webkit-scrollbar-thumb { background: var(--lift); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--violet); }

  /* ── Aurora ── */
  .misc-aurora {
    position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
  }
  .misc-blob {
    position: absolute; border-radius: 50%; filter: blur(100px);
    will-change: transform; mix-blend-mode: screen;
  }
  .misc-b1 {
    width: 700px; height: 700px;
    background: radial-gradient(circle at 40% 40%, rgba(123,94,167,0.2) 0%, rgba(79,195,247,0.08) 50%, transparent 70%);
    top: -200px; left: -150px;
    animation: miscBlob1 24s ease-in-out infinite alternate;
  }
  .misc-b2 {
    width: 550px; height: 550px;
    background: radial-gradient(circle at 60% 40%, rgba(38,208,161,0.15) 0%, rgba(123,94,167,0.1) 55%, transparent 70%);
    bottom: -100px; right: -80px;
    animation: miscBlob2 30s ease-in-out infinite alternate;
  }
  .misc-b3 {
    width: 400px; height: 400px;
    background: radial-gradient(circle at 50% 50%, rgba(79,195,247,0.12) 0%, rgba(240,98,146,0.08) 50%, transparent 70%);
    top: 40vh; left: 40%;
    animation: miscBlob3 20s ease-in-out infinite alternate;
  }
  @keyframes miscBlob1 { from{transform:translate(0,0) scale(1)} to{transform:translate(70px,90px) scale(1.1)} }
  @keyframes miscBlob2 { from{transform:translate(0,0) scale(1.05)} to{transform:translate(-60px,70px) scale(0.92)} }
  @keyframes miscBlob3 { from{transform:translate(0,0) scale(1)} to{transform:translate(50px,-60px) scale(1.08)} }

  .misc-mesh {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
    background-size: 72px 72px;
    mask-image: radial-gradient(ellipse 90% 70% at 50% 30%, rgba(0,0,0,0.5), transparent);
  }
  .misc-noise {
    position: fixed; inset: 0; pointer-events: none; z-index: 1; opacity: 0.025;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  /* ── Page root ── */
  .misc-root {
    font-family: var(--font-body);
    color: var(--text);
    background: var(--ink);
    min-height: 100vh;
    position: relative;
  }
  .misc-inner { position: relative; z-index: 3; }
  .misc-container { max-width: 1100px; margin: 0 auto; padding: 0 28px; }

  .misc-hero {
    padding: 96px 0 42px;
  }
  .misc-hero-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(280px, .9fr);
    gap: 22px;
    align-items: stretch;
  }
  .misc-hero-copy,
  .misc-hero-panel {
    background: rgba(26,29,46,0.72);
    border: 1px solid var(--border);
    border-radius: 24px;
    backdrop-filter: blur(16px);
  }
  .misc-hero-copy {
    padding: 34px;
    position: relative;
    overflow: hidden;
  }
  .misc-hero-copy::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(circle at top left, rgba(123,94,167,0.18), transparent 58%);
    pointer-events: none;
  }
  .misc-hero-copy > * { position: relative; z-index: 1; }
  .misc-hero-title {
    font-family: var(--font-display);
    font-size: clamp(34px, 5vw, 56px);
    line-height: 1.04;
    letter-spacing: -0.03em;
    margin-bottom: 16px;
  }
  .misc-hero-desc {
    font-size: 16px;
    color: var(--text2);
    max-width: 560px;
    line-height: 1.8;
    font-weight: 300;
    margin-bottom: 24px;
  }
  .misc-hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  .misc-link-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 22px;
    border-radius: 999px;
    text-decoration: none;
    font-size: 13px;
    font-weight: 700;
    transition: all .28s var(--ease);
  }
  .misc-link-btn.primary {
    background: linear-gradient(135deg, var(--violet), var(--indigo));
    color: #fff;
    box-shadow: 0 0 28px rgba(123,94,167,0.34);
  }
  .misc-link-btn.ghost {
    background: rgba(255,255,255,0.04);
    color: var(--text);
    border: 1px solid var(--border2);
  }
  .misc-link-btn:hover { transform: translateY(-2px); }
  .misc-hero-panel {
    padding: 24px;
    display: grid;
    gap: 12px;
  }
  .misc-hero-pill {
    padding: 15px 16px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(8,9,15,0.35);
  }
  .misc-hero-pill small {
    display: block;
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text3);
    margin-bottom: 7px;
  }
  .misc-hero-pill strong {
    display: block;
    font-size: 15px;
    margin-bottom: 6px;
  }
  .misc-hero-pill span {
    display: block;
    font-size: 12px;
    color: var(--text2);
    line-height: 1.6;
  }

  /* ── Section ── */
  .misc-section { padding: 110px 0; }
  .misc-section-head { text-align: center; margin-bottom: 64px; }
  .misc-eyebrow {
    display: inline-block;
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--violet3);
    margin-bottom: 18px;
    position: relative;
  }
  .misc-eyebrow::before,
  .misc-eyebrow::after {
    content: '';
    position: absolute; top: 50%; height: 1px; width: 38px;
    transform: translateY(-50%);
  }
  .misc-eyebrow::before { right: calc(100% + 14px); background: linear-gradient(90deg, transparent, var(--violet3)); }
  .misc-eyebrow::after  { left: calc(100% + 14px);  background: linear-gradient(90deg, var(--violet3), transparent); }

  .misc-section-head h2 {
    font-family: var(--font-display);
    font-size: clamp(30px, 4vw, 48px);
    font-weight: 700; letter-spacing: -0.025em;
    margin-bottom: 14px; line-height: 1.1;
  }
  .misc-section-head p {
    color: var(--text2); font-size: 16px;
    max-width: 480px; margin: 0 auto;
    line-height: 1.7; font-weight: 300;
  }

  /* ── Empty state ── */
  .misc-empty {
    text-align: center; padding: 72px 24px;
    border: 1px dashed var(--border2); border-radius: 20px;
    color: var(--text3);
  }
  .misc-empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
  .misc-empty p { font-size: 15px; font-weight: 300; }

  /* ═══════════════════════════════════════
     WORKSHOPS
  ═══════════════════════════════════════ */
  .ws-list { display: flex; flex-direction: column; gap: 20px; }

  .workshop-banner {
    background: rgba(26,29,46,0.8);
    border: 1px solid var(--border);
    border-radius: 20px; overflow: hidden;
    cursor: pointer;
    transition: all 0.4s var(--ease);
    display: grid; grid-template-columns: 280px 1fr;
    backdrop-filter: blur(12px);
    position: relative;
  }
  .workshop-banner::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(123,94,167,0.06) 0%, transparent 60%);
    opacity: 0; transition: opacity 0.4s; pointer-events: none;
    border-radius: inherit;
  }
  .workshop-banner:hover {
    transform: translateY(-5px);
    border-color: rgba(157,127,212,0.35);
    box-shadow: 0 30px 70px rgba(0,0,0,0.5), 0 0 0 1px rgba(157,127,212,0.12), 0 0 50px rgba(123,94,167,0.12);
  }
  .workshop-banner:hover::after { opacity: 1; }

  .workshop-banner-img {
    width: 100%; height: 100%;
    object-fit: cover; display: block;
    transition: transform 0.5s var(--ease);
  }
  .workshop-banner:hover .workshop-banner-img { transform: scale(1.04); }

  .ws-img-ph {
    background: linear-gradient(135deg, var(--surface2), var(--ink3));
    height: 100%; min-height: 180px;
    display: flex; align-items: center; justify-content: center;
    font-size: 56px; position: relative;
  }
  .ws-img-ph::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(circle at 30% 40%, rgba(123,94,167,0.2), transparent 60%);
  }

  .workshop-banner-body {
    padding: 26px 28px;
    display: flex; flex-direction: column;
    justify-content: center; gap: 12px;
    position: relative; z-index: 1;
  }
  .ws-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

  .ws-live-badge {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--rose); padding: 5px 12px; border-radius: 100px;
    background: rgba(240,98,146,0.1); border: 1px solid rgba(240,98,146,0.3);
    box-shadow: 0 0 14px rgba(240,98,146,0.1);
  }
  .ws-live-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--rose); box-shadow: 0 0 8px var(--rose);
    animation: wsDotPulse 1.6s ease-in-out infinite;
  }
  @keyframes wsDotPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(0.7);opacity:0.5} }

  .ws-tag {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 11px; font-weight: 600;
    padding: 4px 11px; border-radius: 100px;
    border: 1px solid var(--border2); color: var(--text2);
    background: rgba(255,255,255,0.04);
  }
  .workshop-title {
    font-family: var(--font-display);
    font-size: 20px; font-weight: 700;
    line-height: 1.3; letter-spacing: -0.015em;
  }
  .workshop-desc {
    font-size: 13px; color: var(--text2); line-height: 1.65;
    font-weight: 300;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .ws-cta-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 24px; border-radius: 100px;
    background: linear-gradient(135deg, var(--violet), var(--indigo));
    color: #fff; font-size: 13px; font-weight: 700;
    border: none; cursor: pointer; font-family: var(--font-body);
    transition: all 0.3s var(--ease);
    box-shadow: 0 0 25px rgba(123,94,167,0.4);
    align-self: flex-start;
  }
  .ws-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 0 40px rgba(123,94,167,0.6); }

  /* ── Workshop Modal ── */
  .ws-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.82); backdrop-filter: blur(20px);
    z-index: 300; display: flex; align-items: center; justify-content: center;
    padding: 24px; animation: wsFadeIn 0.2s ease;
  }
  @keyframes wsFadeIn { from{opacity:0} to{opacity:1} }

  .ws-modal {
    background: var(--surface);
    border: 1px solid var(--border2); border-radius: 24px;
    max-width: 480px; width: 100%; padding: 32px;
    box-shadow: 0 50px 120px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.07), 0 0 0 1px rgba(123,94,167,0.15);
    animation: wsSlideUp 0.35s var(--ease);
    max-height: 92vh; overflow-y: auto; position: relative;
  }
  .ws-modal::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(157,127,212,0.5), transparent);
    border-radius: 24px 24px 0 0;
  }
  @keyframes wsSlideUp { from{opacity:0;transform:translateY(26px)} to{opacity:1;transform:translateY(0)} }

  .ws-modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; gap: 16px; }
  .ws-modal-title { font-family: var(--font-display); font-size: 20px; font-weight: 700; line-height: 1.3; margin-top: 10px; }
  .ws-modal-meta { font-size: 12px; color: var(--text3); margin-top: 5px; }
  .ws-modal-close {
    width: 34px; height: 34px; border-radius: 50%;
    background: rgba(255,255,255,0.05); border: 1px solid var(--border);
    color: var(--text2); font-size: 12px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    transition: all 0.25s;
  }
  .ws-modal-close:hover { background: rgba(240,98,146,0.1); border-color: rgba(240,98,146,0.4); color: var(--rose); transform: rotate(90deg); }

  .ws-modal-form { display: flex; flex-direction: column; gap: 14px; }
  .ws-input-group { display: flex; flex-direction: column; gap: 6px; }
  .ws-label { font-size: 11px; font-weight: 700; color: var(--text3); letter-spacing: 0.08em; text-transform: uppercase; }
  .ws-input {
    background: var(--ink2); border: 1px solid var(--border2);
    border-radius: 12px; padding: 11px 16px;
    color: var(--text); font-size: 14px; font-family: var(--font-body);
    outline: none; width: 100%; transition: border-color 0.25s, box-shadow 0.25s;
  }
  .ws-input::placeholder { color: var(--text3); }
  .ws-input:focus { border-color: var(--violet); box-shadow: 0 0 0 3px rgba(123,94,167,0.15); }

  .ws-error {
    background: rgba(240,98,146,0.07); border: 1px solid rgba(240,98,146,0.22);
    border-radius: 12px; padding: 11px 16px;
    font-size: 13px; color: var(--rose);
  }
  .ws-submit-btn {
    padding: 13px 24px; border-radius: 100px;
    background: linear-gradient(135deg, var(--violet), var(--indigo));
    color: #fff; font-size: 14px; font-weight: 700;
    border: none; cursor: pointer; font-family: var(--font-body);
    width: 100%; margin-top: 6px;
    transition: all 0.3s var(--ease);
    box-shadow: 0 0 30px rgba(123,94,167,0.4);
  }
  .ws-submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 0 50px rgba(123,94,167,0.6); }
  .ws-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .ws-success-box {
    background: rgba(38,208,161,0.07); border: 1px solid rgba(38,208,161,0.22);
    border-radius: 16px; padding: 20px;
  }
  .ws-success-label { font-size: 13px; color: var(--teal); font-weight: 700; margin-bottom: 14px; }
  .ws-meet-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 13px 24px; border-radius: 100px;
    background: linear-gradient(135deg, var(--teal), #00c87a);
    color: #0a1a12; font-size: 14px; font-weight: 800;
    text-decoration: none; width: 100%;
    box-shadow: 0 0 30px rgba(38,208,161,0.4);
    transition: all 0.3s var(--ease);
  }
  .ws-meet-btn:hover { transform: translateY(-2px); box-shadow: 0 0 50px rgba(38,208,161,0.6); }

  /* ═══════════════════════════════════════
     TRAINERS
  ═══════════════════════════════════════ */
  .trainers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 22px;
  }
  .trainer-card {
    background: rgba(26,29,46,0.75);
    border: 1px solid var(--border); border-radius: 20px;
    padding: 28px 22px; text-align: center;
    backdrop-filter: blur(12px);
    transition: all 0.4s var(--ease);
    position: relative; overflow: hidden;
  }
  .trainer-card::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(circle at 50% 0%, rgba(123,94,167,0.12), transparent 60%);
    opacity: 0; transition: opacity 0.4s;
  }
  .trainer-card:hover {
    transform: translateY(-7px);
    border-color: rgba(157,127,212,0.35);
    box-shadow: 0 30px 70px rgba(0,0,0,0.45), 0 0 0 1px rgba(157,127,212,0.12), 0 0 50px rgba(123,94,167,0.1);
  }
  .trainer-card:hover::before { opacity: 1; }

  .trainer-avatar {
    width: 76px; height: 76px; border-radius: 50%;
    object-fit: cover; display: block; margin: 0 auto 16px;
    border: 2px solid var(--border2);
    box-shadow: 0 0 0 4px rgba(123,94,167,0.15);
    position: relative; z-index: 1;
  }
  .trainer-avatar-ph {
    width: 76px; height: 76px; border-radius: 50%;
    background: linear-gradient(135deg, var(--violet), var(--indigo));
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display);
    font-size: 28px; font-weight: 800; color: #fff;
    margin: 0 auto 16px;
    border: 2px solid rgba(157,127,212,0.25);
    box-shadow: 0 0 30px rgba(123,94,167,0.35);
    position: relative; z-index: 1;
  }
  .trainer-name {
    font-family: var(--font-display);
    font-size: 17px; font-weight: 700;
    margin-bottom: 4px; letter-spacing: -0.01em;
    position: relative; z-index: 1;
  }
  .trainer-role {
    font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--violet3); margin-bottom: 12px;
    position: relative; z-index: 1;
  }
  .trainer-bio {
    font-size: 12px; color: var(--text3);
    line-height: 1.65; margin-bottom: 14px; font-weight: 300;
    position: relative; z-index: 1;
  }
  .trainer-specs {
    display: flex; flex-wrap: wrap; gap: 6px; justify-content: center;
    margin-bottom: 16px; position: relative; z-index: 1;
  }
  .trainer-spec-tag {
    display: inline-flex;
    font-size: 10px; font-weight: 700;
    padding: 4px 10px; border-radius: 100px;
    border: 1px solid var(--border2); color: var(--text2);
    background: rgba(255,255,255,0.04);
    letter-spacing: 0.03em;
  }
  .trainer-socials {
    display: flex; justify-content: center; gap: 8px;
    position: relative; z-index: 1;
  }
  .trainer-social-link {
    width: 32px; height: 32px; border-radius: 50%;
    background: rgba(255,255,255,0.05); border: 1px solid var(--border2);
    color: var(--text2); text-decoration: none;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 800;
    transition: all 0.25s var(--ease);
    text-transform: uppercase; letter-spacing: 0.03em;
  }
  .trainer-social-link:hover {
    background: rgba(123,94,167,0.15); border-color: rgba(157,127,212,0.4);
    color: var(--violet3); transform: translateY(-2px);
  }

  /* ═══════════════════════════════════════
     ABOUT
  ═══════════════════════════════════════ */
  .about-wrap { max-width: 780px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }

  .about-card {
    background: rgba(26,29,46,0.75);
    border: 1px solid var(--border); border-radius: 20px;
    padding: 30px 32px;
    backdrop-filter: blur(12px);
    position: relative; overflow: hidden;
    transition: border-color 0.3s;
  }
  .about-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(157,127,212,0.3), transparent);
  }
  .about-card:hover { border-color: rgba(157,127,212,0.2); }

  .about-card-accent { background: rgba(123,94,167,0.07); border-color: rgba(123,94,167,0.2); }

  .about-card-title {
    font-family: var(--font-display);
    font-size: 18px; font-weight: 700; margin-bottom: 14px;
    letter-spacing: -0.01em; display: flex; align-items: center; gap: 10px;
  }
  .about-card-title.c-violet { color: var(--violet3); }
  .about-card-title.c-teal { color: var(--teal); }
  .about-card-title.c-cyan { color: var(--cyan); }

  .about-lead {
    font-size: 15px; color: var(--text2); line-height: 1.75; font-weight: 300;
  }

  .about-list { list-style: none; display: flex; flex-direction: column; gap: 11px; }
  .about-list-item {
    display: flex; gap: 12px; font-size: 14px; color: var(--text2);
    line-height: 1.55; font-weight: 300;
  }
  .about-list-check { color: var(--teal); flex-shrink: 0; font-size: 13px; margin-top: 1px; }

  .about-promise-text {
    font-family: var(--font-display);
    font-size: clamp(18px, 2.5vw, 24px);
    font-weight: 700; letter-spacing: -0.02em; line-height: 1.4;
    background: linear-gradient(135deg, var(--text) 20%, var(--violet3) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* ═══════════════════════════════════════
     NOT FOUND
  ═══════════════════════════════════════ */
  .notfound-wrap {
    min-height: 80vh;
    display: flex; align-items: center; justify-content: center;
    text-align: center; padding: 60px 24px;
    position: relative; z-index: 3;
  }
  .notfound-icon { font-size: 80px; margin-bottom: 22px; display: block; }
  .notfound-code {
    font-family: var(--font-display);
    font-size: clamp(80px, 14vw, 140px); font-weight: 700;
    letter-spacing: -0.05em; line-height: 1;
    background: linear-gradient(135deg, var(--text) 0%, var(--violet3) 60%, var(--cyan) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 16px;
  }
  .notfound-msg {
    font-size: 18px; color: var(--text2); margin-bottom: 36px;
    font-weight: 300; line-height: 1.6;
  }
  .notfound-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 13px 30px; border-radius: 100px;
    background: linear-gradient(135deg, var(--violet), var(--indigo));
    color: #fff; font-size: 14px; font-weight: 700;
    text-decoration: none; transition: all 0.3s var(--ease);
    box-shadow: 0 0 40px rgba(123,94,167,0.4);
    font-family: var(--font-body);
  }
  .notfound-btn:hover { transform: translateY(-3px); box-shadow: 0 0 60px rgba(123,94,167,0.6); }

  /* ── Responsive ── */
  @media (max-width: 700px) {
    .misc-hero { padding: 84px 0 32px; }
    .misc-hero-grid { grid-template-columns: 1fr; }
    .workshop-banner { grid-template-columns: 1fr; }
    .ws-img-ph { min-height: 150px; }
    .trainers-grid { grid-template-columns: 1fr 1fr; }
    .misc-section { padding: 80px 0; }
  }
  @media (max-width: 480px) {
    .trainers-grid { grid-template-columns: 1fr; }
  }
`;

function injectMiscStyles() {
  if (!document.getElementById('pragni-misc-styles')) {
    const el = document.createElement('style');
    el.id = 'pragni-misc-styles';
    el.textContent = MISC_STYLES;
    document.head.appendChild(el);
  }
}

/* ── Aurora backdrop (reused across pages) ── */
function MiscAurora() {
  return (
    <>
      <div className="misc-aurora">
        <div className="misc-blob misc-b1" />
        <div className="misc-blob misc-b2" />
        <div className="misc-blob misc-b3" />
      </div>
      <div className="misc-mesh" />
      <div className="misc-noise" />
    </>
  );
}

function MiscPageHero({ eyebrow, title, description, primary, secondary, highlights = [] }) {
  return (
    <section className="misc-hero">
      <div className="misc-container">
        <div className="misc-hero-grid">
          <div className="misc-hero-copy">
            <div className="misc-eyebrow">{eyebrow}</div>
            <h1 className="misc-hero-title">{title}</h1>
            <p className="misc-hero-desc">{description}</p>
            <div className="misc-hero-actions">
              {primary && <Link to={primary.to} className="misc-link-btn primary">{primary.label}</Link>}
              {secondary && <Link to={secondary.to} className="misc-link-btn ghost">{secondary.label}</Link>}
            </div>
          </div>
          <div className="misc-hero-panel">
            {highlights.map(item => (
              <div key={item.title} className="misc-hero-pill">
                <small>{item.kicker}</small>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Workshops ────────────────────────────────────────────────
export function Workshops() {
  useMeta({ pageKey: 'workshops', title: 'Live Workshops', description: 'Join live cybersecurity and cloud workshops. Limited seats, expert instructors.', keywords: 'live workshop, cybersecurity workshop, cloud training live' });
  const [workshops, setWorkshops] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name:'', email:'', mobile:'' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    injectMiscStyles();
    getWorkshops().then(r => setWorkshops(r.data.workshops || [])).catch(() => {});
  }, []);

  const handleJoin = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const r = await joinWorkshop(selected._id, form);
      setResult(r.data.meetUrl);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    }
    setLoading(false);
  };

  const closeModal = () => { setSelected(null); setResult(null); setError(''); setForm({ name:'', email:'', mobile:'' }); };

  return (
    <div className="misc-root">
      <MiscAurora />
      <div className="misc-inner">
        <MiscPageHero
          eyebrow="Live Sessions"
          title="Workshops that keep learners moving"
          description="Short, practical live classes built for students who want direct guidance, faster clarity and real interaction with instructors."
          primary={{ to: '/courses', label: 'Explore Courses' }}
          secondary={{ to: '/contact', label: 'Talk to Pragni' }}
          highlights={[
            { kicker: 'Hands-on', title: 'Practice-first format', text: 'Sessions are designed to translate concepts into actions learners can repeat later.' },
            { kicker: 'Flexible', title: 'Built for busy schedules', text: 'Join from anywhere, pick up fast, and continue learning with Pragni’s course library.' },
            { kicker: 'Momentum', title: 'Clear next steps', text: 'Workshops connect naturally to free and premium paths so learners know what to do next.' },
          ]}
        />
        <section className="misc-section">
          <div className="misc-container">
            {workshops.length === 0
              ? (
                <div className="misc-empty">
                  <div className="misc-empty-icon"></div>
                  <p>No upcoming workshops. Check back soon!</p>
                </div>
              )
              : (
                <div className="ws-list">
                  {workshops.map(w => {
                    const d = new Date(w.scheduledAt);
                    return (
                      <div key={w._id} className="workshop-banner" onClick={() => { setSelected(w); setResult(null); }}>
                        {w.bannerImage
                          ? <img className="workshop-banner-img" src={w.bannerImage} alt={w.title} />
                          : <div className="ws-img-ph"></div>
                        }
                        <div className="workshop-banner-body">
                          <div className="ws-meta">
                            <span className="ws-live-badge">
                              <span className="ws-live-dot" /> UPCOMING
                            </span>
                            <span className="ws-tag"> {d.toLocaleDateString('en-IN',{ dateStyle:'medium' })}</span>
                            <span className="ws-tag"> {d.toLocaleTimeString('en-IN',{ timeStyle:'short' })}</span>
                            <span className="ws-tag">⏱ {w.durationMinutes} min</span>
                          </div>
                          <div className="workshop-title">{w.title}</div>
                          <div className="workshop-desc">{w.description}</div>
                          <button className="ws-cta-btn">Register &amp; Get Link →</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            }
          </div>
        </section>
      </div>

      {/* Modal */}
      {selected && (
        <div className="ws-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="ws-modal">
            <div className="ws-modal-header">
              <div>
                <span className="ws-live-badge" style={{ display:'inline-flex', marginBottom: 6 }}>
                  <span className="ws-live-dot" /> LIVE SESSION
                </span>
                <div className="ws-modal-title">{selected.title}</div>
                <div className="ws-modal-meta">
                  {new Date(selected.scheduledAt).toLocaleString('en-IN',{ dateStyle:'medium', timeStyle:'short' })} · {selected.durationMinutes} min
                </div>
              </div>
              <button className="ws-modal-close" onClick={closeModal}>✕</button>
            </div>

            {result
              ? (
                <div className="ws-success-box">
                  <div className="ws-success-label">✅ Registered! Join the session:</div>
                  <a href={result} target="_blank" rel="noopener noreferrer" className="ws-meet-btn">
                    Open Google Meet →
                  </a>
                </div>
              )
              : (
                <form onSubmit={handleJoin} className="ws-modal-form">
                  {error && <div className="ws-error">⚠️ {error}</div>}
                  <div className="ws-input-group">
                    <label className="ws-label">Name *</label>
                    <input className="ws-input" required placeholder="John Doe" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} />
                  </div>
                  <div className="ws-input-group">
                    <label className="ws-label">Email *</label>
                    <input type="email" className="ws-input" required placeholder="you@email.com" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} />
                  </div>
                  <div className="ws-input-group">
                    <label className="ws-label">Mobile Number *</label>
                    <input type="tel" className="ws-input" required placeholder="+91 9876543210" value={form.mobile} onChange={e => setForm(f=>({...f,mobile:e.target.value}))} />
                  </div>
                  <button type="submit" className="ws-submit-btn" disabled={loading}>
                    {loading ? 'Getting link...' : 'Get Join Link →'}
                  </button>
                </form>
              )
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ── Trainers ─────────────────────────────────────────────────
export function Trainers() {
  useMeta({ pageKey: 'trainers', title: 'Our Trainers', description: 'Meet our expert certified trainers in cybersecurity, cloud and networking.', keywords: 'cybersecurity trainer, cloud expert, pentesting instructor' });
  const [trainers, setTrainers] = useState([]);

  useEffect(() => {
    injectMiscStyles();
    import('../utils/api').then(api => api.getTrainers().then(r => setTrainers(r.data.trainers || [])));
  }, []);

  return (
    <div className="misc-root">
      <MiscAurora />
      <div className="misc-inner">
        <MiscPageHero
          eyebrow="Meet the Team"
          title="Learn from practitioners, not just presenters"
          description="Our trainers combine teaching clarity with real industry exposure so students get guidance that feels relevant from the first session."
          primary={{ to: '/courses', label: 'Start Learning' }}
          secondary={{ to: '/workshops', label: 'Join Live Sessions' }}
          highlights={[
            { kicker: 'Expertise', title: 'Cloud and cyber specialists', text: 'Mentors across security, pentesting, networking and cloud domains.' },
            { kicker: 'Teaching style', title: 'Explained with context', text: 'Complex topics are broken into practical steps students can absorb faster.' },
            { kicker: 'Learner focus', title: 'Built around outcomes', text: 'The teaching approach prioritises understanding, confidence and progression.' },
          ]}
        />
        <section className="misc-section">
          <div className="misc-container">
            {trainers.length === 0
              ? (
                <div className="misc-empty">
                  <div className="misc-empty-icon"></div>
                  <p>Trainer profiles coming soon.</p>
                </div>
              )
              : (
                <div className="trainers-grid">
                  {trainers.map(t => (
                    <div key={t._id} className="trainer-card">
                      {t.photo
                        ? <img src={t.photo} alt={t.name} className="trainer-avatar" />
                        : <div className="trainer-avatar-ph">{t.name[0]}</div>
                      }
                      <div className="trainer-name">{t.name}</div>
                      <div className="trainer-role">Instructor</div>
                      {t.bio && (
                        <div className="trainer-bio">
                          {t.bio.substring(0, 100)}{t.bio.length > 100 ? '...' : ''}
                        </div>
                      )}
                      <div className="trainer-specs">
                        {(t.specializations || []).slice(0, 3).map((s, i) => (
                          <span key={i} className="trainer-spec-tag">{s}</span>
                        ))}
                      </div>
                      {(t.socialLinks?.linkedin || t.socialLinks?.github || t.socialLinks?.twitter) && (
                        <div className="trainer-socials">
                          {t.socialLinks.linkedin && <a href={t.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="trainer-social-link" title="LinkedIn">in</a>}
                          {t.socialLinks.github   && <a href={t.socialLinks.github}   target="_blank" rel="noopener noreferrer" className="trainer-social-link" title="GitHub">gh</a>}
                          {t.socialLinks.twitter  && <a href={t.socialLinks.twitter}  target="_blank" rel="noopener noreferrer" className="trainer-social-link" title="Twitter">tw</a>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </section>
      </div>
    </div>
  );
}

// ── About ────────────────────────────────────────────────────
export function About() {
  const { useMeta } = require('../context/SeoContext');
  useMeta({ pageKey: 'about', title: 'About Us', description: 'Learn about Pragni — making world-class cybersecurity education free for everyone.', keywords: 'about pragni, cybersecurity education, free IT training' });

  const [team, setTeam] = React.useState([]);
  const [siteContent, setSiteContent] = React.useState({});

  React.useEffect(() => {
    injectMiscStyles();
    fetch('/api/team').then(r => r.json()).then(d => setTeam(d.members || [])).catch(() => {});
    fetch('/api/site-content').then(r => r.json()).then(d => setSiteContent(d.content || {})).catch(() => {});
    const onUpdate = () => fetch('/api/site-content').then(r => r.json()).then(d => setSiteContent(d.content || {})).catch(() => {});
    window.addEventListener('site-content-updated', onUpdate);
    return () => window.removeEventListener('site-content-updated', onUpdate);
  }, []);

  const sc = (key, fallback) => siteContent[key] || fallback;

  return (
    <div className="misc-root">
      <MiscAurora />
      <div className="misc-inner" style={{ paddingBottom: 60 }}>
        <MiscPageHero
          eyebrow="About Us"
          title={sc('about_title', 'Making World-Class Tech Skills Accessible')}
          description={sc('about_description', 'Pragni was born from a simple belief: everyone deserves access to world-class tech education, regardless of their background or budget.')}
          primary={{ to: '/courses', label: 'Browse Courses' }}
          secondary={{ to: '/workshops', label: 'See Live Sessions' }}
          highlights={[
            { kicker: 'Mission', title: 'Free learning stays free', text: 'Fundamentals remain accessible so more students can enter cyber and cloud careers.' },
            { kicker: 'Model', title: 'Premium supports open access', text: 'Mentored programs help sustain the free learning experience instead of replacing it.' },
            { kicker: 'Perspective', title: 'Ed-tech with intent', text: 'Every experience is designed to reduce confusion and increase learner confidence.' },
          ]}
        />
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>
        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 72 }}>
          {[
            {
              title: sc('about_card1_title', 'Why Pragni?'),
              color: 'var(--accent2, #c4a8ff)',
              border: 'rgba(197,176,255,0.25)',
              bg: 'rgba(123,94,167,0.08)',
              text: sc('about_card1_text', 'The cybersecurity and cloud industry faces a massive talent gap. Traditional education is expensive and outdated. Pragni bridges this by providing free, current, hands-on training accessible to anyone with a device and internet connection.'),
            },
            {
              title: sc('about_card2_title', 'What We Offer'),
              color: 'var(--teal, #26d0a1)',
              border: 'rgba(38,208,161,0.25)',
              bg: 'rgba(38,208,161,0.06)',
              text: sc('about_card2_text', 'Free courses on AWS, Azure, GCP, Ethical Hacking, SOC Analysis, Networking, Scripting, and more. Live weekly workshops with industry experts. Premium paid batches with mentorship and certification.'),
            },
            {
              title: sc('about_card3_title', 'Our Promise'),
              color: 'var(--cyan, #4fc3f7)',
              border: 'rgba(79,195,247,0.25)',
              bg: 'rgba(79,195,247,0.06)',
              text: sc('about_card3_text', 'Free courses stay free — always. No paywalls on fundamentals. Premium programs exist to sustain free content, not replace it. Your skills define you, not your bank balance.'),
            },
          ].map(card => (
            <div key={card.title} style={{
              background: card.bg, border: `1px solid ${card.border}`, borderRadius: 20,
              padding: 28, backdropFilter: 'blur(16px)',
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: card.color, marginBottom: 14 }}>{card.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.75, fontWeight: 300 }}>{card.text}</p>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div id="mission" style={{
          background: 'linear-gradient(135deg, rgba(123,94,167,0.1), rgba(79,195,247,0.06))',
          border: '1px solid rgba(197,176,255,0.2)', borderRadius: 24, padding: '48px 44px',
          textAlign: 'center', marginBottom: 72, position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
            fontFamily: 'var(--font-display)', fontSize: 200, lineHeight: 1, color: 'var(--accent)',
            opacity: 0.04, pointerEvents: 'none', userSelect: 'none' }}>"</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px,3vw,34px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.3, marginBottom: 16, position: 'relative',
            background: 'linear-gradient(135deg, var(--text) 30%, var(--accent2, #c4a8ff) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            "{sc('mission_quote', 'Every learner deserves world-class tech education. Period.')}"
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text2)', maxWidth: 480, margin: '0 auto', lineHeight: 1.75, fontWeight: 300 }}>
            {sc('mission_text', 'Pragni was founded to break the paywall on cybersecurity and cloud education. Free for everyone, always.')}
          </p>
        </div>

        {/* Team — from DB */}
        {team.length > 0 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: 12 }}>
                {sc('team_title', 'Meet Our Team')}
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text2)', fontWeight: 300 }}>
                {sc('team_subtitle', 'Passionate educators and security professionals building Pragni.')}
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
              {team.map(m => (
                <div key={m._id} style={{
                  background: 'rgba(26,29,46,0.8)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 20, padding: '28px 20px', textAlign: 'center',
                  backdropFilter: 'blur(12px)', transition: 'transform 0.25s, border-color 0.25s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'rgba(197,176,255,0.25)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}>
                  {m.photo
                    ? <img src={m.photo} alt={m.name} style={{ width: 76, height: 76, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(197,176,255,0.25)', margin: '0 auto 14px', display: 'block' }} />
                    : <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #4a00e0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 auto 14px', border: '2px solid rgba(197,176,255,0.2)' }}>{m.name?.[0]?.toUpperCase()}</div>
                  }
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--accent2, #c4a8ff)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>{m.role}</div>
                  {m.bio && <p style={{ fontSize: 12.5, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 14, fontWeight: 300 }}>{m.bio}</p>}
                  {(m.linkedin || m.twitter) && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                      {m.linkedin && (
                        <a href={m.linkedin} target="_blank" rel="noopener noreferrer"
                          style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0077b5', textDecoration: 'none', transition: 'all 0.2s' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        </a>
                      )}
                      {m.twitter && (
                        <a href={m.twitter} target="_blank" rel="noopener noreferrer"
                          style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1da1f2', textDecoration: 'none', transition: 'all 0.2s' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}


// ── NotFound ─────────────────────────────────────────────────
export function NotFound() {
  useEffect(() => { injectMiscStyles(); }, []);

  return (
    <div className="misc-root">
      <MiscAurora />
      <div className="misc-inner">
        <div className="notfound-wrap">
          <div>
            <span className="notfound-icon"></span>
            <div className="notfound-code">404</div>
            <p className="notfound-msg">This page drifted into the void.<br />Let's get you back on track.</p>
            <a href="/" className="notfound-btn">← Back to Home</a>
          </div>
        </div>
      </div>
    </div>
  );
}
