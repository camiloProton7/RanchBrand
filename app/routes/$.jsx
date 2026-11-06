import {data, Link, useLoaderData} from 'react-router';
import styles from '~/styles/home-nuevo.css?url';
import Buscador from '~/components/Buscador';
import Carroza from '~/components/Carroza';
import MenuLateral from '~/components/MenuLateral';
import Pie from '~/components/Pie';
import {Tarjeta} from '~/components/Tarjeta';

export const links = () => [{rel: 'stylesheet', href: styles}];

export const meta = () => [
  {title: 'Página no encontrada · The Ranch'},
  {name: 'robots', content: 'noindex'},
];

const SUGERIDOS = `#graphql
  query Sugeridos {
    collection(handle: "gorras") {
      title
      handle
      products(first: 4, sortKey: BEST_SELLING) {
        nodes {
          id
          title
          handle
          availableForSale
          priceRange { minVariantPrice { amount currencyCode } }
          images(first: 2) { nodes { url } }
        }
      }
    }
  }
`;

const optimizar = (url, ancho) => {
  if (!url) return '';
  const base = url.split('?')[0];
  const v = url.includes('?v=') ? '?' + url.split('?')[1].split('&')[0] : '';
  return `${base}${v}${v ? '&' : '?'}width=${ancho}`;
};

export async function loader({context}) {
  const fmt = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });

  let productos = [];
  try {
    const r = await context.storefront.query(SUGERIDOS, {cache: context.storefront.CacheShort()});
    productos = (r?.collection?.products?.nodes || []).map((p) => ({
      id: p.id,
      titulo: p.title,
      handle: p.handle,
      disponible: p.availableForSale,
      precio: fmt.format(Number(p.priceRange.minVariantPrice.amount)),
      imgs: (p.images?.nodes || []).slice(0, 2).map((x) => optimizar(x.url, 420)),
    }));
  } catch {
    productos = [];
  }

  // sigue siendo 404 para Google, pero el visitante no se queda sin salida
  return data({productos}, {status: 404});
}

const OTRAS = [
  {nombre: 'Chaquetas', handle: 'chaquetas'},
  {nombre: 'Camisas', handle: 'camisetas'},
  {nombre: 'Botas', handle: 'botas-1'},
];

export default function NoEncontrada() {
  const {productos} = useLoaderData();

  return (
    <div className="hn-root nf-root">
      <header className="nf-bar">
        <MenuLateral />
        <Link to="/" className="hn-logo" aria-label="The Ranch">
          <img src="/logo-tinta.png" alt="The Ranch" width="92" height="33" />
        </Link>
        <span className="hn-bag">
          <Buscador tono="oscuro" />
          <Carroza />
        </span>
      </header>

      <main className="nf-main">
        <p className="nf-eyebrow">404</p>
        <h1 className="nf-titulo">
          Esta página
          <br />
          se fue al monte.
        </h1>
        <p className="nf-texto">
          El enlace que abriste no existe, o la pieza ya no está con nosotros.
          Pero mientras buscabas, esto es lo que más está saliendo.
        </p>

        <Link to="/" className="nf-cta">
          Volver al inicio
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </main>

      {productos.length > 0 && (
        <section className="nf-vitrina" aria-label="Lo más vendido en gorras">
          <div className="nf-vitrina-head">
            <p className="nf-eyebrow">Mientras tanto</p>
            <h2 className="nf-vitrina-titulo">Las gorras que más salen</h2>
          </div>

          <div className="hn-par">
            {productos.map((p) => (
              <Tarjeta key={p.id} p={p} />
            ))}
          </div>

          <Link to="/collections/gorras" className="nf-ver-todo">
            Ver todas las gorras
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </section>
      )}

      <nav className="nf-cats" aria-label="Colecciones">
        {OTRAS.map((c) => (
          <Link key={c.handle} to={`/collections/${c.handle}`} className="nf-cat">
            {c.nombre}
          </Link>
        ))}
      </nav>

      <Pie />
    </div>
  );
}
