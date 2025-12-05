import {useEffect} from 'react';
import {useLocation} from 'react-router';

/* =========================================
   👇 PON TU ID DE PIXEL AQUÍ ABAJO
   ========================================= */
const PIXEL_ID = '377899794811334⁠⁠'; 

export default function FacebookPixel() {
  const location = useLocation();

  useEffect(() => {
    // 1. Cargar el script de Facebook (solo si no existe ya)
    if (!window.fbq) {
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      
      // 2. Inicializar con tu ID
      window.fbq('init', PIXEL_ID);
    }
  }, []);

  useEffect(() => {
    // 3. Rastrea cada vez que el usuario cambia de página (Navegación SPA)
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [location]);

  return null; // Este componente no pinta nada en la pantalla, es invisible
}