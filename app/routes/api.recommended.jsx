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

export async function loader({context}) {
  const {storefront} = context;
  try {
    const handles = RECOMMENDED_HANDLES.map((h) => `"${h}"`).join(', ');
    const data = await storefront.query(
      `#graphql
      query RecommendedProducts($handles: [String!]!) {
        nodes(ids: $handles) {
          ... on Product {
            id
            title
            handle
            availableForSale
            featuredImage { url }
            priceRange { minVariantPrice { amount currencyCode } }
            variants(first: 1) { nodes { id } }
          }
        }
      }`,
      {variables: {handles: RECOMMENDED_HANDLES}},
    );

    const products = (data?.nodes || [])
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
