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
     🛡️ ZONA DE SEGURIDAD BLINDADA (Facebook & Google)
     Aquí construimos la regla manualmente para evitar bloqueos.
     ============================================================ */
  const allowedScripts = [
    "'self'",
    "https://cdn.shopify.com",
    "https://shopify.com",
    "https://connect.facebook.net",
    "https://www.facebook.com",
    "https://www.google-analytics.com",
    "https://*.google.com", 
    "https://*.googleadservices.com",
    "https://*.googletagmanager.com",
    `'nonce-${nonce}'`, // Importante: Permitir scripts internos de Hydrogen
    "'unsafe-eval'",    // Necesario para Pixel
    "'unsafe-inline'"   // Necesario para Pixel
  ].join(" ");

  const allowedConnect = [
    "'self'",
    "https://monorail-edge.shopifysvc.com",
    "https://connect.facebook.net",
    "https://www.facebook.com",
    "https://googleads.g.doubleclick.net",
    "https://*.google-analytics.com",
    "https://*.google.com"
  ].join(" ");

  // Sobrescribimos el encabezado completamente para asegurar que nuestras reglas mandan
  const newHeader = header
    // Aseguramos que script-src existe y tiene nuestros dominios
    .replace("script-src", "script-src_OLD") // Quitamos la vieja si existe
    .replace("connect-src", "connect-src_OLD") 
    + `; script-src ${allowedScripts}; connect-src ${allowedConnect}; img-src 'self' data: https:; frame-src 'self' https:;`;

  responseHeaders.set('Content-Security-Policy', newHeader);
  /* ============================================================ */

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}