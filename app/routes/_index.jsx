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

export default function Home() {
  const rootData = useRouteLoaderData('root');
  const {gorras} = useLoaderData();
  const logoSrc = rootData?.header?.shop?.brand?.logo?.image?.url;

  return (
    <div className="tr-home">
      <ScrollVideoHero logoSrc={logoSrc} />
      <GorrasScroll products={gorras} />
    </div>
  );
}

function GorrasScroll({products}) {
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.querySelectorAll('.tr-gorra-card'));

    let velocity = 0;
    let prevX = track.scrollLeft;
    let raf = 0;

    const render = () => {
      // Inercia: la velocidad decae suavemente (como gravedad amortiguada)
      velocity *= 0.9;
      if (Math.abs(velocity) < 0.005) velocity = 0;
      const skew = Math.max(-7, Math.min(7, velocity * -1.1));
      for (const card of cards) {
        card.style.setProperty('--skew', `${skew}deg`);
      }
      raf = requestAnimationFrame(render);
    };

    const onScroll = () => {
      const dx = track.scrollLeft - prevX;
      prevX = track.scrollLeft;
      velocity += dx * 0.12;
    };

    track.addEventListener('scroll', onScroll, {passive: true});
    raf = requestAnimationFrame(render);

    return () => {
      track.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!products || !products.length) return null;

  return (
    <section className="tr-gorras" aria-label="Colección de gorras">
      <header className="tr-gorras-head">
        <h2 className="tr-gorras-title">Gorras</h2>
        <a
          className="tr-gorras-link"
          href="https://ranch.com.co/collections/gorras-truckers"
        >
          Ver todas <span aria-hidden="true">↗</span>
        </a>
      </header>

      <div className="tr-gorras-scroll" ref={trackRef}>
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
                    className="tr-gorra-img-primary"
                    src={primary.url}
                    alt={primary.altText || product.title}
                    loading="lazy"
                  />
                ) : null}
                {second?.url ? (
                  <img
                    className="tr-gorra-img-secondary"
                    src={second.url}
                    alt=""
                    loading="lazy"
                  />
                ) : null}
              </div>
              <div className="tr-gorra-body">
                <h3 className="tr-gorra-name">{product.title}</h3>
                <div className="tr-gorra-prices">
                  <span className="tr-gorra-price">{formatPrice(price)}</span>
                  {hasDiscount ? (
                    <span className="tr-gorra-compare">
                      {formatPrice(compare)}
                    </span>
                  ) : null}
                </div>
              </div>
            </a>
          );
        })}
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
