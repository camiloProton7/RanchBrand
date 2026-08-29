import {useEffect, useRef, useState} from 'react';

/**
 * ChaquetaHero — hero premium de chaquetas.
 * La chaqueta es un PNG transparente que "flota" sobre un fondo que se tiñe
 * con el color dominante de cada chaqueta. Detrás hay un texto gigante con el
 * nombre (LAREDO, YELLOWSTONE, ARMOR, MOJAVE, SAHARA) parcialmente oculto.
 */

const KEYWORDS = ['Laredo', 'Sahara', 'Yellowstone', 'Armor', 'Mojave'];

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

function descriptionFor(title) {
  const key = keywordFor(title);
  return DESCRIPTIONS[key] || 'Hecha a mano para la intemperie.';
}

function extractColor(src, callback) {
  if (!src) return callback(null);
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 60;
      canvas.height = 60;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 60, 60);
      const data = ctx.getImageData(0, 0, 60, 60).data;
      let r = 0;
      let g = 0;
      let b = 0;
      let n = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 60) continue; // ignorar píxeles transparentes
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        n++;
      }
      if (n === 0) return callback(null);
      callback([Math.round(r / n), Math.round(g / n), Math.round(b / n)]);
    } catch {
      callback(null);
    }
  };
  img.onerror = () => callback(null);
  img.src = src;
}

export default function ChaquetaHero({products}) {
  const items = products.filter((p) =>
    KEYWORDS.some((k) => (p.title || '').includes(k)),
  );
  const [index, setIndex] = useState(0);
  const [bg, setBg] = useState([46, 38, 28]);
  const dragInfo = useRef(null);

  useEffect(() => {
    let alive = true;
    extractColor(items[index]?.featuredImage?.url, (rgb) => {
      if (alive && rgb) setBg(rgb);
    });
    return () => {
      alive = false;
    };
  }, [index, items]);

  if (!items.length) return null;

  const active = items[index];
  const giant = keywordFor(active.title).toUpperCase();
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
      style={{'--bg': `rgb(${bg[0]}, ${bg[1]}, ${bg[2]})`}}
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
        <p className="tr-chaqueta-hero-desc">{descriptionFor(active.title)}</p>
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
