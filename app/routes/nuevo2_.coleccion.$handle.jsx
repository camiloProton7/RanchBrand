import {useLoaderData, Link} from 'react-router';
import styles from '~/styles/home-nuevo.css?url';
import {recordar} from '~/lib/cache';
import {useEffect, useMemo, useRef, useState} from 'react';
import {Grid, Tarjeta} from '~/components/Tarjeta';
import Sellos from '~/components/Sellos';
import Pie from '~/components/Pie';
import MenuLateral from '~/components/MenuLateral';
import Carroza from '~/components/Carroza';
import Buscador from '~/components/Buscador';
import {useHeaderScroll} from '~/lib/useHeaderScroll';

export const links = () => [{rel: 'stylesheet', href: styles}];

const COLECCION = `#graphql
  query Coleccion($handle: String!) {
    collection(handle: $handle) {
      title
      handle
      description
      image { url altText }
      products(first: 60, sortKey: BEST_SELLING) {
        nodes {
          id
          title
          handle
          availableForSale
          productType
          priceRange { minVariantPrice { amount currencyCode } }
      compareAtPriceRange { minVariantPrice { amount } }
          images(first: 4) { nodes { url altText } }
          metafields(identifiers: [
            {namespace: "reviews", key: "rating"},
            {namespace: "reviews", key: "rating_count"}
          ]) { key value }
        }
      }
    }
  }
`;

const PORTADAS = {
  gorras: '/col/gorras.webp',
  chaquetas: '/col/chaquetas.webp',
  camisetas: '/col/camisas.webp',
};

const CITAS = [
  'No nacimos para que fuera fácil.',
  'Hecho para durar, no para pasar.',
  'Para el frío que se viene.',
  'El que madruga, estrena.',
];

const FRASES = {
  gorras: ['Veinticinco gorras.', 'Ninguna sobra.'],
  chaquetas: ['Para el frío que se viene.', 'Cuero, lana y agua.'],
  camisetas: ['Camisas de faena.', 'Para el que madruga.'],
  'botas-1': ['Botas que aguantan.', 'Barro, piedra, camino.'],
};

const OTRAS = `#graphql
  query Otras {
    collections(first: 24) {
      nodes {
        handle
        title
        image { url }
        products(first: 1) { nodes { id featuredImage { url } } }
      }
    }
  }
`;

async function cargarColeccion({params, context}) {
  const handle = params.handle;
  const fresco = import.meta.env.DEV ? {cache: context.storefront.CacheNone()} : undefined;
  const [data, otrasData] = await Promise.all([
    context.storefront.query(COLECCION, {...fresco, variables: {handle}}),
    context.storefront.query(OTRAS, fresco),
  ]);
  const c = data.collection;
  if (!c) throw new Response('Colección no encontrada', {status: 404});

  const optimizar = (url, ancho) => {
    if (!url) return '';
    const base = url.split('?')[0];
    const v = url.includes('?v=') ? '?' + url.split('?')[1].split('&')[0] : '';
    return `${base}${v}${v ? '&' : '?'}width=${ancho}`;
  };

  const estrellas = (nodos) => {
    const lista = (nodos || []).filter(Boolean);
    const r = lista.find((m) => m.key === 'rating');
    const c2 = lista.find((m) => m.key === 'rating_count');
    let valor = 0;
    if (r?.value) {
      try {
        valor = Number(JSON.parse(r.value).value) || 0;
      } catch {
        valor = Number(r.value) || 0;
      }
    }
    return {valor, cuenta: Number(c2?.value) || 0};
  };

  const fmt = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });

  const productos = c.products.nodes.map((p) => {
    const {valor, cuenta} = estrellas(p.metafields);
    const n = Number(p.priceRange.minVariantPrice.amount);
    return {
      id: p.id,
      titulo: p.title,
      handle: p.handle,
      tipo: p.productType,
      disponible: p.availableForSale,
      precioNum: n,
      precio: fmt.format(n),
      antes: Number(p.compareAtPriceRange?.minVariantPrice?.amount) > 0 &&
        Number(p.compareAtPriceRange.minVariantPrice.amount) !== n
        ? fmt.format(Number(p.compareAtPriceRange.minVariantPrice.amount))
        : null,
      valor,
      cuenta,
      imgs: p.images.nodes.map((x) => optimizar(x.url, 420)),
      grande: p.images.nodes[0] ? optimizar(p.images.nodes[0].url, 1100) : null,
    };
  });

  const desde = productos.length ? Math.min(...productos.map((p) => p.precioNum)) : 0;

  const PRINCIPALES = ['chaquetas', 'camisetas', 'botas-1', 'gorras'];
  const porHandle = new Map((otrasData.collections?.nodes ?? []).map((x) => [x.handle, x]));
  const otras = PRINCIPALES.filter((h) => h !== handle)
    .map((h) => porHandle.get(h))
    .filter((x) => x && (x.image?.url || x.products?.nodes?.[0]?.featuredImage?.url))
    .map((x) => ({
      handle: x.handle,
      titulo: x.title,
      foto: optimizar(x.image?.url || x.products.nodes[0].featuredImage.url, 640),
    }));

  return {
    otras,
    titulo: c.title,
    handle: c.handle,
    descripcion: (c.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    foto:
      PORTADAS[handle] ??
      (c.image ? optimizar(c.image.url, 1200) : productos[0]?.grande ?? null),
    desde: desde ? fmt.format(desde) : null,
    productos,
  };
}

/**
 * La coleccion se guarda dos minutos: entrar y volver a una categoria no
 * debe repetir las dos consultas a Shopify cada vez.
 */
export async function loader({params, context}) {
  const handle = params.handle || '';
  return recordar(`coleccion:${handle}`, 2, () => cargarColeccion({params, context}));
}

export const meta = ({data}) => [
  {title: `${data?.titulo ?? 'Colección'} · The Ranch`},
  {name: 'description', content: data?.descripcion?.slice(0, 150) ?? ''},
];

export default function ColeccionNueva() {
  const {titulo, descripcion, foto, productos, handle, desde, otras} = useLoaderData();
  const [orden, setOrden] = useState('destacados');
  const heroRef = useRef(null);
  const [solido, setSolido] = useState(false);
  const {oculto: barraOculta} = useHeaderScroll({alto: 90});
  const [prog, setProg] = useState(0);

  useEffect(() => {
    const alScroll = () => {
      const alto = heroRef.current?.offsetHeight ?? 520;
      setSolido(window.scrollY > alto - 96);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProg(total > 0 ? Math.min(1, window.scrollY / total) : 0);
    };
    alScroll();
    window.addEventListener('scroll', alScroll, {passive: true});
    return () => window.removeEventListener('scroll', alScroll);
  }, []);

  const lista = useMemo(() => {
    const l = [...productos];
    if (orden === 'precio-asc') l.sort((a, b) => a.precioNum - b.precioNum);
    if (orden === 'precio-desc') l.sort((a, b) => b.precioNum - a.precioNum);
    if (orden === 'az') l.sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));
    return l;
  }, [productos, orden]);

  const frase = FRASES[handle] ?? ['Hecho para el campo.', 'Y para la ciudad.'];

  return (
    <div className="hc">
      <div className={'hc-bar' + (solido ? ' is-solido' : '') + (barraOculta ? ' is-oculto' : '')}>
        <MenuLateral tono={solido ? 'tinta' : 'crema'} />
        <Link to="/nuevo2" prefetch="intent" className="hc-logo" aria-label="The Ranch, ir al inicio">
          <img
            src={solido ? '/logo-tinta.png' : '/logo-crema.png'}
            alt="The Ranch"
            width="78"
          />
        </Link>
        <span className="hc-bolsa">
          <Buscador tono="oscuro" />
          <Carroza />
        </span>
        <span className="hc-prog" style={{transform: `scaleX(${prog})`}} aria-hidden="true" />
      </div>

      <section className="hc-hero" ref={heroRef}>
        {foto && <img
          src={foto}
          alt={titulo}
          className="hc-hero-img"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />}
        <span className="hc-hero-velo" aria-hidden="true" />
        <div className="hc-hero-copy">
          <p className="hc-hero-rotulo">Colección</p>
          <h1 className="hc-hero-titulo">{titulo}</h1>
          <p className="hc-hero-pie">
            {productos.length} {productos.length === 1 ? 'pieza' : 'piezas'}
            {desde && <span> · desde {desde}</span>}
          </p>
        </div>
      </section>

      <section className="hc-intro">
        <p className="hc-intro-frase">
          {frase[0]}
          <br />
          <em>{frase[1]}</em>
        </p>
        {descripcion && <p className="hc-intro-desc">{descripcion.slice(0, 132)}</p>}
        <div className="hc-orden" role="group" aria-label="Ordenar">
          {[
            ['destacados', 'Destacados'],
            ['precio-asc', 'Precio ↑'],
            ['precio-desc', 'Precio ↓'],
            ['az', 'A-Z'],
          ].map(([k, t], i) => (
            <button
              key={k}
              type="button"
              className={'hc-orden-btn' + (orden === k ? ' is-on' : '')}
              onClick={() => setOrden(k)}
            >
              {i > 0 && <span className="hc-orden-sep" aria-hidden="true">·</span>}
              {t}
            </button>
          ))}
        </div>
      </section>

      <Grid className="hc-grid">
        {lista.map((p, i) => (
          <Tarjeta
            key={p.id}
            p={p}
            prioridad={i < 2}
            badge={p.tipo || undefined}
            ruta="/nuevo2/producto/"
          />
        ))}
      </Grid>

      {lista.length === 0 && <p className="hc-vacio">Esta colección está vacía.</p>}

      {otras.length > 0 && (
        <section className="hc-otras">
          <div className="hc-otras-head">
            <h2>Sigue el camino</h2>
            <span>Desliza →</span>
          </div>
          <div className="hc-otras-rail">
            {otras.map((o) => (
              <Link key={o.handle} to={`/nuevo2/coleccion/${o.handle}`} className="hc-otra">
                <span className="hc-otra-media">
                  <img src={o.foto} alt={o.titulo} loading="lazy" />
                  <span className="hc-otra-velo" aria-hidden="true" />
                  <span className="hc-otra-nombre">{o.titulo}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Sellos />
      <Pie />
    </div>
  );
}
