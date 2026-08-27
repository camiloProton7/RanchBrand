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
