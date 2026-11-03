import {useState} from 'react';
import {Link} from 'react-router';

export function Rail({children, className = ''}) {
  return <div className={'hn-rail ' + className}>{children}</div>;
}

export function Grid({children, className = ''}) {
  return <div className={'hn-par ' + className}>{children}</div>;
}

export function Tarjeta({p, prioridad = false, badge, ancha = false, ruta = '/products/'}) {
  // dos como maximo: la de reposo y la del hover
  const fotos = (p.imgs?.length ? p.imgs : [p.img1].filter(Boolean)).slice(0, 2);
  const [idx, setIdx] = useState(0);

  return (
    <Link
      to={`${ruta}${p.handle}`}
      prefetch="intent"
      className={'hn-card' + (ancha ? ' is-ancha' : '')}
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
            onMouseEnter={() => fotos.length > 1 && setIdx(1)}
            onMouseLeave={() => setIdx(0)}
          />
        ))}

        <span className="hn-card-velo" aria-hidden="true" />

        {fotos.length > 1 && (
          <span className="hn-card-dots" aria-hidden="true">
            {fotos.map((src, i) => (
              <i key={src + i} className={i === idx ? 'on' : ''} />
            ))}
          </span>
        )}

        {badge && <span className="hn-card-badge">{badge}</span>}

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
