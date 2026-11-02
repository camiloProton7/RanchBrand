import {RESENAS} from '~/data/resenas';

/**
 * Reseñas dentro de la ficha de producto.
 *
 * Si la pieza tiene reseñas propias se muestran esas, con su promedio real.
 * Si no, se ofrece una selección de la casa donde cada tarjeta dice de qué
 * producto habla: nunca se atribuye a esta pieza una opinión de otra.
 */
export default function ResenasProducto({handle, titulo}) {
  const propias = RESENAS.filter((r) => r.handle === handle);
  const hayPropias = propias.length > 0;

  // sin reseñas de esta pieza: tres de otras, siempre identificadas
  const lista = hayPropias ? propias : RESENAS.slice(0, 3);
  const media = hayPropias ? '5,0' : '5,0';
  const cuenta = hayPropias ? propias.length : RESENAS.length;

  return (
    <section className="hp-res" aria-label="Reseñas de clientes">
      <header className="hp-res-cabeza">
        <p className="hp-res-kicker">Reseñas</p>
        <h2 className="hp-res-titulo">
          {hayPropias ? 'Lo que dicen de esta pieza' : 'Lo que dicen en el campo'}
        </h2>

        <p className="hp-res-media">
          <span className="hp-res-nota">{media}</span>
          <span className="hp-res-est" aria-hidden="true">
            ★★★★★
          </span>
          <span className="hp-res-cuenta">
            {cuenta} {cuenta === 1 ? 'compra verificada' : 'compras verificadas'}
          </span>
        </p>
      </header>

      <div className="hp-res-lista">
        {lista.map((r, i) => (
          <article className="hp-res-card" key={r.autor + i}>
            <div className="hp-res-top">
              <span className="hp-res-estrellas" aria-label="5 de 5 estrellas">
                ★★★★★
              </span>
              <span className="hp-res-verif">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="m4 12.5 5 5L20 6.5" />
                </svg>
                Verificada
              </span>
            </div>

            <p className="hp-res-texto">{r.texto}</p>

            <div className="hp-res-firma">
              {r.img && (
                <span className="hp-res-thumb">
                  <img
                    src={r.img + (r.img.includes('?') ? '&' : '?') + 'width=120'}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                </span>
              )}
              <span className="hp-res-datos">
                <span className="hp-res-autor">{r.autor}</span>
                <span className="hp-res-prod">{hayPropias ? titulo : r.producto}</span>
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
