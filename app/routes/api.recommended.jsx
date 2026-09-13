/**
 * Endpoint de cross-sell → devuelve productos recomendados para el carrito.
 * GET /api/recommended
 * Devuelve { products: [{variantId, title, handle, price, image}] }
 */

const RECOMMENDED_HANDLES = [
  'gorra-redwood',
  'gorra-andina',
  'chaqueta-ganadera-gamuza',
  'saco-bordado-rebano',
  'gorra-goat',
  'termo-digital-the-ranch',
];

const PRODUCT_FIELDS = `
  id
  title
  handle
  availableForSale
  featuredImage { url }
  priceRange { minVariantPrice { amount currencyCode } }
  variants(first: 1) { nodes { id } }
`;

export async function loader({context}) {
  const {storefront} = context;
  try {
    const aliases = RECOMMENDED_HANDLES.map(
      (h, i) => `r${i}: product(handle: "${h}") { ${PRODUCT_FIELDS} }`,
    ).join('\n');

    const data = await storefront.query(
      `#graphql
      query Recommended {
        ${aliases}
      }`,
    );

    const products = RECOMMENDED_HANDLES.map((_, i) => data?.[`r${i}`])
      .filter((p) => p && p.availableForSale && p.featuredImage?.url)
      .map((p) => ({
        variantId: p.variants?.nodes?.[0]?.id || p.id,
        title: p.title,
        handle: p.handle,
        price: p.priceRange?.minVariantPrice?.amount,
        image: p.featuredImage?.url,
      }))
      .slice(0, 4);

    return new Response(JSON.stringify({products}), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    console.error('api.recommended error', err);
    return new Response(JSON.stringify({products: []}), {
      headers: {'Content-Type': 'application/json'},
    });
  }
}
