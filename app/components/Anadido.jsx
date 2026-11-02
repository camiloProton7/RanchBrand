import {createPortal} from 'react-dom';
import {useEffect} from 'react';
import {Link} from 'react-router';

/**
 * Hoja inferior que confirma la compra y propone una pieza que combine.
 *
 * Sube pegada al borde: no tapa la pantalla y deja el gesto de cerrar donde
 * el pulgar ya está. Se monta en el body para que ningún contenedor con
 * transform la recorte.
 */
export default function Anadido({abierto, cerrar, articulo, sugerido, onAnadir, anadiendo, yaAnadido}) {
  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e) => {
      if (e.key === 'Escape') cerrar();
    };
    document.addEventListener('keydown', alTeclear);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.body.style.overflow = '';
    };
  }, [abierto, cerrar]);

  if (!abierto || typeof document === 'undefined') return null;

  return createPortal(
    <div className="an-fondo" onClick={cerrar} role="presentation">
      <div
        className="an-hoja"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Producto añadido"
      >
        <span className="an-asa" aria-hidden="true" />

        <div className="an-cabeza">
          <span className="an-tilde" aria-hidden="true">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12.5l5.5 5.5L20 7" />
            </svg>
          </span>
          <span className="an-cabeza-txt">
            <b>En el carrito</b>
            {articulo?.titulo && <em>{articulo.titulo}</em>}
          </span>
          <button type="button" className="an-cerrar" onClick={cerrar} aria-label="Cerrar">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {sugerido && (
          <>
            <p className="an-rotulo">Combina con</p>

            <div className="an-fila">
              <Link to={`/nuevo2/producto/${sugerido.handle}`} className="an-foto" onClick={cerrar}>
                {sugerido.img ? <img src={sugerido.img} alt={sugerido.titulo} /> : <i />}
              </Link>

              <div className="an-datos">
                <Link to={`/nuevo2/producto/${sugerido.handle}`} className="an-nombre" onClick={cerrar}>
                  {sugerido.titulo}
                </Link>
                <p className="an-precio">
                  {sugerido.precio}
                  {sugerido.antes && <span className="an-antes">antes {sugerido.antes}</span>}
                </p>
                <button
                  type="button"
                  className={'an-add' + (yaAnadido ? ' is-ok' : '')}
                  onClick={onAnadir}
                  data-variante={sugerido.varianteId || 'vacio'}
                  disabled={anadiendo || yaAnadido}
                >
                  {yaAnadido ? 'Añadido' : anadiendo ? 'Añadiendo…' : 'Añadir también'}
                </button>
              </div>
            </div>
          </>
        )}

        <Link to="/nuevo2/carrito" className="an-ver" onClick={cerrar}>
          Ver carrito
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </div>,
    document.body,
  );
}
