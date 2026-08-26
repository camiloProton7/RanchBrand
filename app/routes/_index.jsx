import {useLoaderData, useRouteLoaderData} from 'react-router';
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
      <GorrasMarquee products={gorras} />
    </div>
  );
}

function GorrasMarquee({products}) {
  if (!products || !products.length) return null;
  // Duplicamos la lista para que el loop de translateX(-50%) sea infinito y sin saltos.
  const items = [...products, ...products];

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

      <div className="tr-marquee">
        <div className="tr-marquee-track">
          {items.map((product, index) => (
            <a
              key={`${product.id}-${index}`}
              className="tr-gorra-card"
              href={`https://ranch.com.co/products/${product.handle}`}
            >
              {product.featuredImage?.url ? (
                <img
                  src={product.featuredImage.url}
                  alt={product.featuredImage.altText || product.title}
                  loading="lazy"
                />
              ) : (
                <div className="tr-gorra-placeholder">{product.title}</div>
              )}
              <div className="tr-gorra-info">
                <span className="tr-gorra-name">{product.title}</span>
                <span className="tr-gorra-price">
                  {formatPrice(product.priceRange?.minVariantPrice?.amount)}
                </span>
              </div>
            </a>
          ))}
        </div>
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
          priceRange {
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
