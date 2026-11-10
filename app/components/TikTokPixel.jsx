import {useEffect} from 'react';
import {useLocation} from 'react-router';

// Pixel de TikTok del negocio (Ads Manager → Activos → Eventos).
const PIXEL_ID = 'CN6H58BC77U606BMCVUG';

/**
 * Envía un evento al pixel de TikTok.
 * Si el pixel todavía no cargó, no hace nada: nunca rompe la página.
 */
export function ttqTrack(evento, datos = {}) {
  try {
    if (typeof window === 'undefined') return;
    const t = window.ttq;
    if (!t) return;
    if (typeof t.track === 'function') t.track(evento, datos);
    else if (Array.isArray(t)) t.push(['track', evento, datos]);
  } catch {
    /* sin pixel: no pasa nada */
  }
}

/**
 * Manda el teléfono (y correo, si lo hay) hasheados para Advanced Matching.
 * TikTok los cruza con su base y sube el porcentaje de eventos atribuidos.
 */
export async function ttqIdentify({email, phone} = {}) {
  try {
    if (typeof window === 'undefined' || !window.ttq) return;
    const limpio = String(phone || '').replace(/\D/g, '');
    if (limpio.length < 10) return;
    const e164 = limpio.length === 10 ? `57${limpio}` : limpio;
    if (window.__ttqIdent === e164) return; // no repetir en cada tecla
    const hex = async (txt) => {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt.trim().toLowerCase()));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    };
    const datos = {phone_number: [await hex(`+${e164}`)]};
    if (email) datos.email = [await hex(email)];
    window.__ttqIdent = e164;
    if (typeof window.ttq.identify === 'function') window.ttq.identify(datos);
    else if (Array.isArray(window.ttq)) window.ttq.push(['identify', datos]);
  } catch {
    /* sin pixel: no pasa nada */
  }
}

export default function TikTokPixel() {
  const location = useLocation();

  useEffect(() => {
    if (!PIXEL_ID) {
      console.error('TikTokPixel: falta el PIXEL_ID');
      return;
    }
    if (window.ttq && window.ttq._i && window.ttq._i[PIXEL_ID]) return;

    const arrancar = () => {
      // una sola carga aunque StrictMode monte dos veces o el evento load
      // llegue junto con el temporizador de seguridad
      if (window.__ttqIniciado) return;
      window.__ttqIniciado = true;
      if (!window.ttq) {
        /* eslint-disable */
        (function (w, d, t) {
          w.TiktokAnalyticsObject = t;
          var ttq = (w[t] = w[t] || []);
          ttq.methods = [
            'page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once',
            'ready', 'alias', 'group', 'enableCookie', 'disableCookie',
            'holdConsent', 'revokeConsent', 'grantConsent',
          ];
          ttq.setAndDefer = function (t, e) {
            t[e] = function () {
              t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
            };
          };
          for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
          ttq.instance = function (t) {
            for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
            return e;
          };
          ttq.load = function (e, n) {
            var r = 'https://analytics.tiktok.com/i18n/pixel/events.js';
            var o = n && n.partner;
            ttq._i = ttq._i || {};
            ttq._i[e] = [];
            ttq._i[e]._u = r;
            ttq._t = ttq._t || {};
            ttq._t[e] = +new Date();
            ttq._o = ttq._o || {};
            ttq._o[e] = n || {};
            n = document.createElement('script');
            n.type = 'text/javascript';
            n.async = true;
            n.src = r + '?sdkid=' + e + '&lib=' + t;
            e = document.getElementsByTagName('script')[0];
            e.parentNode.insertBefore(n, e);
          };
        })(window, document, 'ttq');
        /* eslint-enable */
      }

      window.ttq.load(PIXEL_ID);
      window.ttq.page();
    };

    // Igual que el pixel de Meta: no compite con la foto del hero.
    const diferir = () => {
      if ('requestIdleCallback' in window) window.requestIdleCallback(arrancar, {timeout: 6000});
      else window.setTimeout(arrancar, 2500);
    };

    if (document.readyState === 'complete') diferir();
    else {
      window.addEventListener('load', diferir, {once: true});
      window.setTimeout(diferir, 8000);
    }
  }, []);

  // Navegación interna de Hydrogen: TikTok necesita el page() en cada ruta.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ttq) return;
    const enviar = () => {
      try {
        if (window.ttq && typeof window.ttq.page === 'function') window.ttq.page();
      } catch {
        /* nada */
      }
    };
    enviar();
    // si el pixel aún no cargó, un par de intentos cortos
    const reloj = window.setInterval(enviar, 400);
    const corte = window.setTimeout(() => window.clearInterval(reloj), 4000);
    return () => {
      window.clearInterval(reloj);
      window.clearTimeout(corte);
    };
  }, [location.pathname]);

  return null;
}
