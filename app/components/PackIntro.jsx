import {Link} from 'react-router';

/**
 * Banda de introducción del pack de cinco gorras.
 * Va justo después del hero: es la primera pieza de contenido de la home.
 */
export default function PackIntro({imagen}) {
  return (
    <section className="pi-band" aria-label="Pack de cinco gorras">
      <div className="pi-text">
        <span className="pi-eyebrow">El pack del rancho</span>
        <h2 className="pi-title">
          Cinco gorras.<br />
          Quinientos mil.
        </h2>
        <p className="pi-copy">
          Elige las cinco que quieras, de las veintiséis. El precio no cambia
          con la mezcla, y cada una sale del inventario real.
        </p>
        <Link to="/combo-gorras" className="pi-cta">
          Armar el pack
        </Link>
      </div>
      <div className="pi-media" aria-hidden="true">
        {imagen ? <img src={imagen} alt="" loading="lazy" /> : null}
      </div>
    </section>
  );
}
