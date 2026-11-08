import {useEffect, useState} from 'react';
import {Link} from 'react-router';
import MenuLateral from '~/components/MenuLateral';
import Carroza from '~/components/Carroza';
import Buscador from '~/components/Buscador';
import Pie from '~/components/Pie';

/**
 * Colección de chaquetas de hombre.
 *
 * La versión anterior dedicaba una pantalla completa a cada prenda: para ver
 * las 13 había que dar catorce scrolls, y como las fotos son 1:1 con fondo
 * claro, cada panel era una foto flotando en mucho vacío. No se comparaba
 * nada y no se sentía premium.
 *
 * Ahora la portada presenta la colección y debajo va un catálogo en grilla que
 * deja ver varias prendas de un vistazo y comparar precios sin scrollear. Las
 * fotos 1:1 entran enteras sobre el mismo tono claro del fondo, así la grilla
 * se lee como catálogo y no como recortes pegados.
 */

// acabado real de cada Windsor (la ficha de Shopify lo dice en la descripción)
const ACABADO = {
  'chaqueta-windsor': 'No encerrada',
  'chaqueta-encerada-windsor-verde': 'Encerada',
};

const dos = (n) => String(n).padStart(2, '0');

// La prenda que abre la portada, no el primer ítem de la lista
const ABRE = 'chaqueta-encerada-windsor-verde';

export default function ColeccionEditorial({productos = [], titulo = '', desde = null}) {
  // la barra va transparente sobre la portada y se vuelve sólida al bajar
  const [solido, setSolido] = useState(false);
  useEffect(() => {
    const alScroll = () => setSolido(window.scrollY > window.innerHeight * 0.62);
    alScroll();
    window.addEventListener('scroll', alScroll, {passive: true});
    return () => window.removeEventListener('scroll', alScroll);
  }, []);

  const portada = productos.find((p) => p.handle === ABRE) || productos[0];
  const resto = productos.filter((p) => p.handle !== portada?.handle);
  const total = productos.length;

  const pieza = (p, i) => (
    <Link
      key={p.id}
      to={`/products/${p.handle}`}
      prefetch="intent"
      className="cx-card"
      aria-label={`${p.titulo}, ${p.precio}`}
    >
      <span className="cx-card-foto">
        {p.grande && (
          <img
            src={p.grande}
            alt={p.titulo}
            /* 13 prendas: se piden todas de entrada. Con lazy las de abajo
               quedaban en blanco al llegar (naturalWidth 0). */
            loading="eager"
            fetchPriority={i < 2 ? 'high' : 'auto'}
            decoding="async"
            width="800"
            height="800"
          />
        )}
        {p.antes && <span className="cx-card-rebaja">Rebaja</span>}
      </span>
      <span className="cx-card-txt">
        <span className="cx-card-meta">
          <em>{dos(i + 1)}</em>
          {ACABADO[p.handle] && <i>{ACABADO[p.handle]}</i>}
        </span>
        <span className="cx-card-nombre">{p.titulo}</span>
        <span className="cx-card-precio">
          <b>{p.precio}</b>
          {p.antes && <s>{p.antes}</s>}
        </span>
      </span>
    </Link>
  );

  return (
    <main className="cx">
      <div className={'hc-bar' + (solido ? ' is-solido' : '')}>
        <MenuLateral tono={solido ? 'tinta' : 'crema'} />
        <Link to="/" prefetch="intent" className="hc-logo" aria-label="The Ranch, ir al inicio">
          <img src={solido ? '/logo-tinta.png' : '/logo-crema.png'} alt="The Ranch" width="78" />
        </Link>
        <span className="hc-bolsa">
          <Buscador tono={solido ? 'oscuro' : 'claro'} />
          <Carroza />
        </span>
      </div>

      {/* ===== Portada: una sola pantalla, con la prenda que abre la colección */}
      <header className="cx-portada">
        {portada?.grande && (
          <img
            className="cx-portada-foto"
            src={portada.grande}
            alt={portada.titulo}
            fetchPriority="high"
            decoding="async"
          />
        )}
        <div className="cx-portada-txt">
          <p className="cx-kicker">Colección · {total} piezas</p>
          <h1>
            Chaquetas
            <br />
            de hombre
          </h1>
          <p className="cx-pie">Cuero, lana y agua. {total} piezas para el frío que se viene.</p>
        </div>
        {portada && (
          <Link className="cx-portada-destacada" to={`/products/${portada.handle}`} prefetch="intent">
            <span className="cx-portada-nombre">{portada.titulo}</span>
            <span className="cx-portada-precio">{portada.precio}</span>
          </Link>
        )}
      </header>

      {/* ===== Catálogo: grilla para comparar de un vistazo */}
      <section className="cx-catalogo">
        <div className="cx-catalogo-top">
          <h2>Las {total}</h2>
          <p>{desde ? `Desde ${desde}` : 'Todas las piezas'}</p>
        </div>
        <div className="cx-grid">{resto.map(pieza)}</div>
      </section>

      <div className="cx-cierre">
        <Link to="/collections/chaquetas" prefetch="intent">
          Ver todas las chaquetas <span aria-hidden="true">→</span>
        </Link>
        <small>The Ranch · Hecho para durar, no para pasar.</small>
      </div>

      <Pie />
    </main>
  );
}
