import {useMemo, useState} from 'react';
import {Link, useLoaderData, useRouteLoaderData} from 'react-router';
import productStyles from '~/styles/product.css?url';

export const meta = ({data}) => {
  const product = data?.product;
  const title = product?.title ? `${product.title} — The Ranch` : 'Producto — The Ranch';
  const description = product?.description?.slice(0, 160) || 'The Ranch — Colombia';
  return [
    {title},
    {name: 'description', content: description},
  ];
};

export const links = () => [{rel: 'stylesheet', href: productStyles}];

const PRODUCT_QUERY = `#graphql
  query Product($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      featuredImage {
        url(transform: {maxWidth: 1400, preferredContentType: WEBP})
        altText
      }
      images(first: 10) {
        nodes {
          url(transform: {maxWidth: 1400, preferredContentType: WEBP})
          altText
        }
      }
      priceRange { minVariantPrice { amount currencyCode } }
      compareAtPriceRange { minVariantPrice { amount } }
      variants(first: 50) {
        nodes {
          id
          availableForSale
          selectedOptions { name value }
          price { amount currencyCode }
          image { url(transform: {maxWidth: 1400, preferredContentType: WEBP}) altText }
        }
      }
    }
  }
`;

const RELATED_QUERY = `#graphql
  query RelatedProducts($handle: String!) {
    collection(handle: $handle) {
      products(first: 12) {
        nodes {
          id
          title
          handle
          featuredImage {
            url(transform: {maxWidth: 600, preferredContentType: WEBP})
            altText
          }
          priceRange { minVariantPrice { amount currencyCode } }
        }
      }
    }
  }
`;

const TRUSTOO_SHOP_ID = '67813867760';

function mapReview(raw) {
  const resource = (raw.resources || []).find((x) =>
    (x.src || x.thumb_src || '').trim(),
  );
  const photo =
    (resource && (resource.src || resource.thumb_src)) ||
    raw.product_image_src ||
    raw.corresponding_product?.product_image ||
    null;
  return {
    name: (raw.author || '').trim(),
    product: raw.corresponding_product?.product_name || '',
    stars: raw.star || 5,
    text: (raw.content || '').trim(),
    photo,
    verified: !!raw.verified_badge,
  };
}

async function fetchTrustooReviews() {
  try {
    const url = `https://api.trustoo.io/api/v1/reviews/get_product_reviews?shop_id=${TRUSTOO_SHOP_ID}&limit=50&page=1&sort_by=comprehensive-descending&scene=3&is_show_all=1`;
    const res = await fetch(url, {headers: {accept: 'application/json'}});
    const json = await res.json();
    if (json.code !== 0) return [];
    return (json.data?.list || [])
      .map(mapReview)
      .filter((r) => r.text && r.text.trim().length > 8);
  } catch (error) {
    console.error('Trustoo fetch failed', error);
    return [];
  }
}

export async function loader({params, context}) {
  const {handle} = params;
  const {storefront} = context;
  try {
    const [productData, relatedData, allReviews] = await Promise.all([
      storefront.query(PRODUCT_QUERY, {
        variables: {handle},
        cache: storefront.CacheShort(),
      }),
      storefront.query(RELATED_QUERY, {
        variables: {handle: 'hot-ranch'},
        cache: storefront.CacheLong(),
      }),
      fetchTrustooReviews(),
    ]);

    const product = productData.product || null;
    const title = (product?.title || '').toLowerCase();
    const matching = allReviews.filter((r) => {
      if (!title) return true;
      const p = (r.product || '').toLowerCase();
      return p && (p.includes(title) || title.includes(p));
    });
    const reviews = (matching.length ? matching : allReviews).slice(0, 4);

    const related = (relatedData.collection?.products?.nodes || [])
      .filter((p) => p.handle !== handle)
      .slice(0, 4);

    return {product, reviews, related};
  } catch (error) {
    console.error(`Producto ${handle} falló`, error);
    return {product: null, reviews: [], related: []};
  }
}

const SHOPIFY_DOMAIN = '1caf84-4.myshopify.com';

function toNumericId(gid) {
  return gid?.match(/\/(\d+)$/)?.[1] || gid;
}

function getCheckoutUrl(variantId, qty = 1) {
  if (!variantId) return '#';
  const id = toNumericId(variantId);
  return `https://${SHOPIFY_DOMAIN}/cart/${id}:${qty}`;
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

const norm = (s) => (s || '').trim().toLowerCase();

const BENEFITS = [
  {icon: '🚚', text: 'Envío gratis a toda Colombia'},
  {icon: '🔄', text: '1er cambio gratis · 60 días de garantía'},
  {icon: '🔒', text: 'Pago 100% seguro · PSE, tarjeta o contraentrega'},
];

export default function ProductPage() {
  const {product, reviews, related} = useLoaderData();
  const rootData = useRouteLoaderData('root');
  const logoSrc = rootData?.header?.shop?.brand?.logo?.image?.url;
  const [selectedImage, setSelectedImage] = useState(0);
  const [options, setOptions] = useState({});

  const variants = product?.variants?.nodes || [];
  const allImages = useMemo(() => {
    const imgs = (product?.images?.nodes || []).map((i) => ({
      url: i.url,
      alt: i.altText || product?.title || '',
    }));
    if (!imgs.length && product?.featuredImage?.url) {
      imgs.push({url: product.featuredImage.url, alt: product?.featuredImage?.altText || ''});
    }
    return imgs;
  }, [product]);

  const optionNames = useMemo(() => {
    const names = [];
    variants.forEach((v) => {
      (v.selectedOptions || []).forEach((o) => {
        if (!names.includes(o.name)) names.push(o.name);
      });
    });
    return names;
  }, [variants]);

  const selectedVariant = useMemo(() => {
    return (
      variants.find((v) =>
        (v.selectedOptions || []).every((o) => {
          const val = options[norm(o.name)];
          return !val || norm(o.value) === norm(val);
        }),
      ) || variants[0]
    );
  }, [variants, options]);

  if (!product) {
    return (
      <div className="trp-empty">
        <h1>Producto no encontrado</h1>
        <a href="/">← Volver al inicio</a>
      </div>
    );
  }

  const price = selectedVariant?.price?.amount || product.priceRange?.minVariantPrice?.amount;
  const compare = product.compareAtPriceRange?.minVariantPrice?.amount;
  const hasDiscount = compare && Number(compare) > Number(price);

  return (
    <div className="trp">
      <header className="trp-bar">
        <Link className="trp-bar-back" to="/">
          ← Volver
        </Link>
        <Link className="trp-bar-logo" to="/">
          {logoSrc ? <img src={logoSrc} alt="The Ranch" /> : 'The Ranch'}
        </Link>
      </header>

      <div className="trp-wrap">
        {/* ===== Galería ===== */}
        <div className="trp-gallery">
          <div className="trp-main-img">
            <img
              src={allImages[selectedImage]?.url}
              alt={allImages[selectedImage]?.alt || product.title}
              style={{viewTransitionName: `product-${product.handle}`}}
            />
          </div>
          {allImages.length > 1 && (
            <div className="trp-thumbs">
              {allImages.map((img, i) => (
                <button
                  key={img.url}
                  type="button"
                  className={i === selectedImage ? 'is-active' : ''}
                  onClick={() => setSelectedImage(i)}
                  aria-label={`Foto ${i + 1}`}
                >
                  <img src={img.url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ===== Info ===== */}
        <div className="trp-info">
          <span className="trp-eyebrow">The Ranch</span>
          <h1 className="trp-title">{product.title}</h1>

          <div className="trp-rating">
            <span className="trp-stars">★★★★★</span>
            <span className="trp-rating-num">4.8</span>
            <span className="trp-rating-sep">·</span>
            <span className="trp-rating-label">Reseñas verificadas</span>
          </div>

          <div className="trp-price-row">
            <span className="trp-price">{formatPrice(price)}</span>
            {hasDiscount ? (
              <s className="trp-compare">{formatPrice(compare)}</s>
            ) : null}
            {selectedVariant?.availableForSale === false ? (
              <span className="trp-stock">Agotado</span>
            ) : (
              <span className="trp-stock trp-stock-ok">Disponible</span>
            )}
          </div>

          {product.description ? (
            <p className="trp-desc">{product.description}</p>
          ) : null}

          {optionNames.map((name) => {
            const values = Array.from(
              new Set(
                variants
                  .map((v) => v.selectedOptions?.find((o) => o.name === name)?.value)
                  .filter(Boolean),
              ),
            );
            return (
              <div key={name} className="trp-option">
                <span className="trp-option-label">{name}</span>
                <div className="trp-option-values">
                  {values.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={norm(options[name]) === norm(value) ? 'is-active' : ''}
                      onClick={() =>
                        setOptions((prev) => ({...prev, [norm(name)]: value}))
                      }
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          <a
            className="trp-cta"
            href={getCheckoutUrl(selectedVariant?.id)}
            onClick={(e) => {
              if (!selectedVariant?.id) e.preventDefault();
            }}
          >
            <span>Comprar ahora</span>
            <span className="trp-cta-arrow">→</span>
          </a>

          <ul className="trp-benefits">
            {BENEFITS.map((b) => (
              <li key={b.text}>
                <span>{b.icon}</span> {b.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ===== Reseñas ===== */}
      {reviews.length > 0 && (
        <section className="trp-reviews">
          <div className="trp-reviews-inner">
            <h2 className="trp-reviews-title">Lo que dicen en el campo</h2>
            <div className="trp-reviews-grid">
              {reviews.map((r, i) => (
                <article key={i} className="trp-review-card">
                  {r.photo ? (
                    <img className="trp-review-photo" src={r.photo} alt="" loading="lazy" />
                  ) : null}
                  <div className="trp-review-stars" aria-label={`${r.stars} de 5 estrellas`}>
                    {'★'.repeat(r.stars)}
                    {'☆'.repeat(5 - r.stars)}
                  </div>
                  <p className="trp-review-text">“{r.text}”</p>
                  <div className="trp-review-meta">
                    <span className="trp-review-name">{r.name}</span>
                    {r.verified ? (
                      <span className="trp-review-verified">✓ Compra verificada</span>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== Productos relacionados ===== */}
      {related.length > 0 && (
        <section className="trp-related">
          <div className="trp-related-inner">
            <h2 className="trp-related-title">Completa tu look</h2>
            <div className="trp-related-grid">
              {related.map((p) => (
                <Link
                  key={p.id}
                  className="trp-related-card"
                  to={`/products/${p.handle}`}
                  viewTransition
                >
                  <div className="trp-related-media">
                    {p.featuredImage?.url ? (
                      <img
                        src={p.featuredImage.url}
                        alt={p.featuredImage.altText || p.title}
                        loading="lazy"
                        style={{viewTransitionName: `product-${p.handle}`}}
                      />
                    ) : null}
                  </div>
                  <h3 className="trp-related-name">{p.title}</h3>
                  <span className="trp-related-price">
                    {formatPrice(p.priceRange?.minVariantPrice?.amount)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
