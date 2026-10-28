import {useEffect, useRef, useState} from 'react';
import {Link, useNavigate} from 'react-router';
import {NAV_ITEMS} from '~/lib/nav';

/**
 * Exploración experimental, independiente del home. La navegación tradicional
 * del sitio continúa disponible en SiteHeader. Sin dependencias gráficas pesadas.
 */
const DESTINATIONS = [
  {name: 'Gorras', x: 76, y: 29, href: NAV_ITEMS.find((x) => x.label === 'Gorras')?.href || '/collections/gorras'},
  {name: 'Chaquetas', x: 23, y: 35, href: NAV_ITEMS.find((x) => x.label === 'Chaquetas')?.href || '/collections/chaquetas'},
  {name: 'Botas', x: 24, y: 76, href: NAV_ITEMS.find((x) => x.label === 'Botas')?.href || '/collections/botas-1'},
  {name: 'Camisas', x: 76, y: 53, href: NAV_ITEMS.find((x) => x.label === 'Camisas')?.href || '/collections/camisetas'},
  {name: 'Mujer', x: 79, y: 77, href: NAV_ITEMS.find((x) => x.label === 'Mujer')?.href || '/collections/chaquetas-mujer'},
];
const START = {x: 49, y: 57};
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const meta = () => [
  {title: 'Explorar colecciones | The Ranch — Laboratorio'},
  {name: 'description', content: 'Una nueva forma de explorar las colecciones de The Ranch.'},
  {name: 'robots', content: 'noindex,nofollow'},
];

export default function Explorar() {
  const navigate = useNavigate();
  const boardRef = useRef(null);
  const positionRef = useRef(START);
  const animationRef = useRef(0);
  const transitionRef = useRef(0);
  const lastPrintRef = useRef(0);
  const dragRef = useRef(false);
  const reducedRef = useRef(false);
  const [position, setPosition] = useState(START);
  const [rotation, setRotation] = useState(0);
  const [prints, setPrints] = useState([]);
  const [destination, setDestination] = useState(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return () => {
      window.cancelAnimationFrame(animationRef.current);
      window.clearTimeout(transitionRef.current);
    };
  }, []);

  function stopAnimation() {
    window.cancelAnimationFrame(animationRef.current);
    window.clearTimeout(transitionRef.current);
  }

  function move(x, y) {
    const last = positionRef.current;
    const next = {x: clamp(x, 8, 92), y: clamp(y, 16, 87)};
    const dx = next.x - last.x;
    const dy = next.y - last.y;
    if (Math.hypot(dx, dy) > 0.12) {
      setRotation(Math.atan2(dx, -dy) * 180 / Math.PI);
      positionRef.current = next;
      setPosition(next);
      const now = performance.now();
      if (!reducedRef.current && now - lastPrintRef.current > 125) {
        lastPrintRef.current = now;
        setPrints((old) => [...old.slice(-31), {x: last.x, y: last.y, id: now}]);
      }
    }
  }

  function selectDestination(point) {
    stopAnimation();
    setDestination(point.name);
    const origin = {...positionRef.current};
    const distance = Math.hypot(point.x - origin.x, point.y - origin.y);
    const duration = reducedRef.current ? 0 : clamp(distance * 30, 360, 1100);
    const started = performance.now();

    function frame(now) {
      const progress = duration === 0 ? 1 : Math.min(1, (now - started) / duration);
      const eased = progress * progress * (3 - 2 * progress);
      move(origin.x + (point.x - origin.x) * eased, origin.y + (point.y - origin.y) * eased);
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(frame);
      } else {
        transitionRef.current = window.setTimeout(() => navigate(point.href), reducedRef.current ? 100 : 420);
      }
    }
    animationRef.current = requestAnimationFrame(frame);
  }

  function handlePointerDown(event) {
    if (event.button !== undefined && event.button !== 0) return;
    stopAnimation();
    setDestination(null);
    dragRef.current = true;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event) {
    if (!dragRef.current || !boardRef.current) return;
    const bounds = boardRef.current.getBoundingClientRect();
    move(((event.clientX - bounds.left) / bounds.width) * 100, ((event.clientY - bounds.top) / bounds.height) * 100);
  }

  function handlePointerEnd() {
    dragRef.current = false;
    setDragging(false);
  }

  return (
    <main className="ranch-explore">
      <style>{STYLES}</style>
      <section className="ranch-explore__intro">
        <p>THE RANCH · EXPLORACIÓN</p>
        <h1>Elige tu camino.</h1>
        <span>Descubre nuestras colecciones de otra manera.</span>
      </section>
      <div className="ranch-explore__board" ref={boardRef} aria-label="Mapa interactivo de colecciones">
        <svg className="ranch-explore__terrain" aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M-8 18 C18 -3 29 47 52 15 S83 12 108 -2 M-9 27 C18 6 29 56 52 24 S83 21 108 7 M-9 36 C18 15 29 65 52 33 S83 30 108 16 M-9 45 C18 24 29 74 52 42 S83 39 108 25 M-9 54 C18 33 29 83 52 51 S83 48 108 34 M-9 63 C18 42 29 92 52 60 S83 57 108 43 M-9 72 C18 51 29 101 52 69 S83 66 108 52 M-9 81 C18 60 29 110 52 78 S83 75 108 61" />
        </svg>
        <svg className="ranch-explore__roads" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {DESTINATIONS.map((item) => (
            <path key={item.name} d={`M 49 57 Q ${(49 + item.x) / 2 - 4} ${(57 + item.y) / 2 - 6} ${item.x} ${item.y}`} />
          ))}
        </svg>
        {prints.map((print) => (
          <span key={print.id} className="ranch-explore__print" style={{left: `${print.x}%`, top: `${print.y}%`}} aria-hidden="true">⌁</span>
        ))}
        {DESTINATIONS.map((item) => (
          <button
            key={item.name}
            className="ranch-explore__destination"
            style={{left: `${item.x}%`, top: `${item.y}%`}}
            onClick={() => selectDestination(item)}
            type="button"
            aria-label={`Ir a la colección ${item.name}`}
          >
            <span className="ranch-explore__marker" aria-hidden="true">✦</span>
            <span>{item.name}</span>
          </button>
        ))}
        <div
          role="img"
          aria-label="Jinete y caballo ilustrados vistos desde arriba. Arrastra para moverlos."
          className={`ranch-explore__rider ${dragging ? 'is-dragging' : ''}`}
          style={{left: `${position.x}%`, top: `${position.y}%`, transform: `translate(-50%, -50%) rotate(${rotation}deg)`}}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
        >
          <svg viewBox="0 0 100 140" width="76" height="106" aria-hidden="true">
            <ellipse cx="54" cy="89" rx="35" ry="44" fill="#484135" opacity=".10" />
            <path d="M34 67 L19 105 M66 67 L81 105 M36 28 L20 11 M64 28 L80 11" stroke="#54392b" strokeWidth="10" strokeLinecap="round" />
            <ellipse cx="50" cy="69" rx="30" ry="45" fill="#805237" stroke="#67432e" strokeWidth="3" />
            <path d="M41 29 L38 4 Q50 -4 62 4 L59 29" fill="#8f6244" stroke="#67432e" strokeWidth="3" />
            <path d="M50 111 Q57 127 47 138" stroke="#4b352a" strokeWidth="6" fill="none" strokeLinecap="round" />
            <ellipse cx="50" cy="74" rx="23" ry="22" fill="#332f2b" />
            <path d="M30 73 Q50 82 70 73" stroke="#bcab8b" strokeWidth="5" fill="none" />
            <ellipse cx="50" cy="70" rx="21" ry="15" fill="#b8a484" />
            <ellipse cx="50" cy="67" rx="12" ry="13" fill="#71604b" />
            <ellipse cx="50" cy="62" rx="26" ry="11" fill="#d3c3a7" stroke="#a8906d" strokeWidth="2" />
            <ellipse cx="50" cy="58" rx="12" ry="8" fill="#ab946f" />
          </svg>
        </div>
        <div className="ranch-explore__hint" role="status">
          {destination ? `Rumbo a ${destination}…` : 'Arrastra el caballo o toca una categoría'}
        </div>
      </div>
      <nav className="ranch-explore__direct" aria-label="Acceso directo a colecciones">
        <span>IR DIRECTAMENTE A</span>
        <div>{DESTINATIONS.map((item) => (
          <Link key={item.name} to={item.href}>{item.name} <span aria-hidden="true">↗</span></Link>
        ))}</div>
      </nav>
    </main>
  );
}

const STYLES = `
.ranch-explore{--cream:#fafaf7;--ink:#36362f;--line:#d7d6d0;background:var(--cream);color:var(--ink);min-height:100svh;font-family:Arial,Helvetica,sans-serif}
.ranch-explore__intro{text-align:center;padding:34px 16px 10px}
.ranch-explore__intro p{font-size:10px;letter-spacing:2.6px;color:#77766e;margin:0 0 12px}
.ranch-explore__intro h1{font:normal 32px/1.15 Georgia,serif;margin:0 0 8px}
.ranch-explore__intro>span{font-size:12px;letter-spacing:.3px;color:#77766e}
.ranch-explore__board{position:relative;max-width:660px;margin:0 auto;height:min(66svh,620px);min-height:440px;overflow:hidden;isolation:isolate;touch-action:pan-y}
.ranch-explore__terrain,.ranch-explore__roads{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.ranch-explore__terrain path{stroke:#deded8;stroke-width:.22;fill:none;opacity:.7}
.ranch-explore__roads path{stroke:#c9c7bd;stroke-width:.45;stroke-dasharray:1.5 1.3;fill:none}
.ranch-explore__destination{position:absolute;z-index:2;transform:translate(-50%,-50%);width:83px;height:83px;background:rgba(250,250,247,.94);border:1px solid #cac8bf;border-radius:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:5px;font-size:10px;text-transform:uppercase;letter-spacing:1px;cursor:pointer;color:#3b3933;box-shadow:0 3px 14px #42403509}
.ranch-explore__destination:hover,.ranch-explore__destination:focus-visible{border-color:#736a56;outline-offset:3px}
.ranch-explore__marker{color:#988a72;font-size:18px}
.ranch-explore__rider{position:absolute;z-index:3;width:76px;height:106px;cursor:grab;touch-action:none;user-select:none;filter:drop-shadow(8px 12px 6px #0002);transform-origin:center center}
.ranch-explore__rider.is-dragging{cursor:grabbing}
.ranch-explore__print{position:absolute;transform:translate(-50%,-50%);font-size:20px;color:#b1ada4;opacity:.6;pointer-events:none}
.ranch-explore__hint{position:absolute;left:50%;bottom:9px;transform:translateX(-50%);border:1px solid #e0ded6;background:#fafaf7ee;border-radius:30px;padding:11px 16px;font-size:11px;color:#6b6860;text-align:center;white-space:nowrap}
.ranch-explore__direct{max-width:660px;margin:0 auto;padding:17px 16px 45px;text-align:center}
.ranch-explore__direct>span{display:block;font-size:10px;letter-spacing:1.7px;color:#858176;margin-bottom:14px}
.ranch-explore__direct>div{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.ranch-explore__direct a{border:1px solid #c9c6bb;color:#37352f;text-decoration:none;font-size:12px;padding:10px 13px;display:inline-flex;gap:8px}
@media(max-width:500px){.ranch-explore__intro{padding-top:25px}.ranch-explore__intro h1{font-size:29px}.ranch-explore__board{height:58svh;min-height:400px}.ranch-explore__destination{width:75px;height:75px;font-size:9px}.ranch-explore__direct{padding-bottom:36px}}
@media(prefers-reduced-motion:reduce){.ranch-explore *, .ranch-explore *::before,.ranch-explore *::after{animation:none!important;transition:none!important}}
`;
