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

// La selección la armó Camilo: qué entra a la campaña y en qué orden.
const SECCIONES = [
  {
    titulo: 'Botas de niño',
    nota: 'Las tres que quedan, tallas 27 a 32.',
    handles: ['botas-kids-ovejo', 'botas-rojas-kids', 'botas-western-kids', 'botas-corazones-ranch'],
  },
  {
    titulo: 'Botas de mujer',
    nota: 'Negra, verde militar y berenjena.',
    handles: ['botas-ranch'],
  },
  {
    titulo: 'Botines de mujer',
    nota: 'Chelsea en dos acabados y las urbanas.',
    handles: ['botas-chelsea', 'botas-chelsea-cobreblack', 'botas-urbanas'],
  },
  {
    titulo: 'Chaquetas y chalecos',
    nota: 'Del bombacho al nylon: cinco capas para la lluvia y el frío.',
    handles: [
      'chaleco-bombacho',
      'chaqueta-hunter-impermeable-green',
      'chaqueta-impermeable-yellowstone-dtf',
      'chaqueta-impermeable-camuflada',
      'chaqueta-impermeable-mojave',
      'chaqueta-impermeable-sahara',
    ],
  },
  {
    titulo: 'Camisas y polos',
    nota: 'Manga corta, polo y las outdoor.',
    handles: [
      'camisa-outdoor-the-ranch',
      'camisa-manga-corta',
      'camisa-tipo-polo',
    ],
  },
  {
    titulo: 'Billeteras y licoreras',
    nota: 'Para el que ya tiene de todo.',
    handles: ['billetera-anti-clonacion-copia', 'licorera-metalica'],
  },
  {
    titulo: 'Gorras',
    nota: 'Las dos que menos salen, con descuento.',
    handles: ['gorra-camuflada-heritage', 'gorra-bull'],
  },
];

function ficha(p) {
  const validas = [];
  for (const v of p.variants?.nodes || []) {
    const precio = Number(v.price);
    const antes = v.compareAtPrice ? Number(v.compareAtPrice) : 0;
    const unidades = v.inventoryQuantity || 0;
    if (unidades > 0) validas.push({precio, antes, unidades});
  }
  if (!validas.length) return null;
  const precio = Math.min(...validas.map((x) => x.precio));
  const conDescuento = validas.filter((x) => x.antes > x.precio);
  // el «antes» sólo se pinta si hay descuento real en esa variante
  const antes = conDescuento.length ? Math.max(...conDescuento.map((x) => x.antes)) : 0;
  const pct = antes > precio ? Math.round((1 - precio / antes) * 100) : 0;
  const t = p.title.toLowerCase();
  const tipo =
    p.productType ||
    (t.includes('bota') ? 'Bota' : t.includes('chaqueta') ? 'Chaqueta' : t.includes('camisa')
      ? 'Camisa' : t.includes('gorra') ? 'Gorra' : t.includes('billetera') ? 'Billetera'
      : t.includes('licorera') ? 'Licorera' : 'The Ranch');
  return {
    titulo: p.title,
    handle: p.handle,
    tipo,
    foto: p.featuredImage.url,
    alt: p.featuredImage.altText || p.title,
    precio,
    antes: pct >= 3 ? antes : 0,
    pct: pct >= 3 ? pct : 0,
    unidades: validas.reduce((s, x) => s + x.unidades, 0),
  };
}

function armar(productos) {
  const porHandle = new Map();
  for (const p of productos || []) {
    if (p.status !== 'ACTIVE' || !p.featuredImage) continue;
    const f = ficha(p);
    if (f) porHandle.set(p.handle, f);
  }
  const secciones = SECCIONES.map((sec) => ({
    ...sec,
    piezas: sec.handles.map((h) => porHandle.get(h)).filter(Boolean),
  })).filter((s) => s.piezas.length);

  const conDescuento = [...porHandle.values()].filter((o) => o.pct > 0);
  conDescuento.sort((a, b) => b.pct - a.pct);

  // cuatro gorras para el abanico del pack: las mismas que van en la sección
  // cinco gorras: el pack vende cinco, el abanico muestra cinco
  const packFotos = [
    'gorra-camuflada-heritage',
    'gorra-bull',
    'gorra-desert',
    'gorra-redwood',
    'gorra-territory',
  ]
    .map((h) => porHandle.get(h))
    .filter(Boolean)
    .map((o) => o.foto);

  return {secciones, rebajadas: conDescuento, packFotos};
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
          inventoryQuantity: v.availableForSale ? 1 : 0,
        })),
      },
    }));
    const datos = armar(planos);
    const sinUnidades = (lista) => lista.map((o) => ({...o, unidades: null}));
    return {
      secciones: datos.secciones.map((s) => ({...s, piezas: sinUnidades(s.piezas)})),
      rebajadas: sinUnidades(datos.rebajadas),
      packFotos: datos.packFotos,
    };
  };

  // en desarrollo sin caché: un cambio de precio o de stock se ve al recargar
  const datos = import.meta.env.DEV ? await producir() : await recordar('black-friday', 2, producir);

  return {
    secciones: datos.secciones,
    rebajadas: datos.rebajadas,
    packFotos: datos.packFotos,
    cierre: CIERRE,
  };
}

const dinero = (n) => '$ ' + Math.round(n).toLocaleString('es-CO');

function Cuenta({cierre}) {
  // Arranca en null: el reloj se pinta después de montar. Si se calcula en el
  // servidor, el primer render del cliente no coincide y React tira error 425.
  const [falta, setFalta] = useState(null);

  useEffect(() => {
    const tic = () => setFalta(new Date(cierre).getTime() - Date.now());
    tic();
    const id = setInterval(tic, 1000);
    return () => clearInterval(id);
  }, [cierre]);

  if (falta !== null && falta <= 0) {
    return <p className="bf-fin">La campaña se cerró. Gracias a los que alcanzaron.</p>;
  }

  const s = falta === null ? null : Math.floor(falta / 1000);
  const cajas = [
    ['días', s === null ? null : Math.floor(s / 86400)],
    ['horas', s === null ? null : Math.floor((s % 86400) / 3600)],
    ['min', s === null ? null : Math.floor((s % 3600) / 60)],
    ['seg', s === null ? null : s % 60],
  ];

  return (
    <div className="bf-reloj" aria-label="Cuenta regresiva del Black Friday">
      {cajas.map(([rot, n]) => (
        <span className="bf-reloj-caja" key={rot}>
          <b>{n === null ? '--' : String(n).padStart(2, '0')}</b>
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
        {o.pct > 0 && <span className="bf-off">−{o.pct}%</span>}
        {o.unidades !== null && o.unidades <= 5 && (
          <span className="bf-poco">
            {o.unidades === 1 ? 'Última unidad' : `Solo quedan ${o.unidades}`}
          </span>
        )}
      </span>
      <span className="bf-card-info">
        <span className="bf-card-tipo">{o.tipo || 'The Ranch'}</span>
        <span className="bf-card-nombre">{o.titulo}</span>
        <span className="bf-card-precios">
          <b>{dinero(o.precio)}</b>
          {o.antes > 0 && <em>antes {dinero(o.antes)}</em>}
        </span>
      </span>
    </Link>
  );
}

export default function BlackFriday() {
  const {secciones, rebajadas, packFotos = [], cierre} = useLoaderData();
  const todas = secciones.flatMap((s) => s.piezas);
  const ultimas = todas.filter((o) => o.unidades !== null && o.unidades <= 5);
  const mejor = rebajadas[0]?.pct ?? 0;
  const conDescuento = todas.filter((o) => o.pct > 0).length;

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
              <em>{mejor || 53}%</em>
              <small>de descuento</small>
            </h1>
            <p className="bf-bajada">
              {todas.length} piezas escogidas para la campaña. Las tallas que quedan son las que
              hay: cuando se acaba una, se acaba.
            </p>
            <Cuenta cierre={cierre} />
            <a href="#seleccion" className="bf-cta">
              Ver la selección
            </a>
          </div>
          <div className="bf-hero-pie">
            <span>{todas.length} piezas</span>
            <span>{conDescuento} con descuento</span>
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

        <section className="bf-pack">
          <div className="bf-pack-top">
            <p className="bf-eyebrow">El combo de la casa</p>
            <p className="bf-pack-precio">
              <b>5 gorras</b>
              <span>$ 500.000</span>
            </p>
          </div>
          <div className="bf-pack-fotos" aria-hidden="true">
            {packFotos.map((f, i) => (
              <img
                key={f}
                src={`${f}${f.includes('?') ? '&' : '?'}width=220`}
                alt=""
                loading="lazy"
                width="88"
                height="88"
                style={{'--i': i}}
              />
            ))}
          </div>
          <h2 className="bf-pack-titulo">
            Cinco gorras,
            <br />
            un solo precio.
          </h2>
          <p className="bf-pack-txt">
            Eliges las cinco que quieras y salen a $ 500.000, sin importar la mezcla. Cada una
            queda a $ 100.000.
          </p>
          <Link to="/combo-gorras" prefetch="intent" className="bf-pack-cta">
            Armar mi pack
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
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

        <div id="seleccion">
          {secciones.map((sec) => (
            <section className="bf-bloque" key={sec.titulo}>
              <header className="bf-head bf-bloque-head">
                <h2 className="bf-h2">{sec.titulo}</h2>
                <p className="bf-nota">{sec.nota}</p>
              </header>
              <div className="bf-grid">
                {sec.piezas.map((o) => (
                  <Tarjeta o={o} key={o.handle} />
                ))}
              </div>
            </section>
          ))}
        </div>

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
          <a href="#seleccion" className="bf-cta bf-cta-claro">
            Escoger mi talla
          </a>
        </section>
      </main>

      <Pie />
    </div>
  );
}
