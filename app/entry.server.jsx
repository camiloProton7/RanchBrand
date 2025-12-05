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
     🛡️ REGLAS DE SEGURIDAD MANUALES (SOLO META Y SHOPIFY)
     Definimos cada regla explícitamente para evitar bloqueos.
     ============================================================ */
  const cspHeader = [
    `default-src 'self' https://cdn.shopify.com https://shopify.com`,
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com https://shopify.com https://connect.facebook.net https://www.facebook.com 'nonce-${nonce}'`,
    `style-src 'self' 'unsafe-inline' https://cdn.shopify.com`,
    `img-src 'self' data: https:`, // Permite imágenes de cualquier sitio HTTPS (necesario para Pixel)
    `connect-src 'self' https://monorail-edge.shopifysvc.com https://connect.facebook.net https://www.facebook.com`,
    `frame-src 'self' https://www.facebook.com`
  ].join('; ');

  responseHeaders.set('Content-Security-Policy', cspHeader);
  /* ============================================================ */

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}