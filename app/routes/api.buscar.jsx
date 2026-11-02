/**
 * Búsqueda predictiva.
 *
 * Devuelve JSON para que el panel de búsqueda responda sin recargar la página.
 * Shopify hace el trabajo de relevancia; aquí solo se normaliza la salida.
 */
const BUSCAR = `#graphql
  query Buscar($q: String!) {
    predictiveSearch(
      query: $q
      limit: 8
      types: [PRODUCT, COLLECTION]
      unavailableProducts: LAST
    ) {
      products {
        id
        title
        handle
        vendor
        productType
        featuredImage {
          url
          altText
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        compareAtPriceRange {
          minVariantPrice {
            amount
          }
        }
      }
      collections {
        id
        title
        handle
      }
    }
  }
`;

const fmt = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

function foto(url, ancho = 160) {
  if (!url) return '';
  const base = url.split('?')[0];
  return `${base}?width=${ancho}&format=webp`;
}

export async function loader({request, context}) {
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();

  if (q.length < 2) {
    return Response.json({productos: [], colecciones: [], consulta: q});
  }

  try {
    const data = await context.storefront.query(BUSCAR, {
      variables: {q},
      cache: context.storefront.CacheShort(),
    });

    const ps = data?.predictiveSearch;

    const productos = (ps?.products || []).map((p) => {
      const precio = Number(p.priceRange?.minVariantPrice?.amount || 0);
      const antes = Number(p.compareAtPriceRange?.minVariantPrice?.amount || 0);
      return {
        id: p.id,
        titulo: p.title,
        handle: p.handle,
        img: foto(p.featuredImage?.url),
        precio: fmt.format(precio),
        antes: antes > 0 && antes !== precio ? fmt.format(antes) : null,
      };
    });

    const colecciones = (ps?.collections || []).map((c) => ({
      titulo: c.title,
      handle: c.handle,
    }));

    return Response.json(
      {productos, colecciones, consulta: q},
      {headers: {'Cache-Control': 'public, max-age=60'}},
    );
  } catch (error) {
    return Response.json({productos: [], colecciones: [], consulta: q, error: true});
  }
}
