const BASE = 'https://ranch.com.co';

/**
 * Sitemap de la tienda.
 *
 * Usa las URLs limpias (/, /collections/, /products/), que son las que declara
 * el canonical de cada pagina. Al publicar el diseno nuevo, esas rutas deben
 * servir las paginas nuevas y / debe redirigir con 301 aqui.
 */
export async function loader({context}) {
  const {storefront} = context;

  const collections = ['gorras', 'chaquetas', 'camisetas', 'botas-1'];
  const urls = [{loc: `${BASE}/`}, {loc: `${BASE}/combo-gorras`}];
  const vistos = new Set();

  for (const handle of collections) {
    urls.push({loc: `${BASE}/collections/${handle}`});
    try {
      const data = await storefront.query(
        `#graphql
        query CollectionProducts($handle: String!) {
          collection(handle: $handle) {
            products(first: 100) {
              nodes { handle }
            }
          }
        }`,
        {variables: {handle}},
      );
      (data?.collection?.products?.nodes || []).forEach((p) => {
        if (!p?.handle || vistos.has(p.handle)) return;
        vistos.add(p.handle);
        urls.push({loc: `${BASE}/products/${p.handle}`});
      });
    } catch (error) {
      console.error(`Sitemap ${handle} falló`, error);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc></url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=3600',
    },
  });
}
