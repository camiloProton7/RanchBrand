import {useEffect, useRef, useState} from 'react';
import {RESENAS} from '~/data/resenas';

const PAUSA = 5200;

export default function Resenas() {
  const rail = useRef(null);
  const auto = useRef(false);
  const reanudar = useRef(null);
  const [activa, setActiva] = useState(0);
  const [pausado, setPausado] = useState(false);

  const irA = (i, suave = true) => {
    const el = rail.current;
    if (!el) return;
    const t = el.children[Math.max(0, Math.min(RESENAS.length - 1, i))];
    if (!t) return;
    auto.current = true;
    el.scrollTo({left: t.offsetLeft - el.offsetLeft - el.clientLeft, behavior: suave ? 'smooth' : 'auto'});
    setTimeout(() => {
      auto.current = false;
    }, 700);
  };

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const alScroll = () => {
      const centro = el.scrollLeft + el.clientWidth / 2;
      let mejor = 0;
      let dist = Infinity;
      Array.from(el.children).forEach((t, i) => {
        const c = t.offsetLeft - el.offsetLeft + t.offsetWidth / 2;
        const d = Math.abs(c - centro);
        if (d < dist) {
          dist = d;
          mejor = i;
        }
      });
      setActiva(mejor);

      if (!auto.current) {
        setPausado(true);
        clearTimeout(reanudar.current);
        reanudar.current = setTimeout(() => setPausado(false), 6500);
      }
    };
    const alTocar = () => {
      setPausado(true);
      clearTimeout(reanudar.current);
      reanudar.current = setTimeout(() => setPausado(false), 8000);
    };

    el.addEventListener('scroll', alScroll, {passive: true});
    el.addEventListener('pointerdown', alTocar, {passive: true});
    el.addEventListener('touchstart', alTocar, {passive: true});
    return () => {
      el.removeEventListener('scroll', alScroll);
      el.removeEventListener('pointerdown', alTocar);
      el.removeEventListener('touchstart', alTocar);
      clearTimeout(reanudar.current);
    };
  }, []);

  useEffect(() => {
    if (pausado) return;
    const t = setTimeout(() => {
      irA(activa + 1 >= RESENAS.length ? 0 : activa + 1);
    }, PAUSA);
    return () => clearTimeout(t);
  }, [activa, pausado]);

  return (
    <section className="hn-res" aria-label="Reseñas de clientes">
      <header className="hn-res-head">
        <p className="hn-res-kicker">Reseñas</p>
        <h2 className="hn-res-titulo">Lo que dicen en el campo</h2>
        <p className="hn-res-media">
          <span className="hn-res-media-num">5,0</span>
          <span className="hn-res-media-est">★★★★★</span>
          <span className="hn-res-media-txt">{RESENAS.length} compras verificadas</span>
        </p>
      </header>

      <div className="hn-res-rail" ref={rail}>
        {RESENAS.map((r, i) => (
          <article className={'hn-res-card' + (i === activa ? ' is-on' : '')} key={r.autor + i}>
            <div className="hn-res-estrellas" aria-label="5 de 5 estrellas">
              ★★★★★
            </div>
            <p className="hn-res-texto">{r.texto}</p>
            <div className="hn-res-firma">
              <span className="hn-res-thumb">
                {r.img && (
                  <img
                    src={r.img + (r.img.includes('?') ? '&' : '?') + 'width=120'}
                    alt={r.producto}
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </span>
              <span className="hn-res-datos">
                <span className="hn-res-autor">{r.autor}</span>
                <span className="hn-res-prod">{r.producto}</span>
                <span className="hn-res-verif">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="m4 12.5 5 5L20 6.5" />
                  </svg>
                  Compra verificada
                </span>
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="hn-res-pie">
        <span className="hn-res-barra" aria-hidden="true">
          <i style={{width: `${((activa + 1) / RESENAS.length) * 100}%`}} />
        </span>

        <span className="hn-res-cuenta">
          {String(activa + 1).padStart(2, '0')} / {RESENAS.length}
        </span>

      </div>
    </section>
  );
}
