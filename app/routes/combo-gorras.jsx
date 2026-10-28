import {Form, Link, useActionData, useLoaderData, useNavigation} from 'react-router';
import {useEffect, useState} from 'react';
import styles from '~/styles/combo-pack.css?url';

export const links = () => [
  {rel: 'stylesheet', href: styles},
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400&family=Inter:wght@300;400;500&display=swap',
  },
];

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

export async function loader({context}) {
  const data = await context.storefront.query(QUERY, {cache: context.storefront.CacheShort()});
  const base = (data?.products?.nodes || [])
    .filter(esGorra)
    .map((p) => {
      const v = (p.variants?.nodes || []).find((x) => x.availableForSale);
      if (!v) return null;
      return {
        title: p.title,
        handle: p.handle,
        img: p.featuredImage?.url || '',
        alt: p.featuredImage?.altText || p.title,
        vid: v.id.split('/').pop(),
        price: Number(v.price.amount),
        currency: v.price.currencyCode,
      };
    })
    .filter(Boolean);

  // Stock real por variante (el storefront puede decir "disponible" con la política de venta sin stock).
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
    } catch (e) {
      stock = {};
    }
  }

  const gorras = base
    .map((g) => ({...g, stock: stock[g.vid] ?? null}))
    .filter((g) => g.stock === null || g.stock > 0);

  return {gorras};
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
  } catch (e) {
    return {error: 'El servidor del pack no respondió.'};
  }
}

function money(n) {
  return new Intl.NumberFormat('es-CO', {style: 'currency', currency: 'COP', maximumFractionDigits: 0}).format(n);
}

export default function ComboGorras() {
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

  return (
    <div className="cb">
      <header className="cb-head">
        <Link to="/" className="cb-back">← The Ranch</Link>
        <span className="cb-count">{sel.length} de {CUANTAS}</span>
      </header>

      <div className="cb-intro">
        <h1>Arma tu pack de cinco</h1>
        <p>
          Elige las cinco gorras que quieras. Salen a {money(PACK)} las cinco,
          sin importar la mezcla.
        </p>
      </div>

      <div className="cb-grid">
        {gorras.map((g) => {
          const activa = sel.includes(g.vid);
          const orden = sel.indexOf(g.vid) + 1;
          return (
            <button
              key={g.vid}
              type="button"
              className={`cb-item ${activa ? 'is-on' : ''}`}
              onClick={() => toggle(g)}
              aria-pressed={activa}
            >
              <span className="cb-img">
                {g.img && <img src={g.img} alt={g.alt} loading="lazy" />}
                {activa && <span className="cb-badge">{orden}</span>}
                {g.stock !== null && g.stock <= 6 && (
                  <span className="cb-low">Últimas {g.stock}</span>
                )}
              </span>
              <span className="cb-name">{g.title.replace(/^Gorra\s+/i, '')}</span>
              <span className="cb-price">{money(g.price)}</span>
            </button>
          );
        })}
      </div>

      <div className="cb-bar">
        <div className="cb-bar-info">
          <span className="cb-bar-pack">{money(PACK)} <small>las cinco</small></span>
          {listo && ahorro > 0 && <span className="cb-bar-save">ahorras {money(ahorro)}</span>}
        </div>
        <Form method="post">
          {sel.map((v) => <input key={v} type="hidden" name="vid" value={v} />)}
          <button type="submit" disabled={!listo || nav.state === 'submitting'}>
            {nav.state === 'submitting' ? 'Armando…' : listo ? 'Llevar el pack' : `Faltan ${CUANTAS - sel.length}`}
          </button>
        </Form>
      </div>

      {data?.error && <p className="cb-error">{data.error}</p>}
    </div>
  );
}
