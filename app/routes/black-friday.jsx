import {useEffect, useState} from 'react';
import {Link, useLoaderData} from 'react-router';
import styles from '~/styles/home-nuevo.css?url';
import Buscador from '~/components/Buscador';
import Carroza from '~/components/Carroza';
import MenuLateral from '~/components/MenuLateral';
import Pie from '~/components/Pie';
import {recordar} from '~/lib/cache';

export const links = () => [{rel: 'stylesheet', href: styles}];

export const meta = () => [
  {title: 'Black Friday · The Ranch'},
  {
    name: 'description',
    content:
      'Black Friday en The Ranch: del 27 al 30 de noviembre, piezas con descuento puesto en la etiqueta. Hasta 53 % en gorras, chaquetas y botas.',
  },
  {tagName: 'link', rel: 'canonical', href: 'https://ranch.com.co/black-friday'},
];

// cierra el 27 de noviembre de 2026 a medianoche de Colombia (UTC-5)
// cierra el 30 de noviembre de 2026 a las 11:59 p. m. de Colombia (UTC-5)
const CIERRE = '2026-12-01T04:59:59.000Z';

const CONSULTA = `
  query OfertasBlackFriday {
    products(first: 250) {
      nodes {
        title
        handle
        status
        productType
        featuredImage { url altText }
        variants(first: 40) {
          nodes { price compareAtPrice inventoryQuantity }
        }
      }
    }
  }
`;

async function desdeAdmin(context) {
  const token = context?.env?.SHOPIFY_ADMIN_TOKEN || process.env.SHOPIFY_ADMIN_TOKEN;
  if (!token) return null;
  try {
    const r = await fetch('https://1caf84-4.myshopify.com/admin/api/2025-01/graphql.json', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'X-Shopify-Access-Token': token},
      body: JSON.stringify({query: CONSULTA}),
    });
    const j = await r.json();
    return j?.data?.products?.nodes || null;
  } catch {
    return null;
  }
}

function armar(productos) {
  const ofertas = [];
  for (const p of productos || []) {
    if (p.status !== 'ACTIVE' || !p.featuredImage) continue;
    const validas = [];
    for (const v of p.variants?.nodes || []) {
      const precio = Number(v.price);
      const antes = v.compareAtPrice ? Number(v.compareAtPrice) : 0;
      const unidades = v.inventoryQuantity || 0;
      if (antes > precio && unidades > 0) validas.push({precio, antes, unidades});
    }
    if (!validas.length) continue;
    const precio = Math.min(...validas.map((x) => x.precio));
    const antes = Math.max(...validas.map((x) => x.antes));
    const unidades = validas.reduce((s, x) => s + x.unidades, 0);
    const pct = Math.round((1 - precio / antes) * 100);
    if (pct < 5) continue;
    const sinDato = validas.some((x) => x.sinDato);
    ofertas.push({
      titulo: p.title,
      handle: p.handle,
      tipo: p.productType || 'The Ranch',
      foto: p.featuredImage.url,
      alt: p.featuredImage.altText || p.title,
      precio,
      antes,
      pct,
      unidades: sinDato ? null : unidades,
    });
  }
  return ofertas.sort((a, b) => b.pct - a.pct);
}

export async function loader({context}) {
  const producir = async () => {
    const admin = await desdeAdmin(context);
    if (admin) return armar(admin);

    // Sin token de administración se arma con el catálogo público y SIN
    // etiqueta de unidades: nunca se inventa un "quedan X".
    const d = await context.storefront.query(
      `#graphql
        query OfertasPublicas {
          products(first: 250) {
            nodes {
              title
              handle
              productType
              featuredImage { url altText }
              variants(first: 40) { nodes { price { amount } compareAtPrice { amount } availableForSale } }
            }
          }
        }`,
      {cache: context.storefront.CacheShort()},
    );
    const planos = (d?.products?.nodes || []).map((p) => ({
      ...p,
      status: 'ACTIVE',
      variants: {
        nodes: (p.variants?.nodes || []).map((v) => ({
          price: v.price?.amount,
          compareAtPrice: v.compareAtPrice?.amount || null,
          // sin el token de administración no hay unidades reales:
          // se marca el vacío para no inventar un "quedan X".
          inventoryQuantity: v.availableForSale ? 1 : 0,
          sinDato: true,
        })),
      },
    }));
    return armar(planos).map((o) => ({...o, unidades: null}));
  };

  // en desarrollo sin caché: un cambio de precio o de stock se ve al recargar
  const ofertas = import.meta.env.DEV ? await producir() : await recordar('black-friday', 2, producir);

  return {ofertas, cierre: CIERRE};
}

const dinero = (n) => '$ ' + Math.round(n).toLocaleString('es-CO');

function Cuenta({cierre}) {
  const [falta, setFalta] = useState(() => new Date(cierre).getTime() - Date.now());

  useEffect(() => {
    const tic = () => setFalta(new Date(cierre).getTime() - Date.now());
    tic();
    const id = setInterval(tic, 1000);
    return () => clearInterval(id);
  }, [cierre]);

  if (falta <= 0) {
    return <p className="bf-fin">La campaña se cerró. Gracias a los que alcanzaron.</p>;
  }

  const s = Math.floor(falta / 1000);
  const cajas = [
    ['días', Math.floor(s / 86400)],
    ['horas', Math.floor((s % 86400) / 3600)],
    ['min', Math.floor((s % 3600) / 60)],
    ['seg', s % 60],
  ];

  return (
    <div className="bf-reloj" aria-label="Cuenta regresiva del Black Friday">
      {cajas.map(([rot, n]) => (
        <span className="bf-reloj-caja" key={rot}>
          <b>{String(n).padStart(2, '0')}</b>
          <i>{rot}</i>
        </span>
      ))}
    </div>
  );
}

function Tarjeta({o}) {
  return (
    <Link to={`/products/${o.handle}`} prefetch="intent" className="bf-card">
      <span className="bf-card-foto">
        <img
          src={`${o.foto}${o.foto.includes('?') ? '&' : '?'}width=440`}
          alt={o.alt}
          loading="lazy"
          width="440"
          height="440"
        />
        <span className="bf-off">−{o.pct}%</span>
        {o.unidades !== null && o.unidades <= 5 && (
          <span className="bf-poco">
            {o.unidades === 1 ? 'Última unidad' : `Solo quedan ${o.unidades}`}
          </span>
        )}
      </span>
      <span className="bf-card-info">
        <span className="bf-card-tipo">{o.tipo === 'The Ranch' ? 'En oferta' : o.tipo}</span>
        <span className="bf-card-nombre">{o.titulo}</span>
        <span className="bf-card-precios">
          <b>{dinero(o.precio)}</b>
          <em>antes {dinero(o.antes)}</em>
        </span>
      </span>
    </Link>
  );
}

export default function BlackFriday() {
  const {ofertas, cierre} = useLoaderData();
  const ultimas = ofertas.filter((o) => o.unidades !== null && o.unidades <= 5);
  const mejor = ofertas[0]?.pct ?? 0;
  const ahorro = ofertas.reduce((s, o) => s + (o.antes - o.precio), 0);

  return (
    <div className="bf">
      <header className="hc-bar is-solido">
        <MenuLateral tono="tinta" />
        <Link to="/" prefetch="intent" className="hc-logo" aria-label="The Ranch, ir al inicio">
          <img src="/logo-tinta.png" alt="The Ranch" width="78" />
        </Link>
        <span className="hc-bolsa">
          <Buscador tono="oscuro" />
          <Carroza />
        </span>
      </header>

      <main>
        <section className="bf-hero">
          <div className="bf-hero-grano" aria-hidden="true" />
          <div className="bf-hero-in">
            <p className="bf-sello">
              <span /> Del 27 al 30 de noviembre
            </p>
            <h1 className="bf-titulo">
              Hasta
              <br />
              <em>{mejor}%</em>
              <small>de descuento</small>
            </h1>
            <p className="bf-bajada">
              {ofertas.length} piezas escogidas, con el descuento puesto en la etiqueta. Son las
              últimas tallas que quedan y no vuelven.
            </p>
            <Cuenta cierre={cierre} />
            <a href="#ofertas" className="bf-cta">
              Ver las ofertas
            </a>
          </div>
          <div className="bf-hero-pie">
            <span>{ofertas.length} piezas</span>
            <span>Del 27 al 30 de noviembre</span>
            <span>Precios COP</span>
          </div>
        </section>

        <section className="bf-sellos" aria-label="Cómo comprar">
          <div>
            <b>Pago seguro</b>
            <span>Tarjeta, PSE, Nequi o contra entrega</span>
          </div>
          <div>
            <b>Envío nacional</b>
            <span>Desde $ 6.000, a toda Colombia</span>
          </div>
          <div>
            <b>Cambio de talla</b>
            <span>Escríbenos y lo cuadramos</span>
          </div>
        </section>

        {ultimas.length > 0 && (
          <section className="bf-ultimas">
            <header className="bf-head">
              <p className="bf-eyebrow">Antes de que se acaben</p>
              <h2 className="bf-h2">Las últimas</h2>
            </header>
            <div className="bf-rail">
              {ultimas.map((o) => (
                <Link to={`/products/${o.handle}`} prefetch="intent" className="bf-mini" key={o.handle}>
                  <span className="bf-mini-foto">
                    <img
                      src={`${o.foto}${o.foto.includes('?') ? '&' : '?'}width=260`}
                      alt={o.alt}
                      loading="lazy"
                      width="260"
                      height="260"
                    />
                  </span>
                  <span className="bf-mini-nombre">{o.titulo}</span>
                  <span className="bf-mini-poco">
                    {o.unidades === 1 ? 'Queda 1' : `Quedan ${o.unidades}`}
                  </span>
                  <span className="bf-mini-precio">{dinero(o.precio)}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="bf-piezas" id="ofertas">
          <header className="bf-head">
            <p className="bf-eyebrow">Todo lo que está en descuento</p>
            <h2 className="bf-h2">
              {ofertas.length} piezas.
              <br />
              Ninguna a precio lleno.
            </h2>
          </header>

          <div className="bf-grid">
            {ofertas.map((o) => (
              <Tarjeta o={o} key={o.handle} />
            ))}
          </div>
        </section>

        <section className="bf-cierre">
          <p className="bf-eyebrow">El 30 se apaga</p>
          <h2 className="bf-h2">
            Después vuelve
            <br />
            el precio de siempre.
          </h2>
          <p className="bf-cierre-txt">
            No hay segunda vuelta ni lista de espera. Lo que quede, se queda sin descuento.
          </p>
          <a href="#ofertas" className="bf-cta bf-cta-claro">
            Escoger mi talla
          </a>
        </section>
      </main>

      <Pie />
    </div>
  );
}
