import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMeta } from '../context/SeoContext';

const PAGE_STYLES = `
.srv-page{min-height:100vh;background:var(--bg);position:relative;overflow:hidden}
.srv-bg{position:fixed;inset:0;pointer-events:none;background-size:cover;background-position:center;opacity:.22;filter:saturate(1.15) contrast(1.02)}
.srv-overlay{position:fixed;inset:0;pointer-events:none;background:
radial-gradient(circle at 15% 10%,rgba(108,71,255,.25),transparent 35%),
radial-gradient(circle at 85% 85%,rgba(139,111,255,.2),transparent 35%),
linear-gradient(120deg,rgba(10,10,16,.55),rgba(10,10,16,.35))}
.srv-wrap{position:relative;z-index:1;max-width:1180px;margin:0 auto;padding:72px 24px 96px}
.srv-hero{padding:26px;border:1px solid rgba(255,255,255,.18);border-radius:20px;background:rgba(255,255,255,.08);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:0 14px 40px rgba(0,0,0,.28)}
.srv-eyebrow{display:inline-block;padding:6px 12px;border-radius:999px;background:var(--accent-bg);color:var(--accent2);font-size:12px;font-weight:600;margin-bottom:16px}
.srv-title{font-size:clamp(32px,5vw,56px);line-height:1.1;letter-spacing:-.03em;margin:0 0 14px}
.srv-sub{font-size:16px;max-width:760px;line-height:1.8;color:var(--text2);margin:0}
.srv-grid{margin-top:24px;display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px}
.srv-card{border:1px solid rgba(255,255,255,.15);border-radius:16px;background:rgba(255,255,255,.08);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);padding:18px;transition:transform .2s,border-color .2s}
.srv-card:hover{transform:translateY(-3px);border-color:rgba(139,111,255,.55)}
.srv-card h3{font-size:18px;margin:0 0 8px}
.srv-card p{margin:0;color:var(--text2);font-size:14px;line-height:1.7}
.srv-cta{margin-top:26px;border:1px solid rgba(255,255,255,.18);border-radius:18px;background:rgba(255,255,255,.08);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);padding:22px;display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:space-between}
.srv-cta h2{margin:0 0 6px;font-size:24px}
.srv-cta p{margin:0;color:var(--text2)}
.srv-actions{display:flex;flex-wrap:wrap;gap:10px}
.srv-btn{display:inline-flex;align-items:center;justify-content:center;padding:11px 18px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;border:1px solid transparent}
.srv-btn-primary{background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;box-shadow:0 0 24px var(--accent-glow)}
.srv-btn-secondary{background:rgba(255,255,255,.09);color:var(--text);border-color:rgba(255,255,255,.2)}
@media(max-width:700px){.srv-wrap{padding-top:54px}.srv-hero{padding:20px}.srv-cta{padding:18px}}
`;

const defaults = {
  eyebrow: 'Pragni Tech Services',
  title: 'Production-ready digital services for modern teams.',
  subtitle: 'Every block below is admin-editable so you can tune offerings, positioning, and CTA copy without code changes.',
  ctaTitle: 'Need a custom engagement?',
  ctaText: 'We can tailor a service package for your team, growth stage, and budget.',
  ctaPrimaryLabel: 'Talk to our team',
  ctaPrimaryUrl: '/contact',
  ctaSecondaryLabel: 'Explore courses',
  ctaSecondaryUrl: '/courses',
  cards: [
    { title: 'Cloud Security', text: 'Architecture hardening, IAM baselines, and automated posture checks.' },
    { title: 'Web & API Security', text: 'Pentesting, secure SDLC guidance, and vulnerability remediation plans.' },
    { title: 'DevSecOps Setup', text: 'Pipeline security, secrets management, and release gating for safer deployments.' },
    { title: 'Security Training', text: 'Hands-on internal enablement for engineering and operations teams.' },
    { title: 'Incident Readiness', text: 'Runbooks, escalation workflows, and practical response simulations.' },
    { title: 'Compliance Support', text: 'Control mapping and implementation support for required standards.' },
  ],
};

const safeJsonCards = (raw) => {
  if (!raw || typeof raw !== 'string') return null;
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return null;
    const cards = arr
      .map((c) => ({
        title: (c?.title || '').toString().trim().slice(0, 120),
        text: (c?.text || c?.description || '').toString().trim().slice(0, 400),
      }))
      .filter((c) => c.title || c.text)
      .slice(0, 12);
    return cards.length ? cards : null;
  } catch {
    return null;
  }
};

export default function Services() {
  const [content, setContent] = useState({});
  useMeta({
    pageKey: 'services',
    title: 'Services',
    description: 'Pragni Tech services for cloud, application security, training, and DevSecOps.',
    keywords: 'services, cloud security, devsecops, training, pragni tech',
  });

  useEffect(() => {
    const load = () =>
      fetch('/api/site-content', { cache: 'no-store' })
        .then((r) => r.json())
        .then((d) => setContent(d.content || {}))
        .catch(() => {});
    load();
    const onUpdate = () => load();
    window.addEventListener('site-content-updated', onUpdate);
    return () => window.removeEventListener('site-content-updated', onUpdate);
  }, []);

  const cv = (k, fallback = '') => (content[k] || fallback).toString();

  const cards = useMemo(() => {
    const jsonCards = safeJsonCards(content.services_cards_json);
    if (jsonCards) return jsonCards;
    const fromKeys = Array.from({ length: 12 }, (_, i) => {
      const n = i + 1;
      return {
        title: cv(`services_card_${n}_title`, ''),
        text: cv(`services_card_${n}_text`, ''),
      };
    }).filter((c) => c.title || c.text);
    return fromKeys.length ? fromKeys : defaults.cards;
  }, [content]);

  const ActionLink = ({ className, to, children }) => {
    const href = (to || '').toString().trim();
    if (/^https?:\/\//i.test(href)) {
      return <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
    }
    return <Link className={className} to={href || '/'}>{children}</Link>;
  };

  return (
    <div className="srv-page">
      <style>{PAGE_STYLES}</style>
      <div className="srv-bg" style={{ backgroundImage: cv('services_background_image') ? `url(${cv('services_background_image')})` : 'none' }} />
      <div className="srv-overlay" />
      <section className="srv-wrap">
        <div className="srv-hero">
          <span className="srv-eyebrow">{cv('services_eyebrow', defaults.eyebrow)}</span>
          <h1 className="srv-title">{cv('services_title', defaults.title)}</h1>
          <p className="srv-sub">{cv('services_subtitle', defaults.subtitle)}</p>
        </div>

        <div className="srv-grid">
          {cards.map((card, i) => (
            <article key={`${card.title}-${i}`} className="srv-card">
              <h3>{card.title || `Service ${i + 1}`}</h3>
              <p>{card.text || 'Details available on request.'}</p>
            </article>
          ))}
        </div>

        <div className="srv-cta">
          <div>
            <h2>{cv('services_cta_title', defaults.ctaTitle)}</h2>
            <p>{cv('services_cta_text', defaults.ctaText)}</p>
          </div>
          <div className="srv-actions">
            <ActionLink className="srv-btn srv-btn-primary" to={cv('services_cta_primary_url', defaults.ctaPrimaryUrl)}>
              {cv('services_cta_primary_label', defaults.ctaPrimaryLabel)}
            </ActionLink>
            <ActionLink className="srv-btn srv-btn-secondary" to={cv('services_cta_secondary_url', defaults.ctaSecondaryUrl)}>
              {cv('services_cta_secondary_label', defaults.ctaSecondaryLabel)}
            </ActionLink>
          </div>
        </div>
      </section>
    </div>
  );
}
