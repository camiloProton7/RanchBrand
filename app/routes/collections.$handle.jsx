import {useEffect, useMemo, useRef, useState} from 'react';
import {Link, useLoaderData} from 'react-router';
import collectionStyles from '~/styles/collection.css?url';

export const links = () => [{rel: 'stylesheet', href: collectionStyles}];

export const meta = ({data}) => {
  const title = data?.collection?.title;
  return [{title: title ? `${title} — The Ranch` : 'Colección — The Ranch'}];
};

const COLLECTION_QUERY = `#graphql
  query CollectionByHandle($handle: String!) {
    collection(handle: $handle) {
      id
      title
      description
      image {
        url
        altText
      }
      products(first: 24) {
        nodes {
          id
          title
          handle
          description
          featuredImage {
            url(transform: {maxWidth: 700, preferredContentType: WEBP})
            altText
          }
          images(first: 2) {
            nodes {
              url(transform: {maxWidth: 700, preferredContentType: WEBP})
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

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
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
            <img src={heroImage} alt="" />
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
            onAdd={addToCart}
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
                src={quickView.featuredImage.url}
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

function CollectionCard({product, index, onAdd, onQuickView}) {
  const ref = useRef(null);
  const parallaxRef = useRef(null);
  const primary = product.featuredImage;
  const second = product.images?.nodes?.[1];
  const price = product.priceRange?.minVariantPrice?.amount;
  const compare = product.compareAtPriceRange?.minVariantPrice?.amount;
  const hasDiscount = compare && Number(compare) > Number(price);
  const variantId = product.variants?.nodes?.[0]?.id;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      },
      {threshold: 0.12},
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Parallax sutil: la tarjeta se desplaza levemente según su posición en el viewport.
  useEffect(() => {
    const el = parallaxRef.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      const offset = (center - viewportCenter) / viewportCenter;
      el.style.transform = `translate3d(0, ${(offset * -14).toFixed(2)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <article
      ref={ref}
      className="tr-col-card"
      style={{'--d': `${Math.min(index, 8) * 60}ms`}}
    >
      <div className="tr-col-parallax" ref={parallaxRef}>
        <Link className="tr-gorra-card" to={`/products/${product.handle}`}>
          <div className="tr-gorra-media">
          {primary?.url ? (
            <img
              className="tr-gorra-img"
              src={primary.url}
              alt={primary.altText || product.title}
              loading="lazy"
            />
          ) : null}
          {second?.url ? (
            <img
              className="tr-gorra-img tr-gorra-img-2"
              src={second.url}
              alt=""
              loading="lazy"
            />
          ) : null}

          <div className="tr-gorra-labels">
            <span className="tr-badge">Premium</span>
            <span className="tr-badge tr-badge-rating">
              <i className="tr-star">★</i> 4.8
            </span>
          </div>

          <div className="tr-gorra-pager" aria-hidden="true">
            <span className="is-active" />
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="tr-gorra-body">
          <h3 className="tr-gorra-name">{product.title}</h3>
          <p className="tr-gorra-desc">{stripHtml(product.description)}</p>
          <div className="tr-gorra-foot">
            <span className="tr-gorra-price">
              {formatPrice(price)}
              {hasDiscount ? (
                <s className="tr-gorra-compare">{formatPrice(compare)}</s>
              ) : null}
            </span>
            <button
              type="button"
              className="tr-gorra-cta"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
            >
              Comprar ahora <i aria-hidden="true">→</i>
            </button>
          </div>
        </div>
        </Link>
      </div>
    </article>
  );
}
