import {useEffect, useRef, useState} from 'react';

/**
 * ChaquetaSelector3D — carousel 3D de chaquetas (estilo coverflow/SSENSE).
 * Las tarjetas rotan en perspectiva; al cambiar la chaqueta activa, cambia
 * toda la información y el fondo de la sección se tiñe con el color dominante
 * de la chaqueta.
 */

function formatPrice(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '';
  return '$' + n.toLocaleString('es-CO', {maximumFractionDigits: 0});
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
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
  const n = products.length;
  const [index, setIndex] = useState(0);
  const [bgColor, setBgColor] = useState([16, 15, 13]);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const dragInfo = useRef(null);
  const DRAG_SCALE = 120; // px por chaqueta

  // Teñir el fondo con el color dominante de la chaqueta activa
  useEffect(() => {
    let alive = true;
    const src = products[index]?.featuredImage?.url;
    extractColor(src, (rgb) => {
      if (alive && rgb) setBgColor(rgb);
    });
    return () => {
      alive = false;
    };
  }, [index, products]);

  const clampIndex = (i) => Math.max(0, Math.min(n - 1, i));

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragInfo.current = {startX: e.clientX, lastX: e.clientX};
    setIsGrabbing(true);
  };

  const onPointerMove = (e) => {
    const info = dragInfo.current;
    if (!info) return;
    const dx = e.clientX - info.startX;
    if (Math.abs(dx) > DRAG_SCALE * 0.55) {
      // Avanzó una chaqueta
      const dir = dx > 0 ? -1 : 1;
      setIndex(clampIndex(index + dir));
      dragInfo.current.startX = e.clientX;
      setHasInteracted(true);
    }
  };

  const onPointerUp = () => {
    dragInfo.current = null;
    setIsGrabbing(false);
  };

  if (!products.length) return null;

  const active = products[index];

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
        {/* Info sincronizada */}
        <div className="tr-chaqueta3d-info" key={active.id}>
          <span className="tr-chaqueta3d-eyebrow">Chaquetas</span>
          <h3 className="tr-chaqueta3d-name">{active.title}</h3>
          <div className="tr-chaqueta3d-actions">
            <span className="tr-chaqueta3d-price">
              {formatPrice(active.priceRange?.minVariantPrice?.amount)}
            </span>
            <a
              className="tr-chaqueta3d-cta"
              href={`https://ranch.com.co/products/${active.handle}`}
            >
              Ver chaqueta
            </a>
          </div>
        </div>

        {/* Carousel 3D (coverflow) */}
        <div className="tr-chaqueta3d-carousel">
          {products.map((p, i) => {
            const offset = i - index;
            const angle = offset * 38;
            const scale = 1 - Math.abs(offset) * 0.12;
            const x = offset * 42;
            const z = -Math.abs(offset) * 160;
            const opacity = Math.abs(offset) > 2.5 ? 0 : 1;
            const isActive = i === index;
            return (
              <div
                key={p.id}
                className={`tr-chaqueta3d-card ${isActive ? 'is-active' : ''}`}
                style={{
                  transform: `translateX(${x}%) translateZ(${z}px) rotateY(${angle}deg) scale(${scale})`,
                  zIndex: 20 - Math.abs(offset),
                  opacity,
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

        {!hasInteracted && (
          <div className="tr-chaqueta3d-hint" aria-hidden="true">
            Desliza para explorar
          </div>
        )}
      </div>
    </section>
  );
}
