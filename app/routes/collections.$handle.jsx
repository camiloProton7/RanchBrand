import {useLoaderData, Link} from 'react-router';
import styles from '~/styles/home-nuevo.css?url';
import {recordar} from '~/lib/cache';
import {useEffect, useMemo, useRef, useState} from 'react';
import {Grid, Tarjeta} from '~/components/Tarjeta';
import ColeccionEditorial from '~/components/ColeccionEditorial';
import Sellos from '~/components/Sellos';
import Pie from '~/components/Pie';
import MenuLateral from '~/components/MenuLateral';
import Carroza from '~/components/Carroza';
import Buscador from '~/components/Buscador';

export const links = () => [{rel: 'stylesheet', href: styles}];

const COLECCION = `#graphql
  query Coleccion($handle: String!, $orden: ProductCollectionSortKeys!, $alreves: Boolean!) {
    collection(handle: $handle) {
      title
      handle
      description
      image { url altText }
      products(first: 60, sortKey: $orden, reverse: $alreves) {
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
  chaquetas: '/col/chaquetas-portada.webp',
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

// las dos colecciones que Camilo llena a mano desde Shopify
const DE_GENERO = `#graphql
  query DeGenero {
    hombre: collection(handle: "chaquetas-hombre") {
      products(first: 100) { nodes { handle } }
    }
    mujer: collection(handle: "chaquetas-mujer") {
      products(first: 100) { nodes { handle } }
    }
  }
`;

async function cargarColeccion({params, context, genero = ''}) {
  const handle = params.handle;
  // Hombre/Mujer se leen de SU colección curada, no de la grande filtrada:
  // así manda el orden manual que Camilo deja en Shopify para cada una.
  const curada =
    handle === 'chaquetas' && (genero === 'hombre' || genero === 'mujer')
      ? `chaquetas-${genero}`
      : null;
  const fresco = import.meta.env.DEV ? {cache: context.storefront.CacheNone()} : undefined;
  const [data, otrasData] = await Promise.all([
    context.storefront.query(COLECCION, {
      ...fresco,
      // manda el orden manual que Camilo arma en Shopify
      variables: {
        handle: curada || handle,
        orden: 'MANUAL',
        alreves: false,
      },
    }),
    context.storefront.query(OTRAS, fresco),
  ]);
  let c = data.collection;
  // si la colección curada no existe todavía, se cae a la grande
  if (!c && curada) {
    const alt = await context.storefront.query(COLECCION, {
      ...fresco,
      variables: {handle, orden: 'MANUAL', alreves: false},
    });
    c = alt.collection;
  }
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
      // solo la principal y la del hover: la grilla traia las cuatro fotos de
      // cada producto y bajaba 1,9 MB aunque solo se viera la primera
      imgs: p.images.nodes.slice(0, 2).map((x) => optimizar(x.url, 420)),
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

  // submenu hombre / mujer: manda lo que haya en cada coleccion curada
  let lista = productos;
  if (handle === 'chaquetas' && (genero === 'hombre' || genero === 'mujer')) {
    const hombres = new Set();
    const mujeres = new Set();
    try {
      const g = await context.storefront.query(DE_GENERO, {
        cache: context.storefront.CacheShort(),
      });
      for (const p of g?.hombre?.products?.nodes || []) hombres.add(p.handle);
      for (const p of g?.mujer?.products?.nodes || []) mujeres.add(p.handle);
    } catch {
      /* sin las listas, se muestran todas */
    }

    if (genero === 'mujer' && mujeres.size) {
      lista = productos.filter((p) => mujeres.has(p.handle));
    }
    if (genero === 'hombre') {
      if (hombres.size) {
        lista = productos.filter((p) => hombres.has(p.handle));
      } else if (mujeres.size) {
        // mientras la coleccion de hombre este vacia: todas menos las de mujer
        lista = productos.filter((p) => !mujeres.has(p.handle));
      }
    }
  }

  // Título con el género pegado de forma legible: "Chaquetasde hombre" salía
  // sin espacio porque se concatenaba crudo sobre el title de Shopify.
  const tituloBase = (c.title || '').trim();
  const tituloGenero =
    genero === 'hombre' || genero === 'mujer'
      ? `${
          /chaqueta/i.test(tituloBase)
            ? tituloBase.replace(/chaquetas?/i, (m) => (m.endsWith('s') ? 'Chaquetas' : 'Chaqueta'))
            : tituloBase
        } de ${genero}`
      : tituloBase;

  return {
    otras,
    genero,
    titulo: tituloGenero,
    handle: c.handle,
    descripcion: (c.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    foto:
      PORTADAS[handle] ??
      (c.image ? optimizar(c.image.url, 1200) : productos[0]?.grande ?? null),
    desde: desde ? fmt.format(desde) : null,
    productos: lista,
  };
}

/**
 * La coleccion se guarda dos minutos: entrar y volver a una categoria no
 * debe repetir las dos consultas a Shopify cada vez.
 */
export async function loader({params, context, request}) {
  const handle = params.handle || '';
  const genero = new URL(request.url).searchParams.get('genero') || '';
  return recordar(`coleccion:${handle}:${genero}`, 2, () =>
    cargarColeccion({params, context, genero}),
  );
}

const FRASE_COL = {
  gorras: 'Gorras de faena, visera curva y tela que aguanta sol y polvo. Elige la tuya y recíbela en casa.',
  chaquetas: 'Chaquetas enceradas, acolchadas y de gamuza para el frío de la sabana. Prendas que duran años.',
  camisetas: 'Camisas de dril y algodón pesado, con el corte de trabajo de siempre. Para el que madruga.',
  'botas-1': 'Botas de cuero, suela firme y horma cómoda. Para el barro, la piedra y el camino largo.',
};

export const meta = ({data}) => {
  const t = data?.titulo ?? 'Colección';
  const h = data?.handle ?? '';
  const d =
    (data?.descripcion && data.descripcion.slice(0, 155)) ||
    FRASE_COL[h] ||
    `${t} de The Ranch. Prendas hechas para durar, con envío a toda Colombia.`;
  const crudo = data?.foto || `/col/${h === 'botas-1' ? 'chaquetas' : h}.webp`;
  // Facebook y WhatsApp exigen la imagen absoluta
  const img = crudo.startsWith('http') ? crudo : `https://ranch.com.co${crudo}`;
  return [
    {title: `${t} · The Ranch`},
    {name: 'description', content: d},
    {tagName: 'link', rel: 'canonical', href: `https://ranch.com.co/collections/${h}`},
    {property: 'og:type', content: 'website'},
    {property: 'og:site_name', content: 'The Ranch'},
    {property: 'og:locale', content: 'es_CO'},
    {property: 'og:title', content: `${t} · The Ranch`},
    {property: 'og:description', content: d},
    {property: 'og:url', content: `https://ranch.com.co/collections/${h}`},
    {property: 'og:image', content: img},
    {name: 'twitter:card', content: 'summary_large_image'},
  ];
};

export default function ColeccionNueva() {
  const {titulo, descripcion, foto, productos, handle, desde, otras, genero} = useLoaderData();
  const [orden, setOrden] = useState('destacados');
  const heroRef = useRef(null);
  // La barra va siempre sólida y visible: sobre la foto quedaba transparente y
  // se perdía al subir. En colección el usuario necesita el menú a mano.
  const solido = true;
  const [prog, setProg] = useState(0);

  useEffect(() => {
    const alScroll = () => {
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

  // chaquetas de hombre: recorrido editorial, una prenda por pantalla
  const esEditorial = handle === 'chaquetas-hombre' || (handle === 'chaquetas' && genero === 'hombre');
  if (esEditorial) {
    return <ColeccionEditorial productos={productos} titulo={titulo} desde={desde} />;
  }

  return (
    <main className="hc">
      <div className={'hc-bar' + (solido ? ' is-solido' : '')}>
        <MenuLateral tono={solido ? 'tinta' : 'crema'} />
        <Link to="/" prefetch="intent" className="hc-logo" aria-label="The Ranch, ir al inicio">
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
        {handle === 'chaquetas' && (
          <div className="hc-genero" role="group" aria-label="Hombre o mujer">
            {[
              ['', 'Todo'],
              ['hombre', 'Hombre'],
              ['mujer', 'Mujer'],
            ].map(([k, t]) => (
              <Link
                key={t}
                to={'/collections/chaquetas' + (k ? `?genero=${k}` : '')}
                prefetch="intent"
                className={'hc-genero-btn' + (genero === k ? ' is-on' : '')}
              >
                {t}
              </Link>
            ))}
          </div>
        )}

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
            ruta="/products/"
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
              <Link key={o.handle} to={`/collections/${o.handle}`} className="hc-otra">
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
    </main>
  );
}
