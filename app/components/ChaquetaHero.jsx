import {useEffect, useRef, useState} from 'react';

/**
 * ChaquetaHero — hero premium de chaquetas.
 * PNG flotante sobre fondo de color complementario + texto gigante detrás.
 * Incluye miniaturas de detalle (fotos de cada chaqueta), eyebrow y CTA.
 */

const KEYWORDS = ['Laredo', 'Sahara', 'Yellowstone', 'Armor', 'Mojave'];

const COLORS = {
  Laredo: {bg: '#6b4a2b', text: '#e8d5b0'},
  Sahara: {bg: '#c8a36a', text: '#3f3322'},
  Yellowstone: {bg: '#5a6b3c', text: '#e8d5a8'},
  Armor: {bg: '#3a3f44', text: '#e8e2d4'},
  Mojave: {bg: '#a35c3a', text: '#f0e0c8'},
};

// Fondo con imagen (opcional) por chaqueta. Se sirve del CDN (cacheado) para
// que el crossfade sea instantáneo; el render WebP no cachea y se siente lento.
const BASE =
  'https://rattwfjkxgqvxmxlybcz.supabase.co/storage/v1/object/public/whatsapp-images/home';
const BG = (file) => `${BASE}/${file}`;

const BACKGROUND_IMAGES = {
  Yellowstone: BG('yellowstone-bg.jpg'),
  Armor: BG('armor-bg.jpg'),
  Mojave: BG('mojave-desert.jpg'),
  Laredo: BG('laredo-bg.jpg'),
  Sahara: BG('sahara-bg.jpg'),
};

const DESCRIPTIONS = {
  Laredo: 'Hecha a mano en lona y cuero, impermeabilizada para la intemperie.',
  Sahara: 'Ligera y transpirable, hecha para el calor del desierto.',
  Yellowstone: 'Abrigo resistente, impermeable para la lluvia y el frío.',
  Armor: 'Máxima protección contra el agua y el viento.',
  Mojave: 'Robusta y versátil, lista para el terreno.',
};

function formatPrice(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '';
  return '$' + n.toLocaleString('es-CO', {maximumFractionDigits: 0});
}

function keywordFor(title) {
  return KEYWORDS.find((k) => title.includes(k)) || title;
}

export default function ChaquetaHero({products}) {
  const items = products.filter((p) =>
    KEYWORDS.some((k) => (p.title || '').includes(k)),
  );
  const initialKeyword = items[0] ? keywordFor(items[0].title) : '';
  const initialBg = BACKGROUND_IMAGES[initialKeyword] || '';
  const [index, setIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [displayBg, setDisplayBg] = useState(initialBg);
  const [bgFading, setBgFading] = useState(false);
  const dragInfo = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    setImageIndex(0);
  }, [index]);

  // Parallax: el fondo responde al mouse (desktop) y al giroscopio (móvil).
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const onMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty('--par-x', x.toFixed(3));
      el.style.setProperty('--par-y', y.toFixed(3));
    };

    el.addEventListener('mousemove', onMouseMove);

    return () => {
      el.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  // Crossfade del fondo al cambiar de chaqueta (fade-out → cambio → fade-in)
  useEffect(() => {
    const item = items[index];
    if (!item) return;
    const bg = BACKGROUND_IMAGES[keywordFor(item.title)] || '';
    if (!bg || bg === displayBg) return;
    setBgFading(true);
    const t = setTimeout(() => {
      setDisplayBg(bg);
      setBgFading(false);
    }, 200);
    return () => clearTimeout(t);
  }, [index]);

  // Precargar SOLO los fondos (ligeros) para que el cambio sea instantáneo
  useEffect(() => {
    Object.values(BACKGROUND_IMAGES).forEach((url) => {
      if (url) {
        const img = new Image();
        img.src = url;
      }
    });
  }, []);

  if (!items.length) return null;

  const active = items[index];
  const keyword = keywordFor(active.title);
  const colors = COLORS[keyword] || {bg: '#3a3228', text: '#f4f0e7'};
  const giant = keyword.toUpperCase();
  const images = active.images?.nodes || [];
  const mainImage = images[imageIndex]?.url || active.featuredImage?.url || '';
  const backgroundImage = BACKGROUND_IMAGES[keyword] || '';
  const price = active.priceRange?.minVariantPrice?.amount;
  const compare = active.compareAtPriceRange?.minVariantPrice?.amount;
  const hasDiscount = compare && Number(compare) > Number(price);
  const totalInventory = active.totalInventory;
  const lowStock = totalInventory != null && totalInventory <= 5;
  const n = items.length;

  const prev = () => setIndex((index - 1 + n) % n);
  const next = () => setIndex((index + 1) % n);

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragInfo.current = {startX: e.clientX};
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}
  };

  const onPointerUp = (e) => {
    const info = dragInfo.current;
    if (!info) return;
    const dx = e.clientX - info.startX;
    if (Math.abs(dx) > 50) {
      if (dx < 0) next();
      else prev();
    }
    dragInfo.current = null;
  };

  return (
    <section
      ref={sectionRef}
      className="tr-chaqueta-hero"
      style={{'--bg': colors.bg, '--text': colors.text}}
      aria-label="Chaquetas"
    >
      {displayBg ? (
        <img
          className={`tr-chaqueta-hero-bg ${bgFading ? 'is-fading' : ''}`}
          src={displayBg}
          alt=""
          aria-hidden="true"
          draggable={false}
        />
      ) : null}
      <div
        className="tr-chaqueta-hero-stage"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Texto gigante detrás */}
        <span
          key={active.id}
          className="tr-chaqueta-hero-giant"
          aria-hidden="true"
        >
          {giant}
        </span>

        {/* Chaqueta PNG flotando */}
        {mainImage ? (
          <div className="tr-chaqueta-hero-jacket-float">
            <img
              key={active.id}
              className="tr-chaqueta-hero-jacket"
              src={mainImage}
              alt={active.title}
              draggable={false}
            />
          </div>
        ) : null}

        {/* Flechas */}
        <button
          className="tr-chaqueta-hero-arrow tr-chaqueta-hero-prev"
          type="button"
          onClick={prev}
          aria-label="Anterior"
        >
          ‹
        </button>
        <button
          className="tr-chaqueta-hero-arrow tr-chaqueta-hero-next"
          type="button"
          onClick={next}
          aria-label="Siguiente"
        >
          ›
        </button>
      </div>

      {/* Miniaturas de detalle */}
      {images.length > 1 && (
        <div className="tr-chaqueta-hero-thumbs">
          {images.map((img, i) => (
            <button
              key={img.url}
              className={i === imageIndex ? 'is-active' : ''}
              type="button"
              onClick={() => setImageIndex(i)}
              aria-label={`Foto ${i + 1}`}
            >
              <img src={img.url} alt="" loading="lazy" draggable={false} />
            </button>
          ))}
        </div>
      )}

      <div className="tr-chaqueta-hero-info" key={active.id}>
        <div className="tr-chaqueta-hero-head">
          <span className="tr-chaqueta-hero-eyebrow">{active.title}</span>
          <span className="tr-chaqueta-hero-rating">★ 4.9</span>
        </div>
        <p className="tr-chaqueta-hero-desc">{DESCRIPTIONS[keyword]}</p>
        <div className="tr-chaqueta-hero-price-row">
          {hasDiscount ? (
            <span className="tr-chaqueta-hero-compare">
              {formatPrice(compare)}
            </span>
          ) : null}
          <span className="tr-chaqueta-hero-price">{formatPrice(price)}</span>
          {lowStock ? (
            <span className="tr-chaqueta-hero-stock">⚡ Últimas unidades</span>
          ) : null}
        </div>
        <ul className="tr-chaqueta-hero-benefits">
          <li>💧 100% impermeable</li>
          <li>🚚 Envío gratis a toda Colombia</li>
          <li>🔄 1er cambio gratis</li>
        </ul>
      </div>

      <div className="tr-chaqueta-hero-bottom">
        <a
          className="tr-chaqueta-hero-cta"
          href={`/products/${active.handle}`}
        >
          <span>Comprar ahora</span>
          <span className="tr-chaqueta-hero-cta-arrow" aria-hidden="true">
            →
          </span>
        </a>
        <div className="tr-chaqueta-hero-dots">
          {items.map((p, i) => (
            <button
              key={p.id}
              className={i === index ? 'is-active' : ''}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ir a ${p.title}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
