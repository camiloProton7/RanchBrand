import {useEffect, useState} from 'react';
import {Link} from 'react-router';
import MenuLateral from '~/components/MenuLateral';
import Carroza from '~/components/Carroza';
import Buscador from '~/components/Buscador';
import Pie from '~/components/Pie';
import {Grid, Tarjeta} from '~/components/Tarjeta';

/**
 * Colección de chaquetas de hombre.
 *
 * Usa las mismas tarjetas del home (<Tarjeta>) dentro del mismo <Grid> que las
 * demás colecciones, para que la tienda se lea pareja de punta a punta. La
 * versión anterior tenía un tratamiento editorial propio —una prenda por
 * pantalla— que obligaba a catorce scrolls y no dejaba comparar nada.
 */

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
  const total = productos.length;

  return (
    <main className="cx">
      <div className={'hc-bar' + (solido ? ' is-solido' : '')}>
        {/* La portada es clara: el logo va en tinta desde el principio,
            en crema se perdía sobre el fondo. */}
        <MenuLateral tono="tinta" />
        <Link to="/" prefetch="intent" className="hc-logo" aria-label="The Ranch, ir al inicio">
          <img src="/logo-tinta.png" alt="The Ranch" width="78" />
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

      {/* ===== Catálogo: las mismas tarjetas del home */}
      <section className="cx-catalogo">
        <div className="cx-catalogo-top">
          <h2>Las {total}</h2>
          <p>{desde ? `Desde ${desde}` : 'Todas las piezas'}</p>
        </div>
        {/* El home pinta las prendas con <Rail> en una cinta horizontal; acá se
            repiten con <Grid>, el mismo componente que ya usan las otras
            colecciones, para no inventar una tercera forma de mostrar producto. */}
        <Grid>
          {productos.map((p, i) => (
            <Tarjeta key={p.id} p={p} prioridad={i < 2} ruta="/products/" />
          ))}
        </Grid>
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
