import {Link, useLoaderData} from 'react-router';
import {formatPrice} from '~/lib/cart';
import {optimizeImage, imageSrcSet} from '~/lib/image';
import searchStyles from '~/styles/search.css?url';

export const meta = ({data}) => [
  {title: data?.query ? `Buscar: ${data.query} — The Ranch` : 'Buscar — The Ranch'},
];

export function links() {
  return [{rel: 'stylesheet', href: searchStyles}];
}

const SEARCH_QUERY = `#graphql
  query SearchProducts($query: String!, $first: Int!) {
    search(
      first: $first
      query: $query
      types: PRODUCT
      sortKey: RELEVANCE
      unavailableProducts: LAST
    ) {
      totalCount
      nodes {
        ... on Product {
          id
          title
          handle
          availableForSale
          featuredImage { url }
          priceRange { minVariantPrice { amount currencyCode } }
          compareAtPriceRange { minVariantPrice { amount } }
        }
      }
    }
  }
`;

const SUGGESTIONS_QUERY = `#graphql
  query BestSellers($first: Int!) {
    products(first: $first, sortKey: BEST_SELLING) {
      nodes {
        id
        title
        handle
        availableForSale
        featuredImage { url }
        priceRange { minVariantPrice { amount } }
        compareAtPriceRange { minVariantPrice { amount } }
      }
    }
  }
`;

// Palabras que llevan a una colección concreta.
const CATEGORIAS = [
  {re: /gorr|trucker|cap/i, label: 'Ver todas las gorras', to: '/collections/gorras'},
  {re: /botas?|calzado/i, label: 'Ver todas las botas', to: '/collections/botas-1'},
  {re: /camisas?|camisetas?|polo|outdoor/i, label: 'Ver camisas y camisetas', to: '/collections/camisetas'},
  {re: /chaquetas?|chalecos?|abrigo/i, label: 'Ver todas las chaquetas', to: '/collections/chaquetas'},
  {re: /sacos?|su[eé]ter|ruana|bordado/i, label: 'Ver sacos bordados', to: '/collections/bordados'},
  {re: /termo|billetera|licorera|accesorio/i, label: 'Ver accesorios', to: '/collections/accesorios'},
];

const SIN_TILDE = (s) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function limpiar(texto) {
  // Shopify entiende comodines y operadores; se quitan para no romper la búsqueda.
  return texto.replace(/[*:()"'\\]/g, ' ').replace(/\s+/g, ' ').trim();
}

function puntaje(titulo, termino) {
  const t = SIN_TILDE(titulo);
  const q = SIN_TILDE(termino);
  if (!q) return 0;
  if (t === q) return 100;
  if (t.startsWith(q)) return 80;
  if (t.includes(q)) return 60;
  const palabras = q.split(' ').filter((w) => w.length > 2);
  const encontradas = palabras.filter((w) => t.includes(w)).length;
  return encontradas * 15;
}

export async function loader({request, context}) {
  const url = new URL(request.url);
  const crudo = (url.searchParams.get('q') || '').trim();
  const q = limpiar(crudo);
  const {storefront} = context;

  if (!q) return {query: '', productos: [], total: 0, sugerencias: [], corregido: null, categorias: []};

  const categorias = CATEGORIAS.filter((c) => c.re.test(q)).map((c) => ({label: c.label, to: c.to}));

  async function buscar(termino) {
    const data = await storefront.query(SEARCH_QUERY, {
      variables: {query: termino, first: 48},
      cache: storefront.CacheShort(),
    });
    return data?.search?.nodes?.filter(Boolean) || [];
  }

  let productos = [];
  let total = 0;
  let corregido = null;
  try {
    const data = await storefront.query(SEARCH_QUERY, {
      variables: {query: q, first: 48},
      cache: storefront.CacheShort(),
    });
    productos = data?.search?.nodes?.filter(Boolean) || [];
    total = data?.search?.totalCount || productos.length;
  } catch (error) {
    console.error('search error', error);
  }

  // Si no hubo nada, se intenta sin tildes y en singular antes de rendirse.
  if (productos.length === 0) {
    const intentos = [SIN_TILDE(q)];
    if (/s$/i.test(q)) intentos.push(q.replace(/s$/i, ''));
    for (const intento of intentos) {
      if (!intento || intento === q) continue;
      try {
        const alt = await buscar(intento);
        if (alt.length) {
          productos = alt;
          total = alt.length;
          corregido = intento;
          break;
        }
      } catch {
        /* sigue con el siguiente intento */
      }
    }
  }

  // Orden: coincidencia en el título primero, luego disponibles antes que agotados.
  const ordenados = productos
    .map((p, i) => ({p, i, s: puntaje(p.title, q) + (p.availableForSale ? 0 : -1)}))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .map(({p}) => p);

  // Sugerencias solo cuando no hay resultados.
  let sugerencias = [];
  if (ordenados.length === 0) {
    try {
      const data = await storefront.query(SUGGESTIONS_QUERY, {
        variables: {first: 8},
        cache: storefront.CacheShort(),
      });
      sugerencias = (data?.products?.nodes || []).filter((p) => p?.availableForSale).slice(0, 8);
    } catch {
      sugerencias = [];
    }
  }

  return {query: crudo, productos: ordenados, total, sugerencias, corregido, categorias};
}

function Tarjeta({p}) {
  const price = Number(p.priceRange?.minVariantPrice?.amount) || 0;
  const compare = Number(p.compareAtPriceRange?.minVariantPrice?.amount) || 0;
  const hasDiscount = compare > price;
  const agotado = p.availableForSale === false;
  return (
    <Link
      to={`/products/${p.handle}`}
      className={`trs-card${agotado ? ' trs-card--agotado' : ''}`}
    >
      {p.featuredImage?.url ? (
        <img
          className="trs-img"
          src={optimizeImage(p.featuredImage.url, 300)}
          srcSet={imageSrcSet(p.featuredImage.url, [200, 300, 480])}
          sizes="(min-width: 1000px) 220px, 45vw"
          alt={p.title}
          loading="lazy"
        />
      ) : null}
      <div className="trs-info">
        <h2 className="trs-name">{p.title}</h2>
        <div className="trs-price">
          {hasDiscount ? <s>{formatPrice(compare)}</s> : null}
          <strong>{formatPrice(price)}</strong>
        </div>
        {agotado ? <span className="trs-tag">Agotado</span> : null}
      </div>
    </Link>
  );
}

export default function SearchPage() {
  const {query, productos, total, sugerencias, corregido, categorias} = useLoaderData();
  const hayBusqueda = Boolean(query);

  return (
    <main className="trs-search">
      <header className="trs-head">
        <h1 className="trs-title">
          {hayBusqueda ? (
            <>
              Resultados para <em>&quot;{query}&quot;</em>
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

        {hayBusqueda && productos.length > 0 ? (
          <p className="trs-count">
            {total > productos.length
              ? `Mostrando ${productos.length} de ${total} resultados`
              : `${productos.length} ${productos.length === 1 ? 'resultado' : 'resultados'}`}
            {corregido ? ` · también buscamos "${corregido}"` : ''}
          </p>
        ) : null}

        {categorias.length > 0 ? (
          <div className="trs-chips">
            {categorias.map((c) => (
              <Link key={c.to} to={c.to} className="trs-chip">
                {c.label}
              </Link>
            ))}
          </div>
        ) : null}
      </header>

      {hayBusqueda && productos.length === 0 ? (
        <div className="trs-empty">
          <p>
            No encontramos nada para <strong>&quot;{query}&quot;</strong>. Revisa cómo está escrito
            o mira lo que más se vende:
          </p>
          <div className="trs-grid trs-grid--sug">
            {sugerencias.map((p) => (
              <Tarjeta key={p.id} p={p} />
            ))}
          </div>
          <p className="trs-empty-links">
            <Link to="/collections/gorras">Gorras</Link> ·{' '}
            <Link to="/collections/chaquetas">Chaquetas</Link> ·{' '}
            <Link to="/collections/botas-1">Botas</Link> ·{' '}
            <Link to="/collections/camisetas">Camisas</Link>
          </p>
        </div>
      ) : null}

      <section className="trs-grid" aria-label="Resultados">
        {productos.map((p) => (
          <Tarjeta key={p.id} p={p} />
        ))}
      </section>
    </main>
  );
}
