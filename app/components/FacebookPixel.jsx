import {useEffect} from 'react';
import {useLocation} from 'react-router';

// TU ID REAL (Ya limpio y configurado)
const PIXEL_ID = '377899794811334'; 

export default function FacebookPixel() {
  const location = useLocation();

  useEffect(() => {
    // 1. Validación simple: Si no hay ID, salir y avisar en consola.
    if (!PIXEL_ID) {
        console.error("❌ Error: PIXEL_ID no está definido en FacebookPixel.jsx");
        return;
    }

    // 2. Inicializar Facebook Pixel (Solo si no existe ya)
    if (!window.fbq) {
      console.log("🔵 Iniciando Pixel de Meta:", PIXEL_ID);
      
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      
      window.fbq('init', PIXEL_ID);

      // Desactivar SOLO la "configuración automática" de Meta (autoConfig).
      //
      // Por qué: Meta escanea el DOM buscando precios para adivinar la moneda.
      // Nuestros precios usan formato colombiano ("$185.000"), eso lo confunde,
      // deriva una moneda inválida y ensucia la consola con
      // "Invalid parameter format for currency". Además sus endpoints de eventos
      // automáticos (run.app / on.aws) están bloqueados por nuestra CSP, así que
      // no aportaban nada: solo generaban 4 errores de consola por página.
      //
      // OJO: esto NO apaga nada nuestro. Todos los eventos reales (PageView,
      // ViewContent, AddToCart, InitiateCheckout, Purchase) siguen enviándose
      // manualmente con currency 'COP' y verificados como válidos.
      window.fbq('set', 'autoConfig', false, PIXEL_ID);
    }
  }, []);

  // 3. Rastreo de navegación (PageView) con clave de deduplicación.
  useEffect(() => {
    if (window.fbq && PIXEL_ID) {
      window.fbq(
        'track',
        'PageView',
        {},
        {
          eventID:
            'tr_pv_' +
            Date.now().toString(36) +
            '_' +
            Math.random().toString(36).slice(2, 10),
        },
      );
    }
  }, [location]);

  return null;
}