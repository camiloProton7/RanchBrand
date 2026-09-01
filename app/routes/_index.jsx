import {useLoaderData, useRouteLoaderData} from 'react-router';
import {useEffect, useRef} from 'react';
import {ScrollVideoHero} from '~/components/ScrollVideoHero';
import ChaquetaHero from '~/components/ChaquetaHero';
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
  const [gorras, chaquetas, camisetas, hotRanch, reviews] = await Promise.all([
    fetchCollection(storefront, 'gorras-truckers'),
    fetchCollection(storefront, 'chaquetas'),
    fetchCollection(storefront, 'camisetas'),
    fetchCollection(storefront, 'hot-ranch'),
    fetchTrustooReviews(),
  ]);
  return {gorras, chaquetas, camisetas, hotRanch, reviews};
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
  const {gorras, chaquetas, camisetas, hotRanch, reviews} = useLoaderData();
  const logoSrc = rootData?.header?.shop?.brand?.logo?.image?.url;

  return (
    <div className="tr-home">
      <ScrollVideoHero logoSrc={logoSrc} />
      <TrustBar />
      <ProductScroll
        products={gorras}
        collectionUrl="https://ranch.com.co/collections/gorras-truckers"
        ariaLabel="Colección de gorras"
      />
      <ChaquetaHero products={chaquetas} />
      <ProductScroll
        products={camisetas}
        collectionUrl="https://ranch.com.co/collections/camisetas"
        ariaLabel="Colección de camisetas"
      />
      <RanchStory />
      <ProductScroll
        products={hotRanch}
        collectionUrl="https://ranch.com.co/collections/hot-ranch"
        ariaLabel="Más vendidos"
        title="Más vendidos"
      />
      <ReviewsSection reviews={reviews} />
      <EditorialFooter />
      <WhatsAppFloat />
    </div>
  );
}

function EditorialFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="tr-footer">
      <div className="tr-footer-inner">
        <div className="tr-footer-head">
          <h2 className="tr-footer-megatitle">THE RANCH</h2>
          <p className="tr-footer-tagline">No seguimos modas, las marcamos.</p>
        </div>

        <div className="tr-footer-grid">
          <div className="tr-footer-newsletter">
            <h4 className="tr-footer-title">Únete al ranch</h4>
            <p className="tr-footer-newsletter-desc">
              Novedades, drops y ofertas exclusivas.
            </p>
            <form
              className="tr-footer-form"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                className="tr-footer-input"
                type="email"
                placeholder="Tu email"
                aria-label="Email"
              />
              <button
                className="tr-footer-submit"
                type="submit"
                aria-label="Suscribirse"
              >
                →
              </button>
            </form>
          </div>

          <div className="tr-footer-col">
            <h4 className="tr-footer-title">Tienda</h4>
            <a href="https://ranch.com.co/collections/gorras-truckers">
              Gorras
            </a>
            <a href="https://ranch.com.co/collections/chaquetas">Chaquetas</a>
            <a href="https://ranch.com.co/collections/all">Accesorios</a>
          </div>

          <div className="tr-footer-col">
            <h4 className="tr-footer-title">Ayuda</h4>
            <a href="https://ranch.com.co/policies/shipping-policy">Envíos</a>
            <a href="https://ranch.com.co/policies/refund-policy">
              Devoluciones
            </a>
            <a href="https://wa.me/573209157343">Contacto</a>
          </div>

          <div className="tr-footer-col">
            <h4 className="tr-footer-title">Legal</h4>
            <a href="https://ranch.com.co/policies/privacy-policy">
              Privacidad
            </a>
            <a href="https://ranch.com.co/policies/terms-of-service">
              Términos
            </a>
          </div>
        </div>

        <div className="tr-footer-bottom">
          <span className="tr-footer-copy">© {year} The Ranch — Colombia</span>
          <div className="tr-footer-social">
            <a
              href="https://www.instagram.com/"
              rel="noopener noreferrer"
              target="_blank"
            >
              Instagram
            </a>
            <a
              href="https://www.tiktok.com/"
              rel="noopener noreferrer"
              target="_blank"
            >
              TikTok
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function TrustBar() {
  const items = [
    'Envío gratis a toda Colombia',
    'Garantía de calidad',
    'Pago 100% seguro',
    'Pagos por Addi',
  ];
  return (
    <div className="tr-trustbar">
      <div className="tr-trustbar-track">
        {[0, 1].map((dup) => (
          <div
            className="tr-trustbar-group"
            key={dup}
            aria-hidden={dup === 1 ? 'true' : undefined}
          >
            {items.map((text) => (
              <span
                className={`tr-trustbar-item ${
                  text === 'Pagos por Addi' ? 'tr-trustbar-addi' : ''
                }`}
                key={`${dup}-${text}`}
              >
                {text}
                <span className="tr-trustbar-sep">·</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function RanchStory() {
  return (
    <section className="tr-ranchstory">
      <div className="tr-ranchstory-inner">
        <span className="tr-ranchstory-eyebrow">El Ranch</span>
        <h2 className="tr-ranchstory-title">
          Hecho en Colombia, para el campo y la calle
        </h2>
        <p className="tr-ranchstory-text">
          Diseñamos piezas que aguantan el sol, la lluvia y el kilómetro.
          Cuero, bordado a mano y una actitud que no seguimos de nadie: la
          nuestra.
        </p>
        <a
          className="tr-ranchstory-cta"
          href="https://wa.me/573209157343"
          target="_blank"
          rel="noopener noreferrer"
        >
          Conoce la marca
        </a>
      </div>
    </section>
  );
}

function WhatsAppFloat() {
  return (
    <a
      className="tr-whatsapp-float"
      href="https://wa.me/573209157343"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
    >
      <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </a>
  );
}

function ProductScroll({products, collectionUrl, ariaLabel, title}) {
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
        {title ? <h2 className="tr-gorras-title">{title}</h2> : null}
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
  {x: '-55px', y: '-30px', rotate: -7},
  {x: '58px', y: '18px', rotate: 5},
  {x: '-68px', y: '38px', rotate: -9},
  {x: '28px', y: '-42px', rotate: 4},
  {x: '0px', y: '40px', rotate: 2},
];

function ReviewsSection({reviews}) {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const cards = Array.from(section.querySelectorAll('.tr-review-card'));
    let raf = 0;

    const applyTransform = (card, p) => {
      const x = card.style.getPropertyValue('--x') || '0px';
      const y = card.style.getPropertyValue('--y') || '0px';
      const dx = card.style.getPropertyValue('--dx') || '0px';
      const dy = card.style.getPropertyValue('--dy') || '0px';
      const r = card.style.getPropertyValue('--rotate') || '0deg';
      const drop = (1 - p) * -620;
      card.style.opacity = String(p);
      card.style.transform = `translate(-50%, -50%) translate(calc(${x} + ${dx}), calc(${y} + ${dy})) rotate(${r}) translateY(${drop}px) scale(${0.85 + p * 0.15})`;
    };

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
        const p = clamp01((progress - i * 0.08) / 0.15);
        applyTransform(card, p);
      });
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    // Drag con el mouse: las tarjetas se pueden mover como fotos físicas.
    cards.forEach((card) => {
      let drag = null;

      const onDown = (e) => {
        if (e.button !== 0) return;
        if (parseFloat(card.style.opacity) < 0.7) return;
        e.preventDefault();
        drag = {
          startX: e.clientX,
          startY: e.clientY,
          dx: parseFloat(card.style.getPropertyValue('--dx')) || 0,
          dy: parseFloat(card.style.getPropertyValue('--dy')) || 0,
        };
        card.setPointerCapture(e.pointerId);
        card.classList.add('is-dragging');
        card.style.zIndex = 200;
        card.style.transition = 'none';
      };

      const onMove = (e) => {
        if (!drag) return;
        const dx = drag.dx + (e.clientX - drag.startX);
        const dy = drag.dy + (e.clientY - drag.startY);
        card.style.setProperty('--dx', `${dx}px`);
        card.style.setProperty('--dy', `${dy}px`);
        applyTransform(card, 1);
      };

      const onUp = () => {
        if (!drag) return;
        drag = null;
        card.classList.remove('is-dragging');
        card.style.zIndex = 100;
        card.style.transition =
          'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)';
        setTimeout(() => {
          card.style.transition = '';
        }, 320);
      };

      card.addEventListener('pointerdown', onDown);
      card.addEventListener('pointermove', onMove);
      card.addEventListener('pointerup', onUp);
      card.addEventListener('pointercancel', onUp);
    });

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
            url(transform: {maxWidth: 1000, preferredContentType: WEBP})
            altText
            width
            height
          }
          images(first: 5) {
            nodes {
              url(transform: {maxWidth: 400, preferredContentType: WEBP})
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
          totalInventory
        }
      }
    }
  }
`;
