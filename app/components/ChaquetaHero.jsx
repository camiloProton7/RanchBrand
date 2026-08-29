import {useRef, useState} from 'react';

/**
 * ChaquetaHero — hero premium de chaquetas.
 * La chaqueta es un PNG transparente que "flota" sobre un fondo de color
 * complementario. Detrás hay un texto gigante con el nombre (LAREDO,
 * YELLOWSTONE, ARMOR, MOJAVE, SAHARA) en un color propio de cada chaqueta.
 */

const KEYWORDS = ['Laredo', 'Sahara', 'Yellowstone', 'Armor', 'Mojave'];

// Colores complementarios por chaqueta: fondo + color del texto gigante
const COLORS = {
  Laredo: {bg: '#6b4a2b', text: '#e8d5b0'},
  Sahara: {bg: '#c8a36a', text: '#3f3322'},
  Yellowstone: {bg: '#5a6b3c', text: '#e8d5a8'},
  Armor: {bg: '#3a3f44', text: '#e8e2d4'},
  Mojave: {bg: '#a35c3a', text: '#f0e0c8'},
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
  const [index, setIndex] = useState(0);
  const dragInfo = useRef(null);

  if (!items.length) return null;

  const active = items[index];
  const keyword = keywordFor(active.title);
  const colors = COLORS[keyword] || {bg: '#3a3228', text: '#f4f0e7'};
  const giant = keyword.toUpperCase();
  const jacketSrc = active.featuredImage?.url || '';
  const n = items.length;

  const prev = () => setIndex((index - 1 + n) % n);
  const next = () => setIndex((index + 1) % n);

  // Swipe táctil (mobile) para cambiar de chaqueta deslizando
  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragInfo.current = {startX: e.clientX};
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
      className="tr-chaqueta-hero"
      style={{'--bg': colors.bg, '--text': colors.text}}
      aria-label="Chaquetas"
    >
      <div
        className="tr-chaqueta-hero-stage"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Texto gigante detrás */}
        <span className="tr-chaqueta-hero-giant" aria-hidden="true">
          {giant}
        </span>

        {/* Chaqueta PNG flotando */}
        {jacketSrc ? (
          <img
            key={active.id}
            className="tr-chaqueta-hero-jacket"
            src={jacketSrc}
            alt={active.title}
            draggable={false}
          />
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

      <div className="tr-chaqueta-hero-info">
        <p className="tr-chaqueta-hero-desc">{DESCRIPTIONS[keyword]}</p>
        <span className="tr-chaqueta-hero-price">
          {formatPrice(active.priceRange?.minVariantPrice?.amount)}
        </span>
      </div>

      <div className="tr-chaqueta-hero-bottom">
        <a
          className="tr-chaqueta-hero-cta"
          href={`https://ranch.com.co/products/${active.handle}`}
        >
          Comprar ahora
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
