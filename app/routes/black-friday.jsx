import {useEffect, useState} from 'react';
import {Link, useLoaderData} from 'react-router';
import styles from '~/styles/home-nuevo.css?url';
import Buscador from '~/components/Buscador';
import Carroza from '~/components/Carroza';
import MenuLateral from '~/components/MenuLateral';
import Pie from '~/components/Pie';
import {Tarjeta} from '~/components/Tarjeta';

export const links = () => [{rel: 'stylesheet', href: styles}];

export const meta = () => [
  {title: 'Black Friday · The Ranch'},
  {
    name: 'description',
    content:
      'Black Friday en The Ranch: del 27 al 30 de noviembre, las piezas de la casa con precio de campaña. Envío a toda Colombia.',
  },
];

// el cierre de la campaña: lunes 30 de noviembre de 2026, 11:59 p.m. Colombia
const CIERRE = new Date('2026-12-01T04:59:59Z').getTime();

const PIEZAS = `#graphql
  query Piezas {
    gorras: collection(handle: "gorras") {
      products(first: 8, sortKey: BEST_SELLING) {
        nodes { ...Pieza }
      }
    }
    chaquetas: collection(handle: "chaquetas") {
      products(first: 6, sortKey: BEST_SELLING) {
        nodes { ...Pieza }
      }
    }
  }
  fragment Pieza on Product {
    id
    title
    handle
    availableForSale
    priceRange { minVariantPrice { amount } }
    compareAtPriceRange { minVariantPrice { amount } }
    images(first: 2) { nodes { url } }
  }
`;

const optimizar = (url, ancho) => {
  if (!url) return '';
  const base = url.split('/').pop() ? url.split('?')[0] : url;
  const q = url.includes('?') ? '?' + url.split('?')[1] : '';
  return `${base}${q}${q ? '&' : '?'}width=${ancho}`;
};

export async function loader({context}) {
  const fmt = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });

  const r = await context.storefront.query(PIEZAS, {cache: context.storefront.CacheShort()});

  const armar = (nodos, tipo) =>
    (nodos || [])
      .filter((p) => p.availableForSale)
      .map((p) => {
        const precio = Number(p.priceRange.minVariantPrice.amount);
        const antes = Number(p.compareAtPriceRange?.minVariantPrice?.amount || 0);
        return {
          id: p.id,
          titulo: p.title,
          handle: p.handle,
          tipo,
          precio: fmt.format(precio),
          antes: antes > 0 && antes !== precio ? fmt.format(antes) : null,
          imgs: (p.images?.nodes || []).slice(0, 2).map((x) => optimizar(x.url, 420)),
        };
      });

  const gorras = armar(r?.gorras?.products?.nodes, 'gorra');
  const chaquetas = armar(r?.chaquetas?.products?.nodes, 'chaqueta');

  return {gorras, chaquetas};
}

function Cuenta() {
  const [falta, setFalta] = useState(null);

  useEffect(() => {
    const tic = () => {
      const ms = Math.max(0, CIERRE - Date.now());
      setFalta({
        d: Math.floor(ms / 86400000),
        h: Math.floor((ms % 86400000) / 3600000),
        m: Math.floor((ms % 3600000) / 60000),
        s: Math.floor((ms % 60000) / 1000),
      });
    };
    tic();
    const id = setInterval(tic, 1000);
    return () => clearInterval(id);
  }, []);

  const caja = (n, r) => (
    <span className="bf-reloj-caja">
      <b>{String(n ?? 0).padStart(2, '0')}</b>
      <i>{r}</i>
    </span>
  );

  return (
    <div className="bf-reloj" aria-label="Cuenta regresiva del Black Friday">
      {caja(falta?.d, 'días')}
      {caja(falta?.h, 'horas')}
      {caja(falta?.m, 'min')}
      {caja(falta?.s, 'seg')}
    </div>
  );
}

export default function BlackFriday() {
  const {gorras, chaquetas} = useLoaderData();
  const todas = [...gorras, ...chaquetas];

  return (
    <div className="hn-root bf-root">
      <header className="bf-bar">
        <MenuLateral />
        <Link to="/" className="hn-logo" aria-label="The Ranch">
          <img src="/logo-crema.png" alt="The Ranch" width="92" height="33" />
        </Link>
        <span className="hn-bag">
          <Buscador tono="claro" />
          <Carroza />
        </span>
      </header>

      <main>
        <section className="bf-hero">
          <img src="/hero-jinete.webp" alt="" className="bf-hero-foto" aria-hidden="true" />
          <div className="bf-hero-velo" aria-hidden="true" />

          <div className="bf-hero-texto">
            <p className="bf-sello">Del 27 al 30 de noviembre</p>
            <h1 className="bf-titulo">
              Black
              <br />
              Friday.
            </h1>
            <p className="bf-bajada">
              Cuatro días. Las piezas de la casa con precio de campaña.
            </p>
            <Cuenta />
            <a href="#piezas" className="bf-cta">
              Ver las piezas
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>
        </section>

        <section className="bf-piezas" id="piezas">
          <header className="bf-head">
            <p className="bf-eyebrow">La selección</p>
            <h2 className="bf-h2">Lo que se va a mover</h2>
            <p className="bf-nota">
              Gorras y chaquetas, las que más salen. Mientras la campaña no abra, se ven a su precio de hoy.
            </p>
          </header>

          <div className="hn-par">
            {todas.map((p) => (
              <Tarjeta key={p.id} p={p} />
            ))}
          </div>
        </section>

        <section className="bf-condiciones">
          <div className="bf-cond">
            <p className="bf-cond-rot">Envío</p>
            <p className="bf-cond-txt">A todo Colombia. Económico o exprés, se elige al pagar.</p>
          </div>
          <div className="bf-cond">
            <p className="bf-cond-rot">Cambios</p>
            <p className="bf-cond-txt">Tienes días para cambiarla si no te queda.</p>
          </div>
          <div className="bf-cond">
            <p className="bf-cond-rot">Pago</p>
            <p className="bf-cond-txt">Tarjeta, PSE, Nequi, Bancolombia o contra entrega.</p>
          </div>
        </section>
      </main>

      <Pie />
    </div>
  );
}
