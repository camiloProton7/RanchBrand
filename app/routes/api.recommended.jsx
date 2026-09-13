/**
 * Endpoint de cross-sell → devuelve productos recomendados para el carrito.
 * GET /api/recommended
 * Devuelve { products: [{variantId, title, handle, price, image}] }
 */

export async function loader({context}) {
  const {storefront} = context;
  try {
    const data = await storefront.query(
      `#graphql
      query Recommended {
        r0: product(handle: "gorra-redwood") {
          id title handle availableForSale
          featuredImage { url }
          priceRange { minVariantPrice { amount currencyCode } }
          variants(first: 1) { nodes { id } }
        }
        r1: product(handle: "gorra-andina") {
          id title handle availableForSale
          featuredImage { url }
          priceRange { minVariantPrice { amount currencyCode } }
          variants(first: 1) { nodes { id } }
        }
        r2: product(handle: "chaqueta-ganadera-gamuza") {
          id title handle availableForSale
          featuredImage { url }
          priceRange { minVariantPrice { amount currencyCode } }
          variants(first: 1) { nodes { id } }
        }
        r3: product(handle: "saco-bordado-rebano") {
          id title handle availableForSale
          featuredImage { url }
          priceRange { minVariantPrice { amount currencyCode } }
          variants(first: 1) { nodes { id } }
        }
        r4: product(handle: "gorra-goat") {
          id title handle availableForSale
          featuredImage { url }
          priceRange { minVariantPrice { amount currencyCode } }
          variants(first: 1) { nodes { id } }
        }
        r5: product(handle: "termo-digital-the-ranch") {
          id title handle availableForSale
          featuredImage { url }
          priceRange { minVariantPrice { amount currencyCode } }
          variants(first: 1) { nodes { id } }
        }
      }`,
    );

    const keys = ['r0', 'r1', 'r2', 'r3', 'r4', 'r5'];
    const products = keys
      .map((k) => data?.[k])
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
