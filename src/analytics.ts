declare global {
  interface Window {
    // gtag queue before/after the library loads (Arguments objects or command arrays)
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() || '';

function loadGtag(id: string): void {
  if (document.querySelector(`script[data-ga="${id}"]`)) return;

  // Match Google's official snippet: queue with `arguments`, then load gtag.js.
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(this: void) {
    // Intentional: gtag.js expects the Arguments object on the queue.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());

  const debug =
    typeof location !== 'undefined' &&
    new URLSearchParams(location.search).has('ga_debug');

  window.gtag('config', id, {
    anonymize_ip: true,
    ...(debug ? { debug_mode: true } : {}),
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  script.dataset.ga = id;
  document.head.appendChild(script);
}

export function trackEvent(name: string, params?: Record<string, string | number | boolean>): void {
  if (!MEASUREMENT_ID || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}

function observeSectionOnce(selector: string, eventName: string): void {
  const el = document.querySelector(selector);
  if (!el) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        trackEvent(eventName, { section: selector });
        observer.disconnect();
        break;
      }
    },
    { threshold: 0.35 },
  );
  observer.observe(el);
}

/** Loads GA4 when `VITE_GA_MEASUREMENT_ID` is set; no-ops otherwise. */
export function initAnalytics(): void {
  if (!MEASUREMENT_ID) return;

  loadGtag(MEASUREMENT_ID);

  for (const el of document.querySelectorAll<HTMLAnchorElement>('[data-play]')) {
    el.addEventListener('click', () => {
      trackEvent('play_store_click', { link_url: el.href });
    });
  }

  observeSectionOnce('#access', 'scroll_to_access');
  observeSectionOnce('#faq', 'scroll_to_faq');
}
