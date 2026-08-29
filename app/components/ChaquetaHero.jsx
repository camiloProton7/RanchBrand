import {useState} from 'react';

/**
 * ChaquetaHero — carousel premium de chaquetas tipo campaña western.
 * Cada chaqueta es un "hero" (render 3D) con texto gigante detrás, elementos
 * ambientales (agua, ramas, brújula, roca) y navegación con flechas.
 *
 * Las imágenes hero las genera Camilo (render 3D). Mientras tanto se usa la
 * foto del producto como placeholder.
 */

// Chaquetas que se muestran (por palabra clave en el título)
const KEYWORDS = ['Laredo', 'Sahara', 'Yellowstone', 'Armor', 'Mojave'];

// ── Renders hero (Camilo los genera) ────────────────────────────────────────
// Añade aquí: handle -> ruta del render 3D (con texto gigante + elementos).
const HERO_IMAGES = {
  // 'chaqueta-impermeable-yellowstone': '/chaquetas-hero/yellowstone.webp',
  // 'chaqueta-impermeable-armor': '/chaquetas-hero/armor.webp',
  // 'chaqueta-impermeable-mojave': '/chaquetas-hero/mojave.webp',
  // 'chaqueta-impermeable-sahara': '/chaquetas-hero/sahara.webp',
  // 'chaqueta-laredo-impermeable': '/chaquetas-hero/laredo.webp',
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

function descriptionFor(title) {
  const key = KEYWORDS.find((k) => title.includes(k));
  return DESCRIPTIONS[key] || 'Hecha a mano para la intemperie.';
}

export default function ChaquetaHero({products}) {
  const items = products.filter((p) =>
    KEYWORDS.some((k) => (p.title || '').includes(k)),
  );
  const [index, setIndex] = useState(0);

  if (!items.length) return null;

  const active = items[index];
  const heroImage =
    HERO_IMAGES[active.handle] || active.featuredImage?.url || '';
  const n = items.length;

  const prev = () => setIndex((index - 1 + n) % n);
  const next = () => setIndex((index + 1) % n);

  return (
    <section className="tr-chaqueta-hero" aria-label="Chaquetas">
      <span className="tr-chaqueta-hero-logo">THE RANCH</span>

      <div className="tr-chaqueta-hero-stage">
        <button
          className="tr-chaqueta-hero-arrow"
          type="button"
          onClick={prev}
          aria-label="Anterior"
        >
          ‹
        </button>

        <div className="tr-chaqueta-hero-media">
          {heroImage ? (
            <img
              key={active.id}
              src={heroImage}
              alt={active.title}
              draggable={false}
            />
          ) : null}
        </div>

        <button
          className="tr-chaqueta-hero-arrow"
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
