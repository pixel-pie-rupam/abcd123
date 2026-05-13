import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

const SeoContext = createContext({});

// No module-level cache — all cache lives in context state so it
// can be invalidated and re-fetched cleanly.
const SEO_CACHE_TTL_MS = 60 * 1000; // 1 minute TTL

export function SeoProvider({ children }) {
  const [seo, setSeo]         = useState(null);
  const [contact, setContact] = useState(null);
  const seoFetchedAt          = useRef(0);
  const contactFetchedAt      = useRef(0);
  const seoLoading            = useRef(false);
  const contactLoading        = useRef(false);

  const fetchSeo = useCallback((force = false) => {
    const now = Date.now();
    // Respect TTL unless forced
    if (!force && seoFetchedAt.current && now - seoFetchedAt.current < SEO_CACHE_TTL_MS) return;
    if (seoLoading.current) return;
    seoLoading.current = true;

    fetch('/api/seo/meta', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        const data = d.seo || {};
        seoFetchedAt.current = Date.now();
        setSeo(data);

        // Google Analytics
        const gaId = data.googleAnalyticsId;
        if (gaId && !document.getElementById('ga-script')) {
          const s1 = document.createElement('script');
          s1.id = 'ga-script'; s1.async = true;
          s1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
          document.head.appendChild(s1);
          const s2 = document.createElement('script');
          s2.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`;
          document.head.appendChild(s2);
        }

        // Favicon
        if (data.faviconUrl) {
          let link = document.querySelector("link[rel~='icon']");
          if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
          link.href = data.faviconUrl;
        }

        // Schema.org JSON-LD
        if (data.schemaOrg) {
          const existing = document.getElementById('schema-org');
          const el = existing || document.createElement('script');
          el.id = 'schema-org'; el.type = 'application/ld+json';
          try { el.textContent = data.schemaOrg; if (!existing) document.head.appendChild(el); } catch {}
        }
      })
      .catch(() => {})
      .finally(() => { seoLoading.current = false; });
  }, []);

  const fetchContact = useCallback((force = false) => {
    const now = Date.now();
    if (!force && contactFetchedAt.current && now - contactFetchedAt.current < SEO_CACHE_TTL_MS) return;
    if (contactLoading.current) return;
    contactLoading.current = true;

    fetch('/api/contact/public', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        contactFetchedAt.current = Date.now();
        setContact(d.contact || {});
      })
      .catch(() => {})
      .finally(() => { contactLoading.current = false; });
  }, []);

  // Initial load
  useEffect(() => {
    fetchSeo();
    fetchContact();
  }, [fetchSeo, fetchContact]);

  // Listen for admin save events to bust cache and re-fetch
  useEffect(() => {
    const onSeoUpdate     = () => { seoFetchedAt.current = 0; fetchSeo(true); };
    const onContactUpdate = () => { contactFetchedAt.current = 0; fetchContact(true); };

    window.addEventListener('seo-updated',     onSeoUpdate);
    window.addEventListener('contact-updated', onContactUpdate);
    // Logo update can trigger a settings refresh
    window.addEventListener('logo-updated',    onSeoUpdate);

    return () => {
      window.removeEventListener('seo-updated',     onSeoUpdate);
      window.removeEventListener('contact-updated', onContactUpdate);
      window.removeEventListener('logo-updated',    onSeoUpdate);
    };
  }, [fetchSeo, fetchContact]);

  return (
    <SeoContext.Provider value={{ seo, contact, refreshSeo: fetchSeo, refreshContact: fetchContact }}>
      {children}
    </SeoContext.Provider>
  );
}

export const useSeo = () => useContext(SeoContext);

// ── useMeta hook — call in every page component ─────────────────────
export function useMeta({ pageKey, title, description, keywords, ogImage } = {}) {
  const { seo } = useContext(SeoContext);

  useEffect(() => {
    // Use safe defaults even when seo is null (not yet loaded)
    const safeSeo = seo || {};
    const overrides = (() => { try { return JSON.parse(safeSeo.pageOverrides || '{}'); } catch { return {}; } })();
    const pg = overrides[pageKey] || {};

    // ── FIX: always have a fallback siteName so title never vanishes ──
    const siteName   = safeSeo.siteName || 'Pragni';
    const finalTitle = pg.title || (title ? `${title} · ${siteName}` : siteName);
    const finalDesc  = pg.description || description || safeSeo.siteDescription || '';
    const finalKw    = pg.keywords || keywords || safeSeo.siteKeywords || '';
    const finalImg   = ogImage || safeSeo.defaultOgImage || '';
    const canonical  = safeSeo.canonicalUrl || '';

    // Always update document.title — even before seo loads, use the passed title
    document.title = finalTitle;

    const setMeta = (sel, attr, val) => {
      if (!val) return;
      let el = document.querySelector(sel);
      if (!el) { el = document.createElement('meta'); document.head.appendChild(el); }
      el.setAttribute(attr, val);
    };
    const setMetaName = (name, val) => setMeta(`meta[name="${name}"]`,     'content', val);
    const setMetaProp = (prop, val) => setMeta(`meta[property="${prop}"]`, 'content', val);
    const setLinkRel  = (rel, val)  => {
      if (!val) return;
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) { el = document.createElement('link'); el.rel = rel; document.head.appendChild(el); }
      el.href = val;
    };

    if (finalDesc) setMetaName('description', finalDesc);
    if (finalKw)   setMetaName('keywords',    finalKw);
    setMetaName('robots', 'index, follow');
    setMetaName('author', siteName);

    setMetaProp('og:title',       finalTitle);
    if (finalDesc) setMetaProp('og:description', finalDesc);
    if (finalImg)  setMetaProp('og:image',       finalImg);
    setMetaProp('og:type',        safeSeo.ogType || 'website');
    setMetaProp('og:site_name',   siteName);
    if (canonical) setMetaProp('og:url', canonical + window.location.pathname);

    setMetaName('twitter:card',        'summary_large_image');
    setMetaName('twitter:title',       finalTitle);
    if (finalDesc) setMetaName('twitter:description', finalDesc);
    if (finalImg)  setMetaName('twitter:image',       finalImg);
    if (safeSeo.twitterHandle) setMetaName('twitter:site', safeSeo.twitterHandle);

    if (canonical) setLinkRel('canonical', canonical + window.location.pathname);
    if (safeSeo.googleVerification) setMetaName('google-site-verification', safeSeo.googleVerification);
    if (safeSeo.bingVerification)   setMetaName('msvalidate.01',            safeSeo.bingVerification);

  }, [seo, pageKey, title, description, keywords, ogImage]);
}
