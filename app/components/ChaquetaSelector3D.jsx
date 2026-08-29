import {useEffect, useRef, useState} from 'react';

/**
 * ChaquetaSelector3D — carousel 3D de chaquetas (coverflow).
 * Solo muestra chaquetas seleccionadas, con tarjeta grande, info compacta,
 * fondo teñido con el color de la chaqueta y una foto de contexto debajo.
 */

// ── Fotos de contexto (Camilo las sube) ─────────────────────────────────────
// Cada chaqueta puede tener una foto "de contexto" (lifestyle) debajo.
// Añade aquí: handle -> ruta. Mientras tanto se usa la 2ª imagen del producto.
const CONTEXT_IMAGES = {
  // 'chaqueta-laredo': '/contexto/laredo.webp',
  // 'chaqueta-impermeable-sahara': '/contexto/sahara.webp',
};

// Chaquetas que se muestran (por palabra clave en el título)
const KEYWORDS = ['Laredo', 'Sahara', 'Yellowstone', 'Armor', 'Mojave'];

function formatPrice(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '';
  return '$' + n.toLocaleString('es-CO', {maximumFractionDigits: 0});
}

function contextImage(product) {
  return CONTEXT_IMAGES[product.handle] || '';
}

function extractColor(src, callback) {
  if (!src) return callback(null);
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 40;
      canvas.height = 40;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 40, 40);
      const data = ctx.getImageData(0, 0, 40, 40).data;
      let r = 0;
      let g = 0;
      let b = 0;
      let n = 0;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        n++;
      }
      callback([Math.round(r / n), Math.round(g / n), Math.round(b / n)]);
    } catch {
      callback(null);
    }
  };
  img.onerror = () => callback(null);
  img.src = src;
}

export default function ChaquetaSelector3D({products}) {
  const items = products.filter((p) =>
    KEYWORDS.some((k) => (p.title || '').includes(k)),
  );
  const n = items.length;

  const [index, setIndex] = useState(0);
  const [bgColor, setBgColor] = useState([16, 15, 13]);
  const [hasInteracted, setHasInteracted] = useState(false);

  const dragInfo = useRef(null);
  const DRAG_SCALE = 140;

  useEffect(() => {
    let alive = true;
    const src = items[index]?.featuredImage?.url;
    extractColor(src, (rgb) => {
      if (alive && rgb) setBgColor(rgb);
    });
    return () => {
      alive = false;
    };
  }, [index, items]);

  const clampIndex = (i) => Math.max(0, Math.min(n - 1, i));

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragInfo.current = {startX: e.clientX};
  };

  const onPointerMove = (e) => {
    const info = dragInfo.current;
    if (!info) return;
    const dx = e.clientX - info.startX;
    if (Math.abs(dx) > DRAG_SCALE * 0.55) {
      const dir = dx > 0 ? -1 : 1;
      setIndex(clampIndex(index + dir));
      dragInfo.current.startX = e.clientX;
      setHasInteracted(true);
    }
  };

  const onPointerUp = () => {
    dragInfo.current = null;
  };

  if (!items.length) return null;

  const active = items[index];

  return (
    <section
      className="tr-chaqueta3d"
      style={{'--bg': `rgb(${bgColor[0]}, ${bgColor[1]}, ${bgColor[2]})`}}
      aria-label="Selección de chaquetas"
    >
      <div
        className="tr-chaqueta3d-stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Info compacta */}
        <div className="tr-chaqueta3d-info" key={active.id}>
          <div className="tr-chaqueta3d-head">
            <h3 className="tr-chaqueta3d-name">{active.title}</h3>
            <span className="tr-chaqueta3d-price">
              {formatPrice(active.priceRange?.minVariantPrice?.amount)}
            </span>
          </div>
          <a
            className="tr-chaqueta3d-cta"
            href={`https://ranch.com.co/products/${active.handle}`}
          >
            Ver chaqueta
          </a>
        </div>

        {/* Carousel 3D */}
        <div className="tr-chaqueta3d-carousel">
          {items.map((p, i) => {
            const offset = i - index;
            const angle = offset * 45;
            const scale = 1 - Math.abs(offset) * 0.1;
            const x = offset * 250;
            const z = -Math.abs(offset) * 220;
            const opacity = Math.abs(offset) > 2.5 ? 0 : 1;
            const isActive = i === index;
            const blur = isActive ? 0 : Math.min(6, Math.abs(offset) * 2.5);
            return (
              <div
                key={p.id}
                className={`tr-chaqueta3d-card ${isActive ? 'is-active' : ''}`}
                style={{
                  transform: `translate(-50%, -50%) translateX(${x}px) translateZ(${z}px) rotateY(${angle}deg) scale(${scale})`,
                  zIndex: 20 - Math.abs(offset),
                  opacity,
                  filter: blur ? `blur(${blur}px)` : undefined,
                }}
                onClick={() => {
                  setIndex(i);
                  setHasInteracted(true);
                }}
              >
                {p.featuredImage?.url ? (
                  <img
                    src={p.featuredImage.url}
                    alt={p.title}
                    loading="lazy"
                    draggable={false}
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Foto de contexto (debajo) — solo aparece cuando hay fotos cargadas */}
        {Object.keys(CONTEXT_IMAGES).length > 0 && (
          <div className="tr-chaqueta3d-context">
            {items.map((p, i) => {
              const src = contextImage(p);
              if (!src) return null;
              return (
                <img
                  key={p.id}
                  className={i === index ? 'is-active' : ''}
                  src={src}
                  alt=""
                  loading="lazy"
                  draggable={false}
                />
              );
            })}
          </div>
        )}

        {!hasInteracted && (
          <div className="tr-chaqueta3d-hint" aria-hidden="true">
            Desliza para explorar
          </div>
        )}
      </div>
    </section>
  );
}
