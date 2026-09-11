import {json} from '@shopify/remix-oxygen';

/**
 * /.well-known/apple-app-site-association
 * Declara a iOS que ranch.com.co NO tiene app nativa asociada,
 * para que los enlaces se abran directo en el navegador (sin pedir permiso).
 */
export async function loader() {
  return json(
    {
      applinks: {
        apps: [],
        details: [],
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    },
  );
}
