import {useEffect} from 'react';
import {useLocation} from 'react-router';

// ID de medición de Google Analytics 4 (GA4). Formato: G-XXXXXXXXXX
// Se configura en la variable de entorno PUBLIC_GA4_ID (Vercel/Oxygen).
const GA4_ID = (import.meta.env?.PUBLIC_GA4_ID || '').trim();

export default function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    if (!GA4_ID || typeof window === 'undefined') return;

    const scriptId = 'ga4-gtag';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
      document.head.appendChild(script);
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function gtag() {
        window.dataLayer.push(arguments);
      };
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID, {send_page_view: false});
  }, []);

  // PageView en cada navegación.
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag && GA4_ID) {
      window.gtag('config', GA4_ID, {
        page_path: location.pathname + location.search,
        page_title: document.title,
      });
    }
  }, [location, GA4_ID]);

  return null;
}
