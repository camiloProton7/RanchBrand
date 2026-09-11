import {json} from '@shopify/remix-oxygen';

/**
 * /.well-known/assetlinks.json
 * Declara a Android que ranch.com.co NO tiene app nativa asociada,
 * para que los enlaces se abran directo en el navegador.
 */
export async function loader() {
  return json([], {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
