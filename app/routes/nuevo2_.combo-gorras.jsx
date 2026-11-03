import {Form, Link, useActionData, useLoaderData, useNavigation} from 'react-router';
import {useEffect, useState} from 'react';
import styles from '~/styles/home-nuevo.css?url';
import {recordar} from '~/lib/cache';

export const links = () => [{rel: 'stylesheet', href: styles}];

const PACK = 500000;
const CUANTAS = 5;
const ENDPOINT = 'https://the-ranch-premium.vercel.app/api/pack';

const QUERY = `#graphql
  query GorrasCombo {
    products(first: 100, sortKey: BEST_SELLING) {
      nodes {
        title
        handle
        productType
        featuredImage { url altText }
        variants(first: 5) {
          nodes { id price { amount currencyCode } availableForSale }
        }
      }
    }
  }
`;

function esGorra(p) {
  const t = (p.title || '').toLowerCase();
  if (t.startsWith('combo')) return false;
  return (
    (p.productType || '').toLowerCase().includes('gorra') ||
    t.startsWith('gorra') ||
    t.startsWith('ranch ')
  );
}

async function cargarCombo({context}) {
  const opt = import.meta.env.DEV ? {cache: context.storefront.CacheNone()} : {cache: context.storefront.CacheShort()};
  const data = await context.storefront.query(QUERY, opt);
  const base = (data?.products?.nodes || [])
    .filter(esGorra)
    .map((p) => {
      const v = (p.variants?.nodes || []).find((x) => x.availableForSale);
      if (!v) return null;
      return {
        title: p.title,
        handle: p.handle,
        img: p.featuredImage?.url
          ? `${p.featuredImage.url}${p.featuredImage.url.includes('?') ? '&' : '?'}width=380`
          : '',
        alt: p.featuredImage?.altText || p.title,
        vid: v.id.split('/').pop(),
        price: Number(v.price.amount),
      };
    })
    .filter(Boolean);

  const token = context?.env?.SHOPIFY_ADMIN_TOKEN;
  let stock = {};
  if (token && base.length) {
    try {
      const ids = base.map((g) => `gid://shopify/ProductVariant/${g.vid}`);
      const r = await fetch(`https://1caf84-4.myshopify.com/admin/api/2025-01/graphql.json`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'X-Shopify-Access-Token': token},
        body: JSON.stringify({
          query: `query($ids:[ID!]!){ nodes(ids:$ids){ ... on ProductVariant { id inventoryQuantity } } }`,
          variables: {ids},
        }),
      });
      const j = await r.json();
      for (const n of j?.data?.nodes || []) {
        if (n?.id) stock[n.id.split('/').pop()] = n.inventoryQuantity ?? 0;
      }
    } catch {
      stock = {};
    }
  }

  const gorras = base
    .map((g) => ({...g, stock: stock[g.vid] ?? null}))
    .filter((g) => g.stock === null || g.stock > 0);

  return {gorras};
}

/**
 * El combo pregunta el inventario al Admin en cada visita, y eso no se
 * cachea solo: se quedaba en 280 ms aun repitiendo. Dos minutos de memoria.
 */
export async function loader({context}) {
  return recordar('combo-gorras', 2, () => cargarCombo({context}));
}

export async function action({request}) {
  const form = await request.formData();
  const vids = form.getAll('vid').map(String).filter(Boolean);
  if (vids.length !== CUANTAS || new Set(vids).size !== CUANTAS) {
    return {error: 'Tienen que ser cinco gorras distintas.'};
  }
  try {
    const r = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({vids}),
    });
    const j = await r.json();
    if (!r.ok || !j.checkoutUrl) return {error: j.error || 'No pudimos armar el pack.'};
    return {checkoutUrl: j.checkoutUrl, suma: j.suma};
  } catch {
    return {error: 'El servidor del pack no respondió.'};
  }
}

function money(n) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n);
}

const DESC_COMBO =
  'Cinco gorras de The Ranch por un solo precio. Elige las que quieras y recibe el pack en casa con envío a toda Colombia.';

export const meta = () => [
  {title: 'El pack de cinco gorras · The Ranch'},
  {name: 'description', content: DESC_COMBO},
  {tagName: 'link', rel: 'canonical', href: 'https://ranch.com.co/combo-gorras'},
  {property: 'og:type', content: 'website'},
  {property: 'og:site_name', content: 'The Ranch'},
  {property: 'og:locale', content: 'es_CO'},
  {property: 'og:title', content: 'El pack de cinco gorras · The Ranch'},
  {property: 'og:description', content: DESC_COMBO},
  {property: 'og:url', content: 'https://ranch.com.co/combo-gorras'},
  {property: 'og:image', content: 'https://ranch.com.co/promo-gorras.webp'},
  {name: 'twitter:card', content: 'summary_large_image'},
];

export default function ComboNuevo() {
  const {gorras} = useLoaderData();
  const data = useActionData();
  const nav = useNavigation();
  const [sel, setSel] = useState([]);

  useEffect(() => {
    if (data?.checkoutUrl) window.location.href = data.checkoutUrl;
  }, [data]);

  const toggle = (g) => {
    setSel((prev) => {
      if (prev.includes(g.vid)) return prev.filter((x) => x !== g.vid);
      if (prev.length >= CUANTAS) return prev;
      return [...prev, g.vid];
    });
  };

  const suma = gorras.filter((g) => sel.includes(g.vid)).reduce((a, g) => a + g.price, 0);
  const listo = sel.length === CUANTAS;
  const ahorro = Math.max(0, suma - PACK);
  const faltan = CUANTAS - sel.length;

  return (
    <main className="hc cbc">
      <header className="hc-barra">
        <Link to="/nuevo2" aria-label="Volver" className="hc-volver">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </Link>
        <Link to="/nuevo2" className="hc-logo" aria-label="The Ranch, ir al inicio">
          <img src="/logo-tinta.png" alt="The Ranch" />
        </Link>
        <span className="hc-barra-hueco" />
      </header>

      <section className="cbc-intro">
        <span className="cbc-sobre">El pack</span>
        <h1>
          Cinco gorras.
          <br />
          <em>Un solo precio.</em>
        </h1>
        <p>
          Elige las cinco que quieras. Salen a {money(PACK)} las cinco, sin
          importar la mezcla. Cada una vale {money(Math.round(PACK / CUANTAS))}.
        </p>
      </section>

      <div className="cbc-progreso">
        <div className="cbc-puntos">
          {Array.from({length: CUANTAS}).map((_, i) => (
            <i key={i} className={i < sel.length ? 'on' : ''} />
          ))}
        </div>
        <span>
          {sel.length} de {CUANTAS}
        </span>
      </div>

      <div className="cbc-grid">
        {gorras.map((g) => {
          const activa = sel.includes(g.vid);
          const orden = sel.indexOf(g.vid) + 1;
          return (
            <button
              key={g.vid}
              type="button"
              className={'cbc-item' + (activa ? ' is-on' : '')}
              onClick={() => toggle(g)}
              aria-pressed={activa}
            >
              <span className="cbc-img">
                {g.img && <img src={g.img} alt={g.alt} loading="lazy" decoding="async" />}
                {activa && <span className="cbc-orden">{orden}</span>}
                {g.stock !== null && g.stock <= 6 && (
                  <span className="cbc-low">Últimas {g.stock}</span>
                )}
              </span>
              <span className="cbc-name">{g.title.replace(/^Gorra\s+/i, '')}</span>
              <span className="cbc-price">{money(g.price)}</span>
            </button>
          );
        })}
      </div>

      {data?.error && <p className="cbc-error">{data.error}</p>}

      <div className="hc-barra-pago cbc-barra">
        <div>
          <span>{listo ? 'Las cinco' : faltan === 1 ? 'Falta 1' : `Faltan ${faltan}`}</span>
          <strong>{money(PACK)}</strong>
        </div>
        <Form method="post" className="cbc-form">
          {sel.map((v) => (
            <input key={v} type="hidden" name="vid" value={v} />
          ))}
          <button
            type="submit"
            className="hc-pagar"
            disabled={!listo || nav.state === 'submitting'}
          >
            {nav.state === 'submitting'
              ? 'Armando…'
              : listo
                ? 'Llevar el pack'
                : `Elige ${faltan}`}
          </button>
        </Form>
      </div>

      {listo && ahorro > 0 && (
        <div className="cbc-ahorro">
          Ahorras {money(ahorro)} frente a comprarlas sueltas
        </div>
      )}
    </main>
  );
}
