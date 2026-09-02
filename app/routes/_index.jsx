import {Link, useLoaderData, useRouteLoaderData} from 'react-router';
import {useEffect, useRef, useState} from 'react';
import {ScrollVideoHero} from '~/components/ScrollVideoHero';
import ChaquetaHero from '~/components/ChaquetaHero';
import DesertCampaign from '~/components/DesertCampaign';
import UtilityLinks from '~/components/UtilityLinks';
import homeStyles from '~/styles/scroll-video-hero.css?url';

export const meta = () => [
  {title: 'The Ranch — No seguimos modas'},
  {
    name: 'description',
    content:
      'The Ranch: gorras, chaquetas y accesorios para quienes hacen las cosas bien.',
  },
  {property: 'og:title', content: 'The Ranch — No seguimos modas'},
  {
    property: 'og:description',
    content:
      'Gorras, chaquetas y camisetas para quienes hacen las cosas bien. Envío gratis en Colombia.',
  },
  {property: 'og:type', content: 'website'},
  {property: 'og:url', content: 'https://ranch.com.co/'},
  {property: 'og:image', content: 'https://ranch.com.co/og-image.jpg'},
  {name: 'twitter:card', content: 'summary_large_image'},
  {name: 'twitter:title', content: 'The Ranch — No seguimos modas'},
  {tagName: 'link', rel: 'canonical', href: 'https://ranch.com.co/'},
  {
    'script:ld+json': {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'The Ranch',
      url: 'https://ranch.com.co',
      sameAs: ['https://www.instagram.com/', 'https://www.tiktok.com/'],
    },
  },
];

export function links() {
  return [
    {rel: 'stylesheet', href: homeStyles},
    {rel: 'preload', as: 'video', href: '/home-video.mp4?v=5', type: 'video/mp4'},
    {rel: 'preload', as: 'image', href: '/home-poster.jpg?v=5'},
  ];
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
      <CategoryMenu />
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
      <ExchangeBanner />
      <DesertCampaign />
      <RanchStory />
      <ProductScroll
        products={hotRanch}
        collectionUrl="https://ranch.com.co/collections/hot-ranch"
        ariaLabel="Más vendidos"
      />
      <UtilityLinks />
      <ReviewsSection reviews={reviews} />
      <WhatsAppFloat />
    </div>
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

function ExchangeBanner() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <section className="tr-exchange" aria-label="Cambios y devoluciones">
        <div className="tr-exchange-inner">
          <span className="tr-exchange-icon" aria-hidden="true">🔄</span>
          <div className="tr-exchange-text">
            <h2 className="tr-exchange-title">
              ¿Cambio de talla, color o referencia?
            </h2>
            <p className="tr-exchange-desc">
              Sin complicaciones. Te cambiamos tu pedido por la talla, color o
              referencia que necesites.
            </p>
          </div>
          <button
            className="tr-exchange-cta"
            type="button"
            onClick={() => setOpen(true)}
          >
            Solicitar cambio
          </button>
        </div>
      </section>
      {open ? <ExchangeModal onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function ExchangeModal({onClose}) {
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [ticketNumber, setTicketNumber] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus('sending');
    try {
      const body = new URLSearchParams();
      body.append('name', fd.get('name') || '');
      body.append('phone', fd.get('phone') || '');
      body.append('orderNumber', fd.get('orderNumber') || '');
      body.append('reason', fd.get('reason') || '');
      body.append('message', fd.get('message') || '');

      const res = await fetch('/api/exchange', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: body.toString(),
      });
      const data = await res.json();
      if (data.ok) {
        setTicketNumber(data.ticketNumber);
        setStatus('done');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  const close = () => {
    if (status === 'sending') return;
    onClose();
  };

  return (
    <div
      className="tr-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Solicitar cambio"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="tr-modal-panel">
        <button
          type="button"
          className="tr-modal-close"
          onClick={close}
          aria-label="Cerrar"
        >
          ×
        </button>

        {status === 'done' ? (
          <div className="tr-modal-success">
            <span className="tr-modal-success-icon" aria-hidden="true">
              ✓
            </span>
            <h3 className="tr-modal-success-title">¡Solicitud de cambio recibida!</h3>
            <p className="tr-modal-success-text">
              Te contactaremos pronto para coordinar el cambio.
              {ticketNumber ? (
                <>
                  {' '}
                  Tu ticket:{' '}
                  <strong className="tr-modal-ticket">{ticketNumber}</strong>.
                </>
              ) : null}
            </p>
            <button type="button" className="tr-modal-button" onClick={close}>
              Cerrar
            </button>
          </div>
        ) : (
          <form className="tr-modal-form" onSubmit={handleSubmit}>
            <h3 className="tr-modal-title">Solicitar cambio</h3>
            <p className="tr-modal-subtitle">
              Déjanos tus datos y coordinamos el cambio de tu pedido.
            </p>

            <label className="tr-modal-field">
              <span className="tr-modal-label">Nombre *</span>
              <input name="name" required autoComplete="name" />
            </label>

            <label className="tr-modal-field">
              <span className="tr-modal-label">Teléfono / WhatsApp *</span>
              <input name="phone" type="tel" required autoComplete="tel" />
            </label>

            <label className="tr-modal-field">
              <span className="tr-modal-label">Número de pedido *</span>
              <input name="orderNumber" required placeholder="Ej. #1024" />
            </label>

            <label className="tr-modal-field">
              <span className="tr-modal-label">Razón del cambio *</span>
              <select name="reason" required defaultValue="">
                <option value="" disabled>
                  Selecciona una razón
                </option>
                <option>Talla</option>
                <option>Color</option>
                <option>Referencia</option>
                <option>Defecto del producto</option>
                <option>Otro</option>
              </select>
            </label>

            <label className="tr-modal-field">
              <span className="tr-modal-label">Detalles adicionales</span>
              <textarea name="message" rows={3} />
            </label>

            {status === 'error' ? (
              <p className="tr-modal-error">
                No pudimos enviar tu solicitud. Intenta de nuevo.
              </p>
            ) : null}

            <button
              type="submit"
              className="tr-modal-button"
              disabled={status === 'sending'}
            >
              {status === 'sending' ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function CategoryMenu() {
  const items = [
    {label: 'Home', href: '/'},
    {label: 'Gorras', href: '/collections/gorras-truckers'},
    {label: 'Chaquetas', href: '/collections/chaquetas'},
    {label: 'Camisetas', href: '/collections/camisetas'},
  ];
  return (
    <section className="tr-catmenu" aria-label="Categorías">
      <div className="tr-catmenu-inner">
        <nav className="tr-catmenu-nav">
          {items.map((item, i) => (
            <Link key={item.href} className="tr-catmenu-link" to={item.href}>
              <span className="tr-catmenu-num">0{i + 1}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <a
          className="tr-catmenu-wa"
          href="https://wa.me/573209157343"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 004.74 1.21c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm5.83 14.12c-.25.7-1.45 1.33-2.02 1.38-.52.04-1.16.19-3.9-.81-3.3-1.3-5.38-4.67-5.54-4.89-.16-.22-1.32-1.76-1.32-3.36 0-1.6.84-2.39 1.14-2.71.3-.33.65-.41.87-.41.21 0 .44 0 .63.01.2.01.47-.08.74.57.27.65.92 2.25 1 2.41.08.16.13.35.03.57-.11.22-.16.35-.32.54-.16.19-.34.43-.48.57-.16.16-.33.34-.14.66.19.33.84 1.39 1.8 2.25 1.24 1.1 2.28 1.44 2.6 1.6.32.16.51.14.7-.08.19-.22.81-.94 1.02-1.27.21-.32.43-.27.72-.16.3.11 1.87.88 2.19 1.04.32.16.53.24.61.38.08.13.08.76-.17 1.45z" />
          </svg>
          <span>WhatsApp</span>
        </a>
      </div>
    </section>
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
      </header>

      <div className="tr-gorras-scroll">
        {products.map((product) => {
          const primary = product.featuredImage;
          const second = product.images?.nodes?.[1];
          const price = product.priceRange?.minVariantPrice?.amount;
          const compare = product.compareAtPriceRange?.minVariantPrice?.amount;
          const hasDiscount = compare && Number(compare) > Number(price);

          return (
            <Link
              key={product.id}
              className="tr-gorra-card"
              to={`/products/${product.handle}`}
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
            </Link>
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
            url(transform: {maxWidth: 700, preferredContentType: WEBP})
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
        }
      }
    }
  }
`;
