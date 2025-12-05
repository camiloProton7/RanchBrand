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
     🛡️ ZONA DE SEGURIDAD BLINDADA (CSP)
     Aquí agregamos 'unsafe-eval' que es lo que pide el error rojo.
     ============================================================ */
  
  // 1. Definimos las reglas para scripts (JS)
  const scriptsRules = [
    "'self'",
    "'unsafe-inline'",  // Necesario para Pixel
    "'unsafe-eval'",    // EL QUE TE FALTABA
    "https://cdn.shopify.com",
    "https://shopify.com",
    "https://connect.facebook.net",
    "https://www.facebook.com",
    "https://www.google-analytics.com",
    "https://*.google.com", 
    "https://*.googleadservices.com",
    "https://*.googletagmanager.com",
    `'nonce-${nonce}'`
  ].join(" ");

  // 2. Definimos reglas para conexiones de datos
  const connectRules = [
    "'self'",
    "https://monorail-edge.shopifysvc.com",
    "https://connect.facebook.net",
    "https://www.facebook.com",
    "https://googleads.g.doubleclick.net",
    "https://*.google-analytics.com",
    "https://*.google.com"
  ].join(" ");

  // 3. Modificamos el encabezado de seguridad
  let newHeader = header;

  // Reemplazamos o agregamos script-src
  if (newHeader.includes("script-src")) {
    newHeader = newHeader.replace("script-src", `script-src ${scriptsRules}`);
  } else {
    newHeader += `; script-src ${scriptsRules}`;
  }

  // Reemplazamos o agregamos connect-src
  if (newHeader.includes("connect-src")) {
    newHeader = newHeader.replace("connect-src", `connect-src ${connectRules}`);
  } else {
    newHeader += `; connect-src ${connectRules}`;
  }

  // Permitir imágenes de Pixel (1x1)
  newHeader = newHeader.replace("img-src", "img-src 'self' data: https: ");

  // Aplicar el nuevo encabezado permisivo
  responseHeaders.set('Content-Security-Policy', newHeader);
  /* ============================================================ */

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}