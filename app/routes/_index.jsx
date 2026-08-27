import {useLoaderData, useRouteLoaderData} from 'react-router';
import {useEffect, useRef} from 'react';
import {ScrollVideoHero} from '~/components/ScrollVideoHero';
import homeStyles from '~/styles/scroll-video-hero.css?url';

export const meta = () => [
  {title: 'The Ranch — No seguimos modas'},
  {
    name: 'description',
    content:
      'The Ranch: gorras, chaquetas y accesorios para quienes hacen las cosas bien.',
  },
];

export function links() {
  return [{rel: 'stylesheet', href: homeStyles}];
}

const TRUSTOO_SHOP_ID = '67813867760';

async function fetchTrustooReviews() {
  try {
    const url = `https://api.trustoo.io/api/v1/reviews/get_product_reviews?shop_id=${TRUSTOO_SHOP_ID}&limit=30&page=1&sort_by=comprehensive-descending&scene=3&is_show_all=1`;
    const res = await fetch(url, {headers: {accept: 'application/json'}});
    const json = await res.json();
    if (json.code !== 0) return [];
    return (json.data?.list || [])
      .map(mapReview)
      .filter((r) => r.text && r.text.trim().length > 8)
      .slice(0, 5);
  } catch (error) {
    console.error('Trustoo fetch failed', error);
    return [];
  }
}

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

export async function loader({context}) {
  const {storefront} = context;
  const [gorras, chaquetas, reviews] = await Promise.all([
    fetchCollection(storefront, 'gorras-truckers'),
    fetchCollection(storefront, 'chaquetas'),
    fetchTrustooReviews(),
  ]);
  return {gorras, chaquetas, reviews};
}

async function fetchCollection(storefront, handle) {
  try {
    const data = await storefront.query(COLLECTION_QUERY(handle));
    return data?.collection?.products?.nodes || [];
  } catch (error) {
    console.error(`Colección ${handle} falló`, error);
    return [];
  }
}

function formatPrice(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '';
  return '$' + n.toLocaleString('es-CO', {maximumFractionDigits: 0});
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));

export default function Home() {
  const rootData = useRouteLoaderData('root');
  const {gorras, chaquetas, reviews} = useLoaderData();
  const logoSrc = rootData?.header?.shop?.brand?.logo?.image?.url;

  return (
    <div className="tr-home">
      <ScrollVideoHero logoSrc={logoSrc} />
      <ProductScroll
        products={gorras}
        collectionUrl="https://ranch.com.co/collections/gorras-truckers"
        ariaLabel="Colección de gorras"
      />
      <ReviewsSection reviews={reviews} />
      <ProductScroll
        products={chaquetas}
        collectionUrl="https://ranch.com.co/collections/chaquetas"
        ariaLabel="Colección de chaquetas"
      />
    </div>
  );
}

function ProductScroll({products, collectionUrl, ariaLabel}) {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            section.classList.add('is-visible');
            observer.disconnect();
          }
        }
      },
      {threshold: 0.02},
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  if (!products || !products.length) return null;

  return (
    <section
      ref={sectionRef}
      className="tr-gorras"
      aria-label={ariaLabel}
    >
      <header className="tr-gorras-head">
        <a className="tr-gorras-link" href={collectionUrl}>
          Ver todas <span aria-hidden="true">↗</span>
        </a>
      </header>

      <div className="tr-gorras-scroll">
        {products.map((product) => {
          const primary = product.featuredImage;
          const second = product.images?.nodes?.[1];
          const price = product.priceRange?.minVariantPrice?.amount;
          const compare = product.compareAtPriceRange?.minVariantPrice?.amount;
          const hasDiscount = compare && Number(compare) > Number(price);

          return (
            <a
              key={product.id}
              className="tr-gorra-card"
              href={`https://ranch.com.co/products/${product.handle}`}
            >
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
                  <span className="tr-badge">Nuevo</span>
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
                  <span className="tr-gorra-cta">
                    Comprar ahora <i aria-hidden="true">→</i>
                  </span>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

const FALLBACK_REVIEWS = [
  {name: 'Camilo R.', product: 'Gorra Redwood', stars: 5, text: 'La calidad del bordado es brutal. La uso todos los días y sigue como nueva.'},
  {name: 'Daniela M.', product: 'Gorra Andina', stars: 4, text: 'El color es tal cual la foto. Llegó rapidísimo y el empaque es otro nivel.'},
  {name: 'Andrés P.', product: 'Gorra Rodeo', stars: 5, text: 'Perfecta para el campo. No se deforma ni con el sol ni con la lluvia.'},
  {name: 'Valentina S.', product: 'Gorra Cabras', stars: 5, text: 'El ajuste es cómodo y el logo se ve premium. Vale cada peso.'},
  {name: 'Santiago L.', product: 'Gorra LandMan', stars: 4, text: 'Se siente de buena tela, fresca. Ya pedí otra para regalar.'},
  {name: 'Mariana G.', product: 'Gorra Forester', stars: 5, text: 'El detalle de la costura es fino. Se nota que es hecha a mano.'},
  {name: 'Felipe T.', product: 'Gorra Heritage 89', stars: 4, text: 'Me encantó. El diseño western es único, no la he visto en nadie más.'},
  {name: 'Juliana C.', product: 'Gorra GOAT', stars: 5, text: 'Excelente compra. La atención y la entrega fueron impecables.'},
];

const SCATTER = [
  {x: '-28px', y: '-18px', rotate: -6},
  {x: '38px', y: '14px', rotate: 4},
  {x: '-48px', y: '28px', rotate: -8},
  {x: '18px', y: '-32px', rotate: 3},
  {x: '52px', y: '8px', rotate: -4},
  {x: '-34px', y: '38px', rotate: 6},
  {x: '24px', y: '18px', rotate: -3},
  {x: '0px', y: '34px', rotate: 2},
];

function ReviewsSection({reviews}) {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const cards = Array.from(section.querySelectorAll('.tr-review-card'));
    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const viewport = window.innerHeight;
      // El progress empieza cuando la sección ya está ~30% dentro del viewport,
      // para que las tarjetas caigan al llegar a la sección (no antes).
      const progress = clamp01(
        (viewport * 0.7 - rect.top) / (viewport + rect.height),
      );

      cards.forEach((card, i) => {
        const p = clamp01((progress - i * 0.1) / 0.22);
        const x = card.style.getPropertyValue('--x') || '0px';
        const y = card.style.getPropertyValue('--y') || '0px';
        const r = card.style.getPropertyValue('--rotate') || '0deg';
        const drop = (1 - p) * -620;
        card.style.opacity = String(p);
        card.style.transform = `translate(-50%, -50%) translate(${x}, ${y}) rotate(${r}) translateY(${drop}px) scale(${0.85 + p * 0.15})`;
      });
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
      cancelAnimationFrame(raf);
    };
  }, []);

  const source = reviews && reviews.length ? reviews : FALLBACK_REVIEWS;
  const cards = source.slice(0, 5).map((review, i) => ({
    ...review,
    ...SCATTER[i % SCATTER.length],
  }));

  return (
    <section
      ref={sectionRef}
      className="tr-reviews"
      aria-label="Reseñas de clientes"
    >
      <h2 className="tr-reviews-title">Lo que dicen en el campo</h2>
      <div className="tr-reviews-scatter">
        {cards.map((review, i) => (
          <article
            key={`${review.name}-${i}`}
            className="tr-review-card"
            style={{
              '--x': review.x,
              '--y': review.y,
              '--rotate': `${review.rotate}deg`,
              '--z': i,
            }}
          >
            {review.photo ? (
              <img
                className="tr-review-photo"
                src={review.photo}
                alt=""
                loading="lazy"
              />
            ) : null}
            <div
              className="tr-review-stars"
              aria-label={`${review.stars} de 5 estrellas`}
            >
              {'★'.repeat(Math.max(0, Math.min(5, review.stars)))}
              {'☆'.repeat(5 - Math.max(0, Math.min(5, review.stars)))}
            </div>
            <p className="tr-review-text">“{review.text}”</p>
            <div className="tr-review-meta">
              <span className="tr-review-name">{review.name}</span>
              <span className="tr-review-product">{review.product}</span>
            </div>
            {review.verified ? (
              <span className="tr-review-verified">✓ Compra verificada</span>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

const COLLECTION_QUERY = (handle) => `#graphql
  query Collection {
    collection(handle: "${handle}") {
      title
      handle
      products(first: 15) {
        nodes {
          id
          title
          handle
          description
          featuredImage {
            url
            altText
            width
            height
          }
          images(first: 2) {
            nodes {
              url
              altText
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;
