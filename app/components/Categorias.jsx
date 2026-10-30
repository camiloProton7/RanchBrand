import {Link} from 'react-router';

const ORDEN = ['gorras', 'chaquetas', 'camisas', 'botas'];

export default function Categorias({cats}) {
  if (!cats?.length) return null;

  const porClave = Object.fromEntries(cats.map((c) => [c.clave, c]));
  const prin = ORDEN.map((k) => porClave[k]).filter(Boolean);

  const [vertical, ...otras] = prin;
  if (!vertical) return null;

  return (
    <section className="hn-mosaico" aria-label="Compra por categoría">
      <div className="hn-mos-grid">
        <Link
          to={`/nuevo2/coleccion/${vertical.handle}`}
          className="hn-mos hn-mos-vert"
          style={{'--i': 0}}
        >
          {vertical.img && <img src={vertical.img} alt={vertical.titulo} loading="lazy" decoding="async" />}
          <span className="hn-mos-velo" aria-hidden="true" />
          <span className="hn-mos-txt">
            <span className="hn-mos-nombre">{vertical.titulo}</span>
            <span className="hn-mos-flecha" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h13M12 5l7 7-7 7" />
              </svg>
            </span>
          </span>
        </Link>

        {otras.map((c, i) => (
          <Link
            key={c.handle}
            to={`/nuevo2/coleccion/${c.handle}`}
            className="hn-mos hn-mos-horiz"
            style={{'--i': i + 1}}
          >
            {c.img && <img src={c.img} alt={c.titulo} loading="lazy" decoding="async" />}
            <span className="hn-mos-velo" aria-hidden="true" />
            <span className="hn-mos-txt">
              <span className="hn-mos-nombre">{c.titulo}</span>
              <span className="hn-mos-flecha" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h13M12 5l7 7-7 7" />
                </svg>
              </span>
            </span>
          </Link>
        ))}
      </div>

    </section>
  );
}
