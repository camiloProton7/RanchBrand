import {useMemo, useState} from 'react';
import {useLoaderData} from 'react-router';
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

export const links = () => [
  {rel: 'stylesheet', href: productStyles},
];

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
      priceRange {
        minVariantPrice { amount currencyCode }
      }
      compareAtPriceRange {
        minVariantPrice { amount }
      }
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

export async function loader({params, context}) {
  const {handle} = params;
  const {storefront} = context;
  try {
    const data = await storefront.query(PRODUCT_QUERY, {
      variables: {handle},
      cache: storefront.CacheShort(),
    });
    return {product: data.product || null};
  } catch (error) {
    console.error(`Producto ${handle} falló`, error);
    return {product: null};
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
  const n = Number(amount);
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

const norm = (s) => (s || '').trim().toLowerCase();

const BENEFITS = [
  {icon: '🚚', text: 'Envío gratis a toda Colombia'},
  {icon: '🔄', text: '1er cambio gratis · 60 días de garantía'},
  {icon: '🔒', text: 'Pago 100% seguro · PSE, tarjeta o contraentrega'},
];

export default function ProductPage() {
  const {product} = useLoaderData();
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

  // Opciones del producto (talla, color, etc.)
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
    return variants.find((v) => {
      return (v.selectedOptions || []).every((o) => {
        const val = options[norm(o.name)];
        return !val || norm(o.value) === norm(val);
      });
    }) || variants[0];
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
        <a className="trp-bar-back" href="/">
          ← Volver
        </a>
        <a className="trp-bar-logo" href="/">
          The Ranch
        </a>
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

          {/* Selectores */}
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
          <a
            className="trp-cta-ghost"
            href={`https://wa.me/573209157343?text=${encodeURIComponent(
              `Hola, quiero más info de ${product.title}`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            ¿Dudas? Escríbenos por WhatsApp
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
    </div>
  );
}
