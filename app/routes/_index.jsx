import {useLoaderData, useRouteLoaderData} from 'react-router';
import {useEffect, useRef, useState} from 'react';
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

export async function loader({context}) {
  const {storefront} = context;
  try {
    const data = await storefront.query(GORRAS_QUERY);
    const products = data?.collection?.products?.nodes || [];
    return {gorras: products};
  } catch (error) {
    console.error(error);
    return {gorras: []};
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

export default function Home() {
  const rootData = useRouteLoaderData('root');
  const {gorras} = useLoaderData();
  const logoSrc = rootData?.header?.shop?.brand?.logo?.image?.url;

  return (
    <div className="tr-home">
      <ScrollVideoHero logoSrc={logoSrc} />
      <GorrasScroll products={gorras} />
      <ReviewsSection products={gorras} />
    </div>
  );
}

function GorrasScroll({products}) {
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
      aria-label="Colección de gorras"
    >
      <header className="tr-gorras-head">
        <a
          className="tr-gorras-link"
          href="https://ranch.com.co/collections/gorras-truckers"
        >
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

const REVIEWS = [
  {
    name: 'Camilo R.',
    product: 'Gorra Redwood',
    stars: 5,
    text: 'La calidad del bordado es brutal. La uso todos los días y sigue como nueva.',
  },
  {
    name: 'Daniela M.',
    product: 'Gorra Andina',
    stars: 4,
    text: 'El color es tal cual la foto. Llegó rapidísimo y el empaque es otro nivel.',
  },
  {
    name: 'Andrés P.',
    product: 'Gorra Rodeo',
    stars: 5,
    text: 'Perfecta para el campo. No se deforma ni con el sol ni con la lluvia.',
  },
  {
    name: 'Valentina S.',
    product: 'Gorra Cabras',
    stars: 5,
    text: 'El ajuste es cómodo y el logo se ve premium. Vale cada peso.',
  },
  {
    name: 'Santiago L.',
    product: 'Gorra LandMan',
    stars: 4,
    text: 'Se siente de buena tela, fresca. Ya pedí otra para regalar.',
  },
  {
    name: 'Mariana G.',
    product: 'Gorra Forester',
    stars: 5,
    text: 'El detalle de la costura es fino. Se nota que es hecha a mano.',
  },
  {
    name: 'Felipe T.',
    product: 'Gorra Heritage 89',
    stars: 4,
    text: 'Me encantó. El diseño western es único, no la he visto en nadie más.',
  },
  {
    name: 'Juliana C.',
    product: 'Gorra GOAT',
    stars: 5,
    text: 'Excelente compra. La atención y la entrega fueron impecables.',
  },
];

const SCATTER = [
  {x: '-6px', y: '-4px', rotate: -4},
  {x: '12px', y: '6px', rotate: 3},
  {x: '-14px', y: '10px', rotate: -6},
  {x: '5px', y: '-8px', rotate: 2},
  {x: '16px', y: '4px', rotate: -3},
  {x: '-10px', y: '12px', rotate: 5},
  {x: '7px', y: '5px', rotate: -2},
  {x: '0px', y: '8px', rotate: 1},
];

function ReviewsSection({products}) {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      {threshold: 0.25},
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const reviews = REVIEWS.map((review, i) => {
    const product = products[i % products.length];
    return {
      ...review,
      photo: product?.featuredImage?.url || null,
      ...SCATTER[i % SCATTER.length],
    };
  });

  return (
    <section
      ref={sectionRef}
      className={`tr-reviews ${visible ? 'is-visible' : ''}`}
      aria-label="Reseñas de clientes"
    >
      <h2 className="tr-reviews-title">Lo que dicen en el campo</h2>
      <div className="tr-reviews-scatter">
        {reviews.map((review, i) => (
          <article
            key={review.name}
            className="tr-review-card"
            style={{
              '--x': review.x,
              '--y': review.y,
              '--rotate': `${review.rotate}deg`,
              '--z': i,
              animationDelay: `${i * 0.12}s`,
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
              {'★'.repeat(review.stars)}
              {'☆'.repeat(5 - review.stars)}
            </div>
            <p className="tr-review-text">“{review.text}”</p>
            <div className="tr-review-meta">
              <span className="tr-review-name">{review.name}</span>
              <span className="tr-review-product">{review.product}</span>
            </div>
            <span className="tr-review-verified">✓ Compra verificada</span>
          </article>
        ))}
      </div>
    </section>
  );
}

const GORRAS_QUERY = `#graphql
  query Gorras {
    collection(handle: "gorras-truckers") {
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
