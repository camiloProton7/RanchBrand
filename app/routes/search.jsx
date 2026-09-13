import {Link, useLoaderData} from 'react-router';
import {formatPrice} from '~/lib/cart';
import searchStyles from '~/styles/search.css?url';

export const meta = ({data}) => [
  {title: data?.query ? `Buscar: ${data.query} — The Ranch` : 'Buscar — The Ranch'},
];

export function links() {
  return [{rel: 'stylesheet', href: searchStyles}];
}

const SEARCH_QUERY = `#graphql
  query SearchProducts($query: String!) {
    search(first: 24, query: $query, types: PRODUCT) {
      nodes {
        ... on Product {
          id
          title
          handle
          availableForSale
          featuredImage {
            url(transform: {maxWidth: 500, preferredContentType: WEBP})
          }
          priceRange { minVariantPrice { amount currencyCode } }
          compareAtPriceRange { minVariantPrice { amount } }
        }
      }
    }
  }
`;

export async function loader({request, context}) {
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();
  const {storefront} = context;

  if (!q) {
    return {query: '', products: []};
  }

  try {
    const data = await storefront.query(SEARCH_QUERY, {
      variables: {query: `title:*${q}*`},
      cache: storefront.CacheShort(),
    });
    const products = (data?.search?.nodes || []).filter((p) => p && p.availableForSale);
    return {query: q, products};
  } catch (error) {
    console.error('search error', error);
    return {query: q, products: []};
  }
}

export default function SearchPage() {
  const {query, products} = useLoaderData();

  return (
    <main className="trs-search">
      <header className="trs-head">
        <h1 className="trs-title">
          {query ? (
            <>
              Resultados para <em>"{query}"</em>
            </>
          ) : (
            'Buscar productos'
          )}
        </h1>
        <form className="trs-form" action="/search" method="get" role="search">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Buscar gorras, botas, chaquetas…"
            aria-label="Buscar productos"
            autoFocus
          />
          <button type="submit">Buscar</button>
        </form>
      </header>

      {query && products.length === 0 ? (
        <p className="trs-empty">
          No encontramos resultados para "{query}". Prueba con otra palabra (ej. "gorra",
          "bota", "chaqueta").
        </p>
      ) : null}

      <section className="trs-grid" aria-label="Resultados">
        {products.map((p) => {
          const price = Number(p.priceRange?.minVariantPrice?.amount) || 0;
          const compare = Number(p.compareAtPriceRange?.minVariantPrice?.amount) || 0;
          const hasDiscount = compare > price;
          return (
            <Link key={p.id} to={`/products/${p.handle}`} className="trs-card">
              {p.featuredImage?.url ? (
                <img className="trs-img" src={p.featuredImage.url} alt={p.title} loading="lazy" />
              ) : null}
              <div className="trs-info">
                <h2 className="trs-name">{p.title}</h2>
                <div className="trs-price">
                  {hasDiscount ? <s>{formatPrice(compare)}</s> : null}
                  <strong>{formatPrice(price)}</strong>
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
