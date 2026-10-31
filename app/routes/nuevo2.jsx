import {useEffect, useRef, useState} from 'react';
import {Link, useLoaderData} from 'react-router';
import styles from '~/styles/home-nuevo.css?url';
import {getCartCount} from '~/lib/cart';
import HeroBurn from '~/components/HeroBurn';
import Carroza from '~/components/Carroza';
import MenuLateral from '~/components/MenuLateral';
import {useHeaderScroll} from '~/lib/useHeaderScroll';
import Lienzo from '~/components/Lienzo';
import Combo from '~/components/Combo';
import Destacada from '~/components/Destacada';
import Categorias from '~/components/Categorias';
import Sellos from '~/components/Sellos';
import Resenas from '~/components/Resenas';
import Pie from '~/components/Pie';
import {Rail, Tarjeta} from '~/components/Tarjeta';

export const links = () => [{rel: 'stylesheet', href: styles}];

const CATS = [
  {nombre: 'Gorras', handle: 'gorras', img: '/cats/gorras.webp'},
  {nombre: 'Chaquetas', handle: 'chaquetas', img: '/cats/chaquetas.webp'},
  {nombre: 'Camisas', handle: 'camisetas', img: '/cats/camisas.webp'},
  {nombre: 'Camisetas', handle: 'camisetas', img: '/cats/camisetas.webp'},
  {nombre: 'Botas', handle: 'botas-1', img: '/cats/botas.webp'},
];


const ADMIN_PEDIDOS = `#graphql
  query PedidosMes($cursor: String, $desde: String!) {
    orders(first: 250, after: $cursor, query: $desde, sortKey: CREATED_AT, reverse: true) {
      pageInfo { hasNextPage endCursor }
      nodes {
        lineItems(first: 20) {
          nodes { quantity product { id title } }
        }
      }
    }
  }
`;

const WINDSOR = `#graphql
  query Windsor {
    product(handle: "chaqueta-encerada-windsor-verde") {
      title
      handle
      description
      priceRange { minVariantPrice { amount currencyCode } }
      compareAtPriceRange { minVariantPrice { amount } }
      images(first: 3) { nodes { url } }
      metafields(identifiers: [{namespace: "reviews", key: "rating"}, {namespace: "reviews", key: "rating_count"}]) {
        key
        value
      }
    }
  }
`;

const BOTAS = `#graphql
  query Botas {
    product(handle: "botas-gamuza-lariat") {
      title
      handle
      description
      priceRange { minVariantPrice { amount currencyCode } }
      compareAtPriceRange { minVariantPrice { amount } }
      images(first: 3) { nodes { url } }
      metafields(identifiers: [{namespace: "reviews", key: "rating"}, {namespace: "reviews", key: "count"}]) {
        key
        value
      }
    }
  }
`;

const COMBO = `#graphql
  query Combo {
    camisa: product(handle: "camisa-outdoor-proteccion-solar-upf-50") {
      title
      handle
      description
      images(first: 4) { nodes { url } }
      variants(first: 40) { nodes { id price { amount currencyCode } availableForSale } }
      metafields(identifiers: [{namespace: "reviews", key: "rating"}, {namespace: "reviews", key: "rating_count"}]) {
        key
        value
      }
    }
    gorra: product(handle: "gorra-1") {
      title
      handle
      description
      images(first: 4) { nodes { url } }
      variants(first: 40) { nodes { id price { amount currencyCode } availableForSale } }
      metafields(identifiers: [{namespace: "reviews", key: "rating"}, {namespace: "reviews", key: "rating_count"}]) {
        key
        value
      }
    }
  }
`;

const CHAQUETAS = `#graphql
  query Chaquetas {
    collection(handle: "chaquetas") {
      products(first: 8, sortKey: BEST_SELLING) {
        nodes {
          id title handle description
          priceRange { minVariantPrice { amount currencyCode } }
      compareAtPriceRange { minVariantPrice { amount } }
          images(first: 4) { nodes { url } }
          metafields(identifiers: [{namespace: "reviews", key: "rating"}, {namespace: "reviews", key: "rating_count"}]) {
            key
            value
          }
        }
      }
    }
  }
`;

const CAMISAS = `#graphql
  query Camisas {
    collection(handle: "camisetas") {
      products(first: 16, sortKey: BEST_SELLING) {
        nodes {
          id title handle description
          priceRange { minVariantPrice { amount currencyCode } }
      compareAtPriceRange { minVariantPrice { amount } }
          images(first: 4) { nodes { url } }
          metafields(identifiers: [{namespace: "reviews", key: "rating"}, {namespace: "reviews", key: "rating_count"}]) {
            key
            value
          }
        }
      }
    }
  }
`;

const CATEGORIAS = `#graphql
  query Categorias {
    gorras: collection(handle: "gorras") {
      title
      image { url }
      products(first: 1) { nodes { images(first: 1) { nodes { url } } } }
    }
    camisas: collection(handle: "camisetas") {
      title
      image { url }
      products(first: 1) { nodes { images(first: 1) { nodes { url } } } }
    }
    botas: collection(handle: "botas-1") {
      title
      image { url }
      products(first: 1) { nodes { images(first: 1) { nodes { url } } } }
    }
    chaquetas: collection(handle: "chaquetas") {
      title
      image { url }
      products(first: 1) { nodes { images(first: 1) { nodes { url } } } }
    }
    sacos: collection(handle: "bordados") {
      title
      image { url }
      products(first: 1) { nodes { images(first: 1) { nodes { url } } } }
    }
  }
`;

const GORRAS = `#graphql
  query Gorras {
    collection(handle: "gorras") {
      products(first: 6, sortKey: BEST_SELLING) {
        nodes {
          id title handle
          description
          priceRange { minVariantPrice { amount currencyCode } }
      compareAtPriceRange { minVariantPrice { amount } }
          images(first: 4) { nodes { url } }
          metafields(identifiers: [{namespace: "reviews", key: "rating"}, {namespace: "reviews", key: "rating_count"}]) {
            key
            value
          }
        }
      }
    }
  }
`;

const TOP_PRODUCTOS = `#graphql
  query TopProductos($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        id
        title
        handle
        description
        priceRange { minVariantPrice { amount currencyCode } }
      compareAtPriceRange { minVariantPrice { amount } }
        images(first: 4) { nodes { url altText } }
        metafields(identifiers: [{namespace: "reviews", key: "rating"}, {namespace: "reviews", key: "rating_count"}]) {
          key
          value
        }
      }
    }
  }
`;

function estrellas(nodos) {
  const lista = (nodos || []).filter(Boolean);
  const rating = lista.find((m) => m.key === 'rating');
  const cuenta = lista.find((m) => m.key === 'rating_count');
  let valor = 0;
  if (rating?.value) {
    try {
      valor = Number(JSON.parse(rating.value).value) || 0;
    } catch {
      valor = Number(rating.value) || 0;
    }
  }
  return {valor, cuenta: Number(cuenta?.value) || 0};
}

export async function loader({context}) {
  // en el laboratorio las fotos de Shopify deben verse al instante, sin caché de consulta
  const fresco = import.meta.env.DEV ? {cache: context.storefront.CacheNone()} : undefined;
  const dominio = context.env.PUBLIC_STORE_DOMAIN;
  const token = context.env.SHOPIFY_ADMIN_TOKEN;
  const desde = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);

  const unidades = new Map();
  const titulos = new Map();

  // el ranking de pedidos va en paralelo con el catálogo:
  // antes se esperaba a que terminara y el home tardaba 1,1 s
  const ranking = (async () => {
  if (dominio && token) {
    let cursor = null;
    try {
      for (let pagina = 0; pagina < 4; pagina++) {
        const r = await fetch(`https://${dominio}/admin/api/2025-01/graphql.json`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json', 'X-Shopify-Access-Token': token},
          body: JSON.stringify({
            query: ADMIN_PEDIDOS,
            variables: {cursor, desde: `created_at:>=${desde} AND financial_status:paid`},
          }),
        });
        const d = await r.json();
        const o = d?.data?.orders;
        if (!o) break;
        for (const pedido of o.nodes) {
          for (const li of pedido.lineItems.nodes) {
            const p = li.product;
            if (!p) continue;
            if (/combo|pack/i.test(p.title)) continue;
            unidades.set(p.id, (unidades.get(p.id) || 0) + li.quantity);
            titulos.set(p.id, p.title);
          }
        }
        if (!o.pageInfo.hasNextPage) break;
        cursor = o.pageInfo.endCursor;
      }
    } catch (e) {
      console.error('ranking:', e.message);
    }
  }

  })().catch(() => {});

  const [gorrasData, chaquetasData, comboData, windsorData, camisasData, catsData, botasData] =
    await Promise.all([
      context.storefront.query(GORRAS, fresco),
      context.storefront.query(CHAQUETAS, fresco),
      context.storefront.query(COMBO, fresco),
      context.storefront.query(WINDSOR, fresco),
      context.storefront.query(CAMISAS, fresco),
      context.storefront.query(CATEGORIAS, fresco),
      context.storefront.query(BOTAS, fresco),
      ranking,
    ]);

  let ids = [...unidades.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([id]) => id);

  let productos = [];
  if (ids.length) {
    const d = await context.storefront.query(TOP_PRODUCTOS, {variables: {ids}});
    const porId = new Map((d.nodes || []).filter(Boolean).map((p) => [p.id, p]));
    productos = ids.map((id) => porId.get(id)).filter(Boolean);
  }

  // si el mes viene flojo, completa con los más vendidos del catálogo
  if (productos.length < 8) {
    const d = await context.storefront.query(`#graphql
      query Relleno { products(first: 12, sortKey: BEST_SELLING) {
        nodes { id title handle priceRange { minVariantPrice { amount currencyCode } }
      compareAtPriceRange { minVariantPrice { amount } } images(first: 4) { nodes { url altText } } }
      } }`);
    const vistos = new Set(productos.map((p) => p.id));
    for (const p of d.products.nodes) {
      if (productos.length >= 8) break;
      if (vistos.has(p.id) || /combo|pack/i.test(p.title)) continue;
      productos.push(p);
    }
  }

  const fmt = new Intl.NumberFormat('es-CO', {style: 'currency', currency: 'COP', maximumFractionDigits: 0});

  // el CDN de Shopify sirve el tamaño que se le pida: evita bajar 2000 px para una tarjeta
  const optimizar = (url, ancho) => {
    if (!url) return '';
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}width=${ancho}`;
  };

  const gorras = (gorrasData.collection?.products.nodes || []).map((p) => ({
    id: p.id,
    titulo: p.title,
    handle: p.handle,
    precio: fmt.format(Number(p.priceRange.minVariantPrice.amount)),
    antes: Number(p.compareAtPriceRange?.minVariantPrice?.amount) > 0 &&
      Number(p.compareAtPriceRange.minVariantPrice.amount) !== Number(p.priceRange.minVariantPrice.amount)
      ? fmt.format(Number(p.compareAtPriceRange.minVariantPrice.amount))
      : null,
    imgs: p.images.nodes.map((n) => optimizar(n.url, 420)),
    img1: optimizar(p.images.nodes[0]?.url, 420),
    img2: optimizar(p.images.nodes[1]?.url || p.images.nodes[0]?.url, 420),
    desc: (p.description || '').replace(/\s+/g, ' ').trim().slice(0, 165),
    ...estrellas(p.metafields),
  }));

  const chaquetas = (chaquetasData.collection?.products.nodes || []).map((p) => ({
    id: p.id,
    titulo: p.title,
    handle: p.handle,
    precio: fmt.format(Number(p.priceRange.minVariantPrice.amount)),
    antes: Number(p.compareAtPriceRange?.minVariantPrice?.amount) > 0 &&
      Number(p.compareAtPriceRange.minVariantPrice.amount) !== Number(p.priceRange.minVariantPrice.amount)
      ? fmt.format(Number(p.compareAtPriceRange.minVariantPrice.amount))
      : null,
    imgs: p.images.nodes.map((n) => optimizar(n.url, 420)),
    img1: optimizar(p.images.nodes[0]?.url, 420),
    img2: optimizar(p.images.nodes[1]?.url || p.images.nodes[0]?.url, 420),
    desc: (p.description || '').replace(/\s+/g, ' ').trim().slice(0, 165),
    ...estrellas(p.metafields),
  }));

  const aItem = (p) => {
    if (!p) return null;
    // la primera variante puede estar agotada: se usa una que si se pueda comprar
    const v = p.variants.nodes.find((x) => x.availableForSale) || p.variants.nodes[0];
    return {
      titulo: p.title,
      handle: p.handle,
      desc: (p.description || '').replace(/\s+/g, ' ').trim().slice(0, 165),
      imgs: p.images.nodes.map((n) => optimizar(n.url, 420)),
      variantId: v.id,
      precio: fmt.format(Number(v.price.amount)),
      precioNum: Number(v.price.amount),
      ...estrellas(p.metafields),
    };
  };

  const itemsCombo = [aItem(comboData.camisa), aItem(comboData.gorra)].filter(Boolean);
  const suma = itemsCombo.reduce((t, i) => t + i.precioNum, 0);
  const combo = {
    items: itemsCombo,
    suma,
    sumaTxt: fmt.format(suma),
    final: Math.round(suma * 0.85),
    finalTxt: fmt.format(Math.round(suma * 0.85)),
    ahorro: Math.round(suma * 0.15),
    ahorroTxt: fmt.format(Math.round(suma * 0.15)),
  };

  const w = windsorData.product;
  const destacada = w
    ? {
        titulo: w.title,
        handle: w.handle,
        precio: fmt.format(Number(w.priceRange.minVariantPrice.amount)),
    antes: w.compareAtPriceRange?.minVariantPrice?.amount &&
      Number(w.compareAtPriceRange.minVariantPrice.amount) > Number(w.priceRange.minVariantPrice.amount)
      ? fmt.format(Number(w.compareAtPriceRange.minVariantPrice.amount))
      : null,
        desc: (() => {
          const t = (w.description || '')
            .replace(/\s+/g, ' ')
            .replace(/^entrega:[^.]*\.\s*/i, '')
            .trim();
          const frases = t.match(/[^.!?]+[.!?]+/g) || [];
          const dos = frases.slice(0, 2).join(' ').replace(/\s+/g, ' ').trim();
          return dos.length > 40 ? dos : t.slice(0, 170);
        })(),
        imgs: w.images.nodes.map((n) => optimizar(n.url, 900)),
        recorte: '/windsor-recorte.webp',
        ...estrellas(w.metafields),
      }
    : null;

  const camisas = (camisasData.collection?.products?.nodes || [])
    .filter((p) => !p.handle.startsWith('combo-'))
    .map((p) => ({
      id: p.id,
      titulo: p.title,
      handle: p.handle,
      precio: fmt.format(Number(p.priceRange.minVariantPrice.amount)),
    antes: Number(p.compareAtPriceRange?.minVariantPrice?.amount) > 0 &&
      Number(p.compareAtPriceRange.minVariantPrice.amount) !== Number(p.priceRange.minVariantPrice.amount)
      ? fmt.format(Number(p.compareAtPriceRange.minVariantPrice.amount))
      : null,
      imgs: p.images.nodes.map((n) => optimizar(n.url, 440)),
      desc: (p.description || '').replace(/\s+/g, ' ').trim().slice(0, 165),
      unidades: 0,
      ...estrellas(p.metafields),
    }));

  const cats = [
    {clave: 'gorras', titulo: 'Gorras', handle: 'gorras'},
    {clave: 'chaquetas', titulo: 'Chaquetas', handle: 'chaquetas'},
    {clave: 'camisas', titulo: 'Camisas y camisetas', handle: 'camisetas'},
    {clave: 'botas', titulo: 'Botas', handle: 'botas-1'},
  ]
    .map((c) => {
      const col = catsData[c.clave];
      const foto =
        col?.image?.url ||
        col?.products?.nodes?.[0]?.images?.nodes?.[0]?.url ||
        null;
      const locales = {
        gorras: '/col/gorras.webp',
        chaquetas: '/col/chaquetas.webp',
        camisas: '/col/camisas.webp',
      };
      return {...c, img: locales[c.clave] || (foto ? optimizar(foto, 700) : null)};
    })
    .filter((c) => c.img);

  const b = botasData.product;
  const botas = b
    ? {
        titulo: b.title,
        handle: b.handle,
        precio: fmt.format(Number(b.priceRange.minVariantPrice.amount)),
    antes: b.compareAtPriceRange?.minVariantPrice?.amount &&
      Number(b.compareAtPriceRange.minVariantPrice.amount) > Number(b.priceRange.minVariantPrice.amount)
      ? fmt.format(Number(b.compareAtPriceRange.minVariantPrice.amount))
      : null,
        desc: (() => {
          const t = (b.description || '').replace(/\s+/g, ' ').trim();
          const frases = t.match(/[^.!?]+[.!?]+/g) || [];
          const dos = frases.slice(0, 2).join(' ').replace(/\s+/g, ' ').trim();
          return dos.length > 40 ? dos : t.slice(0, 170);
        })(),
        imgs: b.images.nodes.map((n) => optimizar(n.url, 900)),
        ...estrellas(b.metafields),
      }
    : null;

  return {
    destacada,
    botas,
    camisas,
    cats,
    combo,
    gorras,
    chaquetas,
    vendidos: productos.map((p) => ({
      id: p.id,
      titulo: p.title,
      handle: p.handle,
      precio: fmt.format(Number(p.priceRange.minVariantPrice.amount)),
    antes: Number(p.compareAtPriceRange?.minVariantPrice?.amount) > 0 &&
      Number(p.compareAtPriceRange.minVariantPrice.amount) !== Number(p.priceRange.minVariantPrice.amount)
      ? fmt.format(Number(p.compareAtPriceRange.minVariantPrice.amount))
      : null,
      imgs: p.images.nodes.map((n) => optimizar(n.url, 420)),
      img1: optimizar(p.images.nodes[0]?.url, 440),
      img2: optimizar(p.images.nodes[1]?.url || p.images.nodes[0]?.url, 440),
      desc: (p.description || '').replace(/\s+/g, ' ').trim().slice(0, 165),
      unidades: unidades.get(p.id) || 0,
      ...estrellas(p.metafields),
    })),
  };
}

export const meta = () => [
  {title: 'The Ranch — No nacimos para que fuera fácil'},
  {name: 'robots', content: 'noindex, nofollow'},
];

function Estrellas({valor, cuenta}) {
  if (!valor) return null;
  const pct = Math.max(0, Math.min(100, (valor / 5) * 100));
  return (
    <span className="hn-stars">
      <span className="hn-stars-icon">
        <span className="hn-stars-bg" aria-hidden="true">★★★★★</span>
        <span className="hn-stars-fg" style={{width: `${pct}%`}} aria-hidden="true">★★★★★</span>
      </span>
      <span className="hn-stars-num">
        {valor.toFixed(1)}
        {cuenta ? ` (${cuenta})` : ''}
      </span>
    </span>
  );
}

export default function HomeNuevo() {
  const wrap = useRef(null);
  const hero = useRef(null);
  const [enCesta, setEnCesta] = useState(0);
  const {oculto: barraOculta, pegado: barraPegada} = useHeaderScroll({alto: 120});

  useEffect(() => {
    const leer = () => setEnCesta(getCartCount());
    leer();
    window.addEventListener('ranch-cart-updated', leer);
    return () => window.removeEventListener('ranch-cart-updated', leer);
  }, []);
  const {vendidos, gorras, chaquetas, combo, destacada, camisas, cats, botas} = useLoaderData();


  return (
    <div className="hn-root">
      <div className="hn-wrap" ref={wrap}>
        <section className="hn-hero" ref={hero}>
          <HeroBurn src="/hero-jinete.webp" wrapRef={wrap} alt="Jinete con gorra The Ranch a caballo" />

          <header
            className={
              'hn-bar' +
              (barraPegada ? ' is-pegada' : '') +
              (barraOculta ? ' is-oculto' : '')
            }
          >
            <MenuLateral />
            <Link to="/nuevo2" className="hn-logo" aria-label="The Ranch">
              <img src="/logo-crema.png" alt="The Ranch" width="92" height="33" />
            </Link>
            <span className="hn-bag">
              <Carroza />
            </span>
          </header>

          <div className="hn-bottom">
            <h1 className="hn-title">
              <span className="hn-line hn-thin">No nacimos</span>
              <span className="hn-line hn-bold">para que fuera fácil.</span>
              <span className="hn-line hn-thin">Nacimos para</span>
              <span className="hn-line hn-bold">hacerlo bien.</span>
            </h1>


            <Link to="/nuevo2" className="hn-cta">
              Explorar colecciones
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>

        </section>
      </div>

      <section className="hn-cats">
        <div className="hn-cats-head">
          <p className="hn-cats-eyebrow">Explora</p>
          <h2 className="hn-cats-title">Colecciones</h2>
        </div>

        <nav className="hn-cats-row" aria-label="Colecciones">
          {CATS.map((c) => (
            <Link key={c.handle} to={`/nuevo2/coleccion/${c.handle}`} className="hn-cat">
              <span
                className="hn-cat-thumb"
                style={c.img ? {backgroundImage: `url(${c.img})`} : undefined}
              >
                {!c.img && <span className="hn-cat-ph">{c.nombre.slice(0, 3)}</span>}
              </span>
              <span className="hn-cat-name">{c.nombre}</span>
            </Link>
          ))}
        </nav>

        <section className="hn-top" aria-label="Lo más vendido del mes">
          <header className="hn-top-head">
            <p className="hn-top-eyebrow">Lo más vendido</p>
            <h2 className="hn-top-title">Este mes</h2>
          </header>

          <Rail>
            {vendidos.map((p, i) => (
              <Tarjeta key={p.id} p={p} prioridad={i < 2} badge="Más vendido" ruta="/nuevo2/producto/" />
            ))}
          </Rail>

          <Link to="/nuevo2/combo-gorras" className="hn-promo">
            <img src="/promo-gorras.webp" alt="Cinco gorras The Ranch" loading="lazy" decoding="async" />
            <span className="hn-promo-copy">
              <span className="hn-promo-eyebrow">El combo</span>
              <span className="hn-promo-title">Cinco gorras.<br />Quinientos mil.</span>
              <span className="hn-promo-cta">
                Ver el combo
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </span>
          </Link>

        <section className="hn-gorras" aria-label="Colección de gorras">
          <header className="hn-gorras-head">
            <div>
              <p className="hn-gorras-eyebrow">Colección</p>
              <h2 className="hn-gorras-title">Gorras</h2>
            </div>
            <Link to="/nuevo2/coleccion/gorras" className="hn-gorras-link">
              Ver todas
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </header>

          <Rail className="hn-rail-gorras">
            {gorras.map((p) => (
              <Tarjeta key={p.id} p={p} badge="Gorra" ruta="/nuevo2/producto/" />
            ))}
          </Rail>
        </section>

        <Lienzo />

        <section className="hn-gorras" aria-label="Colección de chaquetas">
          <header className="hn-gorras-head">
            <div>
              <p className="hn-gorras-eyebrow">Colección</p>
              <h2 className="hn-gorras-title">Chaquetas</h2>
            </div>
            <Link to="/nuevo2/coleccion/chaquetas" className="hn-gorras-link">
              Ver todas
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </header>

          <Rail className="hn-rail-chaquetas">
            {chaquetas.map((p) => (
              <Tarjeta key={p.id} p={p} badge="Chaquetas" ruta="/nuevo2/producto/" />
            ))}
          </Rail>
        </section>

        <Combo combo={combo} />

        <Destacada p={destacada} numero="01" tono="verde" />

        <section className="hn-gorras hn-camisas" aria-label="Camisas y camisetas">
          <header className="hn-gorras-head">
            <div>
              <p className="hn-gorras-eyebrow">Colección</p>
              <h2 className="hn-gorras-title">Camisas</h2>
            </div>
            <Link to="/nuevo2/coleccion/camisetas" className="hn-gorras-link">
              Ver todas
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </header>

          <Rail className="hn-rail-camisas">
            {camisas.map((p) => (
              <Tarjeta
                key={p.id}
                p={p}
                badge={p.handle.startsWith('camiseta') ? 'Camiseta' : 'Camisa'}
                ruta="/nuevo2/producto/"
              />
            ))}
          </Rail>
        </section>

        <Categorias cats={cats} />

        <Sellos />

        <Resenas />

        <Destacada p={botas} numero="02" tono="caoba" encuadre="escena" />

        <Pie />

        </section>
      </section>

    </div>
  );
}
