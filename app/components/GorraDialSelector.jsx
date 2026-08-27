import {useEffect, useRef, useState} from 'react';

/**
 * GorraDialSelector — selector inmersivo de gorras con dial semicircular
 * inspirado en el anillo de zoom de una cámara profesional.
 *
 * El modelo permanece fijo; al girar el dial solo cambia la gorra (crossfade)
 * y la información del producto. Conectado a productos reales de Shopify.
 */

// ── Imágenes del modelo con cada gorra ──────────────────────────────────────
// Camilo genera estas imágenes (mismo modelo, mismo encuadre, distinta gorra).
// Añade aquí: handle -> URL. Mientras tanto se usa la imagen del producto.
const MODEL_IMAGES = {
  // 'gorra-redwood': '/model-gorras/redwood.webp',
  // 'gorra-andina': '/model-gorras/andina.webp',
};

const LIFESTYLE = [
  'Hecha para el campo y la calle.',
  'Bordado a mano, actitud sin filtro.',
  'Cuero, sol y kilómetros.',
  'No seguimos modas, las marcamos.',
  'Detalles que se notan de lejos.',
];

function modelImage(product) {
  return MODEL_IMAGES[product.handle] || product.featuredImage?.url || '';
}

function shortName(title) {
  return (title || '')
    .replace(/^Gorra\s+/i, '')
    .replace(/\s+x\s+\$[\d.,]+$/i, '')
    .slice(0, 10);
}

function formatPrice(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '';
  return '$' + n.toLocaleString('es-CO', {maximumFractionDigits: 0});
}

export default function GorraDialSelector({products}) {
  const n = products.length;
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isGrabbing, setIsGrabbing] = useState(false);

  const dialRef = useRef(null);
  const dragInfo = useRef(null);
  const animRef = useRef(0);

  const DRAG_SCALE = 90; // px por gorra
  const reduced = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduced.current = mq.matches;
  }, []);

  const clampIndex = (i) => Math.max(0, Math.min(n - 1, i));

  const commit = (raw, vibrate = true) => {
    const target = clampIndex(Math.round(raw));
    setIndex(target);
    setDrag(0);
    setHasInteracted(true);
    if (vibrate && navigator.vibrate) navigator.vibrate(12);
  };

  const goTo = (i) => {
    setIndex(clampIndex(i));
    setDrag(0);
    setHasInteracted(true);
  };

  // ── Drag con inercia + snap ───────────────────────────────────────────────
  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    dragInfo.current = {
      startX: e.clientX,
      startDrag: drag,
      lastX: e.clientX,
      lastT: performance.now(),
      velocity: 0,
    };
    setIsGrabbing(true);
    dialRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    const info = dragInfo.current;
    if (!info) return;
    const now = performance.now();
    const dt = now - info.lastT;
    if (dt > 0) {
      info.velocity = 0.85 * info.velocity + 0.15 * ((e.clientX - info.lastX) / dt);
    }
    info.lastX = e.clientX;
    info.lastT = now;
    const dx = e.clientX - info.startX;
    setDrag(info.startDrag + dx / DRAG_SCALE);
  };

  const onPointerUp = () => {
    const info = dragInfo.current;
    dragInfo.current = null;
    setIsGrabbing(false);
    if (!info) return;

    // Inercia suave + snap
    let vel = info.velocity * 16; // px/frame
    let cur = index + drag;
    const tick = () => {
      if (reduced.current || Math.abs(vel) < 0.05) {
        commit(cur);
        animRef.current = 0;
        return;
      }
      cur += vel / DRAG_SCALE;
      vel *= 0.92;
      const target = Math.round(cur);
      const clamped = clampIndex(target);
      const diff = clamped - index;
      if (Math.abs(diff) >= 1) {
        // Avanza gorras de forma fluida durante la inercia
        setIndex(clamped);
        setDrag(0);
        cur = clamped;
      } else {
        setDrag(cur - index);
      }
      animRef.current = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(tick);
  };

  const onWheel = (e) => {
    e.preventDefault();
    goTo(index + (e.deltaY > 0 ? 1 : -1));
  };

  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  if (!products.length) return null;

  const active = products[index];
  const lifestyle = LIFESTYLE[index % LIFESTYLE.length];

  // ── Geometría del dial semicircular ────────────────────────────────────────
  const CX = 300;
  const CY = 300;
  const R = 240;
  const STEP = 0.19; // rad entre gorras
  const marks = products.map((p, i) => {
    const angle = Math.PI / 2 + (i - index - drag) * STEP;
    const visible = angle > 0.12 && angle < Math.PI - 0.12;
    const x = CX + R * Math.cos(angle);
    const y = CY - R * Math.sin(angle);
    const isActive = i === index && Math.abs(drag) < 0.01;
    return {p, i, angle, x, y, visible, isActive};
  });

  return (
    <section className="tr-dial" aria-label="Selección de gorras">
      <div className="tr-dial-stage">
        {/* Modelo con la gorra (crossfade) */}
        <div className="tr-dial-model">
          {products.map((p, i) => {
            const src = modelImage(p);
            if (!src) return null;
            const isActive = i === index;
            return (
              <img
                key={p.id}
                className={`tr-dial-model-img ${isActive ? 'is-active' : ''}`}
                src={src}
                alt={isActive ? p.title : ''}
                loading={i === 0 ? 'eager' : 'lazy'}
                draggable={false}
              />
            );
          })}
          <div className="tr-dial-vignette" aria-hidden="true" />
        </div>

        {/* Info del producto */}
        <div className="tr-dial-info" key={active.id}>
          <span className="tr-dial-eyebrow">
            {active.productType || 'Trucker premium'}
          </span>
          <h3 className="tr-dial-name">{active.title}</h3>
          <p className="tr-dial-lifestyle">{lifestyle}</p>
          <div className="tr-dial-actions">
            <span className="tr-dial-price">
              {formatPrice(active.priceRange?.minVariantPrice?.amount)}
            </span>
            <a
              className="tr-dial-cta"
              href={`https://ranch.com.co/products/${active.handle}`}
            >
              Ver gorra
            </a>
            <button className="tr-dial-add" type="button">
              Agregar
            </button>
          </div>
        </div>

        {/* Dial semicircular */}
        <div
          className={`tr-dial-ring ${isGrabbing ? 'is-grabbing' : ''}`}
          ref={dialRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
        >
          <svg
            viewBox="0 0 600 300"
            preserveAspectRatio="xMidYMax meet"
            aria-hidden="true"
          >
            {/* Arco base */}
            <path
              d="M 60 300 A 240 240 0 0 1 540 300"
              fill="none"
              stroke="rgba(244,240,231,0.14)"
              strokeWidth="2"
            />
            {/* Escala curva + marcas */}
            {marks.map(({p, i, angle, x, y, visible, isActive}) => {
              if (!visible) return null;
              const tx = x + Math.cos(angle) * 20;
              const ty = y - Math.sin(angle) * 20;
              const major = i % 3 === 0;
              return (
                <g key={p.id} className="tr-dial-mark">
                  <line
                    x1={x}
                    y1={y}
                    x2={x + Math.cos(angle) * (major ? 16 : 9)}
                    y2={y - Math.sin(angle) * (major ? 16 : 9)}
                    stroke={
                      isActive ? 'rgba(245,179,1,0.95)' : 'rgba(244,240,231,0.4)'
                    }
                    strokeWidth={isActive ? 2.5 : 1.5}
                  />
                  <text
                    x={tx}
                    y={ty}
                    textAnchor="middle"
                    fontSize={isActive ? 13 : 11}
                    fill={isActive ? '#f5b301' : 'rgba(244,240,231,0.6)'}
                    fontWeight={isActive ? 700 : 400}
                    style={{letterSpacing: '0.04em'}}
                  >
                    {shortName(p.title)}
                  </text>
                </g>
              );
            })}
            {/* Indicador central */}
            <g className="tr-dial-indicator">
              <path d="M 300 300 l -9 -16 h 18 Z" fill="#f5b301" />
            </g>
          </svg>
        </div>

        {/* Hint que desaparece tras la primera interacción */}
        {!hasInteracted && (
          <div className="tr-dial-hint" aria-hidden="true">
            <span className="tr-dial-hint-arrow">←</span>
            Desliza para cambiar de gorra
            <span className="tr-dial-hint-arrow">→</span>
          </div>
        )}
      </div>
    </section>
  );
}
