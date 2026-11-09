import {useEffect, useState} from 'react';
import {Link} from 'react-router';

export function Rail({children, className = ''}) {
  return <div className={'hn-rail ' + className}>{children}</div>;
}

export function Grid({children, className = ''}) {
  return <div className={'hn-par ' + className}>{children}</div>;
}

/**
 * Tarjeta de producto para el grid de colección.
 *
 * Las fotos llegan en 1:1 con fondo claro, así que la tarjeta no recorta:
 * muestra la imagen completa dentro de un marco cuadrado del mismo tono que
 * el fondo. `object-fit: contain` deja la prenda entera visible —con `cover`
 * se cortaban mangas y cuellos— y el marco claro hace que las fotos de
 * fondo claro se fundan con la tarjeta en vez de quedar como un parche.
 *
 * El hover se maneja en el <Link>, no en cada <img>: antes el onMouseEnter
 * vivía en la imagen, que estaba en opacity 0 y por tanto no recibía eventos,
 * así que la foto alternativa nunca aparecía.
 */
export function Tarjeta({p, prioridad = false, badge, ancha = false, ruta = '/products/'}) {
  // dos como máximo: la de reposo y la del hover
  const fotos = (p.imgs?.length ? p.imgs : [p.img1].filter(Boolean)).slice(0, 2);
  const [idx, setIdx] = useState(0);
  const [volteada, setVolteada] = useState(false);
  // en celular no hay hover: el tap dispara un mouseenter falso que cambiaba
  // la foto y dejaba navegar en el mismo gesto
  const enCelular = () =>
    typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

  /**
   * Primer toque: muestra la segunda foto y no navega.
   * Segundo toque: abre el producto. "Comprar" navega de una.
   */
  const alTocar = (e) => {
    if (fotos.length < 2) return;
    if (e.target?.closest?.('.hn-card-btn, .hn-card-foot')) return;
    if (!enCelular()) return;
    if (!volteada) {
      e.preventDefault();
      setVolteada(true);
      setIdx(1);
    }
  };

  // al deslizar no se cambia la foto: si el dedo pasa por encima de una
  // tarjeta no debe quedar mostrando la segunda imagen a medio fundir
  useEffect(() => {
    if (!enCelular()) return;
    const alDeslizar = () => {
      setIdx(0);
      setVolteada(false);
    };
    window.addEventListener('scroll', alDeslizar, {passive: true});
    return () => window.removeEventListener('scroll', alDeslizar);
  }, []);

  return (
    <Link
      to={`${ruta}${p.handle}`}
      prefetch="intent"
      className={'hn-card' + (ancha ? ' is-ancha' : '') + (volteada ? ' is-volteada' : '')}
      onClick={alTocar}
      onMouseEnter={() => {
        if (!enCelular() && fotos.length > 1) setIdx(1);
      }}
      onMouseLeave={() => {
        setIdx(0);
        setVolteada(false);
      }}
      onFocus={() => fotos.length > 1 && setIdx(1)}
      onBlur={() => setIdx(0)}
    >
      <span className="hn-card-media">
        {fotos.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt={i === 0 ? p.titulo : ''}
            className={i === idx ? 'on' : ''}
            loading={prioridad && i === 0 ? 'eager' : 'lazy'}
            fetchPriority={prioridad && i === 0 ? 'high' : 'auto'}
            decoding="async"
            width="800"
            height="800"
          />
        ))}

        {fotos.length > 1 && (
          <span className="hn-card-dots" aria-hidden="true">
            {fotos.map((src, i) => (
              <i key={src + i} className={i === idx ? 'on' : ''} />
            ))}
          </span>
        )}

        {badge && <span className="hn-card-badge">{badge}</span>}

        {p.disponible === false && <span className="hn-card-agotado">Agotado</span>}

        {p.valor > 0 && (
          <span className="hn-card-rating">
            <span className="hn-card-star" aria-hidden="true">★</span>
            {p.valor.toFixed(1)}
            {p.cuenta > 0 && <em>({p.cuenta})</em>}
          </span>
        )}
      </span>

      <span className="hn-card-body">
        <span className="hn-card-name">{p.titulo}</span>
        {p.desc && <span className="hn-card-desc">{p.desc}</span>}
      </span>

      <span className="hn-card-foot">
        <span className="hn-card-price">
          {p.precio}
          {p.antes && <em className="hn-card-antes">antes {p.antes}</em>}
        </span>
        <span className="hn-card-btn">
          Comprar
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </span>
    </Link>
  );
}
