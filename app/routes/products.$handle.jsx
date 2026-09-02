import {useEffect, useMemo, useRef, useState} from 'react';
import {Link, useLoaderData, useRouteLoaderData} from 'react-router';
import {addToCart, buyNow} from '~/lib/cart';
import {
  TrustBadges,
  SizeGuide,
  isApparel,
  ProductAccordion,
  RecommendedProduct,
  PaymentTrust,
} from '~/components/ProductExtras';
import productStyles from '~/styles/product.css?url';

export const meta = ({data}) => {
  const product = data?.product;
  const title = product?.title ? `${product.title} — The Ranch` : 'Producto — The Ranch';
  const description = product?.description?.slice(0, 160) || 'The Ranch — Colombia';
  const items = [
    {title},
    {name: 'description', content: description},
  ];
  if (product) {
    const price = product.priceRange?.minVariantPrice?.amount;
    const currency = product.priceRange?.minVariantPrice?.currencyCode || 'COP';
    items.push({
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        description: product.description,
        image: product.images?.nodes?.map((i) => i.url) || [],
        sku: product.handle,
        brand: {'@type': 'Brand', name: 'The Ranch'},
        offers: {
          '@type': 'Offer',
          priceCurrency: currency,
          price: price,
          availability: 'https://schema.org/InStock',
          url: `https://laredo.ranch.com.co/products/${product.handle}`,
        },
      },
    });
  }
  return items;
};

export const links = () => [{rel: 'stylesheet', href: productStyles}];

const PRODUCT_QUERY = `#graphql
  query Product($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      productType
      tags
      featuredImage {
        url(transform: {maxWidth: 900, preferredContentType: WEBP})
        altText
      }
      images(first: 10) {
        nodes {
          url(transform: {maxWidth: 900, preferredContentType: WEBP})
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
          image { url(transform: {maxWidth: 900, preferredContentType: WEBP}) altText }
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
          priceRange {
            minVariantPrice { amount currencyCode }
          }
          compareAtPriceRange {
            minVariantPrice { amount }
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
    const rest = allReviews.filter((r) => !matching.includes(r));
    const reviews = [...matching, ...rest].slice(0, 8);

    const relatedPool = (relatedData.collection?.products?.nodes || []).filter(
      (p) => p.handle !== handle,
    );
    const related = relatedPool.slice(0, 4);
    const similar = relatedPool.slice(0, 6);

    return {product, reviews, related, similar};
  } catch (error) {
    console.error(`Producto ${handle} falló`, error);
    return {product: null, reviews: [], related: [], similar: []};
  }
}

const SHOPIFY_DOMAIN = '1caf84-4.myshopify.com';

function toNumericId(gid) {
  return gid?.match(/\/(\d+)$/)?.[1] || gid;
}

function getCheckoutUrl(variantId, qty = 1) {
  if (!variantId) return '#';
  const id = toNumericId(variantId);
  return `https://${SHOPIFY_DOMAIN}/cart/${id}:${qty}?checkout=true`;
}

function getCartUrl(variantId, qty = 1) {
  if (!variantId) return '#';
  const id = toNumericId(variantId);
  return `https://${SHOPIFY_DOMAIN}/cart/${id}:${qty}`;
}

function getBundleCartUrl(variantIds) {
  if (!variantIds || !variantIds.length) return '#';
  const items = variantIds.map((id) => `${toNumericId(id)}:1`).join(',');
  return `https://${SHOPIFY_DOMAIN}/cart/${items}`;
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

// Mapeo de nombres de color comunes a hex (para los círculos del selector)
const COLOR_HEX = {
  negro: '#1a1a18',
  black: '#1a1a18',
  blanco: '#e8e2d4',
  white: '#e8e2d4',
  crema: '#e6d9bf',
  arena: '#d8c9a8',
  beige: '#d8c9a8',
  'verde oliva': '#5a6b3c',
  verde: '#3a6b35',
  olive: '#5a6b3c',
  marrón: '#6b4a2b',
  brown: '#6b4a2b',
  cuero: '#8a5a2b',
  camuflaje: '#4a5240',
  camo: '#4a5240',
  azul: '#3a4a5a',
  rojo: '#7a3a2a',
  gris: '#8a8a8a',
  gray: '#8a8a8a',
  camel: '#b58a5a',
  naranja: '#d97a2b',
  amarillo: '#d9c23a',
  morado: '#6b4a8a',
  rosa: '#c97a8a',
};

function colorToHex(name) {
  const key = norm(name);
  if (COLOR_HEX[key]) return COLOR_HEX[key];
  if (key.includes('verde')) return '#3a6b35';
  if (key.includes('negro')) return '#1a1a18';
  if (key.includes('blanco')) return '#e8e2d4';
  if (key.includes('azul')) return '#3a4a5a';
  if (key.includes('rojo')) return '#7a3a2a';
  if (key.includes('marr') || key.includes('cuero') || key.includes('cafe')) return '#6b4a2b';
  if (key.includes('gris')) return '#8a8a8a';
  if (key.includes('naranja')) return '#d97a2b';
  if (key.includes('amarillo')) return '#d9c23a';
  if (key.includes('camuflaje') || key.includes('camo')) return '#4a5240';
  if (key.includes('arena') || key.includes('beige') || key.includes('crema') || key.includes('camel') || key.includes('desert')) return '#d8c9a8';
  return '#c9bfa8';
}

// Abrevia tallas: "Pequeño (S)" -> "S", "Doble extragrande (XXL)" -> "2XL"
function formatSize(value) {
  const m = (value || '').match(/\(([^)]+)\)/);
  if (!m) return value;
  let abbr = m[1].trim().toUpperCase();
  abbr = abbr.replace(/^X{2,}/, (x) => `${x.length}XL`);
  return abbr;
}

const ATTRS = ['Edición limitada', 'Ajuste regulable'];

export default function ProductPage() {
  const {product, reviews, related, similar} = useLoaderData();
  const rootData = useRouteLoaderData('root');
  const logoSrc = rootData?.header?.shop?.brand?.logo?.image?.url;

  const [activeImage, setActiveImage] = useState(0);
  const [color, setColor] = useState(null);
  const [fav, setFav] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [options, setOptions] = useState({});
  const trackRef = useRef(null);

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

  // Colores disponibles (de variantes con opción "Color")
  const colors = useMemo(() => {
    const set = [];
    variants.forEach((v) => {
      const opt = (v.selectedOptions || []).find((o) => norm(o.name) === 'color');
      if (opt?.value && !set.includes(opt.value)) set.push(opt.value);
    });
    return set;
  }, [variants]);

  // Opciones de talla/otras (excluye Color y Title)
  const optionNames = useMemo(() => {
    const names = [];
    variants.forEach((v) => {
      (v.selectedOptions || []).forEach((o) => {
        const n = norm(o.name);
        if (n !== 'title' && n !== 'color' && !names.includes(o.name)) {
          names.push(o.name);
        }
      });
    });
    return names;
  }, [variants]);

  const selectedVariant = useMemo(() => {
    return (
      variants.find((v) =>
        (v.selectedOptions || []).every((o) => {
          const n = norm(o.name);
          const val = n === 'color' ? color : options[n];
          return !val || norm(o.value) === norm(val);
        }),
      ) || variants[0]
    );
  }, [variants, options, color]);

  // Inicializa color y talla con los primeros valores disponibles.
  useEffect(() => {
    if (colors.length && !color) setColor(colors[0]);
  }, [colors, color]);

  useEffect(() => {
    if (!variants.length) return;
    optionNames.forEach((name) => {
      const key = norm(name);
      if (!options[key]) {
        const first = variants[0]?.selectedOptions?.find((o) => o.name === name)?.value;
        if (first) setOptions((prev) => ({...prev, [key]: first}));
      }
    });
  }, [optionNames, variants, options]);

  // Cambia la imagen activa cuando cambia la variante seleccionada (color/talla).
  useEffect(() => {
    let idx = -1;
    const img = selectedVariant?.image?.url;
    if (img) {
      idx = allImages.findIndex((i) => i.url === img);
    }
    if (idx < 0 && colors.length > 1 && color) {
      idx = colors.findIndex((c) => norm(c) === norm(color));
    }
    if (idx >= 0 && idx < allImages.length) {
      setActiveImage(idx);
      const track = trackRef.current;
      const slide = track?.children?.[idx];
      if (slide) slide.scrollIntoView({behavior: 'smooth', inline: 'center'});
    }
  }, [selectedVariant, allImages, colors, color]);

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
  const isOut = selectedVariant?.availableForSale === false;
  const totalPrice = (Number(price) || 0) * qty;
  const totalCompare = (Number(compare) || 0) * qty;

  const handleScroll = (e) => {
    const el = e.currentTarget;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx >= 0 && idx < allImages.length) setActiveImage(idx);
  };

  const scrollToImage = (i) => {
    if (trackRef.current) {
      trackRef.current.scrollTo({
        left: i * trackRef.current.clientWidth,
        behavior: 'smooth',
      });
      setActiveImage(i);
    }
  };

  const handleBuyNow = () => {
    if (!selectedVariant?.id) return;
    buyNow(selectedVariant.id, qty);
  };

  const handleAddToCart = () => {
    if (!selectedVariant?.id) return;
    addToCart({
      variantId: selectedVariant.id,
      qty,
      title: product.title,
      image: selectedVariant.image?.url || product.featuredImage?.url,
      price: selectedVariant.price?.amount,
      compareAtPrice: compare,
      handle: product.handle,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="trp">
      {/* ===== Visor visual ===== */}
      <div className="trp-viewer">
        <div
          ref={trackRef}
          className="trp-viewer-track"
          onScroll={handleScroll}
          aria-label="Galería de fotos"
        >
          {allImages.map((img, i) => (
            <div key={i} className="trp-viewer-slide">
              <img src={img.url} alt={img.alt} draggable={false} />
            </div>
          ))}
        </div>

        <Link className="trp-back" to="/" aria-label="Volver">
          ←
        </Link>

        <div className="trp-gallery-indicator" aria-hidden="true">
          {String(activeImage + 1).padStart(2, '0')}
          <span> / </span>
          {String(allImages.length).padStart(2, '0')}
        </div>

        {colors.length > 1 && (
          <div className="trp-color-selector" role="radiogroup" aria-label="Color">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                className={norm(color) === norm(c) ? 'is-active' : ''}
                style={{background: colorToHex(c)}}
                onClick={() => setColor(c)}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        )}

        <div className="trp-attrs" aria-hidden="true">
          {ATTRS.map((a) => (
            <span key={a}>{a}</span>
          ))}
        </div>

        <div className="trp-lasso" aria-hidden="true" />
      </div>

      {/* ===== Miniaturas ===== */}
      {allImages.length > 1 && (
        <div className="trp-thumbs">
          {allImages.map((img, i) => (
            <button
              key={i}
              type="button"
              className={i === activeImage ? 'is-active' : ''}
              onClick={() => scrollToImage(i)}
              aria-label={`Foto ${i + 1}`}
            >
              <img src={img.url} alt="" />
            </button>
          ))}
        </div>
      )}

      {/* ===== Tarjeta flotante de rating ===== */}
      <div className="trp-rating-pill">
        <span className="trp-rating-pill-star">★</span>
        <span className="trp-rating-pill-num">4.8</span>
        <span className="trp-rating-pill-sep">·</span>
        <span className="trp-rating-pill-label">672 reseñas</span>
        <span className="trp-rating-pill-arrow">→</span>
      </div>

      {/* ===== Info ===== */}
      <div className="trp-info">
        <p className="trp-variant">Colección Western — The Ranch</p>
        <h1 className="trp-title">{product.title}</h1>

        <span className="trp-tag">{isOut ? 'Agotado' : 'Edición limitada'}</span>

        {/* ===== Selectores de talla/color (debajo del título) ===== */}
        {colors.length > 1 && (
          <div className="trp-option">
            <span className="trp-option-label">Color</span>
            <div className="trp-option-values trp-option-colors">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={norm(color) === norm(c) ? 'is-active' : ''}
                  style={{background: colorToHex(c)}}
                  onClick={() => setColor(c)}
                  aria-label={`Color ${c}`}
                  title={c}
                />
              ))}
            </div>
          </div>
        )}

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
                    className={norm(options[norm(name)]) === norm(value) ? 'is-active' : ''}
                    onClick={() => setOptions((prev) => ({...prev, [norm(name)]: value}))}
                  >
                    {formatSize(value)}
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {/* ===== Producto recomendado (antes de la descripción) ===== */}
        {related.length > 0 && (
          <RecommendedProduct
            product={{
              handle: related[0].handle,
              title: related[0].title,
              price: related[0].priceRange?.minVariantPrice?.amount,
              image: related[0].featuredImage?.url,
              variantId: related[0].variants?.nodes?.[0]?.id,
            }}
            formatPrice={formatPrice}
            onAdd={() => {
              const currentVid = selectedVariant?.id;
              const relatedVid = related[0]?.variants?.nodes?.[0]?.id;
              if (currentVid && relatedVid) {
                window.location.href = getBundleCartUrl([currentVid, relatedVid]);
              } else if (relatedVid) {
                window.location.href = getCartUrl(relatedVid, 1);
              }
            }}
          />
        )}

        <ProductAccordion
          productType={product.productType}
          title={product.title}
          description={product.description}
        />

        <div className={`trp-stock ${isOut ? 'is-out' : ''}`}>
          {isOut ? 'Agotado' : '⚡ Últimas unidades disponibles'}
        </div>

        {isApparel(product.productType, product.title) ? (
          <>
            <TrustBadges />
            <SizeGuide />
          </>
        ) : null}

        {/* ===== Barra de compra (grid 2x2) ===== */}
        <div className="trp-buybar">
          <div className="trp-buybar-price">
            <span className="trp-buybar-price-now">{formatPrice(totalPrice)}</span>
            {hasDiscount ? (
              <s className="trp-buybar-price-compare">{formatPrice(totalCompare)}</s>
            ) : null}
          </div>
          <button
            className="trp-add"
            type="button"
            onClick={handleBuyNow}
            disabled={isOut}
          >
            Comprar ahora
          </button>
          <div className="trp-qty" aria-label="Cantidad">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Menos"
            >
              −
            </button>
            <span>{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(10, q + 1))}
              aria-label="Más"
            >
              +
            </button>
          </div>
          <button
            className={`trp-add-cart ${added ? 'is-added' : ''}`}
            type="button"
            onClick={handleAddToCart}
            disabled={isOut}
          >
            {added ? '✓ Añadido' : 'Agregar al carrito'}
          </button>
        </div>
      </div>

      {/* ===== Medios de pago (confianza) ===== */}
      <PaymentTrust />

      {/* ===== Reseñas (carrusel) ===== */}
      {reviews.length > 0 && (
        <section className="trp-reviews">
          <h2 className="trp-reviews-title">Lo que dicen en el campo</h2>
          <div className="trp-reviews-track">
            <div className="trp-reviews-row">
              {[...reviews, ...reviews].map((r, i) => (
                <article key={i} className="trp-review-card">
                  <div className="trp-review-head">
                    {r.photo ? (
                      <img className="trp-review-photo" src={r.photo} alt="" loading="lazy" />
                    ) : (
                      <span className="trp-review-avatar">{r.name?.charAt(0) || 'R'}</span>
                    )}
                    <div className="trp-review-who">
                      <span className="trp-review-name">{r.name}</span>
                      <span className="trp-review-stars" aria-label={`${r.stars} de 5 estrellas`}>
                        {'★'.repeat(r.stars)}
                        {'☆'.repeat(5 - r.stars)}
                      </span>
                    </div>
                  </div>
                  <p className="trp-review-text">“{r.text}”</p>
                  {r.verified ? (
                    <span className="trp-review-verified">✓ Compra verificada</span>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== Productos similares ===== */}
      {similar.length > 0 && (
        <section className="trp-similar">
          <h2 className="trp-similar-title">También te puede gustar</h2>
          <div className="trp-similar-grid">
            {similar.map((p) => (
              <Link key={p.id} className="trp-similar-card" to={`/products/${p.handle}`}>
                <div className="trp-similar-media">
                  {p.featuredImage?.url ? (
                    <img
                      src={p.featuredImage.url}
                      alt={p.featuredImage.altText || p.title}
                      loading="lazy"
                    />
                  ) : null}
                  <span className="trp-similar-rating">
                    <i>★</i> 4.8
                  </span>
                </div>
                <h3 className="trp-similar-name">{p.title}</h3>
                <div className="trp-similar-foot">
                  <span className="trp-similar-price">
                    {formatPrice(p.priceRange?.minVariantPrice?.amount)}
                  </span>
                  {p.compareAtPriceRange?.minVariantPrice?.amount &&
                  Number(p.compareAtPriceRange.minVariantPrice.amount) >
                    Number(p.priceRange?.minVariantPrice?.amount) ? (
                    <s className="trp-similar-compare">
                      {formatPrice(p.compareAtPriceRange.minVariantPrice.amount)}
                    </s>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===== Políticas ===== */}
      <PolicyCards />
    </div>
  );
}

function PolicyCards() {
  const items = [
    {
      title: 'Garantía de calidad',
      desc: 'Cada pieza pasa control de calidad. Si algo no te convence, te respondemos.',
      icon: '🛡️',
    },
    {
      title: 'Envíos garantizados',
      desc: 'Despachamos a toda Colombia con seguimiento hasta tu puerta.',
      icon: '🚚',
    },
    {
      title: 'Pagos seguros',
      desc: 'Bold, Addi y pasarelas cifradas. Tu dinero siempre protegido.',
      icon: '🔒',
    },
    {
      title: 'Atención al cliente',
      desc: 'Te acompañamos antes, durante y después de tu compra.',
      icon: '💬',
    },
  ];
  return (
    <section className="trp-policies">
      {items.map((item) => (
        <article key={item.title} className="trp-policy-card">
          <span className="trp-policy-icon" aria-hidden="true">
            {item.icon}
          </span>
          <h3 className="trp-policy-title">{item.title}</h3>
          <p className="trp-policy-desc">{item.desc}</p>
        </article>
      ))}
    </section>
  );
}
