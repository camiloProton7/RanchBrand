import {useEffect, useRef} from 'react';
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
          featuredImage {
            url(transform: {maxWidth: 700, preferredContentType: WEBP})
            altText
          }
          priceRange {
            minVariantPrice { amount currencyCode }
          }
          compareAtPriceRange {
            minVariantPrice { amount currencyCode }
          }
          variants(first: 1) {
            nodes { id }
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

      <div className="tr-col-grid">
        {products.map((p, i) => (
          <CollectionCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </div>
  );
}

function CollectionCard({product, index}) {
  const ref = useRef(null);
  const image = product.featuredImage?.url;
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

  const quickAdd = (e) => {
    e.preventDefault();
    if (!variantId) return;
    window.location.href = `https://${SHOPIFY_DOMAIN}/cart/${toNumericId(variantId)}:1`;
  };

  // Bento: la primera tarjeta es grande; cada 5ª también destaca.
  const isFeature = index === 0 || index % 6 === 3;

  return (
    <article
      ref={ref}
      className={`tr-col-card${isFeature ? ' is-feature' : ''}`}
      style={{'--d': `${Math.min(index, 8) * 60}ms`}}
    >
      <Link to={`/products/${product.handle}`} className="tr-col-card-link">
        <div className="tr-col-card-media">
          {image ? <img src={image} alt={product.featuredImage?.altText || product.title} loading="lazy" /> : null}
          <div className="tr-col-card-shade" />
          {hasDiscount ? <span className="tr-col-badge">Oferta</span> : null}
          <button
            type="button"
            className="tr-col-quick"
            onClick={quickAdd}
            aria-label={`Añadir ${product.title} al carrito`}
          >
            + Añadir
          </button>
        </div>
        <div className="tr-col-card-info">
          <h2 className="tr-col-card-title">{product.title}</h2>
          <div className="tr-col-card-price">
            <span className="tr-col-card-now">{formatPrice(price)}</span>
            {hasDiscount ? (
              <s className="tr-col-card-compare">{formatPrice(compare)}</s>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}
