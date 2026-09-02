export async function loader({context}) {
  const {storefront} = context;

  const collections = ['gorras-truckers', 'chaquetas', 'camisetas'];
  const urls = [{loc: 'https://ranch.com.co/'}];

  for (const handle of collections) {
    urls.push({loc: `https://ranch.com.co/collections/${handle}`});
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
        urls.push({loc: `https://ranch.com.co/products/${p.handle}`});
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
