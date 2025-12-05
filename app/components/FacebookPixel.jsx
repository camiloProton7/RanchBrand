import {useEffect} from 'react';
import {useLocation} from 'react-router';

/* ======================================================
   ⚠️ ATENCIÓN: BORRA LOS CEROS Y PON TU ID REAL AQUÍ
   Ejemplo: const PIXEL_ID = '148294728123';
   ====================================================== */
const PIXEL_ID = '377899794811334⁠'; 

export default function FacebookPixel() {
  const location = useLocation();

  useEffect(() => {
    // Si no hay ID, no hacemos nada (evita errores de 'null')
    if (!PIXEL_ID || PIXEL_ID === '377899794811334⁠') {
        console.error("❌ ERROR: Falta configurar el PIXEL_ID en FacebookPixel.jsx");
        return;
    }

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
    }
  }, []);

  useEffect(() => {
    if (window.fbq && PIXEL_ID) {
      window.fbq('track', 'PageView');
    }
  }, [location]);

  return null;
}