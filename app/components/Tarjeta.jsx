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
 * La segunda foto es solo una vista previa: la muestra el CSS con `:hover`
 * en escritorio y `:active` en celular. No hay estado de React ni manejadores
 * de puntero a propósito: cambiar el DOM entre `touchstart` y `touchend` hacía
 * que Safari se comiera el clic y hubiera que tocar varias veces para abrir.
 */
export function Tarjeta({p, prioridad = false, badge, ancha = false, ruta = '/products/'}) {
  // dos como máximo: la de reposo y la de la vista previa
  const fotos = (p.imgs?.length ? p.imgs : [p.img1].filter(Boolean)).slice(0, 2);

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
            className={i === 0 ? 'base' : 'alt'}
            loading={prioridad && i === 0 ? 'eager' : 'lazy'}
            fetchPriority={prioridad && i === 0 ? 'high' : 'auto'}
            decoding="async"
            width="800"
            height="800"
          />
        ))}

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
