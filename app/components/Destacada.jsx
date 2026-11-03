import {Link} from 'react-router';

export default function Destacada({p, numero = '01', tono = 'verde', encuadre = 'recorte'}) {
  if (!p) return null;

  const foto = p.recorte || p.imgs?.[0];

  return (
    <section
      className={`hn-pieza hn-pieza--${tono} ${encuadre === 'escena' ? 'is-escena' : ''}`}
      aria-label={`Pieza destacada: ${p.titulo}`}
    >
      <div className="hn-pieza-in">
        <div className="hn-pieza-top">
          <span className="hn-pieza-num">{numero}</span>
          <span className="hn-pieza-kicker">Pieza del mes</span>
        </div>

        <Link to={`/products/${p.handle}`} className="hn-pieza-foto">
          {foto && <img src={foto} alt={p.titulo} loading="lazy" decoding="async" />}
        </Link>

        <div className="hn-pieza-txt">
          <h2 className="hn-pieza-nombre">{p.titulo}</h2>

          {p.desc && <p className="hn-pieza-desc">{p.desc}</p>}

          <div className="hn-pieza-pie">
            <span className="hn-pieza-precio">{p.precio}</span>
          </div>

          <Link to={`/products/${p.handle}`} className="hn-pieza-btn">
            <span>Ver producto</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h13M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
