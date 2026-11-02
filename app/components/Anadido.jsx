import {createPortal} from 'react-dom';
import {useEffect} from 'react';
import {Link} from 'react-router';

/**
 * Aviso de compra: confirma lo añadido y propone una pieza que combine.
 *
 * Se monta en el body para que ningún contenedor con transform lo recorte.
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
        <button type="button" className="an-cerrar" onClick={cerrar} aria-label="Cerrar">
          ×
        </button>

        <div className="an-confirma">
          <span className="an-tilde" aria-hidden="true">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12.5l5.5 5.5L20 7" />
            </svg>
          </span>
          <span className="an-confirma-txt">
            <b>En el carrito</b>
            {articulo?.titulo && <em>{articulo.titulo}</em>}
          </span>
          {articulo?.img && (
            <span className="an-confirma-img">
              <img src={articulo.img} alt="" />
            </span>
          )}
        </div>

        {sugerido && (
          <div className="an-sugerido">
            <p className="an-rotulo">Combina con</p>

            <Link to={`/nuevo2/producto/${sugerido.handle}`} className="an-foto" onClick={cerrar}>
              {sugerido.img ? <img src={sugerido.img} alt={sugerido.titulo} /> : <i />}
            </Link>

            <h3 className="an-nombre">{sugerido.titulo}</h3>
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
        )}

        <div className="an-pie">
          <Link to="/nuevo2/carrito" className="an-ver" onClick={cerrar}>
            Ver carrito
          </Link>
          <button type="button" className="an-seguir" onClick={cerrar}>
            Seguir comprando
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
