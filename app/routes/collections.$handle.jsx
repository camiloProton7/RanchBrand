import {useEffect, useMemo, useRef, useState} from 'react';
import {Link, useLoaderData} from 'react-router';
import {Analytics} from '@shopify/hydrogen';
import {optimizeImage, imageSrcSet} from '~/lib/image';
import {ratingFor} from '~/lib/rating';
import percheroStyles from '~/styles/perchero-home.css?url';
import collectionStyles from '~/styles/collection.css?url';

export const links = () => [{rel: 'stylesheet', href: collectionStyles}, {rel: 'stylesheet', href: percheroStyles}];

// Full-page cache de Oxygen: sirve el HTML desde el edge (páginas estáticas).
export const headers = () => ({
  'Oxygen-Cache-Control':
    'public, max-age=3600, s-maxage=3600, stale-while-revalidate=82800',
  Vary: 'Accept-Encoding, Accept-Language',
});

export const meta = ({data}) => {
  const collection = data?.collection;
  const title = collection?.title ? `${collection.title} — The Ranch` : 'Colección — The Ranch';
  const url = collection?.handle
    ? `https://ranch.com.co/collections/${collection.handle}`
    : 'https://ranch.com.co';
  const description =
    collection?.description ||
    `${collection?.title || 'Colección'} de The Ranch. Calidad premium, envío gratis en Colombia.`;
  return [
    {title},
    {name: 'description', content: description},
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    {property: 'og:type', content: 'website'},
    {property: 'og:url', content: url},
    {name: 'twitter:card', content: 'summary_large_image'},
    {tagName: 'link', rel: 'canonical', href: url},
  ];
};

const COLLECTION_QUERY = `#graphql
  query CollectionByHandle($handle: String!) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        url
        altText
      }
      products(first: 48) {
        nodes {
          id
          title
          handle
          featuredImage {
            url
            altText
          }
          images(first: 2) {
            nodes {
              url
              altText
            }
          }
          priceRange {
            minVariantPrice { amount currencyCode }
          }
          compareAtPriceRange {
            minVariantPrice { amount currencyCode }
          }
          variants(first: 10) {
            nodes {
              id
              availableForSale
              selectedOptions { name value }
              price { amount currencyCode }
            }
          }
        }
      }
    }
  }
`;

const SHOPIFY_DOMAIN = '1caf84-4.myshopify.com';

// Tallas de la tarjeta: nombre + si está disponible, para verlo sin entrar al producto.
// Colecciones que arrancan con su PERCHERO (el rack de prendas colgadas) arriba del
// listado: es la misma página del perchero servida en modo embed, dentro de un iframe.
const PERCHEROS = {
  bordados: {
    src: '/perchero/sacos.html?embed=1',
    titulo: 'Sacos bordados',
  },
};

function tallasDe(product) {
  const out = [];
  for (const v of product?.variants?.nodes || []) {
    const opt = (v.selectedOptions || []).find((o) => /talla|tama|size/i.test(o.name));
    const nombre = (opt ? opt.value : (v.title || '').split(' / ').pop() || '').trim();
    if (!nombre || out.some((x) => x.nombre === nombre)) continue;
    out.push({nombre, disponible: Boolean(v.availableForSale)});
  }
  return out;
}

function toNumericId(gid) {
  return gid?.match(/\/(\d+)$/)?.[1] || gid;
}

function formatPrice(amount, currency = 'COP') {
  if (!amount) return '';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

const MARQUEE_ITEMS = [
  'ENVÍO GRATIS',
  'PROTECCIÓN UV',
  'HECHO EN COLOMBIA',
  'CAMBIOS FÁCILES',
  'PAGO SEGURO',
];

export async function loader({params, context}) {
  const {storefront} = context;
  try {
    const data = await storefront.query(COLLECTION_QUERY, {
      variables: {handle: params.handle},
    });
    return {collection: data?.collection || null};
  } catch (error) {
    console.error('Colección falló', error);
    return {collection: null};
  }
}

export default function CollectionPage() {
  const {collection} = useLoaderData();
  const [activeColor, setActiveColor] = useState(null);
  const [sort, setSort] = useState('featured');
  const [quickView, setQuickView] = useState(null);

  if (!collection) {
    return (
      <div className="tr-col-empty">
        <h1>Colección no encontrada</h1>
        <Link to="/">← Volver al inicio</Link>
      </div>
    );
  }

  const products = collection.products?.nodes || [];
  const heroImage = collection.image?.url || products[0]?.featuredImage?.url;

  const colors = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      (p.variants?.nodes || []).forEach((v) => {
        (v.selectedOptions || []).forEach((o) => {
          if (o.name?.toLowerCase() === 'color' && o.value) set.add(o.value);
        });
      });
    });
    return Array.from(set);
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (activeColor) {
      list = list.filter((p) =>
        (p.variants?.nodes || []).some((v) =>
          (v.selectedOptions || []).some(
            (o) => o.name?.toLowerCase() === 'color' && o.value === activeColor,
          ),
        ),
      );
    }
    const price = (p) => Number(p.priceRange?.minVariantPrice?.amount) || 0;
    if (sort === 'price-asc') list.sort((a, b) => price(a) - price(b));
    else if (sort === 'price-desc') list.sort((a, b) => price(b) - price(a));
    else if (sort === 'name') list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [products, activeColor, sort]);

  const addToCart = (variantId) => {
    if (!variantId) return;
    window.location.href = `https://${SHOPIFY_DOMAIN}/cart/${toNumericId(variantId)}:1`;
  };

  return (
    <div className="tr-col">
      <Analytics.CollectionView
        data={{collection: {id: collection.id, handle: collection.handle}}}
      />
      <header className="tr-col-hero">
        <div className="tr-col-hero-inner">
          <span className="tr-col-eyebrow">Colección</span>
          <h1 className="tr-col-title">{collection.title}</h1>
          {collection.description ? (
            <p className="tr-col-desc">{collection.description}</p>
          ) : null}
          <span className="tr-col-count">
            {products.length} {products.length === 1 ? 'producto' : 'productos'}
          </span>
        </div>
        {heroImage ? (
          <div className="tr-col-hero-media" aria-hidden="true">
            <img src={optimizeImage(heroImage, 1200)} alt="" />
          </div>
        ) : null}
      </header>

      {/* ===== Marquee ===== */}
      <div className="tr-col-marquee" aria-hidden="true">
        <div className="tr-col-marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="tr-col-marquee-item">
              {item}
              <i>·</i>
            </span>
          ))}
        </div>
      </div>

      {PERCHEROS[collection.handle] ? (
        <section className="tr-perchero" id="sacos-bordados" aria-label={PERCHEROS[collection.handle].titulo}>
          {/* Sin encabezado propio: el de la colección ya nombra la sección y el gesto lo
              enseña el panel del perchero ("desliza para explorar"). */}
          <div className="tr-perchero-marco">
            <iframe
              src={PERCHEROS[collection.handle].src}
              title={`Perchero de ${PERCHEROS[collection.handle].titulo} The Ranch`}
              loading="lazy"
            />
          </div>
        </section>
      ) : null}

      {/* ===== Filtros ===== */}
      <div className="tr-col-filters">
        <div className="tr-col-chips">
          <button
            type="button"
            className={!activeColor ? 'is-active' : ''}
            onClick={() => setActiveColor(null)}
          >
            Todos
          </button>
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              className={activeColor === c ? 'is-active' : ''}
              onClick={() => setActiveColor(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <select
          className="tr-col-sort"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Ordenar"
        >
          <option value="featured">Destacados</option>
          <option value="price-asc">Precio: menor a mayor</option>
          <option value="price-desc">Precio: mayor a menor</option>
          <option value="name">Nombre A–Z</option>
        </select>
      </div>

      {/* ===== Grid ===== */}
      <div className="tr-col-grid">
        {filtered.map((p, i) => (
          <CollectionCard
            key={p.id}
            product={p}
            index={i}
            onQuickView={setQuickView}
          />
        ))}
      </div>

      {/* ===== Quick view modal ===== */}
      {quickView ? (
        <div className="tr-col-qv-overlay" onClick={() => setQuickView(null)}>
          <div className="tr-col-qv" onClick={(e) => e.stopPropagation()}>
            <button
              className="tr-col-qv-close"
              type="button"
              aria-label="Cerrar"
              onClick={() => setQuickView(null)}
            >
              ×
            </button>
            {quickView.featuredImage?.url ? (
              <img
                className="tr-col-qv-img"
                src={optimizeImage(quickView.featuredImage.url, 600)}
                alt={quickView.featuredImage.altText || quickView.title}
              />
            ) : null}
            <div className="tr-col-qv-info">
              <h3 className="tr-col-qv-title">{quickView.title}</h3>
              <span className="tr-col-qv-price">
                {formatPrice(quickView.priceRange?.minVariantPrice?.amount)}
              </span>
              <div className="tr-col-qv-variants">
                {(quickView.variants?.nodes || []).map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      addToCart(v.id);
                      setQuickView(null);
                    }}
                  >
                    {(v.selectedOptions || []).map((o) => o.value).join(' / ') || 'Único'}
                  </button>
                ))}
              </div>
              <Link
                className="tr-col-qv-link"
                to={`/products/${quickView.handle}`}
                onClick={() => setQuickView(null)}
              >
                Ver producto completo →
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CollectionCard({product, index, onQuickView}) {
  const primary = product.featuredImage;
  const second = product.images?.nodes?.[1];
  const price = product.priceRange?.minVariantPrice?.amount;
  const tallas = tallasDe(product);
  const todoAgotado = tallas.length > 0 && tallas.every((t) => !t.disponible);
  const compare = product.compareAtPriceRange?.minVariantPrice?.amount;
  const hasDiscount = compare && Number(compare) > Number(price);

  return (
    <article className="tr-col-card">
      <Link
        className="tr-col-card-link"
        to={`/products/${product.handle}`}
        prefetch="intent"
      >
          <div
            className="tr-col-card-media"
            onPointerMove={(e) => {
              // Scrub: deslizar el dedo revela la 2ª imagen (solo touch)
              if (e.pointerType !== 'touch') return;
              const el = e.currentTarget;
              const rect = el.getBoundingClientRect();
              const p = Math.max(
                0,
                Math.min(1, (e.clientX - rect.left) / rect.width),
              );
              const img1 = el.querySelector('.tr-col-card-img-1');
              const img2 = el.querySelector('.tr-col-card-img-2');
              if (img1) img1.style.opacity = String(1 - p);
              if (img2) img2.style.opacity = String(p);
            }}
            onPointerLeave={(e) => {
              const img1 = e.currentTarget.querySelector('.tr-col-card-img-1');
              const img2 = e.currentTarget.querySelector('.tr-col-card-img-2');
              if (img1) img1.style.opacity = '1';
              if (img2) img2.style.opacity = '0';
            }}
          >
            {primary?.url ? (
              <img
                className="tr-col-card-img tr-col-card-img-1"
                src={optimizeImage(primary.url, 480)}
                srcSet={imageSrcSet(primary.url, [240, 360, 480, 720])}
                sizes="(min-width: 1000px) 330px, (min-width: 640px) 33vw, 50vw"
                alt={primary.altText || product.title}
                loading="lazy"
              />
            ) : null}
            {second?.url ? (
              <img
                className="tr-col-card-img tr-col-card-img-2"
                src={optimizeImage(second.url, 480)}
                srcSet={imageSrcSet(second.url, [240, 360, 480, 720])}
                sizes="(min-width: 1000px) 330px, (min-width: 640px) 33vw, 50vw"
                alt=""
                loading="lazy"
                decoding="async"
                onLoad={(e) => {
                  // Activa el crossfade solo cuando la 2ª imagen ya cargó
                  e.currentTarget
                    .closest('.tr-col-card-media')
                    ?.classList.add('tr-gorra-ready');
                }}
              />
            ) : null}
            <span className="tr-col-rating-badge">
              <i>★</i> {ratingFor(product.handle).num}
            </span>
            {hasDiscount ? <span className="tr-col-offer">Oferta</span> : null}
          </div>
          <div className="tr-col-card-info">
            <h3 className="tr-col-card-name">{product.title}</h3>
            {tallas.length > 1 ? (
              <div className="tr-col-sizes" role="list" aria-label="Tallas disponibles">
                {tallas.map((t) => (
                  <span
                    key={t.nombre}
                    role="listitem"
                    className={`tr-col-size ${t.disponible ? 'is-on' : 'is-off'}`}
                    title={t.disponible ? `Talla ${t.nombre} disponible` : `Talla ${t.nombre} agotada`}
                  >
                    {t.nombre}
                  </span>
                ))}
                {todoAgotado ? <span className="tr-col-soldout">Agotado</span> : null}
              </div>
            ) : null}
            <div className="tr-col-card-meta">
              <span className="tr-col-card-price">
                {formatPrice(price)}
                {hasDiscount ? (
                  <s className="tr-col-card-compare">{formatPrice(compare)}</s>
                ) : null}
              </span>
            </div>
          </div>
      </Link>
    </article>
  );
}
