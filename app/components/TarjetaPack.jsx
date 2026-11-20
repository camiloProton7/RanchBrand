import {Link} from 'react-router';

/**
 * Tarjeta del pack de cinco gorras dentro de la colección.
 * No es un producto de Shopify: es la entrada a /combo-gorras, donde el cliente
 * arma el pack y elige las cinco. Por eso es una tarjeta especial y no una
 * Tarjeta normal con un handle que no existe.
 */
export default function TarjetaPack({fotos = []}) {
  return (
    <Link to="/combo-gorras" className="pk" aria-label="Armar el pack de cinco gorras">
      <span className="pk-fotos">
        {fotos.slice(0, 5).map((f, i) => (
          <img key={i} src={f} alt="" loading="lazy" decoding="async" style={{'--i': i}} />
        ))}
      </span>

      <span className="pk-cuerpo">
        <span className="pk-rotulo">Pack de cinco</span>
        <span className="pk-titulo">5 Gorras por $500.000</span>
        <span className="pk-precios">
          <b>$ 500.000</b>
          <em>antes $ 857.000</em>
          <span className="pk-sello">−42%</span>
        </span>
        <span className="pk-cta">
          Armar mi pack
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M5 12h13M12 5l7 7-7 7" />
          </svg>
        </span>
      </span>
    </Link>
  );
}
