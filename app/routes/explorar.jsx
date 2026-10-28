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
      const control={x:(origin.x+point.x)/2-4,y:(origin.y+point.y)/2-7};
      move((1-eased)*(1-eased)*origin.x + 2*(1-eased)*eased*control.x + eased*eased*point.x,
           (1-eased)*(1-eased)*origin.y + 2*(1-eased)*eased*control.y + eased*eased*point.y);
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
          {Array.from({length:22}, (_, j) => {
            const x=4+j*4.6;
            const path=Array.from({length:63}, (_,i)=>{
              const y=-12+i*2;
              const x1=x+Math.sin(y*.09+j*.38)*5.2+Math.sin(y*.21+j*.17)*1.4;
              return (i===0?'M':'L')+x1.toFixed(1)+' '+y;
            }).join(' ');
            return <path key={j} d={path}/>;
          })}
          <g className="ranch-explore__mountain" transform="translate(12 14) scale(.65)">
            <path d="M-26 19L-13-6 1-20 10-3 18-9 30 18Z" fill="#e7e6df" stroke="#cccac1" strokeWidth=".8"/>
            <path d="M1-20L-4-5 2-9 8 1M-13-6L-6 2M18-9L13 1" fill="none" stroke="#bfbdb4" strokeWidth=".7"/>
          </g>
          <g className="ranch-explore__mountain" transform="translate(88 13) scale(.7)">
            <path d="M-26 19L-13-6 1-20 10-3 18-9 30 18Z" fill="#e8e7e1" stroke="#cccac1" strokeWidth=".8"/>
            <path d="M1-20L-4-5 2-9 8 1M-13-6L-6 2M18-9L13 1" fill="none" stroke="#bfbdb4" strokeWidth=".7"/>
          </g>
          <g className="ranch-explore__mountain" transform="translate(10 91) scale(.8)">
            <path d="M-26 19L-13-6 1-20 10-3 18-9 30 18Z" fill="#e7e6df" stroke="#cccac1" strokeWidth=".8"/>
            <path d="M1-20L-4-5 2-9 8 1M-13-6L-6 2M18-9L13 1" fill="none" stroke="#bfbdb4" strokeWidth=".7"/>
          </g>
          <g className="ranch-explore__mountain" transform="translate(93 84) scale(.9)">
            <path d="M-26 19L-13-6 1-20 10-3 18-9 30 18Z" fill="#e7e6df" stroke="#cccac1" strokeWidth=".8"/>
            <path d="M1-20L-4-5 2-9 8 1M-13-6L-6 2M18-9L13 1" fill="none" stroke="#bfbdb4" strokeWidth=".7"/>
          </g>
        </svg>
        <svg className="ranch-explore__roads" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {DESTINATIONS.map((item) => (
            <path key={item.name} d={`M 49 57 Q ${(49 + item.x) / 2 - 4} ${(57 + item.y) / 2 - 6} ${item.x} ${item.y}`} />
          ))}
        </svg>
        {prints.map((print) => (
          <span key={print.id} className="ranch-explore__print" style={{left: `${print.x}%`, top: `${print.y}%`}} aria-hidden="true">♞</span>
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
            <span className="ranch-explore__marker" aria-hidden="true">{item.name==='Gorras'?'♧':item.name==='Botas'?'♙':item.name==='Chaquetas'?'♜':item.name==='Camisas'?'♧':'✧'}</span>
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
          <svg viewBox="0 0 100 140" width="86" height="122" aria-hidden="true">
            <defs><linearGradient id="horse-body" x1="0" x2="1"><stop stopColor="#573822"/><stop offset=".35" stopColor="#b17b4b"/><stop offset=".7" stopColor="#99623c"/><stop offset="1" stopColor="#573822"/></linearGradient><radialGradient id="hat-grad"><stop stopColor="#d0bd9c"/><stop offset=".85" stopColor="#b59d78"/><stop offset="1" stopColor="#817054"/></radialGradient></defs>
            <ellipse cx="58" cy="90" rx="34" ry="46" fill="#272119" opacity=".10"/>
            <path d="M31 53 L15 68 12 95 M69 53 L86 69 89 95 M34 97 L23 119 M65 97 L77 119" stroke="#64442c" strokeWidth="11" strokeLinecap="round" fill="none"/>
            <ellipse cx="50" cy="75" rx="31" ry="46" fill="url(#horse-body)" stroke="#5c3d28" strokeWidth="2"/>
            <path d="M41 39 L37 12 40 2 46 9 52 3 60 10 65 3 67 17 59 39" fill="url(#horse-body)" stroke="#5b3b28" strokeWidth="2"/>
            <path d="M41 7l-2 11m24-11 2 11" stroke="#4e3224" strokeWidth="4"/>
            <path d="M50 116 Q57 128 51 140" stroke="#473225" strokeWidth="8" fill="none" strokeLinecap="round"/>
            <ellipse cx="50" cy="79" rx="26" ry="28" fill="#2c302e"/>
            <path d="M28 77Q50 88 72 77" fill="none" stroke="#c4b59b" strokeWidth="5"/>
            <path d="M30 66L20 77m50-11 10 11" stroke="#28313a" strokeWidth="9" strokeLinecap="round"/>
            <ellipse cx="50" cy="74" rx="23" ry="18" fill="#c2b096"/>
            <ellipse cx="50" cy="70" rx="14" ry="17" fill="#665940"/>
            <ellipse cx="50" cy="66" rx="29" ry="13" fill="url(#hat-grad)" stroke="#8b795b" strokeWidth="2"/>
            <ellipse cx="50" cy="61" rx="13" ry="11" fill="#a58d69"/>
            <path d="M38 66Q50 71 62 66" stroke="#62543f" strokeWidth="2" fill="none"/>
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
.ranch-explore__board{background:#faf9f6}
.ranch-explore__destination:focus-visible{outline:3px solid #b99c62;outline-offset:3px}
.ranch-explore__mountain{opacity:.75}

.ranch-explore{--cream:#fafaf7;--ink:#36362f;--line:#d7d6d0;background:var(--cream);color:var(--ink);min-height:100svh;font-family:Arial,Helvetica,sans-serif}
.ranch-explore__intro{text-align:center;padding:34px 16px 10px}
.ranch-explore__intro p{font-size:10px;letter-spacing:2.6px;color:#77766e;margin:0 0 12px}
.ranch-explore__intro h1{font:normal 32px/1.15 Georgia,serif;margin:0 0 8px}
.ranch-explore__intro>span{font-size:12px;letter-spacing:.3px;color:#77766e}
.ranch-explore__board{position:relative;max-width:660px;margin:0 auto;height:calc(100svh - 100px);min-height:580px;overflow:hidden;isolation:isolate;touch-action:pan-y}
.ranch-explore__terrain,.ranch-explore__roads{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.ranch-explore__terrain path{stroke:#d6d5cd;stroke-width:.18;fill:none;opacity:.55}
.ranch-explore__roads path{stroke:#acaaa0;stroke-width:.4;stroke-dasharray:1.3 1.1;fill:none}
.ranch-explore__destination{position:absolute;z-index:2;transform:translate(-50%,-50%);width:83px;height:83px;background:rgba(253,252,249,.96);border:1px solid #cac8bf;border-radius:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:5px;font-size:10px;text-transform:uppercase;letter-spacing:1px;cursor:pointer;color:#3b3933;box-shadow:0 3px 14px #42403512}
.ranch-explore__destination:hover,.ranch-explore__destination:focus-visible{border-color:#736a56;outline-offset:3px}
.ranch-explore__marker{color:#292923;font-size:25px}
.ranch-explore__rider{position:absolute;z-index:3;width:86px;height:122px;cursor:grab;touch-action:none;user-select:none;filter:drop-shadow(8px 12px 6px #0002);transform-origin:center center}
.ranch-explore__rider.is-dragging{cursor:grabbing}
.ranch-explore__print{position:absolute;transform:translate(-50%,-50%);font-size:14px;color:#a49b89;opacity:.45;pointer-events:none}
.ranch-explore__hint{position:absolute;left:50%;bottom:9px;transform:translateX(-50%);border:1px solid #e0ded6;background:#fafaf7ee;border-radius:30px;padding:11px 16px;font-size:11px;color:#6b6860;text-align:center;white-space:nowrap}
.ranch-explore__direct{max-width:660px;margin:0 auto;padding:17px 16px 45px;text-align:center}
.ranch-explore__direct>span{display:block;font-size:10px;letter-spacing:1.7px;color:#858176;margin-bottom:14px}
.ranch-explore__direct>div{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.ranch-explore__direct a{border:1px solid #c9c6bb;color:#37352f;text-decoration:none;font-size:12px;padding:10px 13px;display:inline-flex;gap:8px}
@media(max-width:500px){.ranch-explore__intro{padding-top:25px}.ranch-explore__intro h1{font-size:29px}.ranch-explore__board{height:calc(100svh - 85px);min-height:560px}.ranch-explore__destination{width:75px;height:75px;font-size:9px}.ranch-explore__direct{padding-bottom:36px}}
@media(prefers-reduced-motion:reduce){.ranch-explore *, .ranch-explore *::before,.ranch-explore *::after{animation:none!important;transition:none!important}}
`;
