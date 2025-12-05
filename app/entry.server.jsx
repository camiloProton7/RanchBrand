import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';

export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  reactRouterContext,
  context,
) {
  // Generamos el nonce para los scripts internos
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
        nonce={nonce}
      />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');

  /* ============================================================
     🛡️ REGLAS DE SEGURIDAD MANUALES (Nuclear Option)
     Ignoramos la regla por defecto y construimos una propia que
     SÍ O SÍ incluye a Facebook y 'unsafe-eval'.
     ============================================================ */
  
  const customHeader = [
    // Permitir recursos generales de Shopify y Google
    `default-src 'self' https://cdn.shopify.com https://shopify.com https://*.google.com`,
    
    // REGLA CRÍTICA: script-src
    // Agregamos 'unsafe-eval' y TODOS los dominios de publicidad (FB, Google Ads, Analytics)
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com https://shopify.com https://connect.facebook.net https://www.facebook.com https://*.google.com https://*.google-analytics.com https://*.googleadservices.com https://*.doubleclick.net https://*.googletagmanager.com 'nonce-${nonce}'`,
    
    // Estilos
    `style-src 'self' 'unsafe-inline' https://cdn.shopify.com`,
    
    // Imágenes (incluye data: para pixels de 1x1)
    `img-src 'self' data: https:`,
    
    // Fuentes
    `font-src 'self' data: https:`,
    
    // Conexiones (A dónde se envían los datos)
    `connect-src 'self' https://monorail-edge.shopifysvc.com https://connect.facebook.net https://www.facebook.com https://*.google.com https://*.google-analytics.com https://*.doubleclick.net`,
    
    // Iframes
    `frame-src 'self' https://www.facebook.com https://*.google.com`
  ].join('; ');

  // ¡AQUÍ ESTÁ LA CLAVE! Sobrescribimos la seguridad con nuestras reglas
  responseHeaders.set('Content-Security-Policy', customHeader);
  /* ============================================================ */

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}