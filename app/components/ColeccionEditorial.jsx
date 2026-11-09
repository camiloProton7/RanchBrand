import {useEffect, useState} from 'react';
import {Link} from 'react-router';
import MenuLateral from '~/components/MenuLateral';
import Carroza from '~/components/Carroza';
import Buscador from '~/components/Buscador';
import Pie from '~/components/Pie';

/**
 * Colección de chaquetas de hombre con tratamiento editorial: la prenda ocupa
 * la pantalla, el texto no compite y no hay tarjetas ni sellos de descuento.
 * Solo se usa en esta colección; el resto sigue con la grilla de siempre.
 */

// acabado real de cada Windsor (la ficha de Shopify lo dice en la descripción)
const ACABADO = {
  'chaqueta-windsor': 'No encerrada',
  'chaqueta-encerada-windsor-verde': 'Encerada',
};

const dos = (n) => String(n).padStart(2, '0');

export default function ColeccionEditorial({productos = [], titulo = '', desde = null}) {
  // la barra va transparente sobre la portada y se vuelve sólida al bajar
  const [solido, setSolido] = useState(false);
  useEffect(() => {
    const alScroll = () => setSolido(window.scrollY > window.innerHeight * 0.86);
    alScroll();
    window.addEventListener('scroll', alScroll, {passive: true});
    return () => window.removeEventListener('scroll', alScroll);
  }, []);
  // la portada es la primera pieza del orden manual de Shopify
  const portada = productos[0];
  const total = productos.length;

  const panel = (p, i) => (
    <Link
      key={p.id}
      to={`/products/${p.handle}`}
      prefetch="intent"
      className="ed-panel"
      aria-label={`${p.titulo}, ${p.precio}`}
    >
      {p.grande && (
        <img
          src={p.grande}
          alt={p.titulo}
          loading={i < 2 ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}
      <div className="ed-panel-txt">
        <div>
          {ACABADO[p.handle] && <span className="ed-acabado">{ACABADO[p.handle]}</span>}
          <span className="ed-num">{dos(i + 1)}</span>
          <h2>{p.titulo}</h2>
          <div className="ed-precio">
            <b>{p.precio}</b>
            {p.antes && <i>antes {p.antes}</i>}
          </div>
        </div>
        <span className="ed-flecha" aria-hidden="true">
          →
        </span>
      </div>
    </Link>
  );

  return (
    <main className="ed">
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

      <header className="ed-portada">
        {portada?.grande && (
          <img src={portada.grande} alt={portada.titulo} fetchPriority="high" decoding="async" />
        )}
        <div className="ed-portada-txt">
          {portada && ACABADO[portada.handle] && (
            <span className="ed-acabado ed-acabado-portada">
              {ACABADO[portada.handle]} · {portada.titulo.replace('Chaqueta ', '')}
            </span>
          )}
          <p className="ed-kicker">Colección · {total} piezas</p>
          <h1>
            Chaquetas
            <br />
            de hombre
          </h1>
          <p className="ed-pie">
            Cuero, lana y agua. {total} piezas para el frío que se viene.
          </p>
        </div>
      </header>

      {productos.slice(0, 7).map(panel)}

      <section className="ed-interludio">
        <p>No nacimos para que fuera fácil.</p>
      </section>

      {productos.slice(7).map((p, i) => panel(p, i + 7))}

      <section className="ed-indice">
        <h3>Las {total}</h3>
        <ul>
          {productos.map((p) => (
            <li key={p.id}>
              <Link to={`/products/${p.handle}`} prefetch="intent">
                <span>
                  {p.titulo}
                  {ACABADO[p.handle] && <em> · {ACABADO[p.handle].toLowerCase()}</em>}
                </span>
                <span>{p.precio}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="ed-cierre">
        <Link to="/collections/chaquetas" prefetch="intent">
          Ver todas las chaquetas <span aria-hidden="true">→</span>
        </Link>
        <small>The Ranch · Hecho para durar, no para pasar.</small>
      </div>

      <Pie />
    </main>
  );
}
